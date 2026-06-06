// ============================================================
// Multi Tab Dimension Dummy API
// ============================================================
// 이 파일은 실제 서버 API를 붙이기 전까지 사용하는 더미 API 파일이다.
// 화면에서는 실제 axios API를 호출하는 것처럼 async 함수로 호출한다.
// 나중에 실서버 API가 준비되면 이 파일의 함수 내부만 axios 호출로 교체하면 된다.

// ============================================================
// 1. Internal Delay Utility
// ============================================================

// 실제 API 호출처럼 약간의 지연 시간을 주기 위한 함수이다.
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// 2. Cascade Select Dummy Master Data
// ============================================================

// 5단계 연계 셀렉트박스의 기준이 되는 더미 마스터 데이터이다.
// 실제 업무에서는 DB에서 조회하겠지만, 현재는 구조 검증이 목적이므로 배열로 관리한다.
// level1 ~ level5는 SQL 조건이 누적되는 구조를 흉내낸다.
// 예: level1 선택 → level2 조회조건
// 예: level1 + level2 선택 → level3 조회조건
const CASCADE_MASTER_ROWS = [
  {
    level1: "SALES",
    level2: "KR",
    level3: "DRAM",
    level4: "MOBILE",
    level5: "CUSTOMER_A",
  },
  {
    level1: "SALES",
    level2: "KR",
    level3: "DRAM",
    level4: "SERVER",
    level5: "CUSTOMER_B",
  },
  {
    level1: "SALES",
    level2: "US",
    level3: "NAND",
    level4: "SSD",
    level5: "CUSTOMER_C",
  },
  {
    level1: "PLAN",
    level2: "EU",
    level3: "DRAM",
    level4: "PC",
    level5: "CUSTOMER_D",
  },
  {
    level1: "PLAN",
    level2: "CN",
    level3: "NAND",
    level4: "UFS",
    level5: "CUSTOMER_E",
  },
  {
    level1: "ACTUAL",
    level2: "KR",
    level3: "DRAM",
    level4: "MOBILE",
    level5: "CUSTOMER_F",
  },
  {
    level1: "ACTUAL",
    level2: "US",
    level3: "NAND",
    level4: "SSD",
    level5: "CUSTOMER_G",
  },
  {
    level1: "FORECAST",
    level2: "JP",
    level3: "DRAM",
    level4: "SERVER",
    level5: "CUSTOMER_H",
  },
  {
    level1: "FORECAST",
    level2: "TW",
    level3: "NAND",
    level4: "CARD",
    level5: "CUSTOMER_I",
  },
];

// ============================================================
// 3. Checkbox + Select Dummy Options
// ============================================================

// Dashboard와 동적 컬럼 부모 헤더가 되는 체크박스+멀티셀렉트 5개의 더미 옵션이다.
// 실제 업무에서는 각 셀렉트박스 옵션을 DB에서 가져오겠지만,
// 현재는 구조화 템플릿이 목적이므로 고정 배열로 제공한다.
const EXTRA_SELECT_OPTIONS = {
  dashboard: [
    { value: "DASH_MAIN", label: "Main Dashboard" },
    { value: "DASH_SALES", label: "Sales Dashboard" },
    { value: "DASH_PLAN", label: "Plan Dashboard" },
  ],

  metricGroup1: [
    { value: "QTY", label: "QTY" },
    { value: "ASP", label: "ASP" },
    { value: "AMT", label: "AMT" },
  ],

  metricGroup2: [
    { value: "WAFER", label: "Wafer" },
    { value: "BIT", label: "Bit" },
    { value: "GROSS_DIE", label: "Gross Die" },
  ],

  metricGroup3: [
    { value: "INPUT", label: "Input" },
    { value: "OUTPUT", label: "Output" },
    { value: "SHIP", label: "Ship" },
  ],

  metricGroup4: [
    { value: "INV", label: "Inventory" },
    { value: "WIP", label: "WIP" },
    { value: "COST", label: "Cost" },
  ],

  metricGroup5: [
    { value: "RATIO", label: "Ratio" },
    { value: "GAP", label: "Gap" },
    { value: "TOTAL", label: "Total" },
  ],
};

// ============================================================
// 4. Sub Total Dummy Policy
// ============================================================

// Sub Total 표시 문구이다.
// 실무에서는 쿼리 결과에서 특정 컬럼값에 이 문구가 내려올 수 있다.
const SUBTOTAL_LABEL = "Sub Total";

// Sub Total row를 생성할 계층 필드이다.
// 상위 → 하위 순서로 정의한다.
const SUBTOTAL_HIERARCHY_FIELDS = ["family", "tech", "fab", "dens"];

// ============================================================
// 5. Utility Functions
// ============================================================

// 중복 값을 제거하고 select option 형태로 변환한다.
// AG Grid나 React select에서 사용하기 쉽도록 { value, label } 구조로 만든다.
function uniqOptions(values) {
  return [...new Set(values)].map((value) => ({
    value,
    label: value,
  }));
}

// 특정 row가 상위 레벨 선택조건을 모두 만족하는지 확인한다.
// SQL로 비유하면 아래 조건을 JS filter로 흉내내는 것이다.
// AND level1 IN (...)
// AND level2 IN (...)
// AND level3 IN (...)
function containsAllSelected(row, selectedMap, maxParentLevel) {
  // level1부터 maxParentLevel까지 순회한다.
  for (let level = 1; level <= maxParentLevel; level += 1) {
    // 현재 레벨의 선택값 배열을 조회한다.
    const selectedValues = selectedMap[`level${level}`] ?? [];

    // 선택값이 있고, 현재 row 값이 선택값에 포함되지 않으면 조건 불일치이다.
    if (
      selectedValues.length > 0 &&
      !selectedValues.includes(row[`level${level}`])
    ) {
      return false;
    }
  }

  // 모든 상위 조건을 통과하면 조회 대상이다.
  return true;
}

// 현재 row와 다음 row를 비교해서 종료되는 계층 레벨 목록을 반환한다.
// 예: dens만 바뀌면 dens 레벨 subtotal만 필요하다.
// 예: tech가 바뀌면 tech/fab/dens 레벨 subtotal이 필요하다.
function getClosedHierarchyLevels(currentRow, nextRow) {
  // 다음 row가 없으면 마지막 row이므로 모든 계층 subtotal을 닫아야 한다.
  if (!nextRow) {
    return SUBTOTAL_HIERARCHY_FIELDS.map((_, index) => index).reverse();
  }

  // 값이 달라지는 첫 번째 계층 index를 찾는다.
  const firstChangedIndex = SUBTOTAL_HIERARCHY_FIELDS.findIndex(
    (field) => currentRow[field] !== nextRow[field],
  );

  // 달라지는 계층이 없으면 subtotal row를 만들 필요가 없다.
  if (firstChangedIndex < 0) {
    return [];
  }

  // 첫 변경 계층부터 하위 계층까지 닫는다.
  // 하위 계층부터 subtotal을 넣어야 ㄴ자 구조가 자연스럽다.
  return SUBTOTAL_HIERARCHY_FIELDS.map((_, index) => index)
    .filter((index) => index >= firstChangedIndex)
    .reverse();
}

// 특정 계층 레벨에 대한 Sub Total row를 생성한다.
// 실무에서는 이 row가 쿼리에서 계산되어 내려온다고 보면 된다.
function createSubtotalRow(baseRow, levelIndex) {
  // subtotal이 발생한 필드명을 찾는다.
  const subtotalField = SUBTOTAL_HIERARCHY_FIELDS[levelIndex];

  // 기존 row를 기반으로 subtotal row를 만든다.
  const subtotalRow = {
    ...baseRow,

    // 화면에서 data row와 subtotal row를 구분하기 위한 내부 필드이다.
    _rowType: "SUBTOTAL",

    // 몇 번째 계층 subtotal인지 표시한다.
    _subtotalLevel: levelIndex,

    // 어떤 필드에 Sub Total 문구가 들어갔는지 표시한다.
    _subtotalField: subtotalField,
  };

  // 계층 필드를 순회하면서 subtotal row의 표시값을 만든다.
  SUBTOTAL_HIERARCHY_FIELDS.forEach((field, index) => {
    // subtotal 레벨보다 상위 필드는 원래 값을 유지한다.
    if (index < levelIndex) {
      subtotalRow[field] = baseRow[field];
      return;
    }

    // subtotal 레벨 필드에는 "값 Sub Total"을 표시한다.
    if (index === levelIndex) {
      subtotalRow[field] = `${baseRow[field]} ${SUBTOTAL_LABEL}`;
      return;
    }

    // subtotal 레벨보다 하위 필드는 빈 값으로 표시한다.
    subtotalRow[field] = "";
  });

  // 더미에서는 subtotal 계산값을 단순히 원 row 값으로 둔다.
  // 실무에서는 SQL에서 이미 합산된 qty/asp/amt 값을 내려주면 된다.
  subtotalRow.qty = baseRow.qty;
  subtotalRow.asp = baseRow.asp;
  subtotalRow.amt = baseRow.amt;

  // subtotal row를 반환한다.
  return subtotalRow;
}

// 일반 data row 사이에 Sub Total row를 추가한다.
// 실무에서는 백엔드/쿼리에서 이미 처리된 결과를 내려주고,
// 프론트는 _rowType 또는 컬럼값의 "Sub Total" 여부만 보고 스타일링하면 된다.
function appendSubtotalRows(rows) {
  // 결과 row 배열을 준비한다.
  const result = [];

  // 원본 row를 순회한다.
  rows.forEach((row, index) => {
    // 일반 데이터 row임을 표시한다.
    const dataRow = {
      ...row,
      _rowType: "DATA",
    };

    // 일반 데이터 row를 먼저 추가한다.
    result.push(dataRow);

    // 다음 row를 가져온다.
    const nextRow = rows[index + 1];

    // 현재 row에서 닫혀야 하는 계층 레벨을 계산한다.
    const closedLevels = getClosedHierarchyLevels(row, nextRow);

    // 닫혀야 하는 계층 레벨마다 subtotal row를 추가한다.
    closedLevels.forEach((levelIndex) => {
      result.push(createSubtotalRow(row, levelIndex));
    });
  });

  // 일반 row + subtotal row가 섞인 결과를 반환한다.
  return result;
}

// ============================================================
// 6. Cascade Select API
// ============================================================

// 최초 화면 진입 시 1단계 셀렉트박스 옵션만 조회한다.
// 하위 셀렉트박스는 상위 선택값이 있어야 의미가 있으므로 빈 배열로 시작한다.
export async function fetchInitialCascadeOptions() {
  // 실제 API 호출처럼 지연 시간을 준다.
  await delay();

  // level1은 전체 마스터에서 고유값을 추출한다.
  return {
    level1: uniqOptions(CASCADE_MASTER_ROWS.map((row) => row.level1)),
    level2: [],
    level3: [],
    level4: [],
    level5: [],
  };
}

// 특정 레벨의 셀렉트박스 옵션을 조회한다.
// level2 조회 시 level1 선택값을 조건으로 사용한다.
// level3 조회 시 level1 + level2 선택값을 조건으로 사용한다.
// 이런 식으로 level5까지 누적 조건을 사용한다.
export async function fetchCascadeOptions(level, selectedMap) {
  // 실제 API 호출처럼 지연 시간을 준다.
  await delay();

  // level1은 부모 조건이 없으므로 전체 고유값을 반환한다.
  if (level <= 1) {
    return uniqOptions(CASCADE_MASTER_ROWS.map((row) => row.level1));
  }

  // 현재 레벨보다 상위 레벨의 선택조건으로 마스터 데이터를 필터링한다.
  const filteredRows = CASCADE_MASTER_ROWS.filter((row) =>
    containsAllSelected(row, selectedMap, level - 1),
  );

  // 필터링된 row에서 현재 레벨 값만 추출해 option으로 변환한다.
  return uniqOptions(filteredRows.map((row) => row[`level${level}`]));
}

// ============================================================
// 7. Checkbox + Select API
// ============================================================

// Dashboard와 동적컬럼용 5개 셀렉트박스 옵션을 조회한다.
// 실제 업무에서는 화면 진입 시 각 콤보 값을 DB/API에서 가져오면 된다.
export async function fetchExtraSelectOptions() {
  // 실제 API 호출처럼 지연 시간을 준다.
  await delay();

  // 고정 더미 옵션을 반환한다.
  return EXTRA_SELECT_OPTIONS;
}

// ============================================================
// 8. Grid Search API
// ============================================================

// 조회 버튼 클릭 시 호출되는 더미 그리드 조회 API이다.
// 실제 API처럼 request 객체를 받아서 rowData 배열을 반환한다.
export async function searchMultiTabDimensionRows(request) {
  // 실제 API 호출처럼 지연 시간을 준다.
  await delay(250);

  // 활성 탭에 따라 DRAM/NAND 더미 데이터를 구분한다.
  const baseRows =
    request.activeTabId === "DRAM" ? buildDramRows() : buildNandRows();

  // Sub Total 체크 여부에 따라 subtotal row를 추가한다.
  const rows = request.searchForm?.useSubTotal
    ? appendSubtotalRows(baseRows)
    : baseRows.map((row) => ({
        ...row,
        _rowType: "DATA",
      }));

  // AG Grid getRowId에서 사용할 rowId를 부여한다.
  return rows.map((row, index) => ({
    ...row,
    rowId: `${request.activeTabId}-${index + 1}`,
  }));
}

// DRAM 탭 조회 시 사용할 더미 rowData이다.
// family > tech > fab > dens > ver > mode > app 계층을 테스트할 수 있게 구성한다.
function buildDramRows() {
  return [
    {
      family: "DRAM",
      tech: "1A",
      fab: "M16",
      dens: "8Gb",
      ver: "V1",
      mode: "MOBILE",
      app: "LPDDR",
      customer: "SEC",
      qty: 120,
      asp: 3.2,
      amt: 384,
    },
    {
      family: "DRAM",
      tech: "1A",
      fab: "M16",
      dens: "8Gb",
      ver: "V1",
      mode: "MOBILE",
      app: "LPDDR",
      customer: "APPLE",
      qty: 90,
      asp: 3.4,
      amt: 306,
    },
    {
      family: "DRAM",
      tech: "1A",
      fab: "M16",
      dens: "16Gb",
      ver: "V2",
      mode: "SERVER",
      app: "DDR5",
      customer: "DELL",
      qty: 80,
      asp: 5.1,
      amt: 408,
    },
    {
      family: "DRAM",
      tech: "1B",
      fab: "M15",
      dens: "16Gb",
      ver: "V1",
      mode: "SERVER",
      app: "DDR5",
      customer: "HP",
      qty: 70,
      asp: 5.3,
      amt: 371,
    },
    {
      family: "DRAM",
      tech: "1B",
      fab: "M15",
      dens: "32Gb",
      ver: "V2",
      mode: "PC",
      app: "DDR4",
      customer: "LENOVO",
      qty: 60,
      asp: 4.1,
      amt: 246,
    },
  ];
}

// NAND 탭 조회 시 사용할 더미 rowData이다.
// DRAM과 다른 값이 나오도록 해서 탭별 조회/기억 구조를 확인할 수 있게 한다.
function buildNandRows() {
  return [
    {
      family: "NAND",
      tech: "176L",
      fab: "M14",
      dens: "512Gb",
      ver: "V1",
      mode: "SSD",
      app: "CLIENT",
      customer: "SEC",
      qty: 140,
      asp: 2.4,
      amt: 336,
    },
    {
      family: "NAND",
      tech: "176L",
      fab: "M14",
      dens: "512Gb",
      ver: "V2",
      mode: "SSD",
      app: "ENTERPRISE",
      customer: "DELL",
      qty: 75,
      asp: 2.9,
      amt: 217.5,
    },
    {
      family: "NAND",
      tech: "238L",
      fab: "M17",
      dens: "1Tb",
      ver: "V1",
      mode: "UFS",
      app: "MOBILE",
      customer: "APPLE",
      qty: 110,
      asp: 3.1,
      amt: 341,
    },
    {
      family: "NAND",
      tech: "238L",
      fab: "M17",
      dens: "1Tb",
      ver: "V1",
      mode: "CARD",
      app: "RETAIL",
      customer: "SANDISK",
      qty: 95,
      asp: 1.7,
      amt: 161.5,
    },
  ];
}

// ============================================================
// 9. Dimension API
// ============================================================

// Dimension 메타 정보를 조회한다.
// 실무에서는 DB에서 Dimension 정의를 조회하는 API가 된다.
export async function fetchDimensionItems() {
  await delay();

  return [
    {
      key: "FAMILY",
      value: "Family",
      field: "family",
      order: 1,
      scope: "COMMON",
      states: ["BASE", "UPPER2", "COLCHG"],
    },
    {
      key: "TECH",
      value: "Tech",
      field: "tech",
      order: 2,
      scope: "COMMON",
      states: ["BASE", "UPPER2", "COLCHG"],
    },
    {
      key: "FAB",
      value: "Fab",
      field: "fab",
      order: 3,
      scope: "COMMON",
      states: ["BASE", "UPPER2", "COLCHG"],
    },
    {
      key: "DENS",
      value: "Dens",
      field: "dens",
      order: 4,
      scope: "COMMON",
      states: ["BASE", "UPPER2", "COLCHG"],
    },
    {
      key: "VER",
      value: "Ver",
      field: "ver",
      order: 5,
      scope: "COMMON",
      states: ["BASE", "UPPER2", "COLCHG"],
    },
    {
      key: "MODE",
      value: "Mode",
      field: "mode",
      order: 6,
      scope: "COMMON",
      states: ["BASE", "UPPER2", "COLCHG"],
    },
    {
      key: "APP",
      value: "APP",
      field: "app",
      order: 7,
      scope: "COMMON",
      states: ["BASE", "UPPER2", "COLCHG"],
    },
    {
      key: "DRAM_SPEED",
      value: "DRAM Speed",
      field: "dramSpeed",
      order: 8,
      scope: "DRAM",
      states: ["UPPER2"],
    },
    {
      key: "DRAM_GENERATION",
      value: "DRAM Gen",
      field: "dramGeneration",
      order: 9,
      scope: "DRAM",
      states: ["UPPER2"],
    },
    {
      key: "NAND_LAYER",
      value: "NAND Layer",
      field: "nandLayer",
      order: 10,
      scope: "NAND",
      states: ["BASE", "COLCHG"],
    },
    {
      key: "NAND_CELL",
      value: "NAND Cell",
      field: "nandCell",
      order: 11,
      scope: "NAND",
      states: ["COLCHG"],
    },
  ];
}
