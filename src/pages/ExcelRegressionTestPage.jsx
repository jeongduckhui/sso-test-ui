import { useEffect, useState } from "react";

import { AgGridReact } from "ag-grid-react";

import {
  getRegressionColumns,
  getRegressionRows,
  downloadTemplate,
  uploadRegressionExcel,
} from "../api/excelRegressionApi";

import { buildColumnDefs } from "../utils/headerRegressionColumnBuilder";

function ExcelRegressionTestPage() {
  const [level, setLevel] = useState(1);

  // ExcelColumnMeta 원본
  const [columns, setColumns] = useState([]);

  // AG Grid 표시용
  const [columnDefs, setColumnDefs] = useState([]);

  const [rows, setRows] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    load();
  }, [level]);

  async function load() {
    const colData = await getRegressionColumns(level);

    const rowData = await getRegressionRows(level);

    // 업로드/다운로드용 원본 보관
    setColumns(colData);

    // 화면 표시용
    setColumnDefs(buildColumnDefs(colData));

    setRows(rowData);
  }

  async function handleTemplateDownload() {
    await downloadTemplate(level);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      alert("파일을 선택하세요.");

      return;
    }

    const result = await uploadRegressionExcel(selectedFile, columns);

    setUploadResult(result);

    // 업로드 결과를 그리드에 표시
    if (Array.isArray(result?.rows)) {
      setRows(result.rows);
    }
  }

  return (
    <>
      <h2>Excel Regression Test</h2>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "12px",
          alignItems: "center",
        }}
      >
        <label>
          <input
            type="radio"
            checked={level === 1}
            onChange={() => setLevel(1)}
          />
          1단
        </label>

        <label>
          <input
            type="radio"
            checked={level === 2}
            onChange={() => setLevel(2)}
          />
          2단
        </label>

        <label>
          <input
            type="radio"
            checked={level === 3}
            onChange={() => setLevel(3)}
          />
          3단
        </label>

        <button onClick={load}>조회</button>

        <button onClick={handleTemplateDownload}>템플릿 다운로드</button>

        <input type="file" accept=".xlsx" onChange={handleFileChange} />

        <button onClick={handleUpload}>업로드</button>
      </div>

      <div
        className="ag-theme-quartz"
        style={{
          height: 500,
          width: "100%",
        }}
      >
        <AgGridReact rowData={rows} columnDefs={columnDefs} />
      </div>

      {uploadResult && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <h3>업로드 결과</h3>

          <pre>{JSON.stringify(uploadResult, null, 2)}</pre>
        </div>
      )}
    </>
  );
}

export default ExcelRegressionTestPage;
