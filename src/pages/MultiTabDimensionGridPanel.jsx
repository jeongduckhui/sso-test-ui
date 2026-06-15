// React Hook을 import한다.
import { useEffect, useMemo, useState } from "react";

// AG Grid React 컴포넌트를 import한다.
import { AgGridReact } from "ag-grid-react";

// AG Grid Community 모듈을 등록하기 위해 import한다.
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// AG Grid 기본 CSS를 import한다.
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// 새 버전 더미 API를 import한다.
// 실제 프로젝트에서는 이 파일의 함수 내부만 axios 호출로 교체하면 된다.
import {
  fetchCascadeOptions,
  fetchExtraSelectOptions,
  fetchInitialCascadeOptions,
  fetchDimensionItems,
  searchMultiTabSplitRows,
} from "../mock/multiTabSplitDimensionDummyApi";

// AG Grid Community 전체 기능을 등록한다.
ModuleRegistry.registerModules([AllCommunityModule]);

// ============================================================
// 1. Constants
// ============================================================

// 실제 차세대 탭 key 기준이다.
const TAB_KEYS = {
  DRAM: "1",
  NAND: "2",
};

// Dimension 선택 모드이다.
const DIMENSION_MODES = {
  NONE: "",
  TECH: "TECH",
  TDM: "TDM",
  APP: "APP",
  MODE: "MODE",
};

// strSrcType 상태값이다.
const SRC_TYPES = {
  BASE: "BASE",
  UPPER2: "UPPER2",
  COLCHG: "COLCHG",
  ALL: "ALL",
  ALL_TAB: "ALL_TAB",
};

// 5단계 연계 셀렉트박스 필드이다.
const CASCADE_FIELDS = ["level1", "level2", "level3", "level4", "level5"];

// 체크박스 + 멀티셀렉트 5개 필드이다.
const METRIC_SELECT_FIELDS = [
  "metricGroup1",
  "metricGroup2",
  "metricGroup3",
  "metricGroup4",
  "metricGroup5",
];

// 기간 타입이다.
const PERIOD_TYPES = {
  MONTH: "MONTH",
  QUARTER: "QUARTER",
  HALF: "HALF",
  YEAR: "YEAR",
};

// 기본 조회조건이다.
const DEFAULT_SEARCH_FORM = {
  fromYm: "202601",
  toYm: "202612",

  level1: [],
  level2: [],
  level3: [],
  level4: [],
  level5: [],

  useSubTotal: false,

  dimensionMode: DIMENSION_MODES.NONE,

  // 기본은 분기이다.
  periodTypes: [PERIOD_TYPES.QUARTER],

  dashboardChecked: false,
  dashboardValues: [],

  metricGroup1Checked: true,
  metricGroup1Values: ["QTY"],

  metricGroup2Checked: false,
  metricGroup2Values: [],

  metricGroup3Checked: false,
  metricGroup3Values: [],

  metricGroup4Checked: false,
  metricGroup4Values: [],

  metricGroup5Checked: false,
  metricGroup5Values: [],

  selectedDimensions: [],
};

// 탭별 상태의 기본 구조를 생성한다.
// 부모 화면의 tabStates에서 DRAM/NAND 각각 이 구조를 독립적으로 가진다.
export function createInitialTabState() {
  return {
    searchForm: {
      ...DEFAULT_SEARCH_FORM,
      selectedDimensions: [],
    },
    rowData: [],
    columnDefs: [],
    cascadeOptions: {
      level1: [],
      level2: [],
      level3: [],
      level4: [],
      level5: [],
    },
    extraSelectOptions: {},
    dimensionItems: [],
    dimensionPopupOpen: false,
    loading: false,
    initialized: false,
  };
}

// 탭별 정책이다.
// 탭 key가 "1", "2"이므로 정책도 key 기준으로 관리한다.
const TAB_POLICY = {
  [TAB_KEYS.DRAM]: {
    tabName: "DRAM",
    disabledCascadeFields: ["level4"],
    dimensionScopes: ["COMMON", "DRAM"],
    visibleGroups: [
      "period",
      "cascade",
      "metric",
      "dimension",
      "subtotal",
      "test",
    ],
  },
  [TAB_KEYS.NAND]: {
    tabName: "NAND",
    disabledCascadeFields: [],
    dimensionScopes: ["COMMON", "NAND"],
    visibleGroups: ["period", "cascade", "metric", "dimension", "subtotal"],
  },
};

const CASCADE_FIELD_LABELS = {
  level1: "연계 1",
  level2: "연계 2",
  level3: "연계 3",
  level4: "연계 4",
  level5: "연계 5",
};

const METRIC_FIELD_LABELS = {
  metricGroup1: "동적항목 1",
  metricGroup2: "동적항목 2",
  metricGroup3: "동적항목 3",
  metricGroup4: "동적항목 4",
  metricGroup5: "동적항목 5",
};

const CONTROL_POLICY = {
  dashboardDisables: ["metricGroup1"],
};

const ROW_TYPES = {
  DATA: "DATA",
  SUBTOTAL: "SUBTOTAL",
};

const HIERARCHY_LEVEL_STYLES = {
  0: { backgroundColor: "#eef6ff" },
  1: { backgroundColor: "#f1fff0" },
  2: { backgroundColor: "#fff8e8" },
  3: { backgroundColor: "#f8efff" },
};

const DYNAMIC_CELL_STYLE = {
  textAlign: "right",
  backgroundColor: "#f3f4f6",
};

// ============================================================
// 2. Policy / Utility
// ============================================================

// 탭 + Tech/TDM/APP/Mode 기준으로 strSrcType을 계산한다.
function resolveSrcType(activeTabKey, dimensionMode) {
  if (dimensionMode === DIMENSION_MODES.TECH) {
    return SRC_TYPES.BASE;
  }

  if (dimensionMode === DIMENSION_MODES.TDM) {
    return SRC_TYPES.ALL;
  }

  if (
    dimensionMode === DIMENSION_MODES.MODE &&
    activeTabKey === TAB_KEYS.DRAM
  ) {
    return SRC_TYPES.UPPER2;
  }

  if (dimensionMode === DIMENSION_MODES.APP && activeTabKey === TAB_KEYS.DRAM) {
    return SRC_TYPES.UPPER2;
  }

  if (
    dimensionMode === DIMENSION_MODES.MODE &&
    activeTabKey === TAB_KEYS.NAND
  ) {
    return SRC_TYPES.BASE;
  }

  if (dimensionMode === DIMENSION_MODES.APP && activeTabKey === TAB_KEYS.NAND) {
    return SRC_TYPES.COLCHG;
  }

  return SRC_TYPES.ALL_TAB;
}

// 현재 탭과 strSrcType 기준으로 Dimension 팝업에 노출 가능한 항목을 계산한다.
function getAvailableDimensionItems(
  dimensionItems,
  activeTabKey,
  dimensionMode,
) {
  const tabPolicy = TAB_POLICY[activeTabKey];
  const strSrcType = resolveSrcType(activeTabKey, dimensionMode);

  if (strSrcType === SRC_TYPES.ALL) {
    return dimensionItems
      .filter((item) => item.scope === "COMMON")
      .sort((a, b) => a.order - b.order);
  }

  if (strSrcType === SRC_TYPES.ALL_TAB) {
    return dimensionItems
      .filter(
        (item) => item.scope === "COMMON" || item.scope === tabPolicy.tabName,
      )
      .sort((a, b) => a.order - b.order);
  }

  return dimensionItems
    .filter((item) => {
      const scopeMatched = tabPolicy.dimensionScopes.includes(item.scope);
      const stateMatched = item.states.includes(strSrcType);
      return scopeMatched && stateMatched;
    })
    .sort((a, b) => a.order - b.order);
}

// 선택 모드에 따라 고정 컬럼 key 목록을 반환한다.
function getFixedDimensionKeys(dimensionMode) {
  if (dimensionMode === DIMENSION_MODES.TECH) {
    return ["FAMILY", "TECH"];
  }

  if (dimensionMode === DIMENSION_MODES.APP) {
    return ["FAMILY", "APP"];
  }

  if (dimensionMode === DIMENSION_MODES.MODE) {
    return ["FAMILY", "MODE"];
  }

  if (dimensionMode === DIMENSION_MODES.TDM) {
    return ["FAMILY", "TECH", "FAB", "DENS", "VER", "MODE", "APP"];
  }

  return [];
}

function getDimensionLabel(dimension) {
  return dimension?.value ?? dimension?.key ?? "";
}

function getDimensionField(dimension) {
  return dimension?.field ?? "";
}

function getDimensionKey(dimension) {
  return dimension?.key ?? "";
}

function getDefaultSelectedDimensions(dimensionItems) {
  return dimensionItems
    .filter((item) => ["FAMILY", "TECH", "FAB", "DENS"].includes(item.key))
    .sort((a, b) => a.order - b.order);
}

function toggleArrayValue(values, value, checked) {
  const currentValues = values ?? [];

  if (checked) {
    return [...new Set([...currentValues, value])];
  }

  return currentValues.filter((item) => item !== value);
}

function resetLowerCascadeValues(form, changedField) {
  const changedIndex = CASCADE_FIELDS.indexOf(changedField);

  if (changedIndex < 0) {
    return form;
  }

  const nextForm = { ...form };

  CASCADE_FIELDS.slice(changedIndex + 1).forEach((field) => {
    nextForm[field] = [];
  });

  return nextForm;
}

function resolveNextPeriodTypes(currentTypes, changedType, checked) {
  if (changedType === PERIOD_TYPES.MONTH && checked) {
    return [PERIOD_TYPES.MONTH];
  }

  if (changedType === PERIOD_TYPES.MONTH && !checked) {
    return [];
  }

  const withoutMonth = currentTypes.filter(
    (type) => type !== PERIOD_TYPES.MONTH,
  );

  if (checked) {
    return [...new Set([...withoutMonth, changedType])];
  }

  return withoutMonth.filter((type) => type !== changedType);
}

function getSelectedMetricHeaders(searchForm) {
  const headers = [];

  METRIC_SELECT_FIELDS.forEach((field) => {
    if (!searchForm[`${field}Checked`]) {
      return;
    }

    (searchForm[`${field}Values`] ?? []).forEach((value) => {
      headers.push(value);
    });
  });

  return headers;
}

// ============================================================
// 3. Column Builder
// ============================================================

// 응답 컬럼명을 분석한다.
// q202601_qty -> QTY / 2026 / 1Q
// h202601_qty -> QTY / 2026 / H1
// h2026_qty   -> QTY / 2026 / Year
// m202601_qty -> QTY / 2026 / 01
function parseResponseColumnName(fieldName) {
  const match = String(fieldName).match(/^([qhm])(\d{4})(\d{0,2})_(.+)$/i);

  if (!match) {
    return null;
  }

  const prefix = match[1].toLowerCase();
  const year = match[2];
  const periodCode = match[3];
  const metricKey = match[4];

  let periodLabel = "";
  let periodOrder = 0;

  if (prefix === "q") {
    periodLabel = `${Number(periodCode)}Q`;
    periodOrder = Number(periodCode);
  }

  if (prefix === "h" && periodCode) {
    periodLabel = `H${Number(periodCode)}`;
    periodOrder = Number(periodCode);
  }

  if (prefix === "h" && !periodCode) {
    periodLabel = "Year";
    periodOrder = 1;
  }

  if (prefix === "m") {
    periodLabel = periodCode;
    periodOrder = Number(periodCode);
  }

  return {
    field: fieldName,
    metricKey,
    metricLabel: String(metricKey).toUpperCase(),
    year,
    periodLabel,
    periodOrder,
    prefix,
  };
}

function isDynamicResponseField(fieldName) {
  return parseResponseColumnName(fieldName) !== null;
}

// 현재 선택된 기간 타입 기준으로 응답 컬럼 prefix를 필터링한다.
function isAllowedByPeriodTypes(parsed, periodTypes) {
  const safePeriodTypes =
    periodTypes && periodTypes.length > 0
      ? periodTypes
      : [PERIOD_TYPES.QUARTER];

  if (parsed.prefix === "m") {
    return safePeriodTypes.includes(PERIOD_TYPES.MONTH);
  }

  if (parsed.prefix === "q") {
    return safePeriodTypes.includes(PERIOD_TYPES.QUARTER);
  }

  if (parsed.prefix === "h" && parsed.periodLabel === "Year") {
    return safePeriodTypes.includes(PERIOD_TYPES.YEAR);
  }

  if (parsed.prefix === "h") {
    return safePeriodTypes.includes(PERIOD_TYPES.HALF);
  }

  return false;
}

// 현재 체크박스+멀티셀렉트에서 선택한 metric만 보여준다.
function isAllowedByMetricHeaders(parsed, metricHeaders) {
  if (!metricHeaders || metricHeaders.length === 0) {
    return true;
  }

  return metricHeaders.includes(parsed.metricLabel);
}

// strSrcType 분기를 반영한 고정 컬럼 생성 함수이다.
// 실제 차세대의 if (strSrcType === "UPPER2") 분기 위치를 이 함수에 모았다.
function buildFixedColumnDefs(searchForm, strSrcType) {
  const selectedDimensions = searchForm.selectedDimensions ?? [];
  const fixedDimensionKeys = getFixedDimensionKeys(searchForm.dimensionMode);

  const dimensionColumns = selectedDimensions.map((dimension) => {
    const dimensionKey = getDimensionKey(dimension);
    const dimensionField = getDimensionField(dimension);

    return {
      headerName: getDimensionLabel(dimension),
      field: dimensionField,
      pinned: fixedDimensionKeys.includes(dimensionKey) ? "left" : undefined,
      width: 115,
      cellStyle: (params) =>
        getHierarchyCellStyle(params, dimension, selectedDimensions),
    };
  });

  if (strSrcType === SRC_TYPES.UPPER2) {
    const upperColumns = dimensionColumns.slice(0, 2);
    const lowerColumns = dimensionColumns.slice(2);

    return [
      {
        headerName: "UPPER2",
        marryChildren: true,
        children: upperColumns,
      },
      ...lowerColumns,
    ];
  }

  return dimensionColumns;
}

// 응답 rowData의 key를 기준으로 3단 동적 헤더를 생성한다.
function buildDynamicColumnDefsFromRows(rows, searchForm) {
  if (!rows || rows.length === 0) {
    return [];
  }

  const metricHeaders = getSelectedMetricHeaders(searchForm);
  const firstRow = rows[0];

  const parsedColumns = Object.keys(firstRow)
    .map(parseResponseColumnName)
    .filter(Boolean)
    .filter((item) => isAllowedByPeriodTypes(item, searchForm.periodTypes))
    .filter((item) => isAllowedByMetricHeaders(item, metricHeaders))
    .sort((a, b) => {
      if (a.metricLabel !== b.metricLabel) {
        return a.metricLabel.localeCompare(b.metricLabel);
      }

      if (a.year !== b.year) {
        return a.year.localeCompare(b.year);
      }

      if (a.prefix !== b.prefix) {
        return a.prefix.localeCompare(b.prefix);
      }

      return a.periodOrder - b.periodOrder;
    });

  const metricMap = new Map();

  parsedColumns.forEach((item) => {
    if (!metricMap.has(item.metricLabel)) {
      metricMap.set(item.metricLabel, new Map());
    }

    const yearMap = metricMap.get(item.metricLabel);

    if (!yearMap.has(item.year)) {
      yearMap.set(item.year, []);
    }

    yearMap.get(item.year).push(item);
  });

  return [...metricMap.entries()].map(([metricLabel, yearMap]) => ({
    headerName: metricLabel,
    children: [...yearMap.entries()].map(([year, columns]) => ({
      headerName: year,
      children: columns.map((column) => ({
        headerName: column.periodLabel,
        field: column.field,
        width: 90,
        cellStyle: getDynamicValueCellStyle,
        valueFormatter: (params) =>
          params.value === null || params.value === undefined
            ? ""
            : Number(params.value).toLocaleString(),
      })),
    })),
  }));
}

function buildGridColumnDefs(rows, searchForm, activeTabKey) {
  const strSrcType = resolveSrcType(activeTabKey, searchForm.dimensionMode);

  const fixedColumns = buildFixedColumnDefs(searchForm, strSrcType);
  const dynamicColumns = buildDynamicColumnDefsFromRows(rows, searchForm);

  return [...fixedColumns, ...dynamicColumns];
}

// ============================================================
// 4. Hierarchy Style
// ============================================================

function isSubtotalRow(data) {
  return data?._rowType === ROW_TYPES.SUBTOTAL;
}

function hasSubtotalText(data, dimensionField) {
  return String(data?.[dimensionField] ?? "").includes("Sub Total");
}

function getHierarchyDimensionKeys(selectedDimensions = []) {
  return selectedDimensions.map((item) => item.key);
}

function shouldPaintHierarchyCell(fieldIndex, subtotalLevel) {
  return fieldIndex >= subtotalLevel;
}

function getHierarchyCellStyle(params, dimension, selectedDimensions = []) {
  if (!params.data) {
    return undefined;
  }

  const dimensionKey = getDimensionKey(dimension);
  const dimensionField = getDimensionField(dimension);
  const hierarchyKeys = getHierarchyDimensionKeys(selectedDimensions);
  const fieldIndex = hierarchyKeys.indexOf(dimensionKey);

  if (fieldIndex < 0) {
    return undefined;
  }

  if (!isSubtotalRow(params.data)) {
    return HIERARCHY_LEVEL_STYLES[fieldIndex];
  }

  const subtotalLevel = params.data._subtotalLevel ?? 0;
  const subtotalField = params.data._subtotalField;
  const subtotalLevelStyle = HIERARCHY_LEVEL_STYLES[subtotalLevel] ?? {};

  if (
    dimensionField === subtotalField &&
    hasSubtotalText(params.data, dimensionField)
  ) {
    return {
      ...subtotalLevelStyle,
      fontWeight: 800,
    };
  }

  if (shouldPaintHierarchyCell(fieldIndex, subtotalLevel)) {
    return {
      ...subtotalLevelStyle,
      fontWeight: 700,
    };
  }

  return HIERARCHY_LEVEL_STYLES[fieldIndex];
}

function getDynamicValueCellStyle(params) {
  if (!params.data) {
    return DYNAMIC_CELL_STYLE;
  }

  if (!isSubtotalRow(params.data)) {
    return DYNAMIC_CELL_STYLE;
  }

  const subtotalLevel = params.data._subtotalLevel ?? 0;
  const levelStyle = HIERARCHY_LEVEL_STYLES[subtotalLevel] ?? {};

  return {
    textAlign: "right",
    ...levelStyle,
    fontWeight: 800,
  };
}

// ============================================================
// 5. Component
// ============================================================

export default function MultiTabDimensionGridPanel({
  activeTabKey,
  activeTabName,
  isActive,

  // 공통 값
  loginUserId,
  commonSelectValue,
  commonSelectOptions,

  // 탭별 값
  tabState,
  updateTabState,
}) {
  // 부모의 tabStates에서 현재 탭 상태를 전달받는다.
  // 이 컴포넌트 안에는 searchForm/rowData/columnDefs를 별도 useState로 두지 않는다.
  const {
    searchForm,
    rowData,
    columnDefs,
    cascadeOptions,
    extraSelectOptions,
    dimensionItems,
    dimensionPopupOpen,
    loading,
    initialized,
  } = tabState;

  const strSrcType = resolveSrcType(activeTabKey, searchForm.dimensionMode);

  const availableDimensions = useMemo(() => {
    return getAvailableDimensionItems(
      dimensionItems,
      activeTabKey,
      searchForm.dimensionMode,
    );
  }, [dimensionItems, activeTabKey, searchForm.dimensionMode]);

  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
      sortable: true,
      filter: true,
    };
  }, []);

  // 현재 탭이 최초로 활성화되었을 때 옵션을 조회한다.
  // 조회된 옵션과 기본 Dimension은 부모 tabStates의 현재 탭 상태에 저장된다.
  useEffect(() => {
    if (!isActive || initialized) {
      return;
    }

    let ignore = false;

    async function initOptions() {
      try {
        updateTabState(activeTabKey, (prev) => ({
          ...prev,
          loading: true,
        }));

        const dimensions = await fetchDimensionItems();
        const initialCascadeOptions = await fetchInitialCascadeOptions();
        const nextExtraSelectOptions = await fetchExtraSelectOptions();
        const defaultSelectedDimensions =
          getDefaultSelectedDimensions(dimensions);

        if (ignore) {
          return;
        }

        updateTabState(activeTabKey, (prev) => ({
          ...prev,
          dimensionItems: dimensions,
          cascadeOptions: initialCascadeOptions,
          extraSelectOptions: nextExtraSelectOptions,
          initialized: true,
          loading: false,
          searchForm: {
            ...prev.searchForm,
            selectedDimensions:
              prev.searchForm.selectedDimensions?.length > 0
                ? prev.searchForm.selectedDimensions
                : defaultSelectedDimensions,
          },
        }));
      } catch (error) {
        console.error(error);

        if (!ignore) {
          updateTabState(activeTabKey, (prev) => ({
            ...prev,
            loading: false,
          }));

          alert(`${activeTabName} 초기 옵션 조회 중 오류가 발생했습니다.`);
        }
      }
    }

    initOptions();

    return () => {
      ignore = true;
    };
  }, [isActive, initialized, activeTabKey, activeTabName, updateTabState]);

  function updateSearchForm(updater) {
    updateTabState(activeTabKey, (prev) => {
      const nextSearchForm =
        typeof updater === "function"
          ? updater(prev.searchForm)
          : {
              ...prev.searchForm,
              ...updater,
            };

      return {
        ...prev,
        searchForm: nextSearchForm,
      };
    });
  }

  function handleSearchFormChange(field, value) {
    updateSearchForm({
      [field]: value,
    });
  }

  async function handleCascadeChange(field, value, checked) {
    const nextForm = resetLowerCascadeValues(
      {
        ...searchForm,
        [field]: toggleArrayValue(searchForm[field], value, checked),
      },
      field,
    );

    updateSearchForm(nextForm);

    const changedIndex = CASCADE_FIELDS.indexOf(field);
    const nextField = CASCADE_FIELDS[changedIndex + 1];

    if (!nextField) {
      return;
    }

    const nextLevel = changedIndex + 2;
    const nextOptions = await fetchCascadeOptions(nextLevel, nextForm);

    updateTabState(activeTabKey, (prev) => {
      const nextCascadeOptions = {
        ...prev.cascadeOptions,
        [nextField]: nextOptions,
      };

      CASCADE_FIELDS.slice(changedIndex + 2).forEach((lowerField) => {
        nextCascadeOptions[lowerField] = [];
      });

      return {
        ...prev,
        cascadeOptions: nextCascadeOptions,
      };
    });
  }

  function handleMetricCheckedChange(field, checked) {
    updateSearchForm((form) => ({
      ...form,
      [`${field}Checked`]: checked,
      [`${field}Values`]: checked ? form[`${field}Values`] : [],
    }));
  }

  function handleMetricValueChange(field, value, checked) {
    const valuesField = `${field}Values`;

    updateSearchForm((form) => ({
      ...form,
      [valuesField]: toggleArrayValue(form[valuesField], value, checked),
    }));
  }

  function handleDashboardCheckedChange(checked) {
    updateSearchForm((form) => ({
      ...form,
      dashboardChecked: checked,
      dashboardValues: checked ? form.dashboardValues : [],
      metricGroup1Checked: checked ? false : form.metricGroup1Checked,
      metricGroup1Values: checked ? [] : form.metricGroup1Values,
    }));
  }

  function handleDashboardValueChange(value, checked) {
    updateSearchForm((form) => ({
      ...form,
      dashboardValues: toggleArrayValue(form.dashboardValues, value, checked),
    }));
  }

  function handlePeriodTypeChange(periodType, checked) {
    updateSearchForm((form) => ({
      ...form,
      periodTypes: resolveNextPeriodTypes(
        form.periodTypes,
        periodType,
        checked,
      ),
    }));
  }

  function handleApplyDimensions(nextSelectedDimensions) {
    updateSearchForm({
      selectedDimensions: nextSelectedDimensions,
    });
  }

  async function handleSearch() {
    try {
      updateTabState(activeTabKey, (prev) => ({
        ...prev,
        loading: true,
      }));

      const request = {
        activeTabKey,
        activeTabName,
        loginUserId,
        commonSelectValue,
        searchForm,
      };

      const rows = await searchMultiTabSplitRows(request);
      const nextColumnDefs = buildGridColumnDefs(
        rows,
        searchForm,
        activeTabKey,
      );

      updateTabState(activeTabKey, (prev) => ({
        ...prev,
        rowData: rows,
        columnDefs: nextColumnDefs,
        loading: false,
      }));
    } catch (error) {
      console.error(error);

      updateTabState(activeTabKey, (prev) => ({
        ...prev,
        loading: false,
      }));

      alert(`${activeTabName} 조회 중 오류가 발생했습니다.`);
    }
  }

  function handleOpenDimensionPopup() {
    updateTabState(activeTabKey, (prev) => ({
      ...prev,
      dimensionPopupOpen: true,
    }));
  }

  function handleCloseDimensionPopup() {
    updateTabState(activeTabKey, (prev) => ({
      ...prev,
      dimensionPopupOpen: false,
    }));
  }

  function isVisibleGroup(groupName) {
    return TAB_POLICY[activeTabKey].visibleGroups.includes(groupName);
  }

  function isCascadeDisabled(field) {
    return TAB_POLICY[activeTabKey].disabledCascadeFields.includes(field);
  }

  function isMetricDisabled(field) {
    return (
      searchForm.dashboardChecked &&
      CONTROL_POLICY.dashboardDisables.includes(field)
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.panel}>
        <div style={styles.panelTitle}>{activeTabName} 조회조건</div>

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
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !isActive || !initialized}
        >
          조회
        </button>

        <button
          type="button"
          onClick={handleOpenDimensionPopup}
          disabled={loading || !isActive || !initialized}
        >
          Dimension 설정
        </button>

        <span style={styles.statusText}>
          탭 Key: {activeTabKey} / 탭: {activeTabName} / 접속자ID: {loginUserId}{" "}
          / 공통구분: {commonSelectValue || "전체"} / Row: {rowData.length}
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
          onClose={handleCloseDimensionPopup}
        />
      )}

      {loading && <div style={styles.loading}>조회 중...</div>}
    </div>
  );
}

// ============================================================
// 6. Inner Components
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
  const [workingSelectedDimensions, setWorkingSelectedDimensions] =
    useState(selectedDimensions);

  const selectedKeySet = new Set(
    workingSelectedDimensions.map((dimension) => dimension.key),
  );

  const availableItems = availableDimensions.filter(
    (item) => !selectedKeySet.has(item.key),
  );

  function moveToSelected(dimension) {
    setWorkingSelectedDimensions((prev) =>
      [...prev, dimension].sort((a, b) => a.order - b.order),
    );
  }

  function removeFromSelected(dimensionKey) {
    setWorkingSelectedDimensions((prev) =>
      prev.filter((item) => item.key !== dimensionKey),
    );
  }

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

  function handleApply() {
    onApply(workingSelectedDimensions);
  }

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
// 7. Styles
// ============================================================

const styles = {
  page: {
    padding: 0,
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
