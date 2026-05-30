// src/utils/excel/excelColumnMetaUtils.js

/**
 * AG Grid columnDefs를 서버 ExcelColumnMeta 목록으로 변환한다.
 *
 * <p>
 * 서버 ExcelColumnMeta 구조:
 * {
 *   field,
 *   headerName,
 *   parentHeader,
 *   level,
 *   required,
 *   exampleValue,
 *   dataType,
 *   hidden,
 *   order
 * }
 * </p>
 *
 * <p>
 * 지원 구조:
 * 1. 단일 컬럼
 * 2. 2단 헤더 그룹
 * 3. 3단 이상 헤더 그룹 일부 지원
 * 4. 숨김 컬럼
 * 5. required / dataType / exampleValue 같은 엑셀 전용 속성
 * </p>
 */

/**
 * AG Grid columnDefs를 ExcelColumnMeta 배열로 변환한다.
 *
 * @param {Array<object>} columnDefs AG Grid columnDefs
 * @param {object} options 변환 옵션
 * @param {boolean} options.excludeHiddenColumns 숨김 컬럼 제외 여부
 * @returns {Array<object>} ExcelColumnMeta 배열
 */
export function buildExcelColumnMetas(columnDefs, options = {}) {
  // 숨김 컬럼 제외 여부를 꺼내고, 기본값은 false로 둔다.
  const { excludeHiddenColumns = false } = options;

  // 결과 컬럼 목록이다.
  const result = [];

  // order는 화면 컬럼 순서를 보장하기 위해 1부터 증가시킨다.
  let order = 1;

  /**
   * columnDefs를 재귀적으로 순회한다.
   *
   * @param {Array<object>} columns 현재 레벨 컬럼 목록
   * @param {Array<string>} parentHeaders 상위 헤더명 목록
   */
  function walk(columns, parentHeaders = []) {
    // 컬럼 목록이 없으면 처리하지 않는다.
    if (!Array.isArray(columns) || columns.length === 0) {
      return;
    }

    // 현재 레벨의 컬럼들을 순회한다.
    columns.forEach((columnDef) => {
      // 컬럼 정의가 없으면 건너뛴다.
      if (!columnDef) {
        return;
      }

      // 숨김 컬럼 제외 옵션이 켜져 있고 현재 컬럼이 숨김이면 건너뛴다.
      if (excludeHiddenColumns && isHiddenColumn(columnDef)) {
        return;
      }

      // children이 있으면 그룹 컬럼으로 판단한다.
      if (Array.isArray(columnDef.children) && columnDef.children.length > 0) {
        // 현재 그룹 헤더명을 가져온다.
        const groupHeaderName = resolveHeaderName(columnDef);

        // 상위 헤더 목록에 현재 그룹 헤더명을 추가한다.
        const nextParentHeaders = groupHeaderName
          ? [...parentHeaders, groupHeaderName]
          : [...parentHeaders];

        // 하위 컬럼을 계속 순회한다.
        walk(columnDef.children, nextParentHeaders);

        return;
      }

      // field가 없는 컬럼은 엑셀 데이터 매핑이 불가능하므로 제외한다.
      if (!columnDef.field) {
        return;
      }

      const headerName = resolveHeaderName(columnDef);
      const headerPath = [...parentHeaders, headerName].filter(Boolean);

      // ExcelColumnMeta를 생성한다.
      result.push({
        // 데이터 필드명.
        field: columnDef.field,

        // 실제 엑셀 하위 헤더명.
        headerName,

        // 현재 백엔드 1차 구현은 parentHeader 1개를 기준으로 2단 헤더를 만든다.
        // 3단 이상인 경우에는 마지막 상위 헤더를 parentHeader로 사용한다.
        // 서버가 headerPath를 지원하므로 실제 다중 헤더는 headerPath가 우선된다.
        parentHeader: resolveParentHeader(parentHeaders),

        // 헤더 레벨.
        level: parentHeaders.length,

        // 3단 이상 헤더 지원용.
        headerPath,

        // 필수 컬럼 여부.
        required: Boolean(
          columnDef.required ?? columnDef.excelRequired ?? false,
        ),

        // 템플릿 예제 값.
        exampleValue:
          columnDef.exampleValue ?? columnDef.excelExampleValue ?? "",

        // 엑셀 데이터 타입. 기본은 STRING.
        dataType: columnDef.dataType ?? columnDef.excelDataType ?? "STRING",

        // 숨김 컬럼 여부.
        hidden: isHiddenColumn(columnDef),

        // 화면 컬럼 순서.
        order: order++,
      });
    });
  }

  // 최상위 columnDefs부터 순회한다.
  walk(columnDefs);

  // 변환 결과를 반환한다.
  return result;
}

/**
 * AG Grid columnDefs 기준으로 다중 헤더 사용 여부를 판단한다.
 *
 * @param {Array<object>} columnDefs AG Grid columnDefs
 * @returns {boolean} children이 있는 컬럼이 하나라도 있으면 true
 */
export function hasExcelMultiHeader(columnDefs) {
  // 컬럼 목록이 없으면 false.
  if (!Array.isArray(columnDefs) || columnDefs.length === 0) {
    return false;
  }

  // children이 존재하는 컬럼이 하나라도 있는지 재귀적으로 확인한다.
  return columnDefs.some((columnDef) => {
    // 컬럼 정의가 없으면 false.
    if (!columnDef) {
      return false;
    }

    // children이 있으면 다중 헤더로 판단한다.
    if (Array.isArray(columnDef.children) && columnDef.children.length > 0) {
      return true;
    }

    // 하위 children이 없는 경우 false.
    return false;
  });
}

/**
 * AG Grid 컬럼 정의에서 헤더명을 결정한다.
 *
 * @param {object} columnDef AG Grid 컬럼 정의
 * @returns {string} 헤더명
 */
function resolveHeaderName(columnDef) {
  // headerName이 있으면 우선 사용한다.
  if (columnDef.headerName) {
    return columnDef.headerName;
  }

  // headerValueGetter가 문자열이면 사용한다.
  if (typeof columnDef.headerValueGetter === "string") {
    return columnDef.headerValueGetter;
  }

  // field가 있으면 field를 fallback으로 사용한다.
  if (columnDef.field) {
    return columnDef.field;
  }

  // 없으면 빈 문자열.
  return "";
}

/**
 * parentHeader 값을 결정한다.
 *
 * <p>
 * 현재 백엔드 다운로드 서비스는 parentHeader 하나를 기준으로 2단 헤더를 만든다.
 * 따라서 상위 헤더가 여러 개이면 마지막 상위 헤더를 사용한다.
 * </p>
 *
 * @param {Array<string>} parentHeaders 상위 헤더명 목록
 * @returns {string|null} parentHeader
 */
function resolveParentHeader(parentHeaders) {
  // 상위 헤더가 없으면 null.
  if (!Array.isArray(parentHeaders) || parentHeaders.length === 0) {
    return null;
  }

  // 마지막 상위 헤더를 반환한다.
  return parentHeaders[parentHeaders.length - 1];
}

/**
 * 숨김 컬럼 여부를 판단한다.
 *
 * @param {object} columnDef AG Grid 컬럼 정의
 * @returns {boolean} 숨김 컬럼이면 true
 */
function isHiddenColumn(columnDef) {
  // AG Grid는 hide: true이면 숨김 컬럼이다.
  return columnDef.hide === true;
}

/**
 * 업로드 요청 옵션을 생성한다.
 *
 * @param {object} options 옵션
 * @param {boolean} options.useMultiHeader 다중 헤더 사용 여부
 * @param {boolean} options.hasExampleRow 템플릿 예제 행 포함 여부
 * @returns {object} ExcelUploadOption 구조
 */
export function buildExcelUploadOption(options = {}) {
  // 다중 헤더 사용 여부.
  const useMultiHeader = Boolean(options.useMultiHeader);

  // 템플릿 예제 행 포함 여부.
  const hasExampleRow = Boolean(options.hasExampleRow);

  // 단일 헤더 기준 row index.
  if (!useMultiHeader) {
    return {
      useMultiHeader: false,
      headerStartRowIndex: 0,
      headerEndRowIndex: 0,
      dataStartRowIndex: hasExampleRow ? 2 : 1,
      ignoreEmptyRow: true,
      blockFormula: true,
      includeErrorRows: true,
    };
  }

  // 2단 헤더 기준 row index.
  return {
    useMultiHeader: true,
    headerStartRowIndex: 0,
    // headerEndRowIndex: 1,
    // dataStartRowIndex: hasExampleRow ? 3 : 2,
    headerEndRowIndex: 2,
    dataStartRowIndex: hasExampleRow ? 4 : 3,
    ignoreEmptyRow: true,
    blockFormula: true,
    includeErrorRows: true,
  };
}

/**
 * 업로드 결과 rows 중 오류 행이 있는지 확인한다.
 *
 * @param {Array<object>} rows AG Grid rowData
 * @returns {boolean} 오류 행이 있으면 true
 */
export function hasErrorRows(rows) {
  // rows가 없으면 false.
  if (!Array.isArray(rows) || rows.length === 0) {
    return false;
  }

  // _rowStatus가 ERROR인 행이 있는지 확인한다.
  return rows.some((row) => row?._rowStatus === "ERROR");
}

/**
 * 업로드 결과 rows 중 오류 행만 반환한다.
 *
 * @param {Array<object>} rows AG Grid rowData
 * @returns {Array<object>} 오류 행 목록
 */
export function filterErrorRows(rows) {
  // rows가 없으면 빈 배열.
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  // 오류 행만 필터링한다.
  return rows.filter((row) => row?._rowStatus === "ERROR");
}
