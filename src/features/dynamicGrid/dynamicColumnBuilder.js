// src/features/dynamicGrid/dynamicColumnBuilder.js

import { resolveSelectedDimensions } from "./dimensionOptions";
import {
  getDynamicCellClass,
  getEditCellStyle,
  getSearchCellStyle,
  isDynamicValueColumn,
} from "./dynamicGridStyles";

/**
 * 기본 컬럼 field 목록.
 */
const BASE_FIELD_CATEGORY = "categoryName";
const BASE_FIELD_APP = "appName";
const BASE_FIELD_GA_NGA = "gaNgaType";
const BASE_FIELD_CUSTOMER = "customerName";

/**
 * status 컬럼 field.
 */
const STATUS_FIELD = "_rowStatus";

/**
 * 다이나믹 그리드 columnDefs를 생성한다.
 *
 * @param {object} options 옵션
 * @param {string} options.mode View/Edit 모드
 * @param {Array<string>} options.selectedDimensions 선택 Dimension id 목록
 * @param {string} options.startYm 시작년월
 * @param {string} options.endYm 종료년월
 * @param {boolean} options.useQuarter quarter 컬럼 사용 여부
 * @param {boolean} options.useTotalOnly quarter 미선택 시 total 컬럼만 생성 여부
 * @returns {Array<object>} AG Grid columnDefs
 */
export function buildDynamicGridColumnDefs({
  mode = "VIEW",
  selectedDimensions = [],
  startYm,
  endYm,
  useQuarter = true,
  useTotalOnly = false,
} = {}) {
  const editable = mode === "EDIT";

  const columns = [];

  if (editable) {
    columns.push(createStatusColumn());
  }

  columns.push(...createBaseColumns({ editable }));

  columns.push(
    ...createDynamicColumns({
      selectedDimensions,
      startYm,
      endYm,
      editable,
      useQuarter,
      useTotalOnly,
    }),
  );

  return columns;
}

/**
 * status 컬럼을 생성한다.
 *
 * @returns {object} status columnDef
 */
function createStatusColumn() {
  return {
    field: STATUS_FIELD,
    headerName: "STATUS",
    width: 90,
    pinned: "left",
    editable: false,
    cellStyle: getEditCellStyle,
  };
}

/**
 * 기본 컬럼을 생성한다.
 *
 * @param {object} options 옵션
 * @param {boolean} options.editable 편집 가능 여부
 * @returns {Array<object>} 기본 컬럼 목록
 */
function createBaseColumns({ editable }) {
  return [
    {
      field: BASE_FIELD_CATEGORY,
      headerName: "구분",
      width: 120,
      pinned: "left",
      editable,
      excelDataType: "STRING",
      excelRequired: true,
      excelExampleValue: "구분1",
      cellStyle: editable ? getEditCellStyle : getSearchCellStyle,
    },
    {
      field: BASE_FIELD_APP,
      headerName: "APP",
      width: 120,
      pinned: "left",
      editable,
      excelDataType: "STRING",
      excelRequired: true,
      excelExampleValue: "APP-A",
      cellStyle: editable ? getEditCellStyle : getSearchCellStyle,
    },
    {
      field: BASE_FIELD_GA_NGA,
      headerName: "GA/NGA",
      width: 120,
      pinned: "left",
      editable,
      excelDataType: "STRING",
      excelRequired: true,
      excelExampleValue: "GA",
      cellStyle: editable ? getEditCellStyle : getSearchCellStyle,
    },
    {
      field: BASE_FIELD_CUSTOMER,
      headerName: "CUSTOMER",
      width: 150,
      pinned: "left",
      editable,
      excelDataType: "STRING",
      excelRequired: true,
      excelExampleValue: "삼성전자",
      cellStyle: editable ? getEditCellStyle : getSearchCellStyle,
    },
    {
      field: "sort3",
      headerName: "sort3",
      hide: true,
      excelDataType: "INTEGER",
      excelExampleValue: "1",
    },
    {
      field: "sort4",
      headerName: "sort4",
      hide: true,
      excelDataType: "INTEGER",
      excelExampleValue: "1",
    },
    {
      field: "sort5",
      headerName: "sort5",
      hide: true,
      excelDataType: "INTEGER",
      excelExampleValue: "1",
    },
  ];
}

/**
 * 동적 컬럼을 생성한다.
 *
 * 구조:
 * Dimension
 *   └─ Year
 *       └─ Quarter 또는 Total
 *
 * @param {object} options 옵션
 * @returns {Array<object>} 동적 컬럼 목록
 */
function createDynamicColumns({
  selectedDimensions,
  startYm,
  endYm,
  editable,
  useQuarter,
  useTotalOnly,
}) {
  const dimensions = resolveSelectedDimensions(selectedDimensions);
  const yearMonths = createYearMonthRange(startYm, endYm);
  const years = createYearRange(startYm, endYm);

  if (dimensions.length === 0) {
    return [];
  }

  return dimensions.map((dimension) => {
    const yearGroups = years.map((year) => {
      const childColumns = createChildColumnsByYear({
        dimension,
        year,
        yearMonths,
        editable,
        useQuarter,
        useTotalOnly,
      });

      return {
        headerName: String(year),
        children: childColumns,
      };
    });

    return {
      headerName: dimension.label,
      children: yearGroups,
    };
  });
}

/**
 * 특정 연도 하위 컬럼을 생성한다.
 *
 * @param {object} options 옵션
 * @returns {Array<object>} child columns
 */
function createChildColumnsByYear({
  dimension,
  year,
  yearMonths,
  editable,
  useQuarter,
  useTotalOnly,
}) {
  if (useTotalOnly || !useQuarter) {
    return [
      createDynamicValueColumn({
        dimension,
        field: createTotalField(dimension.metricType, year),
        headerName: "Total",
        editable,
      }),
    ];
  }

  const monthsOfYear = yearMonths.filter((ym) => ym.startsWith(String(year)));

  return monthsOfYear.map((ym) => {
    const month = ym.substring(4, 6);

    return createDynamicValueColumn({
      dimension,
      field: createMonthField(dimension.metricType, ym),
      headerName: `${Number(month)}M`,
      editable,
    });
  });
}

/**
 * 동적 값 컬럼을 생성한다.
 *
 * @param {object} options 옵션
 * @returns {object} columnDef
 */
function createDynamicValueColumn({ dimension, field, headerName, editable }) {
  return {
    field,
    headerName,
    width: 110,
    editable,
    type: "numericColumn",
    excelDataType: dimension.dataType,
    excelExampleValue: dimension.exampleValue,
    cellClass: getDynamicCellClass,
    cellStyle: editable ? getEditCellStyle : getSearchCellStyle,
    valueParser: numberValueParser,
  };
}

/**
 * 월별 field를 생성한다.
 *
 * 규칙:
 * QTY_Q202601
 *
 * @param {string} metricType metric type
 * @param {string} ym yyyyMM
 * @returns {string} field
 */
function createMonthField(metricType, ym) {
  return `${metricType}_Q${ym}`;
}

/**
 * Total field를 생성한다.
 *
 * 규칙:
 * QTY_Q2026_TOT
 *
 * @param {string} metricType metric type
 * @param {number|string} year 연도
 * @returns {string} field
 */
function createTotalField(metricType, year) {
  return `${metricType}_Q${year}_TOT`;
}

/**
 * 시작년월~종료년월 범위의 yyyyMM 목록을 생성한다.
 *
 * @param {string} startYm 시작년월
 * @param {string} endYm 종료년월
 * @returns {Array<string>} yyyyMM 목록
 */
export function createYearMonthRange(startYm, endYm) {
  if (!isValidYm(startYm) || !isValidYm(endYm)) {
    return [];
  }

  const result = [];

  let year = Number(startYm.substring(0, 4));
  let month = Number(startYm.substring(4, 6));

  const endYear = Number(endYm.substring(0, 4));
  const endMonth = Number(endYm.substring(4, 6));

  while (year < endYear || (year === endYear && month <= endMonth)) {
    result.push(`${year}${String(month).padStart(2, "0")}`);

    month += 1;

    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return result;
}

/**
 * 시작년월~종료년월 범위의 연도 목록을 생성한다.
 *
 * @param {string} startYm 시작년월
 * @param {string} endYm 종료년월
 * @returns {Array<number>} 연도 목록
 */
export function createYearRange(startYm, endYm) {
  if (!isValidYm(startYm) || !isValidYm(endYm)) {
    return [];
  }

  const startYear = Number(startYm.substring(0, 4));
  const endYear = Number(endYm.substring(0, 4));

  const result = [];

  for (let year = startYear; year <= endYear; year += 1) {
    result.push(year);
  }

  return result;
}

/**
 * yyyyMM 형식 여부를 검증한다.
 *
 * @param {string} ym yyyyMM
 * @returns {boolean} 유효하면 true
 */
function isValidYm(ym) {
  if (!/^\d{6}$/.test(ym ?? "")) {
    return false;
  }

  const month = Number(ym.substring(4, 6));

  return month >= 1 && month <= 12;
}

/**
 * 숫자 valueParser.
 *
 * @param {object} params AG Grid params
 * @returns {number|null} 숫자 값
 */
function numberValueParser(params) {
  const value = params.newValue;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).replaceAll(",", "");

  const numberValue = Number(normalized);

  return Number.isNaN(numberValue) ? null : numberValue;
}

/**
 * rowData에서 변경된 row만 추출한다.
 *
 * @param {Array<object>} rows rowData
 * @returns {Array<object>} 저장 대상 row 목록
 */
export function filterSaveTargetRows(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter((row) => {
    const status = row?._rowStatus;

    return status === "I" || status === "U" || status === "D";
  });
}

/**
 * 셀 값 변경 시 rowStatus를 U로 변경한다.
 *
 * @param {object} params AG Grid onCellValueChanged params
 */
export function markUpdatedRow(params) {
  const row = params.data;

  if (!row) {
    return;
  }

  if (row._rowStatus === "I" || row._rowStatus === "D") {
    return;
  }

  if (
    isDynamicValueColumn(params.colDef.field) ||
    isBaseEditableField(params.colDef.field)
  ) {
    row._rowStatus = "U";
    params.api.refreshCells({
      rowNodes: [params.node],
      force: true,
    });
  }
}

/**
 * 기본 편집 가능 field 여부.
 *
 * @param {string} field field
 * @returns {boolean} 편집 가능 기본 필드이면 true
 */
function isBaseEditableField(field) {
  return [
    BASE_FIELD_CATEGORY,
    BASE_FIELD_APP,
    BASE_FIELD_GA_NGA,
    BASE_FIELD_CUSTOMER,
  ].includes(field);
}
