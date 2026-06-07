// React Hook을 import한다.
import { useEffect, useMemo, useState } from "react";

// AG Grid React 컴포넌트를 import한다.
import { AgGridReact } from "ag-grid-react";

// AG Grid Community 모듈을 등록하기 위해 import한다.
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// 기존 프로젝트에서 사용하는 AG Grid 기본 CSS를 import한다.
import "ag-grid-community/styles/ag-grid.css";

// 기존 프로젝트에서 사용하는 AG Grid Quartz 테마 CSS를 import한다.
import "ag-grid-community/styles/ag-theme-quartz.css";

// 실제 API처럼 동작하는 더미 API 함수들을 import한다.
import {
  fetchCascadeOptions,
  fetchExtraSelectOptions,
  fetchInitialCascadeOptions,
  searchMultiTabDimensionRows,
  fetchDimensionItems,
} from "../mock/multiTabDimensionDummyApi";

// AG Grid Community 전체 기능을 등록한다.
ModuleRegistry.registerModules([AllCommunityModule]);

// ============================================================
// 1. Constants
// ============================================================

// 탭 ID를 상수로 관리한다.
// 문자열을 직접 사용하면 오타가 나도 찾기 어려우므로 상수화한다.
const TAB_IDS = {
  DRAM: "DRAM",
  NAND: "NAND",
};

// 화면에 표시할 탭 목록이다.
// 나중에 탭이 늘어나면 이 배열에만 추가하면 된다.
const TABS = [
  {
    id: TAB_IDS.DRAM,
    label: "DRAM",
  },
  {
    id: TAB_IDS.NAND,
    label: "NAND",
  },
];

// 5단계 연계 셀렉트박스의 필드명을 정의한다.
// 이 배열의 순서가 상위 → 하위 레벨 순서이다.
const CASCADE_FIELDS = ["level1", "level2", "level3", "level4", "level5"];

// 체크박스 + 멀티셀렉트 5개 필드명을 정의한다.
// 이 값들의 선택값이 동적 컬럼의 부모 헤더가 된다.
const METRIC_SELECT_FIELDS = [
  "metricGroup1",
  "metricGroup2",
  "metricGroup3",
  "metricGroup4",
  "metricGroup5",
];

// 시간 단위 값을 상수로 정의한다.
// 월은 단독 선택이고, 분기/반기/연간은 중복 선택 가능하다.
const PERIOD_TYPES = {
  MONTH: "MONTH",
  QUARTER: "QUARTER",
  HALF: "HALF",
  YEAR: "YEAR",
};

// Tech/TDM/APP/Mode 선택값을 상수로 정의한다.
const DIMENSION_MODES = {
  NONE: "",
  TECH: "TECH",
  TDM: "TDM",
  APP: "APP",
  MODE: "MODE",
};

// Dimension 상태값을 상수로 관리한다.
const DIMENSION_STATES = {
  BASE: "BASE",
  ALL: "ALL",
  ALL_TAB: "ALL_TAB",
  UPPER2: "UPPER2",
  COLCHG: "COLCHG",
};

/*

// 조회조건을 공통과 탭별로 나눠서 오버라이드로 관리할 수 있음.

const DRAM_DEFAULT_SEARCH_FORM = {
  dramType: [],
  dramGeneration: [],
};

const NAND_DEFAULT_SEARCH_FORM = {
  nandLayer: [],
  nandCellType: [],
};

[ TAB_IDS.DRAM ]: {
  searchForm: {
    ...DEFAULT_SEARCH_FORM,
    ...DRAM_DEFAULT_SEARCH_FORM,
  }
}

[ TAB_IDS.NAND ]: {
  searchForm: {
    ...DEFAULT_SEARCH_FORM,
    ...NAND_DEFAULT_SEARCH_FORM,
  }
}

*/

// 조회조건의 기본값이다.
// 탭별 상태를 만들 때 이 객체를 기반으로 복사한다.
const DEFAULT_SEARCH_FORM = {
  // 동적 컬럼의 연도/월/분기/반기/연간 생성 기준이 되는 시작년월이다.
  fromYm: "202401",

  // 동적 컬럼의 연도/월/분기/반기/연간 생성 기준이 되는 종료년월이다.
  toYm: "202612",

  // 5단계 연계 셀렉트박스 선택값이다.
  level1: [],
  level2: [],
  level3: [],
  level4: [],
  level5: [],

  // Sub Total 시각화 사용 여부이다.
  useSubTotal: false,

  // Tech/TDM/APP/Mode 선택값이다.
  dimensionMode: DIMENSION_MODES.NONE,

  // 월/분기/반기/연간 선택값이다.
  periodTypes: [PERIOD_TYPES.QUARTER],

  // Dashboard 체크 여부이다.
  dashboardChecked: false,

  // Dashboard 멀티셀렉트 선택값이다.
  dashboardValues: [],

  // 동적 컬럼용 체크박스 + 멀티셀렉트 1번 체크 여부이다.
  metricGroup1Checked: true,

  // 동적 컬럼용 체크박스 + 멀티셀렉트 1번 선택값이다.
  metricGroup1Values: ["QTY"],

  // 동적 컬럼용 체크박스 + 멀티셀렉트 2번 체크 여부이다.
  metricGroup2Checked: false,

  // 동적 컬럼용 체크박스 + 멀티셀렉트 2번 선택값이다.
  metricGroup2Values: [],

  // 동적 컬럼용 체크박스 + 멀티셀렉트 3번 체크 여부이다.
  metricGroup3Checked: false,

  // 동적 컬럼용 체크박스 + 멀티셀렉트 3번 선택값이다.
  metricGroup3Values: [],

  // 동적 컬럼용 체크박스 + 멀티셀렉트 4번 체크 여부이다.
  metricGroup4Checked: false,

  // 동적 컬럼용 체크박스 + 멀티셀렉트 4번 선택값이다.
  metricGroup4Values: [],

  // 동적 컬럼용 체크박스 + 멀티셀렉트 5번 체크 여부이다.
  metricGroup5Checked: false,

  // 동적 컬럼용 체크박스 + 멀티셀렉트 5번 선택값이다.
  metricGroup5Values: [],

  // Dimension 팝업에서 오른쪽 Selected 영역에 들어간 항목이다.
  // 실무처럼 문자열이 아니라 객체 배열로 관리한다.
  // 예: { key: "FAMILY", value: "Family", field: "family", order: 1 }
  // 실제 그리드 컬럼은 이 배열의 field 값을 기준으로 생성한다.
  selectedDimensions: [],
};

// ============================================================
// 2. Tab Policy
// ============================================================

// 탭별 정책을 정의한다.
// 이 객체를 바꾸면 탭별 표시/숨김/비활성화 규칙을 쉽게 바꿀 수 있다.
const TAB_POLICY = {
  [TAB_IDS.DRAM]: {
    // DRAM 탭에서 화면에 표시할 조회조건 그룹이다.
    visibleGroups: [
      "period",
      "cascade",
      "metric",
      "dimension",
      "subtotal",
      "test",
    ],

    // DRAM 탭에서는 연계 셀렉트박스 4번째를 비활성화한다.
    disabledCascadeFields: ["level4"],

    // DRAM 탭에서만 사용할 수 있는 Dimension 항목 타입이다.
    dimensionScopes: ["COMMON", "DRAM"],
  },

  [TAB_IDS.NAND]: {
    // NAND 탭에서 화면에 표시할 조회조건 그룹이다.
    visibleGroups: ["period", "cascade", "metric", "dimension", "subtotal"],

    // NAND 탭에서는 비활성화할 연계 셀렉트박스가 없다.
    disabledCascadeFields: [],

    // NAND 탭에서만 사용할 수 있는 Dimension 항목 타입이다.
    dimensionScopes: ["COMMON", "NAND"],
  },
};

// ============================================================
// 3. Search Condition Policy
// ============================================================

// 연계 셀렉트박스의 라벨을 정의한다.
// 나중에 업무명으로 바꿀 때 이 객체만 수정하면 된다.
const CASCADE_FIELD_LABELS = {
  level1: "연계 1",
  level2: "연계 2",
  level3: "연계 3",
  level4: "연계 4",
  level5: "연계 5",
};

// 체크박스 + 멀티셀렉트 5개의 라벨을 정의한다.
// 이 값들은 동적 컬럼 부모 헤더 후보가 된다.
const METRIC_FIELD_LABELS = {
  metricGroup1: "동적항목 1",
  metricGroup2: "동적항목 2",
  metricGroup3: "동적항목 3",
  metricGroup4: "동적항목 4",
  metricGroup5: "동적항목 5",
};

// Dashboard 체크 시 제어되는 조회조건 규칙이다.
const CONTROL_POLICY = {
  // Dashboard 체크 시 metricGroup1을 비활성화한다.
  dashboardDisables: ["metricGroup1"],
};

// ============================================================
// 4. Dimension Policy
// ============================================================

// Dimension 목록은 화면 로딩 후 API로 조회해서 state로 관리한다.
// 기존처럼 상수 배열로 들고 있지 않고, fetchDimensionItems() 결과를 dimensionItems에 저장한다.
// key   : 업무 코드 또는 식별자
// value : 화면 표시명
// field : rowData에서 실제 값을 읽을 필드명
// order : 기본 표시 순서
// scope : 공통/DRAM/NAND 구분
// states: BASE/UPPER2/COLCHG 상태별 사용 가능 여부

// Tech/TDM/APP/Mode + 탭 조합으로 상태값을 계산한다.
// 이 상태값으로 어떤 Dimension 항목이 컬럼 후보가 될지 결정한다.
function resolveDimensionState(activeTabId, dimensionMode) {
  // Tech 선택 시 상태값은 BASE이다.
  if (dimensionMode === DIMENSION_MODES.TECH) {
    return DIMENSION_STATES.BASE;
  }

  // TDM 선택 시 상태값은 ALL로 별도 취급한다.
  if (dimensionMode === DIMENSION_MODES.TDM) {
    return DIMENSION_STATES.ALL;
  }

  // Mode + DRAM은 UPPER2이다.
  if (dimensionMode === DIMENSION_MODES.MODE && activeTabId === TAB_IDS.DRAM) {
    return DIMENSION_STATES.UPPER2;
  }

  // Mode + NAND는 BASE이다.
  if (dimensionMode === DIMENSION_MODES.MODE && activeTabId === TAB_IDS.NAND) {
    return DIMENSION_STATES.BASE;
  }

  // APP + DRAM은 UPPER2이다.
  if (dimensionMode === DIMENSION_MODES.APP && activeTabId === TAB_IDS.DRAM) {
    return DIMENSION_STATES.UPPER2;
  }

  // APP + NAND는 COLCHG이다.
  if (dimensionMode === DIMENSION_MODES.APP && activeTabId === TAB_IDS.NAND) {
    return DIMENSION_STATES.COLCHG;
  }

  // 아무 것도 선택하지 않으면 COMMON + 현재 탭 디멘전을 모두 보여준다.
  return DIMENSION_STATES.ALL_TAB;
}

// 현재 탭과 상태값 기준으로 Dimension 팝업에 노출 가능한 항목을 계산한다.
function getAvailableDimensionItems(
  dimensionItems,
  activeTabId,
  dimensionMode,
) {
  // 현재 탭의 정책을 조회한다.
  const tabPolicy = TAB_POLICY[activeTabId];

  // 현재 탭과 라디오 선택에 따른 상태값을 계산한다.
  const dimensionState = resolveDimensionState(activeTabId, dimensionMode);

  // TDM 선택 시 ALL 디멘전 항목을 모두 컬럼 후보로 본다.
  if (dimensionState === DIMENSION_STATES.ALL) {
    return dimensionItems
      .filter((item) => item.scope === "COMMON")
      .sort((a, b) => a.order - b.order);
  }

  // 아무 것도 선택하지 않으면 COMMON + 현재 탭 디멘전을 모두 보여준다.
  if (dimensionState === DIMENSION_STATES.ALL_TAB) {
    return dimensionItems
      .filter((item) => item.scope === "COMMON" || item.scope === activeTabId)
      .sort((a, b) => a.order - b.order);
  }

  // 선택 가능한 scope와 상태값에 맞는 Dimension만 반환한다.
  return dimensionItems
    .filter((item) => {
      // 현재 탭에서 허용되는 scope인지 확인한다.
      const scopeMatched = tabPolicy.dimensionScopes.includes(item.scope);

      // 현재 상태값에서 허용되는 Dimension인지 확인한다.
      const stateMatched = item.states.includes(dimensionState);

      // scope와 상태값을 모두 만족해야 선택 가능하다.
      return scopeMatched && stateMatched;
    })
    .sort((a, b) => a.order - b.order);
}

// 선택 모드에 따라 고정 컬럼으로 간주할 Dimension key 목록을 반환한다.
// 실무에서는 field가 바뀔 수 있으므로 고정 컬럼 판단은 key 기준으로 처리한다.
function getFixedDimensionKeys(dimensionMode) {
  // Tech 선택 시 Family + Tech가 고정 컬럼이다.
  if (dimensionMode === DIMENSION_MODES.TECH) {
    return ["FAMILY", "TECH"];
  }

  // APP 선택 시 Family + APP이 고정 컬럼이다.
  if (dimensionMode === DIMENSION_MODES.APP) {
    return ["FAMILY", "APP"];
  }

  // Mode 선택 시 Family + Mode가 고정 컬럼이다.
  if (dimensionMode === DIMENSION_MODES.MODE) {
    return ["FAMILY", "MODE"];
  }

  // TDM 선택 시 ALL Dimension이 고정 컬럼이다.
  if (dimensionMode === DIMENSION_MODES.TDM) {
    return ["FAMILY", "TECH", "FAB", "DENS", "VER", "MODE", "APP"];
  }

  // 아무 것도 선택하지 않으면 명시적 고정 컬럼은 없다.
  return [];
}

// ============================================================
// 5. Dynamic Column Policy
// ============================================================

// 월/분기/반기/연간 컬럼 라벨을 정의한다.
const PERIOD_COLUMN_LABELS = {
  [PERIOD_TYPES.MONTH]: [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ],
  [PERIOD_TYPES.QUARTER]: ["1Q", "2Q", "3Q", "4Q"],
  [PERIOD_TYPES.HALF]: ["H1", "H2"],
  [PERIOD_TYPES.YEAR]: ["Year"],
};

// ============================================================
// 6. Subtotal / Hierarchy Visual Policy
// ============================================================

// 고정 HIERARCHY_DIMENSION_KEYS는 사용하지 않는다.
// 실제 계층은 현재 선택된 Dimension 순서가 된다.

// Sub Total row를 구분하는 내부 row type 값이다.
const ROW_TYPES = {
  DATA: "DATA",
  SUBTOTAL: "SUBTOTAL",
};

// 계층 레벨별 배경색이다.
// 실제 프로젝트에서는 CSS class로 빼도 되지만, 템플릿 단순화를 위해 inline style로 둔다.
const HIERARCHY_LEVEL_STYLES = {
  0: { backgroundColor: "#eef6ff" },
  1: { backgroundColor: "#f1fff0" },
  2: { backgroundColor: "#fff8e8" },
  3: { backgroundColor: "#f8efff" },
};

// 나중에 확인 필요: 현재 어떤 계층 색도 적용되지 않는 동적 수치 영역을 임시 회색으로 표시한다.
// 실무 화면의 정확한 기본 배경 정책이 확인되면 이 색상은 업무 표준 색상으로 교체해야 한다.
const UNPAINTED_DYNAMIC_CELL_STYLE = {
  backgroundColor: "#f3f4f6",
};

// ============================================================
// 7. Utility Functions
// ============================================================

// Dimension key로 API에서 조회한 Dimension 목록에서 항목을 찾는다.
function getDimensionByKey(dimensionItems, key) {
  return dimensionItems.find((dimension) => dimension.key === key);
}

// Dimension key 배열을 Dimension 객체 배열로 변환한다.
// 실무에서는 서버에서 key 목록만 내려오거나, 객체 목록이 내려올 수 있으므로 변환 유틸을 둔다.
function getDimensionsByKeys(dimensionItems, keys) {
  return keys
    .map((key) => getDimensionByKey(dimensionItems, key))
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);
}

// 기본 Selected Dimension 목록을 생성한다.
// Dimension API 조회가 끝난 뒤 이 함수를 사용해서 기본 선택값을 세팅한다.
function getDefaultSelectedDimensions(dimensionItems) {
  return getDimensionsByKeys(dimensionItems, ["FAMILY", "TECH", "FAB", "DENS"]);
}

// Dimension 객체에서 화면 표시명을 가져온다.
function getDimensionLabel(dimension) {
  return dimension?.value ?? dimension?.key ?? "";
}

// Dimension 객체에서 rowData 접근 필드명을 가져온다.
function getDimensionField(dimension) {
  return dimension?.field ?? "";
}

// Dimension 객체에서 업무 key를 가져온다.
function getDimensionKey(dimension) {
  return dimension?.key ?? "";
}

// 탭별 초기 상태를 생성한다.
// 각 탭은 자기 searchForm과 rowData를 독립적으로 가진다.
function createInitialTabStates() {
  return {
    [TAB_IDS.DRAM]: {
      searchForm: {
        ...DEFAULT_SEARCH_FORM,

        // Dimension 목록은 화면 로딩 후 API로 조회되므로 초기에는 빈 배열로 둔다.
        // API 조회가 끝나면 useEffect에서 기본 Selected Dimension을 세팅한다.
        selectedDimensions: [],
      },
      rowData: [],
    },
    [TAB_IDS.NAND]: {
      searchForm: {
        ...DEFAULT_SEARCH_FORM,

        // Dimension 목록은 화면 로딩 후 API로 조회되므로 초기에는 빈 배열로 둔다.
        // API 조회가 끝나면 useEffect에서 기본 Selected Dimension을 세팅한다.
        selectedDimensions: [],
      },
      rowData: [],
    },
  };
}

// 현재 탭 상태를 쉽게 꺼내기 위한 함수이다.
function getActiveTabState(tabStates, activeTabId) {
  return tabStates[activeTabId];
}

// 현재 탭의 searchForm만 변경하는 공통 함수이다.
function updateActiveSearchForm(tabStates, activeTabId, updater) {
  // 현재 탭 상태를 조회한다.
  const currentTabState = tabStates[activeTabId];

  // updater가 함수이면 기존 searchForm을 넘겨서 다음 searchForm을 계산한다.
  const nextSearchForm =
    typeof updater === "function"
      ? updater(currentTabState.searchForm)
      : {
          ...currentTabState.searchForm,
          ...updater,
        };

  // 전체 tabStates에서 현재 탭의 searchForm만 교체한다.
  return {
    ...tabStates,
    [activeTabId]: {
      ...currentTabState,
      searchForm: nextSearchForm,
    },
  };
}

// 현재 탭의 rowData만 변경하는 공통 함수이다.
function updateActiveRowData(tabStates, activeTabId, rowData) {
  return {
    ...tabStates,
    [activeTabId]: {
      ...tabStates[activeTabId],
      rowData,
    },
  };
}

// 멀티셀렉트 이벤트에서 선택값 배열을 계산한다.
function toggleArrayValue(values, value, checked) {
  // 기존 값이 없으면 빈 배열로 처리한다.
  const currentValues = values ?? [];

  // 체크되면 기존 배열에 값을 추가한다.
  if (checked) {
    return [...new Set([...currentValues, value])];
  }

  // 체크 해제되면 해당 값을 제거한다.
  return currentValues.filter((item) => item !== value);
}

// 연계 셀렉트박스 변경 시 하위 레벨 값을 초기화한다.
function resetLowerCascadeValues(form, changedField) {
  // 변경된 필드의 index를 찾는다.
  const changedIndex = CASCADE_FIELDS.indexOf(changedField);

  // 연계 셀렉트 필드가 아니면 원본을 그대로 반환한다.
  if (changedIndex < 0) {
    return form;
  }

  // 다음 form을 복사한다.
  const nextForm = { ...form };

  // 변경된 필드보다 하위 레벨은 모두 초기화한다.
  CASCADE_FIELDS.slice(changedIndex + 1).forEach((field) => {
    nextForm[field] = [];
  });

  // 하위 값이 초기화된 form을 반환한다.
  return nextForm;
}

// 조회기간 fromYm~toYm 기준으로 연도 목록을 생성한다.
function buildYears(fromYm, toYm) {
  // 시작 연도를 숫자로 변환한다.
  const fromYear = Number(String(fromYm).slice(0, 4));

  // 종료 연도를 숫자로 변환한다.
  const toYear = Number(String(toYm).slice(0, 4));

  // 연도 변환에 실패하면 현재 연도만 반환한다.
  if (!fromYear || !toYear) {
    return [String(new Date().getFullYear())];
  }

  // 시작 연도가 종료 연도보다 크면 시작 연도만 반환한다.
  if (fromYear > toYear) {
    return [String(fromYear)];
  }

  // 시작~종료 연도 배열을 생성한다.
  return Array.from({ length: toYear - fromYear + 1 }, (_, index) =>
    String(fromYear + index),
  );
}

// 체크박스+멀티셀렉트 5개의 선택값을 모아 동적 컬럼 부모 헤더 목록을 만든다.
function getSelectedMetricHeaders(searchForm) {
  // 결과 배열을 준비한다.
  const headers = [];

  // metricGroup1~5를 순회한다.
  METRIC_SELECT_FIELDS.forEach((field) => {
    // 체크 여부 필드명을 계산한다.
    const checkedField = `${field}Checked`;

    // 선택값 필드명을 계산한다.
    const valuesField = `${field}Values`;

    // 체크되지 않은 그룹은 동적 컬럼 생성 대상이 아니다.
    if (!searchForm[checkedField]) {
      return;
    }

    // 체크된 그룹의 선택값을 부모 헤더 목록에 추가한다.
    (searchForm[valuesField] ?? []).forEach((value) => {
      headers.push(value);
    });
  });

  // 부모 헤더 목록을 반환한다.
  return headers;
}

// 월/분기/반기/연간 선택 규칙을 적용한다.
function resolveNextPeriodTypes(currentTypes, changedType, checked) {
  // 월을 선택하면 다른 기간 타입은 모두 제거하고 월만 유지한다.
  if (changedType === PERIOD_TYPES.MONTH && checked) {
    return [PERIOD_TYPES.MONTH];
  }

  // 월을 해제하면 빈 배열을 반환한다.
  if (changedType === PERIOD_TYPES.MONTH && !checked) {
    return [];
  }

  // 분기/반기/연간을 선택하는 경우 기존 월 선택은 제거한다.
  const withoutMonth = currentTypes.filter(
    (type) => type !== PERIOD_TYPES.MONTH,
  );

  // 체크되면 해당 타입을 추가한다.
  if (checked) {
    return [...new Set([...withoutMonth, changedType])];
  }

  // 체크 해제되면 해당 타입을 제거한다.
  return withoutMonth.filter((type) => type !== changedType);
}

// Dimension 컬럼을 생성한다.
// 실제 컬럼은 selectedDimensions 객체 배열 기준으로만 생성한다.
function buildDimensionColumnDefs(searchForm) {
  // 선택된 Dimension 객체 목록을 가져온다.
  const selectedDimensions = searchForm.selectedDimensions ?? [];

  // 고정 컬럼 key 목록을 가져온다.
  const fixedDimensionKeys = getFixedDimensionKeys(searchForm.dimensionMode);

  // 선택된 Dimension만 컬럼으로 만든다.
  return selectedDimensions.map((dimension) => {
    // Dimension 업무 key를 가져온다.
    const dimensionKey = getDimensionKey(dimension);

    // rowData 접근 필드명을 가져온다.
    const dimensionField = getDimensionField(dimension);

    return {
      // 컬럼 헤더명이다.
      headerName: getDimensionLabel(dimension),

      // rowData에서 읽을 필드명이다.
      field: dimensionField,

      // 고정 컬럼에 해당하면 왼쪽 pinned 처리한다.
      pinned: fixedDimensionKeys.includes(dimensionKey) ? "left" : undefined,

      // Dimension 컬럼은 보기 편하게 폭을 고정한다.
      width: 110,

      // Sub Total row를 기준으로 ㄴ자 배경 스타일을 적용한다.
      cellStyle: (params) =>
        getHierarchyCellStyle(params, dimension, selectedDimensions),
    };
  });
}

// 동적 컬럼을 생성한다.
// 구조: 선택값 부모 헤더 → 연도 자식 헤더 → 월/분기/반기/연간 손자 컬럼
function buildDynamicColumnDefs(searchForm) {
  // 부모 헤더가 될 선택값 목록을 만든다.
  const metricHeaders = getSelectedMetricHeaders(searchForm);

  // 조회기간 기준 연도 목록을 만든다.
  const years = buildYears(searchForm.fromYm, searchForm.toYm);

  // 선택된 기간 타입 목록을 가져온다.
  const periodTypes = searchForm.periodTypes ?? [];

  // 부모 헤더가 없으면 기본 QTY 하나를 보여준다.
  const safeMetricHeaders = metricHeaders.length > 0 ? metricHeaders : ["QTY"];

  // 기간 타입이 없으면 분기를 기본값으로 보여준다.
  const safePeriodTypes =
    periodTypes.length > 0 ? periodTypes : [PERIOD_TYPES.QUARTER];

  // 부모 헤더별 column group을 생성한다.
  return safeMetricHeaders.map((metric) => ({
    // 최상위 부모 헤더명이다.
    headerName: metric,

    // 연도별 자식 헤더를 생성한다.
    children: years.map((year) => ({
      // 연도 헤더명이다.
      headerName: year,

      // 월/분기/반기/연간 손자 컬럼을 생성한다.
      children: safePeriodTypes.flatMap((periodType) =>
        (PERIOD_COLUMN_LABELS[periodType] ?? []).map((periodLabel) => ({
          // 손자 컬럼 헤더명이다.
          headerName: periodLabel,

          // 실제 rowData에 없는 필드도 예시용 valueGetter로 값을 만든다.
          colId: `${metric}_${year}_${periodLabel}`,

          // 더미 데이터이므로 qty/asp/amt를 조합해 값을 표시한다.
          valueGetter: (params) => {
            // metric 값이 QTY/ASP/AMT이면 소문자 필드와 매핑된다.
            const baseValue =
              params.data?.[String(metric).toLowerCase()] ??
              params.data?.qty ??
              0;

            // 숫자 형태로 보기 좋게 표시한다.
            return Number(baseValue).toFixed(1);
          },

          // 동적 수치 컬럼도 Sub Total row의 레벨 배경색을 이어받는다.
          cellStyle: getDynamicValueCellStyle,

          // 동적 컬럼 폭이다.
          width: 90,
        })),
      ),
    })),
  }));
}

// 전체 AG Grid columnDefs를 생성한다.
function buildGridColumnDefs(searchForm) {
  // Dimension 컬럼을 생성한다.
  const dimensionColumns = buildDimensionColumnDefs(searchForm);

  // 동적 컬럼을 생성한다.
  const dynamicColumns = buildDynamicColumnDefs(searchForm);

  // Dimension 컬럼 + 동적 컬럼을 합쳐 반환한다.
  return [...dimensionColumns, ...dynamicColumns];
}

// Sub Total row의 셀인지 확인한다.
function isSubtotalRow(data) {
  return data?._rowType === ROW_TYPES.SUBTOTAL;
}

// 특정 dimension field에 "Sub Total" 문구가 있는지 확인한다.
function hasSubtotalText(data, dimensionField) {
  return String(data?.[dimensionField] ?? "").includes("Sub Total");
}

// 현재 subtotal row가 특정 dimension 컬럼까지 색칠해야 하는지 판단한다.
// subtotalLevel보다 오른쪽에 있는 dimension 컬럼은 ㄴ자의 가로 영역으로 본다.
function shouldPaintHierarchyCell(fieldIndex, subtotalLevel) {
  return fieldIndex >= subtotalLevel;
}

// 현재 선택된 Dimension 순서로 hierarchy key 목록을 생성한다.
function getHierarchyDimensionKeys(selectedDimensions = []) {
  return selectedDimensions.map((item) => item.key);
}

// hierarchy 셀 스타일을 계산한다.
// border를 사용하지 않고, 배경색만으로 ㄴ자 영역을 만든다.
function getHierarchyCellStyle(params, dimension, selectedDimensions = []) {
  // rowData가 없으면 스타일을 적용하지 않는다.
  if (!params.data) {
    return undefined;
  }

  // Dimension 객체에서 key를 가져온다.
  const dimensionKey = getDimensionKey(dimension);

  // Dimension 객체에서 rowData field를 가져온다.
  const dimensionField = getDimensionField(dimension);

  // 현재 dimension이 hierarchy 대상인지 key 기준으로 확인한다.
  const hierarchyKeys = getHierarchyDimensionKeys(selectedDimensions);
  const fieldIndex = hierarchyKeys.indexOf(dimensionKey);

  // hierarchy 대상이 아니면 기본 스타일을 적용하지 않는다.
  if (fieldIndex < 0) {
    return undefined;
  }

  // 일반 data row는 계층 레벨별 기본 배경색만 적용한다.
  if (!isSubtotalRow(params.data)) {
    return HIERARCHY_LEVEL_STYLES[fieldIndex];
  }

  // 현재 Sub Total row의 subtotal 레벨을 가져온다.
  const subtotalLevel = params.data._subtotalLevel ?? 0;

  // 현재 Sub Total row의 subtotal 필드를 가져온다.
  // 더미 API에서는 field 문자열이 내려온다. 예: "family", "tech"
  const subtotalField = params.data._subtotalField;

  // Sub Total 레벨에 맞는 배경색을 가져온다.
  const subtotalLevelStyle = HIERARCHY_LEVEL_STYLES[subtotalLevel] ?? {};

  // 현재 셀이 Sub Total 문구가 들어간 기준 셀이면 강조한다.
  if (
    dimensionField === subtotalField &&
    hasSubtotalText(params.data, dimensionField)
  ) {
    return {
      ...subtotalLevelStyle,
      fontWeight: 800,
    };
  }

  // subtotalLevel 이후의 오른쪽 dimension 영역은 같은 배경색으로 칠한다.
  // 이 부분이 기본 컬럼에서 ㄴ자 가로 영역처럼 보이는 핵심이다.
  if (shouldPaintHierarchyCell(fieldIndex, subtotalLevel)) {
    return {
      ...subtotalLevelStyle,
      fontWeight: 700,
    };
  }

  // subtotalLevel보다 왼쪽의 상위 컬럼은 일반 계층 배경색을 유지한다.
  return HIERARCHY_LEVEL_STYLES[fieldIndex];
}

// 동적 수치 컬럼의 셀 스타일을 계산한다.
// Sub Total row이면 해당 subtotal 레벨의 배경색을 수치 컬럼까지 이어서 칠한다.
function getDynamicValueCellStyle(params) {
  // 기본적으로 수치 컬럼은 오른쪽 정렬한다.
  const baseStyle = {
    textAlign: "right",
  };

  // rowData가 없으면 기본 스타일만 반환한다.
  if (!params.data) {
    return {
      ...baseStyle,
      ...UNPAINTED_DYNAMIC_CELL_STYLE,
    };
  }

  // 일반 데이터 row이면 기본 수치 스타일 + 임시 회색 배경을 적용한다.
  // 나중에 확인 필요: 실무에서 일반 수치 컬럼의 기본 배경색 정책 확인 후 수정해야 한다.
  if (!isSubtotalRow(params.data)) {
    return {
      ...baseStyle,
      ...UNPAINTED_DYNAMIC_CELL_STYLE,
    };
  }

  // Sub Total row의 계층 레벨을 가져온다.
  const subtotalLevel = params.data._subtotalLevel ?? 0;

  // Sub Total 레벨에 맞는 배경색을 가져온다.
  const levelStyle = HIERARCHY_LEVEL_STYLES[subtotalLevel] ?? {};

  // Sub Total row의 동적 수치 영역은 같은 레벨 색으로 연결한다.
  // border 없이 배경색만 이어지게 한다.
  return {
    ...baseStyle,
    ...levelStyle,
    fontWeight: 800,
  };
}

// 실무형 예시 함수이다.
// 실제 차세대에서는 조회결과 첫 행의 키(Object.keys)를 분석해서
// 동적 컬럼을 생성하는 경우가 많다.
function buildGridColumnDefsFromRows(rows, selectedDimensions = []) {
  if (!rows || rows.length === 0) {
    return buildGridColumnDefs({
      ...DEFAULT_SEARCH_FORM,
      selectedDimensions,
    });
  }

  // 현재 템플릿에서는 기존 컬럼 생성 함수를 재사용한다.
  // 향후 Object.keys(rows[0]) 기반 파싱 로직으로 교체하면 된다.
  return buildGridColumnDefs({
    ...DEFAULT_SEARCH_FORM,
    selectedDimensions,
  });
}

// ============================================================
// 8. Page Component
// ============================================================

/*

// 탭 클릭 시 ------------------------------------------

| 단계                 | 호출                                 |
| ----------------    | ----------------------------------- |
| 탭 클릭              | onClick                             |
| 상태 변경            | setActiveTabId(tab.id)              |
| React 동작           | 컴포넌트 재렌더                       |
| 현재 탭 상태 조회     | getActiveTabState()                 |
| 현재 searchForm 조회 | activeTabState.searchForm           |
| Dimension 재계산     | useMemo(getAvailableDimensionItems) |
| 컬럼 재계산          | useMemo(buildGridColumnDefs)        |
| 화면 갱신            | JSX 재렌더                           |

탭 클릭
→ setActiveTabId
→ React 재렌더
→ tabStates에서 해당 탭 데이터 조회
→ searchForm/columnDefs 재계산
→ 화면 갱신


// 컬럼 생성 ------------------------------------------

searchForm
    ↓
buildGridColumnDefs()
    ↓
Dimension 컬럼 생성
    ↓
동적 컬럼 생성
    ↓
columnDefs 완성
    ↓
AG Grid 렌더링


// Dimension 변경 시 

*/

export default function MultiTabDimensionTemplatePage() {
  // 현재 활성 탭 ID를 관리한다.
  const [activeTabId, setActiveTabId] = useState(TAB_IDS.DRAM);

  // 탭별 상태를 관리한다.
  // 이 구조 때문에 DRAM → NAND → DRAM 이동 시 DRAM 조회조건이 유지된다.
  const [tabStates, setTabStates] = useState(createInitialTabStates);

  // 연계 셀렉트박스 옵션 목록을 관리한다.
  const [cascadeOptions, setCascadeOptions] = useState({
    level1: [],
    level2: [],
    level3: [],
    level4: [],
    level5: [],
  });

  // Dashboard와 동적컬럼용 체크박스+셀렉트 옵션을 관리한다.
  const [extraSelectOptions, setExtraSelectOptions] = useState({});

  // Dimension 메타 목록을 관리한다.
  // 화면 로딩 후 fetchDimensionItems() API를 호출해서 세팅한다.
  const [dimensionItems, setDimensionItems] = useState([]);

  // Dimension 팝업 열림 여부를 관리한다.
  const [dimensionPopupOpen, setDimensionPopupOpen] = useState(false);

  // 로딩 상태를 관리한다.
  const [loading, setLoading] = useState(false);

  // 현재 활성 탭 상태를 계산한다.
  const activeTabState = getActiveTabState(tabStates, activeTabId);

  // 현재 활성 탭의 조회조건을 계산한다.
  const searchForm = activeTabState.searchForm;

  // 현재 활성 탭의 rowData를 계산한다.
  const rowData = activeTabState.rowData;

  // 현재 탭과 조회조건 기준으로 사용 가능한 Dimension 목록을 계산한다.
  const availableDimensions = useMemo(() => {
    return getAvailableDimensionItems(
      dimensionItems,
      activeTabId,
      searchForm.dimensionMode,
    );
  }, [dimensionItems, activeTabId, searchForm.dimensionMode]);

  // 현재 Grid에 적용된 columnDefs를 관리한다.
  // 실무처럼 조회 버튼을 눌렀을 때만 컬럼을 생성한다.
  const [columnDefs, setColumnDefs] = useState([]);

  // AG Grid 기본 컬럼 옵션이다.
  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
      sortable: true,
      filter: true,
    };
  }, []);

  // 화면 최초 진입 시 더미 옵션을 조회한다.
  useEffect(() => {
    async function initOptions() {
      try {
        // Dimension 메타 목록을 조회한다.
        // 실무에서는 화면 진입 시 서버에서 Dimension 정의를 받아오는 API가 된다.
        const dimensions = await fetchDimensionItems();

        // 연계 셀렉트박스 최초 옵션을 조회한다.
        const initialCascadeOptions = await fetchInitialCascadeOptions();

        // 체크박스+셀렉트 옵션을 조회한다.
        const nextExtraSelectOptions = await fetchExtraSelectOptions();

        // Dimension 메타 목록을 상태에 저장한다.
        setDimensionItems(dimensions);

        // Dimension API 조회 후 기본 Selected Dimension을 세팅한다.
        const defaultSelectedDimensions =
          getDefaultSelectedDimensions(dimensions);

        // 최초 컬럼을 생성한다.
        setColumnDefs(
          buildGridColumnDefs({
            ...DEFAULT_SEARCH_FORM,
            selectedDimensions: defaultSelectedDimensions,
          }),
        );

        // 탭별 기본 Selected Dimension을 세팅한다.
        setTabStates((prev) => ({
          ...prev,
          [TAB_IDS.DRAM]: {
            ...prev[TAB_IDS.DRAM],
            searchForm: {
              ...prev[TAB_IDS.DRAM].searchForm,
              selectedDimensions: defaultSelectedDimensions,
            },
          },
          [TAB_IDS.NAND]: {
            ...prev[TAB_IDS.NAND],
            searchForm: {
              ...prev[TAB_IDS.NAND].searchForm,
              selectedDimensions: defaultSelectedDimensions,
            },
          },
        }));

        // 연계 셀렉트박스 옵션을 상태에 저장한다.
        setCascadeOptions(initialCascadeOptions);

        // 체크박스+셀렉트 옵션을 상태에 저장한다.
        setExtraSelectOptions(nextExtraSelectOptions);
      } catch (error) {
        // 초기 옵션 조회 중 오류를 콘솔에 출력한다.
        console.error(error);

        // 사용자에게 오류 메시지를 표시한다.
        alert("초기 옵션 조회 중 오류가 발생했습니다.");
      }
    }

    // 초기화 함수를 실행한다.
    initOptions();
  }, []);

  // 현재 탭의 조회조건을 변경한다.
  function handleSearchFormChange(field, value) {
    setTabStates((prev) =>
      updateActiveSearchForm(prev, activeTabId, {
        [field]: value,
      }),
    );
  }

  // 연계 셀렉트박스 선택값을 변경한다.
  async function handleCascadeChange(field, value, checked) {
    // 변경된 값이 반영된 searchForm을 미리 만든다.
    const nextForm = resetLowerCascadeValues(
      {
        ...searchForm,
        [field]: toggleArrayValue(searchForm[field], value, checked),
      },
      field,
    );

    // 현재 탭의 searchForm을 갱신한다.
    setTabStates((prev) => updateActiveSearchForm(prev, activeTabId, nextForm));

    // 변경된 필드의 index를 계산한다.
    const changedIndex = CASCADE_FIELDS.indexOf(field);

    // 다음 레벨 field를 계산한다.
    const nextField = CASCADE_FIELDS[changedIndex + 1];

    // 다음 레벨이 없으면 옵션 조회를 하지 않는다.
    if (!nextField) {
      return;
    }

    // 다음 레벨 번호를 계산한다.
    const nextLevel = changedIndex + 2;

    // 더미 API로 다음 레벨 옵션을 조회한다.
    const nextOptions = await fetchCascadeOptions(nextLevel, nextForm);

    // 변경된 레벨보다 하위 옵션은 초기화한다.
    setCascadeOptions((prev) => {
      const nextCascadeOptions = {
        ...prev,
        [nextField]: nextOptions,
      };

      // 다음 다음 레벨부터는 선택값이 초기화되므로 옵션도 비운다.
      CASCADE_FIELDS.slice(changedIndex + 2).forEach((lowerField) => {
        nextCascadeOptions[lowerField] = [];
      });

      return nextCascadeOptions;
    });
  }

  // 체크박스+멀티셀렉트의 체크 여부를 변경한다.
  function handleMetricCheckedChange(field, checked) {
    // 체크 필드명을 계산한다.
    const checkedField = `${field}Checked`;

    // 값 필드명을 계산한다.
    const valuesField = `${field}Values`;

    // 체크 해제 시 선택값도 함께 초기화한다.
    setTabStates((prev) =>
      updateActiveSearchForm(prev, activeTabId, (form) => ({
        ...form,
        [checkedField]: checked,
        [valuesField]: checked ? form[valuesField] : [],
      })),
    );
  }

  // 체크박스+멀티셀렉트 선택값을 변경한다.
  function handleMetricValueChange(field, value, checked) {
    // 값 필드명을 계산한다.
    const valuesField = `${field}Values`;

    // 현재 탭의 선택값 배열을 갱신한다.
    setTabStates((prev) =>
      updateActiveSearchForm(prev, activeTabId, (form) => ({
        ...form,
        [valuesField]: toggleArrayValue(form[valuesField], value, checked),
      })),
    );
  }

  // Dashboard 체크 여부를 변경한다.
  function handleDashboardCheckedChange(checked) {
    setTabStates((prev) =>
      updateActiveSearchForm(prev, activeTabId, (form) => ({
        ...form,

        // Dashboard 체크 상태를 반영한다.
        dashboardChecked: checked,

        // Dashboard 체크 해제 시 선택값을 초기화한다.
        dashboardValues: checked ? form.dashboardValues : [],

        // Dashboard 체크 시 metricGroup1을 비활성화하기 위해 체크를 해제한다.
        metricGroup1Checked: checked ? false : form.metricGroup1Checked,

        // Dashboard 체크 시 metricGroup1 선택값을 초기화한다.
        metricGroup1Values: checked ? [] : form.metricGroup1Values,
      })),
    );
  }

  // Dashboard 선택값을 변경한다.
  function handleDashboardValueChange(value, checked) {
    setTabStates((prev) =>
      updateActiveSearchForm(prev, activeTabId, (form) => ({
        ...form,
        dashboardValues: toggleArrayValue(form.dashboardValues, value, checked),
      })),
    );
  }

  // 월/분기/반기/연간 선택값을 변경한다.
  function handlePeriodTypeChange(periodType, checked) {
    setTabStates((prev) =>
      updateActiveSearchForm(prev, activeTabId, (form) => ({
        ...form,
        periodTypes: resolveNextPeriodTypes(
          form.periodTypes,
          periodType,
          checked,
        ),
      })),
    );
  }

  // Dimension 팝업 적용 이벤트이다.
  // 객체 배열 그대로 저장한다.
  function handleApplyDimensions(nextSelectedDimensions) {
    setTabStates((prev) =>
      updateActiveSearchForm(prev, activeTabId, {
        selectedDimensions: nextSelectedDimensions,
      }),
    );
  }

  // 조회 버튼 클릭 이벤트이다.
  async function handleSearch() {
    try {
      // 로딩을 시작한다.
      setLoading(true);

      // 실제 API 요청처럼 request 객체를 만든다.
      const request = {
        activeTabId,
        searchForm,
      };

      // 더미 API를 호출한다.
      const rows = await searchMultiTabDimensionRows(request);

      // 실무형 구조 예시:
      // 조회결과(rowData)의 키를 분석해서 컬럼을 생성한다.
      // 예: QTY_Q_2024_1Q, ASP_M_202401
      const nextColumnDefs = buildGridColumnDefsFromRows(
        rows,
        searchForm.selectedDimensions,
      );

      setColumnDefs(nextColumnDefs);

      // 현재 탭의 rowData만 갱신한다.
      setTabStates((prev) => updateActiveRowData(prev, activeTabId, rows));
    } catch (error) {
      // 오류를 콘솔에 출력한다.
      console.error(error);

      // 사용자에게 오류 메시지를 표시한다.
      alert("조회 중 오류가 발생했습니다.");
    } finally {
      // 로딩을 종료한다.
      setLoading(false);
    }
  }

  // 현재 필드가 탭 정책에 의해 숨김/보임 되는지 확인한다.
  function isVisibleGroup(groupName) {
    return TAB_POLICY[activeTabId].visibleGroups.includes(groupName);
  }

  // 현재 필드가 탭 정책에 의해 비활성화되는지 확인한다.
  function isCascadeDisabled(field) {
    return TAB_POLICY[activeTabId].disabledCascadeFields.includes(field);
  }

  // 현재 metric field가 비활성화되는지 확인한다.
  function isMetricDisabled(field) {
    return (
      searchForm.dashboardChecked &&
      CONTROL_POLICY.dashboardDisables.includes(field)
    );
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Multi Tab Dimension Template</h2>

      <p style={styles.description}>
        탭별 조회조건 기억, 표시/비활성화, 연계 멀티셀렉트, Dimension 팝업, 동적
        컬럼, Sub Total ㄴ자 시각화를 한 파일에 구조화한 템플릿 화면입니다.
      </p>

      <section style={styles.tabPanel}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            style={{
              ...styles.tabButton,
              ...(activeTabId === tab.id ? styles.activeTabButton : {}),
            }}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </section>

      <section style={styles.panel}>
        <div style={styles.panelTitle}>조회조건</div>

        <div style={styles.searchGrid}>
          <TextField
            label="From YM"
            value={searchForm.fromYm}
            maxLength={6}
            onChange={(value) => handleSearchFormChange("fromYm", value)}
          />

          <TextField
            label="To YM"
            value={searchForm.toYm}
            maxLength={6}
            onChange={(value) => handleSearchFormChange("toYm", value)}
          />

          <CheckboxField
            label="Sub Total"
            checked={searchForm.useSubTotal}
            onChange={(checked) =>
              handleSearchFormChange("useSubTotal", checked)
            }
          />

          <DimensionModeField
            value={searchForm.dimensionMode}
            onChange={(value) => handleSearchFormChange("dimensionMode", value)}
          />

          <PeriodTypeField
            values={searchForm.periodTypes}
            onChange={handlePeriodTypeChange}
          />
        </div>

        <div style={styles.subPanelTitle}>연계 멀티셀렉트 5개</div>

        <div style={styles.searchGrid}>
          {CASCADE_FIELDS.map((field) => (
            <MultiCheckboxSelect
              key={field}
              label={CASCADE_FIELD_LABELS[field]}
              options={cascadeOptions[field] ?? []}
              values={searchForm[field] ?? []}
              disabled={isCascadeDisabled(field)}
              onChange={(value, checked) =>
                handleCascadeChange(field, value, checked)
              }
            />
          ))}
        </div>

        <div style={styles.subPanelTitle}>
          Dashboard + 동적 컬럼용 멀티셀렉트
        </div>

        <div style={styles.searchGrid}>
          <CheckboxMultiSelect
            label="Dashboard"
            checked={searchForm.dashboardChecked}
            values={searchForm.dashboardValues}
            options={extraSelectOptions.dashboard ?? []}
            onCheckedChange={handleDashboardCheckedChange}
            onValueChange={handleDashboardValueChange}
          />

          {METRIC_SELECT_FIELDS.map((field) => (
            <CheckboxMultiSelect
              key={field}
              label={METRIC_FIELD_LABELS[field]}
              checked={searchForm[`${field}Checked`]}
              values={searchForm[`${field}Values`]}
              options={extraSelectOptions[field] ?? []}
              disabled={isMetricDisabled(field)}
              onCheckedChange={(checked) =>
                handleMetricCheckedChange(field, checked)
              }
              onValueChange={(value, checked) =>
                handleMetricValueChange(field, value, checked)
              }
            />
          ))}
        </div>
      </section>

      {isVisibleGroup("test") && (
        <section style={styles.panel}>
          <div style={styles.panelTitle}>TEST 조회조건</div>

          <div style={styles.searchGrid}>
            <TextField
              label="테스트 조회조건"
              value={searchForm.testValue ?? ""}
              maxLength={20}
              onChange={(value) => handleSearchFormChange("testValue", value)}
            />
          </div>
        </section>
      )}

      <section style={styles.toolbar}>
        <button type="button" onClick={handleSearch} disabled={loading}>
          조회
        </button>

        <button
          type="button"
          onClick={() => setDimensionPopupOpen(true)}
          disabled={loading}
        >
          Dimension 설정
        </button>

        <span style={styles.statusText}>
          현재 탭: {activeTabId} / 상태값:{" "}
          {resolveDimensionState(activeTabId, searchForm.dimensionMode)} / Row:{" "}
          {rowData.length}
        </span>
      </section>

      <section style={styles.selectedDimensionBox}>
        <strong>Selected Dimension:</strong>{" "}
        {searchForm.selectedDimensions.length > 0
          ? searchForm.selectedDimensions
              .map((dimension) => getDimensionLabel(dimension))
              .join(" > ")
          : "없음"}
      </section>

      <section className="ag-theme-quartz" style={styles.gridWrapper}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={(params) => params.data.rowId}
          getRowStyle={(params) => {
            if (params.data?._rowType === ROW_TYPES.SUBTOTAL) {
              return {
                fontWeight: 700,
              };
            }

            return undefined;
          }}
        />
      </section>

      {dimensionPopupOpen && (
        <DimensionPopup
          availableDimensions={availableDimensions}
          selectedDimensions={searchForm.selectedDimensions}
          dimensionItems={dimensionItems}
          onApply={handleApplyDimensions}
          onClose={() => setDimensionPopupOpen(false)}
        />
      )}

      {loading && <div style={styles.loading}>조회 중...</div>}
    </div>
  );
}

// ============================================================
// 9. Small Inner Components
// ============================================================

function TextField({ label, value, maxLength, onChange }) {
  return (
    <label style={styles.label}>
      {label}
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />
    </label>
  );
}

function CheckboxField({ label, checked, onChange }) {
  return (
    <label style={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

function DimensionModeField({ value, onChange }) {
  return (
    <div style={styles.label}>
      Tech/TDM/APP/Mode
      <div style={styles.inlineGroup}>
        {[
          { value: DIMENSION_MODES.TECH, label: "Tech" },
          { value: DIMENSION_MODES.TDM, label: "TDM" },
          { value: DIMENSION_MODES.APP, label: "APP" },
          { value: DIMENSION_MODES.MODE, label: "Mode" },
        ].map((item) => (
          <label key={item.value}>
            <input
              type="radio"
              name="dimensionMode"
              checked={value === item.value}
              onChange={() => onChange(item.value)}
            />
            {item.label}
          </label>
        ))}

        <button type="button" onClick={() => onChange(DIMENSION_MODES.NONE)}>
          해제
        </button>
      </div>
    </div>
  );
}

function PeriodTypeField({ values, onChange }) {
  return (
    <div style={styles.label}>
      기간 단위
      <div style={styles.inlineGroup}>
        {[
          { value: PERIOD_TYPES.MONTH, label: "월" },
          { value: PERIOD_TYPES.QUARTER, label: "분기" },
          { value: PERIOD_TYPES.HALF, label: "반기" },
          { value: PERIOD_TYPES.YEAR, label: "연간" },
        ].map((item) => (
          <label key={item.value}>
            <input
              type="checkbox"
              checked={values.includes(item.value)}
              onChange={(event) => onChange(item.value, event.target.checked)}
            />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function MultiCheckboxSelect({ label, options, values, disabled, onChange }) {
  return (
    <div style={styles.label}>
      {label}
      <div
        style={{
          ...styles.multiBox,
          ...(disabled ? styles.disabledBox : {}),
        }}
      >
        {options.length === 0 && (
          <span style={styles.emptyText}>옵션 없음</span>
        )}

        {options.map((option) => (
          <label key={option.value} style={styles.optionLine}>
            <input
              type="checkbox"
              disabled={disabled}
              checked={values.includes(option.value)}
              onChange={(event) => onChange(option.value, event.target.checked)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxMultiSelect({
  label,
  checked,
  values,
  options,
  disabled,
  onCheckedChange,
  onValueChange,
}) {
  const finalDisabled = disabled || !checked;

  return (
    <div style={styles.label}>
      <label style={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        {label}
      </label>

      <div
        style={{
          ...styles.multiBox,
          ...(finalDisabled ? styles.disabledBox : {}),
        }}
      >
        {options.map((option) => (
          <label key={option.value} style={styles.optionLine}>
            <input
              type="checkbox"
              disabled={finalDisabled}
              checked={values.includes(option.value)}
              onChange={(event) =>
                onValueChange(option.value, event.target.checked)
              }
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function DimensionPopup({
  availableDimensions,
  selectedDimensions,
  dimensionItems,
  onApply,
  onClose,
}) {
  // 팝업 내부에서만 사용하는 선택 Dimension 객체 배열이다.
  const [workingSelectedDimensions, setWorkingSelectedDimensions] =
    useState(selectedDimensions);

  // 이미 선택된 Dimension key 목록을 Set으로 만든다.
  const selectedKeySet = new Set(
    workingSelectedDimensions.map((dimension) => dimension.key),
  );

  // available 목록에서 이미 선택된 Dimension은 제외한다.
  const availableItems = availableDimensions.filter(
    (item) => !selectedKeySet.has(item.key),
  );

  // Available → Selected로 Dimension 객체를 이동한다.
  function moveToSelected(dimension) {
    setWorkingSelectedDimensions((prev) =>
      [...prev, dimension].sort((a, b) => a.order - b.order),
    );
  }

  // Selected에서 Dimension 객체를 제거한다.
  function removeFromSelected(dimensionKey) {
    setWorkingSelectedDimensions((prev) =>
      prev.filter((item) => item.key !== dimensionKey),
    );
  }

  // 선택된 Dimension을 위로 이동한다.
  function moveUp(dimensionKey) {
    setWorkingSelectedDimensions((prev) => {
      const index = prev.findIndex((item) => item.key === dimensionKey);

      if (index <= 0) {
        return prev;
      }

      const next = [...prev];

      [next[index - 1], next[index]] = [next[index], next[index - 1]];

      return next;
    });
  }

  // 선택된 Dimension을 아래로 이동한다.
  function moveDown(dimensionKey) {
    setWorkingSelectedDimensions((prev) => {
      const index = prev.findIndex((item) => item.key === dimensionKey);

      if (index < 0 || index >= prev.length - 1) {
        return prev;
      }

      const next = [...prev];

      [next[index], next[index + 1]] = [next[index + 1], next[index]];

      return next;
    });
  }

  // Apply는 팝업을 닫지 않고 현재 선택값만 부모 화면에 반영한다.
  function handleApply() {
    onApply(workingSelectedDimensions);
  }

  // OK는 현재 선택값을 부모 화면에 반영하고 팝업을 닫는다.
  function handleOk() {
    onApply(workingSelectedDimensions);
    onClose();
  }

  return (
    <div style={styles.popupBackdrop}>
      <div style={styles.popup}>
        <div style={styles.popupHeader}>
          <strong>Dimension 설정</strong>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.popupBody}>
          <div style={styles.popupColumn}>
            <div style={styles.popupColumnTitle}>Available</div>

            {availableItems.map((item) => (
              <button
                key={item.key}
                type="button"
                style={styles.dimensionItem}
                onClick={() => moveToSelected(item)}
              >
                {item.value} ({item.key}) &gt;
              </button>
            ))}
          </div>

          <div style={styles.popupColumn}>
            <div style={styles.popupColumnTitle}>Selected</div>

            {workingSelectedDimensions.map((item) => (
              <div key={item.key} style={styles.selectedDimensionItem}>
                <span>
                  {item.value} ({item.key})
                </span>

                <div style={styles.inlineGroup}>
                  <button type="button" onClick={() => moveUp(item.key)}>
                    ↑
                  </button>
                  <button type="button" onClick={() => moveDown(item.key)}>
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromSelected(item.key)}
                  >
                    제거
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.popupFooter}>
          <button
            type="button"
            onClick={() =>
              setWorkingSelectedDimensions(
                getDefaultSelectedDimensions(dimensionItems),
              )
            }
          >
            Default
          </button>

          <button type="button" onClick={handleApply}>
            Apply
          </button>

          <button type="button" onClick={handleOk}>
            OK
          </button>

          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 10. Styles
// ============================================================

const styles = {
  page: {
    padding: 16,
  },
  title: {
    margin: "0 0 8px 0",
  },
  description: {
    margin: "0 0 12px 0",
    color: "#555",
    fontSize: 13,
  },
  tabPanel: {
    display: "flex",
    gap: 6,
    marginBottom: 10,
  },
  tabButton: {
    padding: "8px 16px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    borderRadius: 4,
  },
  activeTabButton: {
    background: "#111",
    color: "#fff",
    borderColor: "#111",
  },
  panel: {
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  panelTitle: {
    fontWeight: 700,
    marginBottom: 10,
  },
  subPanelTitle: {
    fontWeight: 700,
    margin: "14px 0 8px",
    fontSize: 13,
  },
  searchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(160px, 1fr))",
    gap: 10,
    alignItems: "start",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 13,
  },
  input: {
    height: 30,
    padding: "0 8px",
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    minHeight: 30,
    fontSize: 13,
  },
  inlineGroup: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    flexWrap: "wrap",
  },
  multiBox: {
    minHeight: 78,
    maxHeight: 120,
    overflow: "auto",
    border: "1px solid #ddd",
    borderRadius: 4,
    padding: 6,
    background: "#fff",
  },
  disabledBox: {
    background: "#f2f2f2",
    color: "#999",
  },
  optionLine: {
    display: "block",
    marginBottom: 4,
  },
  emptyText: {
    color: "#999",
    fontSize: 12,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    color: "#555",
  },
  selectedDimensionBox: {
    padding: "8px 10px",
    background: "#f7f7f7",
    border: "1px solid #e0e0e0",
    borderRadius: 4,
    marginBottom: 8,
    fontSize: 13,
  },
  gridWrapper: {
    height: 520,
    width: "100%",
  },
  loading: {
    position: "fixed",
    right: 20,
    bottom: 20,
    padding: "10px 14px",
    background: "#333",
    color: "#fff",
    borderRadius: 6,
    zIndex: 9999,
  },
  popupBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  popup: {
    width: 720,
    background: "#fff",
    borderRadius: 8,
    padding: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  popupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  popupBody: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  popupColumn: {
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: 8,
    minHeight: 260,
  },
  popupColumnTitle: {
    fontWeight: 700,
    marginBottom: 8,
  },
  dimensionItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "6px 8px",
    marginBottom: 4,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 4,
    cursor: "pointer",
  },
  selectedDimensionItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    marginBottom: 4,
    border: "1px solid #ddd",
    borderRadius: 4,
  },
  popupFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 12,
  },
};
