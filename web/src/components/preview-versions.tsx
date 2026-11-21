"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PreviewVersions() {
  const pathname = usePathname();
  return <nav aria-label="홈페이지 버전 비교" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", background: "white", borderBottom: "1px solid #e5e5e5", color: "#303236", fontSize: 13 }}>
    <span>세 가지 시안 비교</span>
    {[["/", "A · 기존 홈페이지"], ["/reform-guide", "B · 흰티 리폼 찾기"], ["/reform-choice", "C · 직접 / 맡기기"]].map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "8px 14px", borderRadius: 8, border: "1px solid #d8dfda", background: pathname === href ? "#28594d" : "white", color: pathname === href ? "white" : "#303236", fontWeight: 600 }}>{label}</Link>)}
  </nav>;
}
