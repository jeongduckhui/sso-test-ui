import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import {
  fetchQueryTraceSqls,
  fetchQueryTraces,
  searchQueryTraceSample,
} from "../api/queryTraceApi";

const inputStyle = {
  height: 32,
  padding: "0 8px",
  border: "1px solid #ddd",
  borderRadius: 4,
};

const buttonStyle = {
  height: 32,
  padding: "0 14px",
  border: "1px solid #ccc",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
};

export default function QueryTraceSamplePage() {
  const [searchForm, setSearchForm] = useState({
    startYm: "202601",
    endYm: "202604",
    viewType: "PLAN",
    multiType: "DOMESTIC",
    versionCode: "V1",
    customerName: "",
    metricType: "",
  });

  const [rows, setRows] = useState([]);
  const [traceRows, setTraceRows] = useState([]);
  const [selectedSqlText, setSelectedSqlText] = useState("");
  const [loading, setLoading] = useState(false);

  const resultColumnDefs = useMemo(
    () => [
      { headerName: "ID", field: "id", width: 90 },
      { headerName: "기준월", field: "baseYm", width: 100 },
      { headerName: "View", field: "viewType", width: 110 },
      { headerName: "Multi", field: "multiType", width: 130 },
      { headerName: "Version", field: "versionCode", width: 110 },
      { headerName: "구분", field: "categoryName", width: 120 },
      { headerName: "APP", field: "appName", width: 110 },
      { headerName: "GA/NGA", field: "gaNgaType", width: 110 },
      { headerName: "고객", field: "customerName", width: 140 },
      { headerName: "Metric", field: "metricType", width: 110 },
      { headerName: "Year", field: "yearValue", width: 90 },
      { headerName: "Quarter", field: "quarterValue", width: 100 },
      { headerName: "Value", field: "valueDecimal", width: 120 },
    ],
    [],
  );

  const traceColumnDefs = useMemo(
    () => [
      { headerName: "조회시작", field: "transactionStartTime", flex: 1.3 },
      { headerName: "실행시간(ms)", field: "transactionDurationMs", width: 130 },
      { headerName: "쿼리수", field: "queryCount", width: 90 },
      { headerName: "성공", field: "success", width: 90 },
      { headerName: "설명", field: "description", flex: 1 },
      { headerName: "Method", field: "methodName", flex: 1 },
    ],
    [],
  );

  function handleChange(field, value) {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSearch() {
    setLoading(true);
    try {
      const data = await searchQueryTraceSample(searchForm);
      setRows(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleQueryView() {
    const data = await fetchQueryTraces();
    setTraceRows(data ?? []);
    setSelectedSqlText("");
  }

  async function handleTraceRowClicked(event) {
    const traceId = event.data?.traceId;
    if (!traceId) {
      return;
    }

    const sqls = await fetchQueryTraceSqls(traceId);
    const text = (sqls ?? [])
      .map((item) => {
        return [
          `-- [${item.orderNo}] ${item.mapperId}`,
          `-- ${item.sqlCommandType} / ${item.executionTimeMs}ms`,
          item.sql,
        ].join("\n");
      })
      .join("\n\n");

    setSelectedSqlText(text);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>쿼리보기 샘플</h2>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <input
          style={inputStyle}
          value={searchForm.startYm}
          onChange={(e) => handleChange("startYm", e.target.value)}
          placeholder="시작월"
        />
        <input
          style={inputStyle}
          value={searchForm.endYm}
          onChange={(e) => handleChange("endYm", e.target.value)}
          placeholder="종료월"
        />
        <input
          style={inputStyle}
          value={searchForm.viewType}
          onChange={(e) => handleChange("viewType", e.target.value)}
          placeholder="VIEW_TYPE"
        />
        <input
          style={inputStyle}
          value={searchForm.multiType}
          onChange={(e) => handleChange("multiType", e.target.value)}
          placeholder="MULTI_TYPE"
        />
        <input
          style={inputStyle}
          value={searchForm.versionCode}
          onChange={(e) => handleChange("versionCode", e.target.value)}
          placeholder="VERSION_CODE"
        />
        <input
          style={inputStyle}
          value={searchForm.customerName}
          onChange={(e) => handleChange("customerName", e.target.value)}
          placeholder="CUSTOMER_NAME"
        />
        <input
          style={inputStyle}
          value={searchForm.metricType}
          onChange={(e) => handleChange("metricType", e.target.value)}
          placeholder="METRIC_TYPE"
        />

        <button style={buttonStyle} onClick={handleSearch} disabled={loading}>
          조회
        </button>
        <button style={buttonStyle} onClick={handleQueryView}>
          쿼리보기
        </button>
      </div>

      <div className="ag-theme-quartz" style={{ height: 320, width: "100%" }}>
        <AgGridReact
          rowData={rows}
          columnDefs={resultColumnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
        />
      </div>

      <h3 style={{ marginTop: 24 }}>쿼리보기 목록</h3>
      <div className="ag-theme-quartz" style={{ height: 220, width: "100%" }}>
        <AgGridReact
          rowData={traceRows}
          columnDefs={traceColumnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          rowSelection="single"
          onRowClicked={handleTraceRowClicked}
        />
      </div>

      <h3 style={{ marginTop: 16 }}>SQL</h3>
      <textarea
        value={selectedSqlText}
        readOnly
        style={{
          width: "100%",
          height: 260,
          padding: 12,
          fontFamily: "Consolas, monospace",
          border: "1px solid #ddd",
          borderRadius: 4,
          boxSizing: "border-box",
          whiteSpace: "pre",
        }}
      />
    </div>
  );
}
