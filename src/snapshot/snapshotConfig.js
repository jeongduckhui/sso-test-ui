// 상위 탭 정의
export const BIG_TABS = [
  // Total 탭
  { id: "total", label: "Total" },

  // 수요 탭
  { id: "demand", label: "수요" },

  // 공급 탭
  { id: "supply", label: "공급" },
];

// 탭별 조회조건 설정
// 실무에서는 아마 퍼블리셔가 다 만들어놨을 거니까
// 동적으로 만들 필요가 없음
// 따라서 로직을 위해서 type, name만 있는 객체를 만들고
// 값이 변할 때 세팅할 수 있게 하는 기능으로만 사용하면 될 듯.
export const CONDITION_CONFIG = {
  // Total 탭 조회조건
  total: [
    {
      type: "input",
      name: "keyword",
      label: "통합검색어",
      placeholder: "검색어 입력",
    },
    {
      type: "select",
      name: "region",
      label: "지역",
      options: [
        { value: "", label: "전체" },
        { value: "SEOUL", label: "서울" },
        { value: "BUSAN", label: "부산" },
      ],
    },
    {
      type: "radio",
      name: "periodType",
      label: "기간",
      options: [
        { value: "DAY", label: "일" },
        { value: "MONTH", label: "월" },
      ],
    },
    {
      type: "checkbox",
      name: "includeClosed",
      label: "마감 포함",
    },
  ],

  // 수요 탭 조회조건
  demand: [
    {
      type: "select",
      name: "demandType",
      label: "수요구분",
      options: [
        { value: "", label: "전체" },
        { value: "NORMAL", label: "일반" },
        { value: "URGENT", label: "긴급" },
      ],
    },
    {
      type: "input",
      name: "customerName",
      label: "고객명",
      placeholder: "고객명 입력",
    },
    {
      type: "date",
      name: "requestDate",
      label: "요청일자",
    },
  ],

  // 공급 탭 조회조건
  supply: [
    {
      type: "select",
      name: "factory",
      label: "공장",
      options: [
        { value: "", label: "전체" },
        { value: "F1", label: "1공장" },
        { value: "F2", label: "2공장" },
      ],
    },
    {
      type: "radio",
      name: "supplyStatus",
      label: "공급상태",
      options: [
        { value: "ALL", label: "전체" },
        { value: "READY", label: "준비" },
        { value: "DONE", label: "완료" },
      ],
    },
    {
      type: "checkbox",
      name: "onlyShortage",
      label: "부족분만",
    },
    {
      type: "input",
      name: "materialCode",
      label: "자재코드",
      placeholder: "자재코드 입력",
    },
  ],
};

// ag-grid 컬럼 정의
export const SNAPSHOT_GRID_COLUMN_DEFS = [
  {
    headerName: "",
    field: "checked",
    width: 60,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    editable: false,
  },
  {
    headerName: "행상태",
    field: "rowStatus",
    width: 90,
    editable: false,
  },
  {
    headerName: "ID",
    field: "id",
    width: 120,
  },
  {
    headerName: "구분",
    field: "category",
    width: 120,
  },
  {
    headerName: "품목명",
    field: "itemName",
    flex: 1,
    minWidth: 180,
  },
  {
    headerName: "수량",
    field: "qty",
    width: 120,
  },
  {
    headerName: "상태",
    field: "status",
    width: 120,
  },
  {
    headerName: "조회조건",
    field: "conditionText",
    flex: 1,
    minWidth: 220,
    editable: false,
  },
];

// 탭 ID로 조회조건 설정 조회
export function getConditionConfig(tabId) {
  return CONDITION_CONFIG[tabId] ?? [];
}

// 탭별 기본 조회조건 생성
export function getDefaultSearchForm(tabId) {
  const config = getConditionConfig(tabId);

  return config.reduce((acc, item) => {
    if (item.type === "checkbox") {
      acc[item.name] = false;
    } else if (item.type === "radio") {
      acc[item.name] = item.options?.[0]?.value ?? "";
    } else {
      acc[item.name] = "";
    }

    return acc;
  }, {});
}
