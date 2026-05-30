// src/features/dynamicGrid/dynamicGridStyles.js

/**
 * 조회 모드 셀 스타일을 반환한다.
 *
 * @param {object} params AG Grid cell params
 * @returns {object|null} cellStyle
 */
export function getSearchCellStyle(params) {
  const field = params.colDef.field;
  const row = params.data;

  if (isAmountColumn(field)) {
    return {
      backgroundColor: "#fff3e0",
    };
  }

  if (isTotalColumn(field)) {
    return {
      backgroundColor: "#e3f2fd",
      fontWeight: "bold",
    };
  }

  if (isTopLevelRow(row)) {
    return {
      backgroundColor: "#f5f5f5",
      fontWeight: "bold",
    };
  }

  if (isMiddleLevelRow(row)) {
    return {
      backgroundColor: "#fafafa",
    };
  }

  return null;
}

/**
 * Edit 모드 셀 스타일을 반환한다.
 *
 * @param {object} params AG Grid cell params
 * @returns {object|null} cellStyle
 */
export function getEditCellStyle(params) {
  const field = params.colDef.field;
  const row = params.data;

  if (field === "_rowStatus") {
    return {
      backgroundColor: "#eeeeee",
      fontWeight: "bold",
      textAlign: "center",
    };
  }

  if (row?._rowStatus === "ERROR") {
    return {
      backgroundColor: "#ffebee",
    };
  }

  if (isTotalColumn(field)) {
    return {
      backgroundColor: "#e3f2fd",
      fontWeight: "bold",
    };
  }

  if (isAmountColumn(field)) {
    return {
      backgroundColor: "#fff8e1",
    };
  }

  return {
    backgroundColor: "#ffffff",
  };
}

/**
 * Excel 다운로드용 스타일 key를 반환한다.
 *
 * <p>
 * 현재 AG Grid 기본 export 또는 서버 POI 다운로드에서 스타일 분기 기준으로 사용할 수 있다.
 * 1차 화면에서는 className/key만 반환하고,
 * 실제 Excel 스타일 적용은 추후 확장한다.
 * </p>
 *
 * @param {string} field 컬럼 field
 * @returns {string} 스타일 key
 */
export function getExcelStyleKey(field) {
  if (isAmountColumn(field)) {
    return "AMT_COL";
  }

  if (isTotalColumn(field)) {
    return "TOTAL_COL";
  }

  return "DEFAULT_COL";
}

/**
 * 컬럼 className을 반환한다.
 *
 * @param {object} params AG Grid cell params
 * @returns {Array<string>} className 목록
 */
export function getDynamicCellClass(params) {
  const field = params.colDef.field;
  const classes = [];

  if (isAmountColumn(field)) {
    classes.push("AMT_COL");
  }

  if (isTotalColumn(field)) {
    classes.push("TOTAL_COL");
  }

  if (params.data?._rowStatus === "ERROR") {
    classes.push("ERROR_ROW");
  }

  return classes;
}

/**
 * AMT 컬럼 여부.
 *
 * @param {string} field field
 * @returns {boolean} AMT 컬럼이면 true
 */
export function isAmountColumn(field) {
  return typeof field === "string" && field.includes("AMT_");
}

/**
 * Total 컬럼 여부.
 *
 * @param {string} field field
 * @returns {boolean} Total 컬럼이면 true
 */
export function isTotalColumn(field) {
  return typeof field === "string" && field.includes("_TOT");
}

/**
 * 동적 값 컬럼 여부.
 *
 * @param {string} field field
 * @returns {boolean} 동적 컬럼이면 true
 */
export function isDynamicValueColumn(field) {
  if (!field || typeof field !== "string") {
    return false;
  }

  if (field.startsWith("_")) {
    return false;
  }

  return field.includes("_Q");
}

/**
 * 최상위 row 여부.
 *
 * @param {object} row rowData
 * @returns {boolean} 최상위 row이면 true
 */
export function isTopLevelRow(row) {
  return row?.sort3 === 1 && row?.sort4 === 1 && row?.sort5 === 1;
}

/**
 * 중간 level row 여부.
 *
 * @param {object} row rowData
 * @returns {boolean} 중간 row이면 true
 */
export function isMiddleLevelRow(row) {
  return row?.sort3 === 0 && row?.sort4 === 1 && row?.sort5 === 1;
}

/**
 * 하위 level row 여부.
 *
 * @param {object} row rowData
 * @returns {boolean} 하위 row이면 true
 */
export function isLeafLevelRow(row) {
  return row?.sort3 === 0 && row?.sort4 === 0 && row?.sort5 === 0;
}
