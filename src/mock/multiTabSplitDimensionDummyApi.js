// ============================================================
// Multi Tab Split Dimension Dummy API
// ============================================================
// 이 파일은 새 버전 탭 분리 화면에서 사용하는 더미 API이다.
// 응답 컬럼명은 차세대 규칙을 반영한다.
//
// 분기: q202601_컬럼명, q202602_컬럼명, q202603_컬럼명, q202604_컬럼명
// 반기: h202601_컬럼명, h202602_컬럼명
// 연간: h2026_컬럼명
// 월  : m202601_컬럼명
// ============================================================

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// 1. Cascade Select Dummy Master Data
// ============================================================

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
];

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

const SUBTOTAL_LABEL = "Sub Total";
const SUBTOTAL_HIERARCHY_FIELDS = ["family", "tech", "fab", "dens"];

function uniqOptions(values) {
  return [...new Set(values)].map((value) => ({
    value,
    label: value,
  }));
}

function containsAllSelected(row, selectedMap, maxParentLevel) {
  for (let level = 1; level <= maxParentLevel; level += 1) {
    const selectedValues = selectedMap[`level${level}`] ?? [];

    if (
      selectedValues.length > 0 &&
      !selectedValues.includes(row[`level${level}`])
    ) {
      return false;
    }
  }

  return true;
}

function getClosedHierarchyLevels(currentRow, nextRow) {
  if (!nextRow) {
    return SUBTOTAL_HIERARCHY_FIELDS.map((_, index) => index).reverse();
  }

  const firstChangedIndex = SUBTOTAL_HIERARCHY_FIELDS.findIndex(
    (field) => currentRow[field] !== nextRow[field],
  );

  if (firstChangedIndex < 0) {
    return [];
  }

  return SUBTOTAL_HIERARCHY_FIELDS.map((_, index) => index)
    .filter((index) => index >= firstChangedIndex)
    .reverse();
}

function createSubtotalRow(baseRow, levelIndex) {
  const subtotalField = SUBTOTAL_HIERARCHY_FIELDS[levelIndex];

  const subtotalRow = {
    ...baseRow,
    _rowType: "SUBTOTAL",
    _subtotalLevel: levelIndex,
    _subtotalField: subtotalField,
  };

  SUBTOTAL_HIERARCHY_FIELDS.forEach((field, index) => {
    if (index < levelIndex) {
      subtotalRow[field] = baseRow[field];
      return;
    }

    if (index === levelIndex) {
      subtotalRow[field] = `${baseRow[field]} ${SUBTOTAL_LABEL}`;
      return;
    }

    subtotalRow[field] = "";
  });

  return subtotalRow;
}

function appendSubtotalRows(rows) {
  const result = [];

  rows.forEach((row, index) => {
    const dataRow = {
      ...row,
      _rowType: "DATA",
    };

    result.push(dataRow);

    const nextRow = rows[index + 1];
    const closedLevels = getClosedHierarchyLevels(row, nextRow);

    closedLevels.forEach((levelIndex) => {
      result.push(createSubtotalRow(row, levelIndex));
    });
  });

  return result;
}

// ============================================================
// 2. API
// ============================================================

export async function fetchInitialCascadeOptions() {
  await delay();

  return {
    level1: uniqOptions(CASCADE_MASTER_ROWS.map((row) => row.level1)),
    level2: [],
    level3: [],
    level4: [],
    level5: [],
  };
}

export async function fetchCascadeOptions(level, selectedMap) {
  await delay();

  if (level <= 1) {
    return uniqOptions(CASCADE_MASTER_ROWS.map((row) => row.level1));
  }

  const filteredRows = CASCADE_MASTER_ROWS.filter((row) =>
    containsAllSelected(row, selectedMap, level - 1),
  );

  return uniqOptions(filteredRows.map((row) => row[`level${level}`]));
}

export async function fetchExtraSelectOptions() {
  await delay();
  return EXTRA_SELECT_OPTIONS;
}

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

export async function searchMultiTabSplitRows(request) {
  await delay(250);

  const baseRows =
    request.activeTabKey === "1" ? buildDramRows() : buildNandRows();

  const rows = request.searchForm?.useSubTotal
    ? appendSubtotalRows(baseRows)
    : baseRows.map((row) => ({
        ...row,
        _rowType: "DATA",
      }));

  return rows.map((row, index) => ({
    ...row,
    rowId: `${request.activeTabKey}-${index + 1}`,
  }));
}

// ============================================================
// 3. Row Data
// ============================================================

function createDynamicValues(seed) {
  return {
    // 분기 응답 컬럼
    q202601_qty: seed * 10 + 1,
    q202602_qty: seed * 10 + 2,
    q202603_qty: seed * 10 + 3,
    q202604_qty: seed * 10 + 4,

    q202601_asp: seed + 0.1,
    q202602_asp: seed + 0.2,
    q202603_asp: seed + 0.3,
    q202604_asp: seed + 0.4,

    q202601_amt: seed * 100 + 10,
    q202602_amt: seed * 100 + 20,
    q202603_amt: seed * 100 + 30,
    q202604_amt: seed * 100 + 40,

    // 반기 응답 컬럼
    h202601_qty: seed * 20 + 1,
    h202602_qty: seed * 20 + 2,

    h202601_asp: seed + 0.5,
    h202602_asp: seed + 0.6,

    h202601_amt: seed * 200 + 10,
    h202602_amt: seed * 200 + 20,

    // 연간 응답 컬럼
    h2026_qty: seed * 40,
    h2026_asp: seed + 1.0,
    h2026_amt: seed * 400,

    // 월 응답 컬럼
    m202601_qty: seed * 3 + 1,
    m202602_qty: seed * 3 + 2,
    m202603_qty: seed * 3 + 3,

    m202601_asp: seed + 0.01,
    m202602_asp: seed + 0.02,
    m202603_asp: seed + 0.03,

    m202601_amt: seed * 30 + 1,
    m202602_amt: seed * 30 + 2,
    m202603_amt: seed * 30 + 3,
  };
}

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
      dramSpeed: "6400",
      dramGeneration: "G1",
      ...createDynamicValues(1),
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
      dramSpeed: "6400",
      dramGeneration: "G1",
      ...createDynamicValues(2),
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
      dramSpeed: "7200",
      dramGeneration: "G2",
      ...createDynamicValues(3),
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
      dramSpeed: "7200",
      dramGeneration: "G2",
      ...createDynamicValues(4),
    },
  ];
}

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
      nandLayer: "176L",
      nandCell: "TLC",
      ...createDynamicValues(5),
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
      nandLayer: "176L",
      nandCell: "TLC",
      ...createDynamicValues(6),
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
      nandLayer: "238L",
      nandCell: "QLC",
      ...createDynamicValues(7),
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
      nandLayer: "238L",
      nandCell: "QLC",
      ...createDynamicValues(8),
    },
  ];
}
