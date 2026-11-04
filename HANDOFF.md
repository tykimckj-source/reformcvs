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
| `/patches` | 패치 모음, 브라우저 한정 사진 등록·교체·이름·가격 수정 | `web/src/app/patches/page.tsx`, `web/src/components/patch-manager.tsx` |

## 이미지와 상품 선택

- 현재 사용 중인 최종 이미지는 `web/public/cases/`에 포함되어 있습니다.
- 회색 티 앞면 비포의 최신 파일은 `gray-recut/before-front-plain.png`입니다. 사용자의 요청으로 눈 패치·표정을 제거하고 목 시보리 안쪽을 애프터와 같은 연한 회색으로 AI 편집했습니다. 기존 둥근 목선은 유지합니다. 이전 `before-front.png`는 비교용 이력이며 현재 화면에서는 사용하지 않습니다.
- `patch-cutout-front.png`, `patch-cutout-back.png`는 사진 기반 AI 배경 제거 이미지입니다. 실제 제품과 세부 질감·문자가 달라질 수 있으므로 판매 전 실물 대조가 필요합니다.
- 패치 상품은 투명 이미지 시트의 영역을 CSS로 표시합니다. `products[].box`는 원본 1024×1536 이미지의 `[x, y, width, height]`입니다. 이미지 교체 시 좌표도 확인합니다.
- 2026-11-03: 과도한 사각/타원 마스크 대신 `web/src/data/patch-viewports.json`의 패치별 CSS 외곽 좌표를 사용합니다. 원본 PNG의 알파 채널을 읽어 장식 외곽을 분석했으며, 원본 PNG는 수정하지 않았습니다. 눈썹·입·고래 지느러미를 포함하고 주변 장식은 제외합니다.
- `/patches`는 고객용 선택 화면이며 상품 등록 기능이 없습니다. 고객 목록은 `web/src/data/patch-catalog.json`의 정적 상품 변경분만 읽습니다. 브라우저의 편집 초안은 고객 목록에 적용하지 않습니다.
- 작업자 편집 화면은 `/admin/patches`입니다. 관리자 인증 없는 공개 편집 화면이 되지 않도록 개발 모드에서만 사용 가능하며 production에서는 404를 반환합니다. `/admin` 운영 콘솔에서 접근합니다. 원격 관리자 로그인·상품 업로드 API는 구현하지 않았습니다.
- 초안은 `reformcvs-patch-catalog-v1` localStorage에 저장됩니다. PNG/JPEG/WEBP, 1MB 이하 사진을 지원합니다. `저장된 상품 파일 내려받기`로 받은 `patch-catalog.json`을 작업자가 `web/src/data/patch-catalog.json`에 반영·검토·배포하면 모든 방문자가 해당 상품을 볼 수 있습니다. 저장되지 않은 입력은 다운로드에 포함되지 않습니다. 직접 게시·기기간 초안 공유 기능은 없습니다.
- 검증: 변경 파일 ESLint와 TypeScript 검사 통과. 브라우저에서 눈/고래 외곽, 고객 화면 등록 UI 제거, 작업 초안 가격 1,200원과 고객 가격 1,000원 분리를 확인한 뒤 테스트 초안을 복원했습니다.
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

## 흰색 남방 사례 (2026-11-03)
- 경로: /cases/white-stamp. 홈의 사례 카드에서 이동합니다.
- 제공 사진 4장을 public/cases/white-stamp에 원본 그대로 복사했습니다: before-front(1000176680), after-front(1000176679), before-back(1000176681), after-back(1000176682).
- WhiteStampCompare는 앞뒤 독립 비교 막대와 비포/애프터 전체 보기 버튼을 제공합니다. 같은 정사각형 흰 배경에서 object-contain으로 비율을 보존합니다.
- 기법: 나비 스탬프·나비 스텐실·꽃 스탬프·꽃 스텐실. 가격과 구매 기능은 추가하지 않았습니다.
- TypeScript 및 변경 파일 ESLint 통과. 브라우저에서 앞뒤 이미지와 비교 조작 확인.


## 청치마 사례 (2026-11-03)
- /cases/denim-skirt: 바지 두 벌을 재구성한 청치마, 완성 앞뒤 사진과 디테일 세 장. public/cases/denim-skirt에 제공 원본을 복사해 보존했습니다.
- 리폼 전 바지 사진은 아직 제공되지 않았습니다. DenimSkirtCompare의 before 속성이 없으면 완성 사진과 안내만 표시하며, 실제 before 사진 경로를 전달하면 비교 슬라이더가 활성화됩니다. 완성 앞/뒤를 비포/애프터로 오표기하지 않습니다.
- 홈 카드로 연결. 브라우저에서 페이지·앞뒤 사진·디테일 표시 확인. TypeScript와 변경 파일 ESLint 검사 통과.


### 청치마 비교 사진 업데이트
- 신규 PNG 4장으로 앞뒤 비포·애프터 연결 완료. 이전 JPG는 보존합니다. 최신 after-front.png / after-back.png / before-front.png / before-back.png를 사용합니다.
- 사진 속 허리선 너비·높이를 기준으로 CSS 표시 크기를 조정했습니다. 비포 높이 90%, 앞면 애프터 97.6%, 뒷면 애프터 99.6%; 프릴만 바지 밑단 아래로 내려오도록 위치를 맞췄습니다. 실측 치수 보정이 아닌 화면상 정렬입니다. 원본 파일은 편집하지 않았습니다.
- 앞뒤 독립 슬라이더와 전체 보기 버튼을 제공하며 사진 준비 중 안내를 제거했습니다.

## 최신 사례 업데이트 (2026-11-04)
- /cases/indigo-ocean: 쪽염색 티셔츠의 앞뒤 독립 비포·애프터 슬라이더. 제공 PNG 4장을 동일 배율로 표시하며 원본 형태와 색상을 유지합니다. 고양이·고래 원단 패치 및 뒷면만 바다 스텐실 작업을 설명합니다. 홈 카드로 연결했습니다.
- /cases/denim-skirt: 사용자 요청으로 디테일 사진 섹션과 해당 이동 링크를 제거했습니다. 앞뒤 비교는 유지합니다.
- 쪽염색 페이지 및 홈 변경은 ESLint·TypeScript 검사 통과. 브라우저에서 사진 4장 로딩과 비교 막대 독립 동작 확인.
- 이 디자인 브랜치는 기존 로컬 작업을 보존한 별도 브랜치입니다. 원격 main의 백엔드 변경은 병합하지 않았으므로 담당 작업자가 검토 후 통합해야 합니다.
