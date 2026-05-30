// src/api/sampleDynamicGridApi.js

import api from "./axios";

/**
 * 서버에서 내려준 Content-Disposition 헤더에서 파일명을 추출한다.
 *
 * @param {string} contentDisposition Content-Disposition 헤더 값
 * @param {string} defaultFileName 기본 파일명
 * @returns {string} 다운로드 파일명
 */
function extractFileName(
  contentDisposition,
  defaultFileName = "download.xlsx",
) {
  if (!contentDisposition) {
    return defaultFileName;
  }

  const utf8FileNameMatch = contentDisposition.match(
    /filename\*=UTF-8''([^;]+)/i,
  );

  if (utf8FileNameMatch && utf8FileNameMatch[1]) {
    return decodeURIComponent(utf8FileNameMatch[1]);
  }

  const normalFileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  if (normalFileNameMatch && normalFileNameMatch[1]) {
    return normalFileNameMatch[1];
  }

  return defaultFileName;
}

/**
 * Blob 파일 다운로드를 실행한다.
 *
 * @param {Blob} blob Blob 데이터
 * @param {string} fileName 파일명
 */
function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

/**
 * 엑셀 다운로드 응답을 처리한다.
 *
 * @param {object} response Axios 응답
 * @param {string} defaultFileName 기본 파일명
 */
function handleExcelDownloadResponse(response, defaultFileName) {
  const contentDisposition = response.headers["content-disposition"];

  const fileName = extractFileName(contentDisposition, defaultFileName);

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  downloadBlob(blob, fileName);
}

/**
 * ApiResult 응답에서 실제 data를 꺼낸다.
 *
 * @param {object} response Axios 응답
 * @returns {*} 실제 응답 data
 */
function unwrapApiResult(response) {
  return response.data?.data ?? response.data;
}

/**
 * 다이나믹 그리드 조회.
 *
 * 백엔드:
 * POST /api/excel/sample/dynamic-grid/search
 *
 * @param {object} request SampleDynamicGridSearchRequest
 * @returns {Promise<Array<object>>} AG Grid rowData
 */
export async function searchDynamicGrid(request) {
  const response = await api.post(
    "/api/excel/sample/dynamic-grid/search",
    request,
  );

  return unwrapApiResult(response);
}

/**
 * 다이나믹 그리드 MyBatis 저장.
 *
 * 백엔드:
 * POST /api/excel/sample/dynamic-grid/save/mybatis
 *
 * @param {object} request SampleDynamicGridSaveRequest
 * @returns {Promise<void>}
 */
export async function saveDynamicGridByMyBatis(request) {
  const response = await api.post(
    "/api/excel/sample/dynamic-grid/save/mybatis",
    request,
  );

  return unwrapApiResult(response);
}

/**
 * 다이나믹 그리드 JPA 저장.
 *
 * 백엔드:
 * POST /api/excel/sample/dynamic-grid/save/jpa
 *
 * @param {object} request SampleDynamicGridSaveRequest
 * @returns {Promise<void>}
 */
export async function saveDynamicGridByJpa(request) {
  const response = await api.post(
    "/api/excel/sample/dynamic-grid/save/jpa",
    request,
  );

  return unwrapApiResult(response);
}

/**
 * 조회조건 기준 전체 엑셀 다운로드.
 *
 * 백엔드:
 * POST /api/excel/sample/dynamic-grid/excel/download-all
 *
 * @param {object} request SampleDynamicGridSearchRequest + columns
 * @returns {Promise<void>}
 */
export async function downloadDynamicGridAll(request) {
  const response = await api.post(
    "/api/excel/sample/dynamic-grid/excel/download-all",
    request,
    {
      responseType: "blob",
    },
  );

  handleExcelDownloadResponse(response, "dynamic-grid-all.xlsx");
}

/**
 * 다이나믹 그리드 업무 엑셀 업로드.
 *
 * 백엔드:
 * POST /api/excel/sample/dynamic-grid/excel/upload
 *
 * 공통 /api/excel/upload이 아니라 업무용 upload API를 호출한다.
 * 그래야 SampleDynamicGridExcelValidator가 같이 적용된다.
 *
 * @param {File} file 업로드 파일
 * @param {object} request ExcelUploadRequest
 * @returns {Promise<object>} ExcelUploadResult
 */
export async function uploadDynamicGridExcel(file, request) {
  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "request",
    new Blob([JSON.stringify(request)], {
      type: "application/json",
    }),
  );

  const response = await api.post(
    "/api/excel/sample/dynamic-grid/excel/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return unwrapApiResult(response);
}
