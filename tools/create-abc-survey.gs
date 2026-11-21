/** Google Apps Script에 붙여넣고 createReformABCForm 실행.
 * 실제 웹사이트 배포나 메일 발송 없음. 폼은 미게시 초안으로 생성.
 * 같은 스크립트에서 재실행하면 기존 폼 링크만 반환.
 */
function createReformABCForm() {
  const props = PropertiesService.getScriptProperties();
  const existing = props.getProperty('REFORM_ABC_FORM_ID');
  if (existing) {
    console.log('기존 설문 편집: ' + FormApp.openById(existing).getEditUrl());
    return;
  }
  const form = FormApp.create('리폼 편의점 — A·B·C 중 어떤 화면이 이용하기 쉬운가요?', false);
  props.setProperty('REFORM_ABC_FORM_ID', form.getId());
  form.setCollectEmail(false).setLimitOneResponsePerUser(false)
    .setPublishingSummary(false).setProgressBar(true).setShuffleQuestions(false)
    .setConfirmationMessage('감사합니다. 고객이 쉽게 이용하는 리폼 홈페이지를 만드는 데 참고하겠습니다.');
  form.setDescription('약 6~8분. 이름·연락처·이메일을 묻지 않습니다. 답변은 홈페이지 개선에 사용합니다. 개인정보는 자유응답에도 적지 말아주세요.\n진행자가 보여주는 A·B·C 화면을 같은 상황으로 살펴보고 답해주세요. 모두 개발 중인 시안으로 실제 주문·상담 신청은 진행하지 않습니다.\n화면을 보지 못한 경우 해당 선택지를 골라주세요.');
  const mc = (title, choices, required) => form.addMultipleChoiceItem().setTitle(title).setChoiceValues(choices).setRequired(!!required);
  const free = title => form.addParagraphTextItem().setTitle(title).setRequired(false);
  mc('최근 1년 동안 얼룩이나 작은 구멍 때문에 흰 티셔츠를 안 입은 적이 있나요?', ['있음','없음','기억나지 않음'], true);
  mc('화면을 어떻게 확인했나요?', ['휴대폰에서 직접 눌러봄','PC에서 직접 눌러봄','진행자 화면 공유·시연','캡처 또는 영상만 봄','화면을 보지 못함'], true);
  mc('화면을 본 순서는 무엇인가요?', ['A → B → C','A → C → B','B → A → C','B → C → A','C → A → B','C → B → A','일부만 봄 / 기억나지 않음'], true);
  form.addSectionHeaderItem().setTitle('모든 화면에서 같은 두 가지를 찾아보세요').setHelpText('상황 1: 흰 면 반팔 티의 작은 얼룩을 가리고 싶습니다. 가능한 방법과 먼저 확인할 조건을 찾아보세요.\n상황 2: 직접 작업할 자신이 없습니다. 누군가에게 맡기려면 어디로 가야 할지 찾아보세요.\n어렵거나 찾지 못해도 괜찮습니다. 화면마다 약 1분씩 보고 정답을 알려주기 전에 답해주세요.');
  ['A','B','C'].forEach(version => {
    form.addPageBreakItem().setTitle(version + ' 화면 평가');
    mc(version + '에서 얼룩에 쓸 방법을 찾았나요?', ['혼자 찾음','도움을 받아 찾음','찾지 못함','이 화면을 보지 못함'], true);
    mc(version + '에서 전문가에게 맡기는 경로를 찾았나요?', ['혼자 찾음','도움을 받아 찾음','찾지 못함','이 화면을 보지 못함'], true);
    mc(version + '를 이용하기는 얼마나 쉬웠나요?', ['1 매우 어려움','2 어려움','3 보통','4 쉬움','5 매우 쉬움','보지 못해 평가할 수 없음'], true);
    mc(version + '에서 다음에 무엇을 해야 하는지 알 수 있었나요?', ['명확히 알았음','어느 정도 알았음','잘 모르겠음','이 화면을 보지 못함'], true);
    free(version + '에서 찾은 방법이나 적용 조건을 하나 적어주세요. 못 찾았다면 그렇게 적어주세요.');
    free(version + '에서 헷갈리거나 막힌 부분이 있었나요? (선택)');
  });
  form.addPageBreakItem().setTitle('세 화면을 비교해주세요');
  mc('전체적으로 가장 이용하기 쉬운 화면은 무엇인가요?', ['A','B','C','차이 없음','모두 어려움','모두 보지 못해 비교하기 어려움'], true);
  free('그렇게 선택한 가장 큰 이유는 무엇인가요?');
  mc('처음 방문했을 때 어떤 안내로 시작하고 싶나요?', ['직접 하기 / 맡기기 중 선택','얼룩·구멍 등 옷의 고민 선택','작품 전후 사진부터 보기','잘 모르겠음'], true);
  mc('내 옷을 바꾼다면 어떤 방식이 현재 가장 가깝나요?', ['직접 해보기','전문가에게 맡기기','방법·비용을 본 뒤 결정','둘 다 이용할 생각 없음'], true);
  free('이용하기 전에 꼭 확인하고 싶은 정보가 있다면 적어주세요.');
  mc('방금 본 시안에서 실제 주문·상담 신청이 가능하다고 느꼈나요?', ['실제로 신청 가능하다고 생각함','준비 중인 화면이라고 이해함','잘 모르겠음'], true);
  console.log('설문 편집 링크: ' + form.getEditUrl());
  console.log('미게시 초안입니다. 화면 시연 방식과 소개문을 검토하고 폼에서 게시한 뒤 응답자 링크를 복사하세요.');
}
