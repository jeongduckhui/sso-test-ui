// ========================================
// 상위 탭 정의
// ========================================

// 화면 상단에 표시될 큰 탭 목록을 export
export const BIG_TABS = [
  // Total 탭
  { id: "total", label: "Total" },

  // 수요 탭
  { id: "demand", label: "수요" },

  // 공급 탭
  { id: "supply", label: "공급" },
];

// ========================================
// 탭별 조회조건 설정
// ========================================

// 큰 탭별로 조회조건 구성을 정의
export const CONDITION_CONFIG = {
  // Total 탭 조회조건 목록
  total: [
    {
      // input 타입 조회조건
      type: "input",

      // searchForm에 저장될 필드명
      name: "keyword",

      // 화면에 표시될 라벨
      label: "통합검색어",

      // input placeholder
      placeholder: "검색어 입력",
    },
    {
      // select box 타입 조회조건
      type: "select",

      // searchForm에 저장될 필드명
      name: "region",

      // 화면에 표시될 라벨
      label: "지역",

      // select option 목록
      options: [
        // 전체 조회
        { value: "", label: "전체" },

        // 서울 조건
        { value: "SEOUL", label: "서울" },

        // 부산 조건
        { value: "BUSAN", label: "부산" },
      ],
    },
    {
      // radio 타입 조회조건
      type: "radio",

      // searchForm에 저장될 필드명
      name: "periodType",

      // 화면에 표시될 라벨
      label: "기간",

      // radio option 목록
      options: [
        // 일 단위
        { value: "DAY", label: "일" },

        // 월 단위
        { value: "MONTH", label: "월" },
      ],
    },
    {
      // checkbox 타입 조회조건
      type: "checkbox",

      // searchForm에 저장될 필드명
      name: "includeClosed",

      // 화면에 표시될 라벨
      label: "마감 포함",
    },
  ],

  // 수요 탭 조회조건 목록
  demand: [
    {
      // select box 타입 조회조건
      type: "select",

      // searchForm에 저장될 필드명
      name: "demandType",

      // 화면에 표시될 라벨
      label: "수요구분",

      // select option 목록
      options: [
        // 전체 조회
        { value: "", label: "전체" },

        // 일반 수요
        { value: "NORMAL", label: "일반" },

        // 긴급 수요
        { value: "URGENT", label: "긴급" },
      ],
    },
    {
      // input 타입 조회조건
      type: "input",

      // searchForm에 저장될 필드명
      name: "customerName",

      // 화면에 표시될 라벨
      label: "고객명",

      // input placeholder
      placeholder: "고객명 입력",
    },
    {
      // date 타입 조회조건
      type: "date",

      // searchForm에 저장될 필드명
      name: "requestDate",

      // 화면에 표시될 라벨
      label: "요청일자",
    },
  ],

  // 공급 탭 조회조건 목록
  supply: [
    {
      // select box 타입 조회조건
      type: "select",

      // searchForm에 저장될 필드명
      name: "factory",

      // 화면에 표시될 라벨
      label: "공장",

      // select option 목록
      options: [
        // 전체 조회
        { value: "", label: "전체" },

        // 1공장
        { value: "F1", label: "1공장" },

        // 2공장
        { value: "F2", label: "2공장" },
      ],
    },
    {
      // radio 타입 조회조건
      type: "radio",

      // searchForm에 저장될 필드명
      name: "supplyStatus",

      // 화면에 표시될 라벨
      label: "공급상태",

      // radio option 목록
      options: [
        // 전체 공급상태
        { value: "ALL", label: "전체" },

        // 준비 상태
        { value: "READY", label: "준비" },

        // 완료 상태
        { value: "DONE", label: "완료" },
      ],
    },
    {
      // checkbox 타입 조회조건
      type: "checkbox",

      // searchForm에 저장될 필드명
      name: "onlyShortage",

      // 화면에 표시될 라벨
      label: "부족분만",
    },
    {
      // input 타입 조회조건
      type: "input",

      // searchForm에 저장될 필드명
      name: "materialCode",

      // 화면에 표시될 라벨
      label: "자재코드",

      // input placeholder
      placeholder: "자재코드 입력",
    },
  ],
};

// ========================================
// ag-grid 컬럼 정의
// ========================================

// 스냅샷 그리드에서 사용할 컬럼 정의
export const SNAPSHOT_GRID_COLUMN_DEFS = [
  {
    // 체크박스 컬럼이라 헤더명 없음
    headerName: "",

    // 데이터 필드명
    field: "checked",

    // 컬럼 너비
    width: 60,

    // 행 선택 체크박스 표시
    checkboxSelection: true,

    // 헤더 전체 선택 체크박스 표시
    headerCheckboxSelection: true,

    // 체크박스 컬럼은 수정 불가
    editable: false,
  },
  {
    // 행 상태 컬럼명
    headerName: "상태",

    // rowStatus 값을 표시
    field: "rowStatus",

    // 컬럼 너비
    width: 90,

    // 상태값은 사용자가 직접 수정하지 않음
    editable: false,
  },
  {
    // ID 컬럼명
    headerName: "ID",

    // id 필드 표시
    field: "id",

    // 컬럼 너비
    width: 120,
  },
  {
    // 구분 컬럼명
    headerName: "구분",

    // category 필드 표시
    field: "category",

    // 컬럼 너비
    width: 120,
  },
  {
    // 품목명 컬럼명
    headerName: "품목명",

    // itemName 필드 표시
    field: "itemName",

    // 남는 공간을 차지
    flex: 1,

    // 최소 너비
    minWidth: 180,
  },
  {
    // 수량 컬럼명
    headerName: "수량",

    // qty 필드 표시
    field: "qty",

    // 컬럼 너비
    width: 120,
  },
  {
    // 상태 컬럼명
    headerName: "상태",

    // status 필드 표시
    field: "status",

    // 컬럼 너비
    width: 120,
  },
  {
    // 조회조건 컬럼명
    headerName: "조회조건",

    // conditionText 필드 표시
    field: "conditionText",

    // 남는 공간을 차지
    flex: 1,

    // 최소 너비
    minWidth: 220,

    // 조회조건 표시값은 수정 불가
    editable: false,
  },
];

// ========================================
// 탭 ID로 조회조건 설정 가져오기
// ========================================

export function getConditionConfig(tabId) {
  // tabId에 해당하는 조회조건 설정 리턴
  // 없으면 빈 배열 리턴
  return CONDITION_CONFIG[tabId] ?? [];
}

// ========================================
// 탭별 기본 조회조건 객체 생성
// ========================================

export function getDefaultSearchForm(tabId) {
  // 현재 탭의 조회조건 설정 조회
  const config = getConditionConfig(tabId);

  // 조회조건 설정을 기반으로 기본 searchForm 객체 생성
  return config.reduce((acc, item) => {
    // checkbox는 기본값 false
    if (item.type === "checkbox") {
      acc[item.name] = false;

      // radio는 첫 번째 option 값을 기본값으로 사용
    } else if (item.type === "radio") {
      acc[item.name] = item.options?.[0]?.value ?? "";

      // input/select/date는 기본값 빈 문자열
    } else {
      acc[item.name] = "";
    }

    // 누적 객체 반환
    return acc;
  }, {});
}
