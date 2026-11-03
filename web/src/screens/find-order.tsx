"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PhoneFrame, TopBar } from "@/components/app-frame";
import { Button, TextField } from "@/components/ui";
import { backendOn, findOrder } from "@/lib/db";
import { refresh, useStore } from "@/lib/store";

const digits = (s: string) => s.replace(/\D/g, "");

/** 주문번호와 연락처로 내 주문을 찾는다. lost: 주문 주소를 열었는데 이 브라우저에 그 주문 기록이 없을 때 */
export default function FindOrderScreen({ lost = false }: { lost?: boolean }) {
  const router = useRouter();
  const { orders } = useStore();
  const [form, setForm] = useState({ orderNo: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const no = form.orderNo.trim().toUpperCase();
      // 시연 모드는 서버가 없으니 이 브라우저의 주문에서만 찾는다
      const id = backendOn
        ? await findOrder(no, form.phone)
        : (Object.values(orders).find((o) => o.orderNo === no && digits(o.customer.phone) === digits(form.phone))?.id ?? null);
      if (!id) return setError("주문번호와 연락처가 맞는 주문이 없어요");
      if (backendOn) await refresh();
      router.replace(`/orders/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "주문을 찾지 못했어요. 다시 시도해 주세요");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PhoneFrame>
      <TopBar title="내 주문 찾기" backHref="/" />
      <form onSubmit={submit} className="space-y-3 px-5 pt-2">
        <p className="text-[14.5px] leading-relaxed text-muted">
          {lost ? "이 브라우저에는 이 주문 기록이 없어요. " : ""}
          주문할 때 받은 주문번호와 연락처를 넣으면 다른 기기에서도 주문을 이어서 볼 수 있어요.
        </p>
        <TextField
          label="주문번호"
          placeholder="R2611031234"
          autoCapitalize="characters"
          autoComplete="off"
          value={form.orderNo}
          onChange={(e) => setForm({ ...form, orderNo: e.target.value })}
        />
        <TextField
          label="연락처"
          inputMode="tel"
          autoComplete="tel"
          placeholder="010-1234-5678"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        {error ? <p className="text-[13px] font-semibold text-[#c2412d]">{error}</p> : null}
        <Button type="submit" className="w-full" size="md" disabled={busy || !form.orderNo.trim() || digits(form.phone).length < 9}>
          주문 찾기
        </Button>
      </form>
    </PhoneFrame>
  );
}
