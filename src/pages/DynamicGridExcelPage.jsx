// src/pages/sample/DynamicGridExcelPage.jsx

import { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import ExcelGridButtons from "../components/excel/ExcelGridButtons";
import { downloadExcel } from "../api/excelApi";

import {
  downloadDynamicGridAll,
  saveDynamicGridByJpa,
  saveDynamicGridByMyBatis,
  searchDynamicGrid,
  uploadDynamicGridExcel,
} from "../api/sampleDynamicGridApi";

import { downloadErrorRowsExcel, downloadTemplateExcel } from "../api/excelApi";

import {
  buildExcelColumnMetas,
  buildExcelUploadOption,
  hasErrorRows,
} from "../utils/excel/excelColumnMetaUtils";

import {
  DEFAULT_SELECTED_DIMENSIONS,
  DIMENSION_OPTIONS,
} from "../features/dynamicGrid/dimensionOptions";

import {
  buildDynamicGridColumnDefs,
  filterSaveTargetRows,
  markUpdatedRow,
} from "../features/dynamicGrid/dynamicColumnBuilder";

import DimensionPopup from "../features/dynamicGrid/DimensionPopup";

/**
 * 다이나믹 AG Grid + Excel 업로드/다운로드 실무 샘플 화면.
 *
 * <p>
 * 이 화면은 엑셀 공통 모듈을 실제 업무형 AG Grid 화면에 붙이는 샘플이다.
 * </p>
 */
export default function DynamicGridExcelPage() {
  /**
   * AG Grid API.
   */
  const [gridApi, setGridApi] = useState(null);

  /**
   * AG Grid rowData.
   */
  const [rowData, setRowData] = useState([]);

  /**
   * 조회조건.
   */
  const [searchForm, setSearchForm] = useState({
    startYm: "202601",
    endYm: "202604",
    radioType: "PLAN",
    multiSelectValues: ["DOMESTIC", "EXPORT"],
    singleSelectValue: "V1",
  });

  /**
   * View/Edit 모드.
   *
   * View:
   * - status 컬럼 없음
   * - readOnly
   *
   * Edit:
   * - status 컬럼 있음
   * - editable
   */
  const [mode, setMode] = useState("VIEW");

  /**
   * 저장 방식.
   *
   * MYBATIS 또는 JPA.
   */
  const [saveType, setSaveType] = useState("MYBATIS");

  /**
   * 선택된 Dimension 목록.
   *
   * 이 배열의 순서가 Grid 컬럼 표시 순서가 된다.
   */
  const [selectedDimensions, setSelectedDimensions] = useState(
    DEFAULT_SELECTED_DIMENSIONS,
  );

  /**
   * Dimension 팝업 열림 여부.
   */
  const [dimensionPopupOpen, setDimensionPopupOpen] = useState(false);

  /**
   * 템플릿 예제 행 포함 여부.
   */
  const [includeExampleRow, setIncludeExampleRow] = useState(true);

  /**
   * Quarter 사용 여부.
   *
   * false이면 연도별 Total 컬럼만 생성한다.
   */
  const [useQuarter, setUseQuarter] = useState(true);

  /**
   * 처리 중 여부.
   */
  const [loading, setLoading] = useState(false);

  /**
   * 파일 업로드 input ref.
   *
   * 업무용 업로드 API를 호출하기 위해 이 화면에서 직접 관리한다.
   */
  const fileInputRef = useRef(null);

  /**
   * AG Grid columnDefs.
   *
   * mode, selectedDimensions, 기간이 바뀌면 다시 생성된다.
   */
  const columnDefs = useMemo(() => {
    return buildDynamicGridColumnDefs({
      mode,
      selectedDimensions,
      startYm: searchForm.startYm,
      endYm: searchForm.endYm,
      useQuarter,
      useTotalOnly: !useQuarter,
    });
  }, [
    mode,
    selectedDimensions,
    searchForm.startYm,
    searchForm.endYm,
    useQuarter,
  ]);

  /**
   * 기본 Grid 옵션.
   */
  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
      sortable: true,
      filter: true,
    };
  }, []);

  /**
   * 현재 columnDefs를 서버 ExcelColumnMeta로 변환한다.
   *
   * @returns {Array<object>} ExcelColumnMeta 목록
   */
  function buildColumns() {
    return buildExcelColumnMetas(columnDefs, {
      excludeHiddenColumns: true,
    });
  }

  /**
   * 조회/저장/다운로드에 공통으로 사용할 조회 요청을 생성한다.
   *
   * @returns {object} SampleDynamicGridSearchRequest
   */
  function buildSearchRequest() {
    return {
      startYm: searchForm.startYm,
      endYm: searchForm.endYm,
      radioType: searchForm.radioType,
      multiSelectValues: searchForm.multiSelectValues,
      singleSelectValue: searchForm.singleSelectValue,
      dimensions: selectedDimensions,
    };
  }

  /**
   * 조회조건 input 변경 처리.
   *
   * @param {string} field field명
   * @param {*} value 변경값
   */
  function handleSearchFormChange(field, value) {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /**
   * 다중 선택 체크박스 변경 처리.
   *
   * @param {string} value 선택값
   * @param {boolean} checked 체크 여부
   */
  function handleMultiSelectChange(value, checked) {
    setSearchForm((prev) => {
      const currentValues = prev.multiSelectValues ?? [];

      const nextValues = checked
        ? [...currentValues, value]
        : currentValues.filter((item) => item !== value);

      return {
        ...prev,
        multiSelectValues: nextValues,
      };
    });
  }

  /**
   * 조회 버튼 클릭.
   */
  async function handleSearch() {
    try {
      setLoading(true);

      const rows = await searchDynamicGrid(buildSearchRequest());

      setRowData(rows ?? []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 저장 버튼 클릭.
   *
   * Edit 모드에서 I/U/D 상태인 row만 저장한다.
   */
  async function handleSave() {
    try {
      const saveRows = filterSaveTargetRows(rowData);

      if (saveRows.length === 0) {
        alert("저장할 데이터가 없습니다.");
        return;
      }

      setLoading(true);

      const request = {
        ...buildSearchRequest(),
        rows: saveRows,
      };

      if (saveType === "MYBATIS") {
        await saveDynamicGridByMyBatis(request);
      } else {
        await saveDynamicGridByJpa(request);
      }

      alert("저장되었습니다.");

      await handleSearch();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 새 행 추가.
   *
   * Edit 모드에서만 사용한다.
   */
  function handleAddRow() {
    if (mode !== "EDIT") {
      alert("Edit 모드에서만 행을 추가할 수 있습니다.");
      return;
    }

    const newRow = {
      _rowStatus: "I",
      categoryName: "",
      appName: "",
      gaNgaType: "",
      customerName: "",
      sort3: 0,
      sort4: 0,
      sort5: 0,
    };

    setRowData((prev) => [newRow, ...prev]);
  }

  /**
   * 선택 행 삭제 처리.
   *
   * 기존 행은 D 상태로 바꾸고, 신규 행은 화면에서 제거한다.
   */
  function handleDeleteSelectedRows() {
    if (mode !== "EDIT") {
      alert("Edit 모드에서만 삭제할 수 있습니다.");
      return;
    }

    if (!gridApi) {
      return;
    }

    const selectedRows = gridApi.getSelectedRows();

    if (!selectedRows || selectedRows.length === 0) {
      alert("삭제할 행을 선택하세요.");
      return;
    }

    setRowData((prevRows) => {
      return prevRows
        .map((row) => {
          if (!selectedRows.includes(row)) {
            return row;
          }

          if (row._rowStatus === "I") {
            return null;
          }

          return {
            ...row,
            _rowStatus: "D",
          };
        })
        .filter(Boolean);
    });
  }

  /**
   * 전체 데이터 엑셀 다운로드.
   *
   * 화면 rowData가 아니라 조회조건으로 서버에서 전체 데이터를 재조회한다.
   */
  async function handleDownloadAll() {
    try {
      setLoading(true);

      await downloadDynamicGridAll({
        ...buildSearchRequest(),
        columns: buildColumns(),
        excludeHiddenColumns: true,
        useMultiHeader: true,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 템플릿 다운로드.
   *
   * 현재 화면 columnDefs 기준으로 템플릿을 생성한다.
   */
  async function handleTemplateDownload() {
    try {
      setLoading(true);

      await downloadTemplateExcel({
        fileName: "dynamic-grid-template.xlsx",
        sheetName: "DynamicGrid",
        columns: buildColumns(),
        excludeHiddenColumns: true,
        useMultiHeader: true,
        includeExampleRow,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 업로드 버튼 클릭.
   */
  function handleUploadButtonClick() {
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  }

  /**
   * 파일 선택 후 업무용 업로드 API 호출.
   *
   * 공통 /api/excel/upload이 아니라
   * /api/excel/sample/dynamic-grid/excel/upload을 호출한다.
   */
  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setLoading(true);

      const result = await uploadDynamicGridExcel(file, {
        sheetName: "DynamicGrid",
        columns: buildColumns(),
        option: buildExcelUploadOption({
          useMultiHeader: true,
          hasExampleRow: includeExampleRow,
        }),
      });

      setRowData(
        (result.rows ?? []).map((row) => ({
          ...row,
          _rowStatus: "I",
        })),
      );

      alert(
        `엑셀 업로드 검증이 완료되었습니다.\n` +
          `전체: ${result.totalCount ?? 0}건\n` +
          `정상: ${result.successCount ?? 0}건\n` +
          `오류: ${result.errorCount ?? 0}건`,
      );

      setMode("EDIT");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 오류 행 다운로드.
   */
  async function handleErrorRowsDownload() {
    try {
      if (!hasErrorRows(rowData)) {
        alert("다운로드할 오류 행이 없습니다.");
        return;
      }

      setLoading(true);

      await downloadErrorRowsExcel({
        fileName: "dynamic-grid-error-rows.xlsx",
        sheetName: "오류행",
        columns: buildColumns(),
        rows: rowData,
        excludeHiddenColumns: true,
        useMultiHeader: true,
        includeErrorMessageColumn: true,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * AG Grid 셀 변경 이벤트.
   *
   * Edit 모드에서 기존 row가 수정되면 _rowStatus를 U로 바꾼다.
   */
  function handleCellValueChanged(params) {
    if (mode !== "EDIT") {
      return;
    }

    markUpdatedRow(params);
  }

  /**
   * 공통 오류 처리.
   */
  function handleError(error) {
    console.error(error);

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      "처리 중 오류가 발생했습니다.";

    alert(message);
  }

  async function handleCurrentRowsServerDownload() {
    try {
      setLoading(true);

      await downloadExcel({
        fileName: "dynamic-grid-current.xlsx",
        sheetName: "DynamicGrid",
        columns: buildColumns(),
        rows: rowData,
        excludeHiddenColumns: true,
        useMultiHeader: true,
        includeExampleRow: false,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Dynamic Grid Excel Sample</h2>

      <section style={styles.panel}>
        <div style={styles.panelTitle}>조회조건</div>

        <div style={styles.searchGrid}>
          <label style={styles.label}>
            시작년월
            <input
              type="text"
              value={searchForm.startYm}
              onChange={(event) =>
                handleSearchFormChange("startYm", event.target.value)
              }
              style={styles.input}
              maxLength={6}
            />
          </label>

          <label style={styles.label}>
            종료년월
            <input
              type="text"
              value={searchForm.endYm}
              onChange={(event) =>
                handleSearchFormChange("endYm", event.target.value)
              }
              style={styles.input}
              maxLength={6}
            />
          </label>

          <div style={styles.label}>
            라디오
            <div style={styles.inlineGroup}>
              <label>
                <input
                  type="radio"
                  checked={searchForm.radioType === "PLAN"}
                  onChange={() => handleSearchFormChange("radioType", "PLAN")}
                />
                PLAN
              </label>

              <label>
                <input
                  type="radio"
                  checked={searchForm.radioType === "ACTUAL"}
                  onChange={() => handleSearchFormChange("radioType", "ACTUAL")}
                />
                ACTUAL
              </label>
            </div>
          </div>

          <div style={styles.label}>
            다중선택
            <div style={styles.inlineGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={searchForm.multiSelectValues.includes("DOMESTIC")}
                  onChange={(event) =>
                    handleMultiSelectChange("DOMESTIC", event.target.checked)
                  }
                />
                DOMESTIC
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={searchForm.multiSelectValues.includes("EXPORT")}
                  onChange={(event) =>
                    handleMultiSelectChange("EXPORT", event.target.checked)
                  }
                />
                EXPORT
              </label>
            </div>
          </div>

          <label style={styles.label}>
            단건선택
            <select
              value={searchForm.singleSelectValue}
              onChange={(event) =>
                handleSearchFormChange("singleSelectValue", event.target.value)
              }
              style={styles.input}
            >
              <option value="V1">V1</option>
              <option value="V2">V2</option>
            </select>
          </label>

          <div style={styles.label}>
            Quarter
            <label style={{ marginTop: 6 }}>
              <input
                type="checkbox"
                checked={useQuarter}
                onChange={(event) => setUseQuarter(event.target.checked)}
              />
              월별 컬럼 사용
            </label>
          </div>
        </div>
      </section>

      <section style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <button type="button" onClick={handleSearch} disabled={loading}>
            조회
          </button>

          <button type="button" onClick={handleSave} disabled={loading}>
            저장
          </button>

          <button type="button" onClick={handleAddRow} disabled={loading}>
            행 추가
          </button>

          <button
            type="button"
            onClick={handleDeleteSelectedRows}
            disabled={loading}
          >
            선택 삭제
          </button>

          <button
            type="button"
            onClick={() => setDimensionPopupOpen(true)}
            disabled={loading}
          >
            Dimension 설정
          </button>

          <button type="button" onClick={handleDownloadAll} disabled={loading}>
            전체 다운로드
          </button>

          <button
            type="button"
            onClick={handleTemplateDownload}
            disabled={loading}
          >
            템플릿 다운로드
          </button>

          <button
            type="button"
            onClick={handleUploadButtonClick}
            disabled={loading}
          >
            업무 엑셀 업로드
          </button>

          <button
            type="button"
            onClick={handleErrorRowsDownload}
            disabled={loading || !hasErrorRows(rowData)}
          >
            오류 행 다운로드
          </button>

          <button
            type="button"
            onClick={handleCurrentRowsServerDownload}
            disabled={loading}
          >
            현재 Row 다운로드
          </button>
        </div>

        <div style={styles.toolbarRight}>
          <span>Mode</span>

          <label>
            <input
              type="radio"
              checked={mode === "VIEW"}
              onChange={() => setMode("VIEW")}
            />
            View
          </label>

          <label>
            <input
              type="radio"
              checked={mode === "EDIT"}
              onChange={() => setMode("EDIT")}
            />
            Edit
          </label>

          <span style={{ marginLeft: 12 }}>Save</span>

          <label>
            <input
              type="radio"
              checked={saveType === "MYBATIS"}
              onChange={() => setSaveType("MYBATIS")}
            />
            MyBatis
          </label>

          <label>
            <input
              type="radio"
              checked={saveType === "JPA"}
              onChange={() => setSaveType("JPA")}
            />
            JPA
          </label>

          <label style={{ marginLeft: 12 }}>
            <input
              type="checkbox"
              checked={includeExampleRow}
              onChange={(event) => setIncludeExampleRow(event.target.checked)}
            />
            예제행 포함
          </label>
        </div>
      </section>

      <section style={styles.selectedDimensionBox}>
        <strong>선택 Dimension:</strong>{" "}
        {selectedDimensions.length > 0
          ? selectedDimensions.join(" > ")
          : "없음"}
      </section>

      <section className="ag-theme-quartz" style={styles.gridWrapper}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          animateRows={true}
          onGridReady={(params) => setGridApi(params.api)}
          onCellValueChanged={handleCellValueChanged}
          getRowClass={(params) => {
            if (params.data?._rowStatus === "D") {
              return "deleted-row";
            }

            if (params.data?._rowStatus === "ERROR") {
              return "error-row";
            }

            return "";
          }}
        />
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <DimensionPopup
        open={dimensionPopupOpen}
        selectedDimensionIds={selectedDimensions}
        onApply={(nextDimensions) => {
          setSelectedDimensions(nextDimensions);
        }}
        onClose={() => {
          setDimensionPopupOpen(false);
        }}
      />

      {loading && <div style={styles.loading}>처리 중...</div>}
    </div>
  );
}

const styles = {
  page: {
    padding: 16,
  },
  title: {
    margin: "0 0 12px 0",
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
  searchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(140px, 1fr))",
    gap: 10,
    alignItems: "end",
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
  inlineGroup: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    minHeight: 30,
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  toolbarLeft: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  toolbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
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
    height: 560,
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
};
