# 작업 인수인계 · 2026-11-02

## 시작하기

Node.js 20.9 이상과 npm을 준비하고 저장소를 받은 뒤 실행합니다.

```sh
cd web
npm ci
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다. 로컬 미리보기는 개발 서버가 실행 중일 때만 연결됩니다. GitHub 업로드와 공개 사이트 배포는 별개입니다.

## 작업 범위와 사용자 요구

- 디자인과 프론트엔드만 변경합니다. 기존 백엔드·데이터 처리·로그인·결제 로직은 사용자 승인 없이 변경하지 않습니다.
- 흰 배경, 평면에 놓은 옷 연출, 같은 정사각형 비교 영역을 유지합니다.
- 니트의 마네킹 착용·야외 원본 사진은 사이트에 노출하지 않습니다. 미사용 원본과 중간 생성물은 이번 커밋에 포함하지 않았습니다.

## 현재 화면

| 경로 | 구현 | 주요 파일 |
| --- | --- | --- |
| `/` | 파란 PK티 비포/애프터 슬라이더 | `web/src/screens/landing.tsx`, `web/src/components/real-case-compare.tsx` |
| `/cases/knit-yarn` | 털실 니트 리폼 비교 | `web/src/app/cases/knit-yarn/page.tsx`, `web/src/components/knit-case-compare.tsx` |
| `/cases/gray-recut` | 회색 티 앞·뒤 각각 비교 | `web/src/app/cases/gray-recut/page.tsx`, `web/src/components/gray-case-compare.tsx` |
| `/cases/gray-recut#patch-shop` | 장식 24종 선택·수량·합계·데모 장바구니 | `web/src/components/patch-shop.tsx` |

## 이미지와 상품 선택

- 현재 사용 중인 최종 이미지는 `web/public/cases/`에 포함되어 있습니다.
- `patch-cutout-front.png`, `patch-cutout-back.png`는 사진 기반 AI 배경 제거 이미지입니다. 실제 제품과 세부 질감·문자가 달라질 수 있으므로 판매 전 실물 대조가 필요합니다.
- 패치 상품은 투명 이미지 시트의 영역을 CSS로 표시합니다. `products[].box`는 원본 1024×1536 이미지의 `[x, y, width, height]`입니다. 이미지 교체 시 좌표도 확인합니다.
- 자수/장식 패치 1,000원, 전사지 3,000원, 선택 가능한 디자인 변경 29,000원으로 설정되어 있습니다. 배송·부착비는 합계에서 제외되어 있습니다.
- 장바구니는 해당 페이지 React 상태로만 유지되며 새로고침하면 초기화됩니다. 실제 주문·재고·결제·배송 기능은 연결되지 않았습니다.
- 다음 단계는 실물 상품 정보(소재, 규격, 재고, 부착 방식, 확정 가격)를 확인하고, 사용자와 별도 합의 후 주문/결제를 연결하는 것입니다.

## 검증

2026-11-02 변경 파일 ESLint 검사는 통과했습니다. 로컬 브라우저에서 비교·상품 선택 화면을 확인했습니다. 배포 빌드는 이 Windows 환경에서 Turbopack의 CSS 처리 하위 프로세스가 연결 전에 종료되어 실패했습니다 (`Failed to write app endpoint /page`, `globals.css.css`, child process exit code 0). 배포 전 다른 개발 환경 또는 CI에서 빌드를 재검증해야 합니다. 빌드 통과나 공개 사이트 배포 완료 상태는 아닙니다.

```sh
cd web
npm run lint
npm run build
```

브라우저에서 세 사례의 슬라이더와 패치 필터·수량·합계·장바구니를 확인합니다. 이미지 편집 결과는 확대하여 가장자리와 다른 장식이 잘려 들어오지 않는지 확인합니다.

Next.js 관련 수정 전 `web/AGENTS.md`와 설치된 Next.js 문서를 읽습니다. 기존 앱 구조와 데모 기능은 `web/README.md`를 참고합니다.
