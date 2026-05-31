import api from "./axios";

export async function getRegressionColumns(level) {
  const response = await api.get("/api/excel/regression/columns", {
    params: { level },
  });

  return response.data?.data ?? response.data;
}

export async function getRegressionRows(level) {
  const response = await api.get("/api/excel/regression/rows", {
    params: { level },
  });

  return response.data?.data ?? response.data;
}

export async function downloadTemplate(level) {
  const response = await api.post(
    "/api/excel/regression/template",
    {
      headerLevel: level,
    },
    {
      responseType: "blob",
    },
  );

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `header-level-${level}.xlsx`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

export async function uploadRegressionExcel(file, columns) {
  const request = {
    sheetName: "HeaderTest",

    columns,

    option: {
      useMultiHeader: columns.some(
        (c) => c.headerPath && c.headerPath.length > 1,
      ),

      headerStartRowIndex: 0,

      headerEndRowIndex:
        Math.max(...columns.map((c) => c.headerPath?.length || 1)) - 1,

      // 템플릿에 예제행 있음
      // dataStartRowIndex:
      //   Math.max(...columns.map((c) => c.headerPath?.length || 1)) + 1,

      dataStartRowIndex: Math.max(
        ...columns.map((c) => c.headerPath?.length || 1),
      ),

      ignoreEmptyRow: true,
      blockFormula: true,
      includeErrorRows: true,
    },
  };

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "request",
    new Blob([JSON.stringify(request)], {
      type: "application/json",
    }),
  );

  const response = await api.post("/api/excel/regression/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data ?? response.data;
}
