// Localized copy for the inquiry design preview. No live customer data.
const translations = {
  "ko": {
    "title": "문의하기 | 바론컨설턴트",
    "categories": {
      "notice": "공지사항",
      "general": "일반문의",
      "improvement": "개선문의",
      "error": "오류문의"
    },
    "statuses": {
      "new": "문의접수",
      "done": "답변완료",
      "review": "검토중",
      "patch": "패치예정"
    },
    "notices": [
      "이용 안내 및 문의 작성 방법",
      "프로그램 업데이트 안내",
      "이용가이드 안내",
      "설치 및 실행 전 확인사항",
      "통합로그인 이용 안내"
    ],
    "questions": {
      "egbim": [
        "PDF 출력 시 이미지 표시 관련 문의",
        "도면 편집 기능 개선 요청",
        "프로그램 설치 방법을 문의합니다",
        "다중출력 설정 관련 문의",
        "도면관리 기능 사용 방법 문의"
      ],
      "gaia": [
        "시추주상도 출력 설정 관련 문의",
        "성과품 양식 추가 요청",
        "프로그램 설치 방법을 문의합니다",
        "지층 정보 입력 시 확인 요청",
        "시추 데이터 불러오기 관련 문의"
      ],
      "tova": [
        "네트워크 데이터 불러오기 관련 문의",
        "교통 분석 결과 화면 개선 요청",
        "프로그램 설치 방법을 문의합니다",
        "공로 분석 설정 관련 문의",
        "대중교통 분석 기능 사용 방법 문의"
      ]
    },
    "noticeNumber": "공지",
    "company": "바론컨설턴트",
    "support": "고객지원",
    "admin": "관리자",
    "placeholderCompany": "회사명",
    "departments": [
      "설계부",
      "기술부",
      "사업부"
    ],
    "userPrefix": "사용자",
    "noticeContent": "{service} 서비스 이용 안내입니다.\n\n게시판의 제목, 내용, 작성 정보가 표시되는 디자인 예시입니다.",
    "questionContent": "{service} 이용 중 궁금한 사항을 문의합니다.\n\n이 영역에 문의 내용과 첨부파일, 답변이 표시됩니다. 현재 내용은 디자인 확인을 위한 예시입니다.",
    "replies": "답변 {count}개",
    "empty": "검색 조건에 맞는 문의가 없습니다.",
    "previous": "이전 페이지",
    "next": "다음 페이지",
    "page": "{page}페이지",
    "results": "{service} 문의 {count}건, {page} / {pages}페이지",
    "submitPreview": "디자인 미리보기 화면으로 문의는 전송되지 않습니다."
  },
  "en": {
    "title": "Software Inquiries | BARON Consultants",
    "categories": {
      "notice": "Notice",
      "general": "General",
      "improvement": "Suggestion",
      "error": "Bug report"
    },
    "statuses": {
      "new": "Received",
      "done": "Answered",
      "review": "In review",
      "patch": "Scheduled"
    },
    "notices": [
      "Getting started and submitting an inquiry",
      "Software update notice",
      "User guide",
      "Before installing and launching the software",
      "Single sign-on guide"
    ],
    "questions": {
      "egbim": [
        "Images missing from PDF exports",
        "Suggestion for drawing editing tools",
        "How do I install the software?",
        "Help with batch printing settings",
        "How to use drawing management"
      ],
      "gaia": [
        "Help with borehole log print settings",
        "Request for an additional report template",
        "How do I install the software?",
        "Checking geological layer information",
        "Help with importing borehole data"
      ],
      "tova": [
        "Help with importing network data",
        "Suggestion for the traffic analysis results screen",
        "How do I install the software?",
        "Help with road traffic analysis settings",
        "How to use public transport analysis"
      ]
    },
    "noticeNumber": "Notice",
    "company": "Baron Consultants",
    "support": "Support",
    "admin": "Admin",
    "placeholderCompany": "Company",
    "departments": [
      "Design",
      "Engineering",
      "Business"
    ],
    "userPrefix": "User ",
    "noticeContent": "A guide to using {service}.\n\nThis sample shows how a post title, content, and author information will appear.",
    "questionContent": "I have a question about using {service}.\n\nInquiry details, attachments, and replies will appear here. This is sample content for the design preview.",
    "replies": "Replies: {count}",
    "empty": "No inquiries match your search.",
    "previous": "Previous page",
    "next": "Next page",
    "page": "Page {page}",
    "results": "{service}: {count} inquiries, page {page} of {pages}",
    "submitPreview": "This is a design preview. Your inquiry has not been sent."
  }
};

export const inquiryCopy = translations[document.documentElement.lang === "en" ? "en" : "ko"];
