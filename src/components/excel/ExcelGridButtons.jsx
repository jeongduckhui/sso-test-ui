// src/components/excel/ExcelGridButtons.jsx

import { useRef, useState } from "react";

import {
  downloadExcel,
  downloadErrorRowsExcel,
  downloadTemplateExcel,
  uploadExcel,
} from "../../api/excelApi";

import {
  buildExcelColumnMetas,
  buildExcelUploadOption,
  hasErrorRows,
  hasExcelMultiHeader,
} from "../../utils/excel/excelColumnMetaUtils";

/**
 * AG Grid 엑셀 업로드/다운로드 공통 버튼 컴포넌트.
 *
 * 사용 기능:
 * 1. 현재 그리드 다운로드
 * 2. 서버 다운로드
 * 3. 템플릿 다운로드
 * 4. 엑셀 업로드
 * 5. 오류 행 다운로드
 *
 * @param {object} props props
 * @param {object} props.gridApi AG Grid GridApi
 * @param {Array<object>} props.columnDefs AG Grid columnDefs
 * @param {Array<object>} props.rowData AG Grid rowData
 * @param {Function} props.setRowData rowData setter
 * @param {string} props.fileName 다운로드 파일명
 * @param {string} props.sheetName 엑셀 시트명
 * @param {boolean} props.excludeHiddenColumns 숨김 컬럼 제외 여부
 * @param {boolean} props.includeExampleRow 템플릿 예제 행 포함 여부
 * @param {boolean} props.useMultiHeader 다중 헤더 사용 여부
 * @param {Function} props.onUploadResult 업로드 완료 후 콜백
 * @param {Function} props.onError 오류 콜백
 */
export default function ExcelGridButtons({
  gridApi,
  columnDefs = [],
  rowData = [],
  setRowData,
  fileName = "excel-download.xlsx",
  sheetName = "Sheet1",
  excludeHiddenColumns = true,
  includeExampleRow = true,
  useMultiHeader,
  onUploadResult,
  onError,
}) {
  // 파일 input을 직접 클릭하기 위한 ref.
  const fileInputRef = useRef(null);

  // 업로드/다운로드 처리 중 여부.
  const [loading, setLoading] = useState(false);

  // 실제 다중 헤더 사용 여부를 결정한다.
  const resolvedUseMultiHeader =
    typeof useMultiHeader === "boolean"
      ? useMultiHeader
      : hasExcelMultiHeader(columnDefs);

  /**
   * AG Grid columnDefs를 서버 ExcelColumnMeta 목록으로 변환한다.
   *
   * @returns {Array<object>} ExcelColumnMeta 목록
   */
  function buildColumns() {
    return buildExcelColumnMetas(columnDefs, {
      excludeHiddenColumns,
    });
  }

  /**
   * 현재 화면 Grid를 AG Grid 기본 기능으로 다운로드한다.
   *
   * 정렬, 필터, 현재 표시 상태가 반영된다.
   */
  function handleCurrentGridDownload() {
    if (!gridApi) {
      alert("Grid API가 준비되지 않았습니다.");
      return;
    }

    gridApi.exportDataAsExcel({
      fileName,
      sheetName,
      allColumns: !excludeHiddenColumns,
    });
  }

  /**
   * 현재 rowData를 서버 POI 방식으로 다운로드한다.
   *
   * 다중 헤더, 필수 컬럼 스타일 등 서버 ExcelDownloadService 기준으로 생성된다.
   */
  async function handleServerDownload() {
    try {
      setLoading(true);

      const columns = buildColumns();

      await downloadExcel({
        fileName,
        sheetName,
        columns,
        rows: rowData,
        excludeHiddenColumns,
        useMultiHeader: resolvedUseMultiHeader,
        includeExampleRow: false,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 현재 화면 컬럼 기준 업로드 템플릿을 다운로드한다.
   */
  async function handleTemplateDownload() {
    try {
      setLoading(true);

      const columns = buildColumns();

      await downloadTemplateExcel({
        fileName: createTemplateFileName(fileName),
        sheetName,
        columns,
        excludeHiddenColumns,
        useMultiHeader: resolvedUseMultiHeader,
        includeExampleRow,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 숨겨진 file input을 클릭한다.
   */
  function handleUploadButtonClick() {
    if (!fileInputRef.current) {
      return;
    }

    fileInputRef.current.value = "";
    fileInputRef.current.click();
  }

  /**
   * 파일 선택 시 서버 업로드 API를 호출한다.
   *
   * 업로드 후 즉시 저장하지 않고,
   * 서버 검증 결과 rows를 Grid에 표시한다.
   *
   * @param {object} event input change event
   */
  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setLoading(true);

      const columns = buildColumns();

      const option = buildExcelUploadOption({
        useMultiHeader: resolvedUseMultiHeader,
        hasExampleRow: includeExampleRow,
      });

      const result = await uploadExcel(file, {
        sheetName,
        columns,
        option,
      });

      if (typeof setRowData === "function") {
        setRowData(result.rows ?? []);
      }

      if (typeof onUploadResult === "function") {
        onUploadResult(result);
      }

      const totalCount = result.totalCount ?? 0;
      const successCount = result.successCount ?? 0;
      const errorCount = result.errorCount ?? 0;

      alert(
        `엑셀 업로드 검증이 완료되었습니다.\n` +
          `전체: ${totalCount}건\n` +
          `정상: ${successCount}건\n` +
          `오류: ${errorCount}건`,
      );
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 업로드 결과 중 오류 행만 다운로드한다.
   */
  async function handleErrorRowsDownload() {
    try {
      if (!hasErrorRows(rowData)) {
        alert("다운로드할 오류 행이 없습니다.");
        return;
      }

      setLoading(true);

      const columns = buildColumns();

      await downloadErrorRowsExcel({
        fileName: createErrorFileName(fileName),
        sheetName: "오류행",
        columns,
        rows: rowData,
        excludeHiddenColumns,
        useMultiHeader: resolvedUseMultiHeader,
        includeErrorMessageColumn: true,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 오류를 공통 처리한다.
   *
   * @param {Error} error 오류 객체
   */
  function handleError(error) {
    console.error(error);

    if (typeof onError === "function") {
      onError(error);
      return;
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      "엑셀 처리 중 오류가 발생했습니다.";

    alert(message);
  }

  return (
    <div style={styles.wrapper}>
      <button
        type="button"
        onClick={handleCurrentGridDownload}
        disabled={loading}
        style={styles.button}
      >
        현재 그리드 다운로드
      </button>

      <button
        type="button"
        onClick={handleServerDownload}
        disabled={loading}
        style={styles.button}
      >
        서버 다운로드
      </button>

      <button
        type="button"
        onClick={handleTemplateDownload}
        disabled={loading}
        style={styles.button}
      >
        템플릿 다운로드
      </button>

      <button
        type="button"
        onClick={handleUploadButtonClick}
        disabled={loading}
        style={styles.button}
      >
        엑셀 업로드
      </button>

      <button
        type="button"
        onClick={handleErrorRowsDownload}
        disabled={loading || !hasErrorRows(rowData)}
        style={styles.button}
      >
        오류 행 다운로드
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {loading && <span style={styles.loadingText}>처리 중...</span>}
    </div>
  );
}

/**
 * 템플릿 파일명을 생성한다.
 *
 * @param {string} fileName 원본 파일명
 * @returns {string} 템플릿 파일명
 */
function createTemplateFileName(fileName) {
  return appendFileNameSuffix(fileName, "-template");
}

/**
 * 오류 행 파일명을 생성한다.
 *
 * @param {string} fileName 원본 파일명
 * @returns {string} 오류 행 파일명
 */
function createErrorFileName(fileName) {
  return appendFileNameSuffix(fileName, "-error-rows");
}

/**
 * 파일명에 suffix를 붙인다.
 *
 * @param {string} fileName 원본 파일명
 * @param {string} suffix suffix
 * @returns {string} 변환 파일명
 */
function appendFileNameSuffix(fileName, suffix) {
  const safeFileName = fileName || "excel-download.xlsx";

  if (safeFileName.toLowerCase().endsWith(".xlsx")) {
    return safeFileName.replace(/\.xlsx$/i, `${suffix}.xlsx`);
  }

  if (safeFileName.toLowerCase().endsWith(".xls")) {
    return safeFileName.replace(/\.xls$/i, `${suffix}.xlsx`);
  }

  return `${safeFileName}${suffix}.xlsx`;
}

/**
 * 임시 인라인 스타일.
 *
 * 실무 화면에서는 공통 버튼 CSS 또는 디자인 시스템 클래스로 대체하면 된다.
 */
const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  button: {
    padding: "6px 10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
  },
  loadingText: {
    marginLeft: "8px",
    fontSize: "13px",
    color: "#666",
  },
};
