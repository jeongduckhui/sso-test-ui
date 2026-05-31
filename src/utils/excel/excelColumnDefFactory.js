// src/utils/excel/excelColumnDefFactory.js

/**
 * 엑셀 데이터 타입 상수.
 *
 * <p>
 * 서버 ExcelCellDataType enum 값과 동일하게 맞춘다.
 * </p>
 */
export const EXCEL_DATA_TYPE = {
  STRING: "STRING",
  INTEGER: "INTEGER",
  LONG: "LONG",
  BIG_DECIMAL: "BIG_DECIMAL",
  BOOLEAN: "BOOLEAN",
  LOCAL_DATE: "LOCAL_DATE",
  LOCAL_DATE_TIME: "LOCAL_DATE_TIME",
  OBJECT: "OBJECT",
};

/**
 * 문자열 컬럼을 생성한다.
 *
 * <p>
 * 고객코드, 고객명, 사번, 사업장코드, 구분값처럼
 * 숫자처럼 보여도 문자로 유지해야 하는 컬럼에 사용한다.
 * </p>
 *
 * @param {object} options 컬럼 옵션
 * @param {string} options.field field명
 * @param {string} options.headerName 헤더명
 * @param {boolean} options.required 필수 여부
 * @param {string} options.exampleValue 예제 값
 * @param {number} options.width 컬럼 너비
 * @returns {object} AG Grid columnDef
 */
export function textColumn({
  field,
  headerName,
  required = false,
  exampleValue = "",
  width = 120,
  ...rest
}) {
  return {
    field,
    headerName,
    width,
    excelDataType: EXCEL_DATA_TYPE.STRING,
    excelRequired: required,
    excelExampleValue: exampleValue,
    ...rest,
  };
}

/**
 * 숫자 컬럼을 생성한다.
 *
 * <p>
 * 기본 타입은 BIG_DECIMAL이다.
 * 금액, 수량, 비율처럼 소수점 가능성이 있거나
 * Oracle NUMBER(22,10)과 매핑될 수 있는 값에 적합하다.
 * </p>
 *
 * @param {object} options 컬럼 옵션
 * @param {string} options.field field명
 * @param {string} options.headerName 헤더명
 * @param {boolean} options.required 필수 여부
 * @param {string} options.exampleValue 예제 값
 * @param {number} options.width 컬럼 너비
 * @param {string} options.dataType 엑셀 데이터 타입
 * @returns {object} AG Grid columnDef
 */
export function numberColumn({
  field,
  headerName,
  required = false,
  exampleValue = "0",
  width = 120,
  dataType = EXCEL_DATA_TYPE.BIG_DECIMAL,
  ...rest
}) {
  return {
    field,
    headerName,
    width,
    type: "numericColumn",
    excelDataType: dataType,
    excelRequired: required,
    excelExampleValue: exampleValue,
    valueParser: numberValueParser,
    ...rest,
  };
}

/**
 * Integer 컬럼을 생성한다.
 *
 * <p>
 * 순번, 개수처럼 정수만 허용하는 컬럼에 사용한다.
 * </p>
 *
 * @param {object} options 컬럼 옵션
 * @returns {object} AG Grid columnDef
 */
export function integerColumn(options) {
  return numberColumn({
    ...options,
    dataType: EXCEL_DATA_TYPE.INTEGER,
  });
}

/**
 * Long 컬럼을 생성한다.
 *
 * <p>
 * Integer 범위를 넘을 수 있는 정수 컬럼에 사용한다.
 * </p>
 *
 * @param {object} options 컬럼 옵션
 * @returns {object} AG Grid columnDef
 */
export function longColumn(options) {
  return numberColumn({
    ...options,
    dataType: EXCEL_DATA_TYPE.LONG,
  });
}

/**
 * 날짜 컬럼을 생성한다.
 *
 * <p>
 * 서버 LOCAL_DATE 타입과 매핑된다.
 * 기본 예제 값은 yyyy-MM-dd 형식이다.
 * </p>
 *
 * @param {object} options 컬럼 옵션
 * @param {string} options.field field명
 * @param {string} options.headerName 헤더명
 * @param {boolean} options.required 필수 여부
 * @param {string} options.exampleValue 예제 값
 * @param {number} options.width 컬럼 너비
 * @returns {object} AG Grid columnDef
 */
export function dateColumn({
  field,
  headerName,
  required = false,
  exampleValue = "2026-05-31",
  width = 130,
  ...rest
}) {
  return {
    field,
    headerName,
    width,
    excelDataType: EXCEL_DATA_TYPE.LOCAL_DATE,
    excelRequired: required,
    excelExampleValue: exampleValue,
    ...rest,
  };
}

/**
 * 일시 컬럼을 생성한다.
 *
 * <p>
 * 서버 LOCAL_DATE_TIME 타입과 매핑된다.
 * 기본 예제 값은 yyyy-MM-ddTHH:mm:ss 형식이다.
 * </p>
 *
 * @param {object} options 컬럼 옵션
 * @returns {object} AG Grid columnDef
 */
export function dateTimeColumn({
  field,
  headerName,
  required = false,
  exampleValue = "2026-05-31T10:30:00",
  width = 180,
  ...rest
}) {
  return {
    field,
    headerName,
    width,
    excelDataType: EXCEL_DATA_TYPE.LOCAL_DATE_TIME,
    excelRequired: required,
    excelExampleValue: exampleValue,
    ...rest,
  };
}

/**
 * Boolean 컬럼을 생성한다.
 *
 * <p>
 * true/false, Y/N, 1/0 값을 boolean으로 다룰 때 사용한다.
 * 실무에서 Y/N 코드 자체를 유지해야 하면 textColumn을 사용하는 것이 더 적합하다.
 * </p>
 *
 * @param {object} options 컬럼 옵션
 * @returns {object} AG Grid columnDef
 */
export function booleanColumn({
  field,
  headerName,
  required = false,
  exampleValue = "true",
  width = 100,
  ...rest
}) {
  return {
    field,
    headerName,
    width,
    excelDataType: EXCEL_DATA_TYPE.BOOLEAN,
    excelRequired: required,
    excelExampleValue: exampleValue,
    ...rest,
  };
}

/**
 * 숨김 컬럼을 생성한다.
 *
 * <p>
 * sort 값, 내부 ID, 기준 코드처럼 화면에는 숨기지만
 * 저장이나 엑셀 메타에는 필요한 컬럼에 사용한다.
 * </p>
 *
 * @param {object} options 컬럼 옵션
 * @returns {object} AG Grid columnDef
 */
export function hiddenColumn({
  field,
  headerName = field,
  dataType = EXCEL_DATA_TYPE.STRING,
  exampleValue = "",
  required = false,
  ...rest
}) {
  return {
    field,
    headerName,
    hide: true,
    excelDataType: dataType,
    excelRequired: required,
    excelExampleValue: exampleValue,
    ...rest,
  };
}

/**
 * 업로드/편집 상태 컬럼을 생성한다.
 *
 * <p>
 * _rowStatus 값을 보여주는 컬럼이다.
 * 일반적으로 엑셀 다운로드 대상에서는 제외하거나 숨김 처리한다.
 * </p>
 *
 * @param {object} options 컬럼 옵션
 * @returns {object} AG Grid columnDef
 */
export function statusColumn({
  field = "_rowStatus",
  headerName = "STATUS",
  width = 90,
  pinned = "left",
  hide = false,
  ...rest
} = {}) {
  return {
    field,
    headerName,
    width,
    pinned,
    hide,
    editable: false,
    excelDataType: EXCEL_DATA_TYPE.STRING,
    excelRequired: false,
    excelExampleValue: "NORMAL",
    ...rest,
  };
}

/**
 * 기존 columnDef에 엑셀 메타 정보만 추가한다.
 *
 * <p>
 * 특수한 AG Grid 설정이 많은 컬럼에 대해
 * columnDef는 직접 만들고 엑셀 관련 속성만 붙이고 싶을 때 사용한다.
 * </p>
 *
 * @param {object} columnDef 기존 AG Grid columnDef
 * @param {object} excelOptions 엑셀 옵션
 * @param {string} excelOptions.dataType 엑셀 데이터 타입
 * @param {boolean} excelOptions.required 필수 여부
 * @param {string} excelOptions.exampleValue 예제 값
 * @returns {object} 엑셀 메타가 추가된 columnDef
 */
export function withExcelMeta(
  columnDef,
  {
    dataType = EXCEL_DATA_TYPE.STRING,
    required = false,
    exampleValue = "",
  } = {},
) {
  return {
    ...columnDef,
    excelDataType: dataType,
    excelRequired: required,
    excelExampleValue: exampleValue,
  };
}

/**
 * 숫자 valueParser.
 *
 * <p>
 * AG Grid 편집 시 사용자가 입력한 문자열 숫자를 number로 변환한다.
 * 콤마는 제거한다.
 * </p>
 *
 * @param {object} params AG Grid valueParser params
 * @returns {number|null} 숫자 값 또는 null
 */
export function numberValueParser(params) {
  const value = params.newValue;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).replaceAll(",", "");
  const numberValue = Number(normalized);

  return Number.isNaN(numberValue) ? null : numberValue;
}
