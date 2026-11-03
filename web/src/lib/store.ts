"use client";

import { useSyncExternalStore } from "react";
import { backendOn, connect, mirror, pendingSessions, pullMine, watchMine } from "./db";
import type { Garment, ManualMockup, MockupSession, Order, OrderStatus, Quote } from "./types";

/**
 * 화면 저장소. 브라우저 localStorage에 저장하고, 다른 탭(운영 콘솔)과 storage 이벤트로 맞춘다.
 * Supabase 키가 있으면(backendOn) 바뀐 내용을 서버에도 따라 적고, 서버 기록을 받아 합친다.
 */
export interface State {
  garments: Record<string, Garment>;
  sessions: Record<string, MockupSession>;
  quotes: Record<string, Quote>;
  orders: Record<string, Order>;
  /** 디자이너 수동 시안 요청과 답. 시안 id가 키다 */
  manual: Record<string, ManualMockup>;
  user: { name: string } | null;
}

const EMPTY: State = { garments: {}, sessions: {}, quotes: {}, orders: {}, manual: {}, user: null };
const KEY = "reform-demo-v1";
const MAX_UPLOADS = 4;

export type Action =
  | { type: "garment/add"; garment: Garment }
  | { type: "garment/update"; id: string; patch: Partial<Garment> }
  | { type: "session/add"; session: MockupSession }
  | { type: "session/update"; id: string; patch: Partial<MockupSession> }
  | { type: "quote/add"; quote: Quote }
  | { type: "order/add"; order: Order }
  | { type: "order/update"; id: string; patch: Partial<Order> }
  | { type: "order/status"; id: string; status: OrderStatus; at: number }
  | { type: "manual/add"; manual: ManualMockup }
  | { type: "user/login"; name: string }
  | { type: "reset" };

function reduce(s: State, a: Action): State {
  switch (a.type) {
    case "garment/add": {
      const garments = { ...s.garments, [a.garment.id]: a.garment };
      // 업로드 사진은 용량이 커서 최근 몇 장만 남긴다
      const uploads = Object.values(garments)
        .filter((g) => g.source === "upload")
        .sort((x, y) => y.createdAt - x.createdAt);
      for (const old of uploads.slice(MAX_UPLOADS)) delete garments[old.id];
      return { ...s, garments };
    }
    case "garment/update":
      return s.garments[a.id] ? { ...s, garments: { ...s.garments, [a.id]: { ...s.garments[a.id], ...a.patch } } } : s;
    case "session/add":
      return { ...s, sessions: { ...s.sessions, [a.session.id]: a.session } };
    case "session/update":
      return s.sessions[a.id] ? { ...s, sessions: { ...s.sessions, [a.id]: { ...s.sessions[a.id], ...a.patch } } } : s;
    case "quote/add":
      return { ...s, quotes: { ...s.quotes, [a.quote.id]: a.quote } };
    case "order/add":
      return { ...s, orders: { ...s.orders, [a.order.id]: a.order } };
    case "order/update":
      return s.orders[a.id] ? { ...s, orders: { ...s.orders, [a.id]: { ...s.orders[a.id], ...a.patch } } } : s;
    case "order/status": {
      const o = s.orders[a.id];
      if (!o || o.status === a.status) return s;
      return {
        ...s,
        orders: { ...s.orders, [a.id]: { ...o, status: a.status, history: [...o.history, { status: a.status, at: a.at }] } },
      };
    }
    case "manual/add":
      return { ...s, manual: { ...s.manual, [a.manual.sessionId]: a.manual } };
    case "user/login":
      return { ...s, user: { name: a.name } };
    case "reset":
      return EMPTY;
  }
}

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function parse(raw: string | null): State {
  if (!raw) return EMPTY;
  try {
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    return EMPTY;
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = parse(window.localStorage.getItem(KEY));
  } catch {
    state = EMPTY;
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    state = parse(e.newValue);
    emit();
  });
  if (backendOn) {
    connect(() => state);
    void refresh();
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장 공간이 모자라도 화면은 계속 동작한다
  }
}

export function dispatch(action: Action) {
  ensureLoaded();
  state = reduce(state, action);
  persist();
  emit();
  if (backendOn) mirror(action);
}

/** 서버 기록을 받아 합친다. 같은 id면 서버 쪽이 이기고, 아직 보내는 중인 시안은 그대로 둔다. */
export async function refresh() {
  const server = await pullMine().catch((e) => {
    console.error("서버 기록을 불러오지 못했어요", e);
    return null;
  });
  if (!server) return;
  const pending = pendingSessions();
  state = {
    ...state,
    garments: { ...state.garments, ...server.garments },
    sessions: { ...state.sessions, ...Object.fromEntries(Object.entries(server.sessions).filter(([id]) => !pending.has(id))) },
    quotes: { ...state.quotes, ...server.quotes },
    orders: { ...state.orders, ...server.orders },
    manual: { ...state.manual, ...server.manual },
  };
  persist();
  emit();
  watchMine(() => void refresh());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => {
  ensureLoaded();
  return state;
};
const getServerSnapshot = () => EMPTY;

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noop = () => () => {};
/** 서버 렌더와 첫 하이드레이션에서는 false, 그 뒤 브라우저에서는 true */
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
