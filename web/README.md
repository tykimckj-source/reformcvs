# 리폼 편의점 웹앱 · 프론트엔드 시안

고객 앱과 운영 콘솔입니다. Supabase 키가 없으면 백엔드 없이 이 브라우저에만 저장하는 시연 모드로, 키가 있으면 서버 모드로 동작합니다(아래 ‘백엔드’). 화면 흐름과 기능 ID는 Claude Docs의 「리폼 편의점 웹앱 개발 기획안」을 따릅니다.

## 실행

```bash
npm install
npm run dev
```

- 고객 앱: http://localhost:3000
- 운영 콘솔: http://localhost:3000/admin

노트북에서는 화면 가운데 휴대폰 크기로 보입니다.

휴대폰으로 시연하려면 개발 서버 대신 운영 모드로 띄웁니다. 개발 서버는 보안 때문에 다른 기기의 접속을 막습니다.

```bash
npm run build
npm run start
```

그다음 같은 와이파이에 연결한 휴대폰에서 `http://<이 컴퓨터의 IP>:3000`으로 접속합니다.

## 화면

| 경로 | 화면 | 기획안 기능 |
| --- | --- | --- |
| `/` | 랜딩 (원본·시안 비교) | C-01 |
| `/capture` | 촬영·업로드, 기기 내 품질 검사, 샘플 옷 | C-04, C-05, C-06 |
| `/g/[garmentId]` | AI 인식 확인·수정 | C-07 |
| `/g/[garmentId]/designs` | 디자인 추천과 불가 사유 | C-08 |
| `/m/[sessionId]` | 시안 만들기: 위치·크기·색, 끌어서 옮기기, 원본 비교, 크게 보기, AI 후보, 저장 | C-09–C-13, C-23 |
| `/checkout/[quoteId]` | 견적·로그인·동의·결제 | C-03, C-14, C-15 |
| `/orders/[orderId]` | 발송 등록, 진행 추적, 확정 시안 승인, 평가 | C-16–C-19, C-24 |
| `/orders/find` | 내 주문 찾기 (주문번호 + 연락처) | 추가 |
| `/admin` | 운영 콘솔 주문 보드와 작업지시서 | A-02–A-09 일부 |

## 실제로 동작하는 것과 흉내만 내는 것

**실제로 동작:** 사진 줄이기와 EXIF 제거, 밝기·흔들림·옷 크기 검사, 사진의 대표 색 계산, 디자인 적용 조건 판정, 오버레이 합성(위치·크기·색·이니셜), 원본 비교, 시안 이미지 저장(‘AI 예시’ 표시 포함), 가격 계산, 주문 상태 흐름, 고객 화면과 운영 콘솔 탭 사이 동기화, 운영 콘솔의 ‘엑셀로 내려받기’(보드의 주문을 엑셀용 CSV로).

**흉내만 냄:** 옷 종류 인식, AI 정밀 시안(화면 합성 효과로 대신 보여 줌), 카카오 로그인, 토스 결제, 알림톡, 배송 조회. 화면에 `데모` 표시가 붙은 곳이 여기에 해당합니다.

가격, 작업실 주소, 주문 번호, 콘솔 지표 숫자는 모두 예시입니다.

## 백엔드 (Supabase)

서버 모드에서 실제로 동작하는 것:

- 손님 체험 기록(사진·옷·시안·견적)을 익명 계정으로 저장한다. 사진은 비공개 보관함에 둔다.
- 주문은 서버(`src/app/api/orders`)가 디자인 가격표로 금액을 다시 계산해 만든다.
- 발송 등록, 확정 시안 승인·조정 요청, 별점은 데이터베이스 함수가 순서를 지키며 바꾼다.
- 손님 계정은 브라우저마다 따로 생긴다. 다른 브라우저나 기기에서는 주문번호와 연락처로 자기 주문을 찾아 이어서 본다(`/orders/find`). 틀린 시도는 같은 연락처나 계정마다 하루 10번까지다.
- 손님은 리폼 작업을 시작하기 전까지 사유와 함께 취소를 요청한다. 반송과 환불은 운영자가 직접 처리하고, 운영 콘솔에서 주문을 '취소'로 바꾼다.
- 운영 콘솔은 입고 검수 실측값을 저장하고, 상태에 맞는 손님 안내 문구를 복사해 준다(알림톡 대신).
- 손님이 AI 시안 대신 디자이너에게 직접 요청하면(바라는 점, 알림 받을 연락처는 선택) 운영 콘솔의 '수동 시안 큐'에 쌓인다. 디자이너가 만든 이미지를 올리면 손님 시안 화면과 첫 화면에 바로 나타난다.
- 운영 콘솔 위쪽 지표 8개(시안 수, 체험한 손님, 시안에서 주문까지, 주문 금액, 확정 시안 한 번에 승인, 주문부터 도착까지 등)는 실제 기록으로 계산한다. 정의는 `src/lib/metrics.ts` 한곳에 있고, `node src/lib/metrics.check.mjs`로 검사한다.
- 운영 콘솔은 이메일로 로그인하고, 모든 주문을 실시간으로 본다. 확정 사진을 올리고 출고 송장을 넣는다.

아직 없는 것: 카카오 로그인, 실제 결제, 알림톡, AI 인식·시안 생성.

손님 화면의 저장소(`src/lib/store.ts`)는 그대로 쓰고, 바뀐 내용을 `src/lib/db.ts`가 서버에 따라 적는다. 테이블과 접근 규칙은 `supabase/schema.sql`에 있다.

### 연결하는 법

1. supabase.com에서 프로젝트를 만든다. 지역은 Northeast Asia (Seoul).
2. SQL Editor에 `supabase/schema.sql`을 통째로 붙여 넣고 실행한다. 예전 schema.sql을 이미 실행한 프로젝트는 대신 `supabase/patch-*.sql` 중 아직 실행하지 않은 것을 순서대로(find-order → measure-cancel → manual) 한 번씩 실행한다.
3. Authentication → Sign In / Providers에서 **Allow anonymous sign-ins**를 켠다.
4. Authentication → Users → Add user로 관리자 계정(이메일·비밀번호, Auto Confirm)을 만든다. 그다음 SQL Editor에서 관리자로 등록한다.

   ```sql
   insert into public.admins (user_id) select id from auth.users where email = '관리자 이메일';
   ```

5. 프로젝트 URL과 API 키를 `web/.env.local`에 넣는다. 예전 방식의 anon·service_role 키를 넣어도 된다. 공개 저장소라 커밋하면 안 되는데, `.env*`는 `.gitignore`에서 이미 빠져 있다.

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<프로젝트>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...
   ```

6. 개발 서버를 다시 띄운다. 배포할 때는 같은 세 값을 Vercel 프로젝트 환경 변수에도 넣는다.

`npm run db:check`는 Supabase 없이 메모리 안 Postgres(PGlite)로 접근 규칙과 상태 함수를 검사한다.

내려받은 엑셀에는 손님 이름·연락처·주소가 그대로 들어 있다. 결과보고처럼 밖에 낼 때는 그 칸을 지운다. 수식처럼 보이는 글자와 0으로 시작하는 번호를 글자로 남기는 처리는 `node src/lib/format.check.mjs`로 검사한다.

### 아직 붙일 자리

| 파일 | 지금 | 붙일 것 |
| --- | --- | --- |
| `src/screens/garment.tsx` | 인식 진행을 연출 | AI 인식 결과 표시 (4~5주차) |
| `src/screens/mockup.tsx`의 `generate` | 화면 합성으로 후보 3장 | AI 시안 생성 (4~5주차) |
| `src/screens/checkout.tsx` | 카카오·결제 자리만 있음 | 카카오 로그인을 익명 계정에 이어 붙이기, 결제 |
| `src/lib/designs.ts` | 디자인 카드 6종을 코드에 둠 | 대표 작품으로 교체, 필요하면 테이블로 |

## 구조

```text
src/app/          경로(페이지). 동적 경로는 Suspense로 감싼다 (Cache Components 규칙)
src/app/api/      서버 API (주문 생성)
src/screens/      화면 컴포넌트
src/components/   공통 UI, 휴대폰 프레임, 시안 무대(합성·비교·드래그)
src/lib/          타입, 디자인 카드, 샘플 옷, 이미지 처리, 합성, 저장소
public/samples/   샘플 옷 그림 (데님 자켓, 화이트 티셔츠, 그레이 후드티)
supabase/         데이터베이스 스키마와 규칙 검사
```

## 참고

- Next.js 16.4.2 (App Router, Cache Components), React 19, Tailwind CSS 4, lucide-react.
- 체험 기록은 이 브라우저의 localStorage에만 남습니다. 랜딩 맨 아래 ‘체험 기록 지우기’로 초기화합니다.
- 글꼴은 Pretendard를 CDN에서 불러오고, 인터넷이 없으면 기기 기본 글꼴로 보입니다.
