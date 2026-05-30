// src/api/excelApi.js

import api from "./axios";

/**
 * 서버에서 내려준 Content-Disposition 헤더에서 파일명을 추출한다.
 *
 * 서버 응답 예:
 * Content-Disposition: attachment; filename*=UTF-8''sales-template.xlsx
 *
 * @param {string} contentDisposition Content-Disposition 헤더 값
 * @param {string} defaultFileName 기본 파일명
 * @returns {string} 다운로드 파일명
 */
function extractFileName(
  contentDisposition,
  defaultFileName = "download.xlsx",
) {
  // Content-Disposition 헤더가 없으면 기본 파일명을 반환한다.
  if (!contentDisposition) {
    return defaultFileName;
  }

  // filename*=UTF-8'' 형식을 먼저 찾는다.
  const utf8FileNameMatch = contentDisposition.match(
    /filename\*=UTF-8''([^;]+)/i,
  );

  // UTF-8 파일명이 있으면 디코딩해서 반환한다.
  if (utf8FileNameMatch && utf8FileNameMatch[1]) {
    return decodeURIComponent(utf8FileNameMatch[1]);
  }

  // 일반 filename= 형식을 찾는다.
  const normalFileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  // 일반 파일명이 있으면 반환한다.
  if (normalFileNameMatch && normalFileNameMatch[1]) {
    return normalFileNameMatch[1];
  }

  // 둘 다 없으면 기본 파일명을 반환한다.
  return defaultFileName;
}

/**
 * Blob 데이터를 브라우저에서 파일로 다운로드한다.
 *
 * @param {Blob} blob 다운로드할 Blob
 * @param {string} fileName 파일명
 */
function downloadBlob(blob, fileName) {
  // Blob URL을 생성한다.
  const url = window.URL.createObjectURL(blob);

  // 임시 a 태그를 생성한다.
  const link = document.createElement("a");

  // 다운로드 URL을 설정한다.
  link.href = url;

  // 다운로드 파일명을 설정한다.
  link.download = fileName;

  // body에 임시 링크를 붙인다.
  document.body.appendChild(link);

  // 클릭 이벤트로 다운로드를 실행한다.
  link.click();

  // 임시 링크를 제거한다.
  document.body.removeChild(link);

  // Blob URL을 해제한다.
  window.URL.revokeObjectURL(url);
}

/**
 * 엑셀 파일 응답을 다운로드 처리한다.
 *
 * @param {object} response Axios 응답
 * @param {string} defaultFileName 기본 파일명
 */
function handleExcelDownloadResponse(response, defaultFileName) {
  // 응답 헤더에서 Content-Disposition을 가져온다.
  const contentDisposition = response.headers["content-disposition"];

  // 파일명을 추출한다.
  const fileName = extractFileName(contentDisposition, defaultFileName);

  // 응답 데이터를 Blob으로 변환한다.
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // 파일 다운로드를 실행한다.
  downloadBlob(blob, fileName);
}

/**
 * 일반 엑셀 다운로드.
 *
 * 사용 시나리오:
 * - 현재 rowData를 서버 POI 방식으로 다운로드
 * - 공통 rows 기반 다운로드
 *
 * @param {object} request ExcelDownloadRequest 구조
 * @returns {Promise<void>}
 */
export async function downloadExcel(request) {
  // 서버에 엑셀 다운로드 요청을 보낸다.
  const response = await api.post("/api/excel/download", request, {
    responseType: "blob",
  });

  // 파일 다운로드를 처리한다.
  handleExcelDownloadResponse(
    response,
    request?.fileName || "excel-download.xlsx",
  );
}

/**
 * 엑셀 템플릿 다운로드.
 *
 * 사용 시나리오:
 * - 현재 화면 ColumnMeta 기준 업로드 템플릿 생성
 * - 다중 헤더/동적 컬럼/필수 컬럼 표시/예제 행 지원
 *
 * @param {object} request ExcelTemplateDownloadRequest 구조
 * @returns {Promise<void>}
 */
export async function downloadTemplateExcel(request) {
  // 서버에 템플릿 다운로드 요청을 보낸다.
  const response = await api.post("/api/excel/template/download", request, {
    responseType: "blob",
  });

  // 파일 다운로드를 처리한다.
  handleExcelDownloadResponse(
    response,
    request?.fileName || "excel-template.xlsx",
  );
}

/**
 * 엑셀 업로드.
 *
 * 사용 시나리오:
 * - 업로드 후 즉시 저장하지 않음
 * - 서버에서 헤더 검증/필수값 검증/타입 변환/수식 차단 수행
 * - 결과 rows를 AG Grid에 표시
 *
 * @param {File} file 업로드할 엑셀 파일
 * @param {object} request ExcelUploadRequest 구조
 * @returns {Promise<object>} ExcelUploadResult
 */
export async function uploadExcel(file, request) {
  // multipart/form-data 전송을 위한 FormData를 생성한다.
  const formData = new FormData();

  // 엑셀 파일을 file 파트로 추가한다.
  formData.append("file", file);

  // 업로드 요청 메타 정보를 request 파트로 추가한다.
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], {
      type: "application/json",
    }),
  );

  // 서버에 업로드 요청을 보낸다.
  const response = await api.post("/api/excel/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // ApiResult 구조를 사용하는 경우 response.data.data가 실제 결과다.
  return response.data?.data ?? response.data;
}

/**
 * 오류 행 엑셀 다운로드.
 *
 * 사용 시나리오:
 * - 업로드 결과 rows 중 _rowStatus = ERROR 인 행만 다운로드
 * - 오류내용 컬럼 포함 가능
 *
 * @param {object} request ExcelErrorRowsDownloadRequest 구조
 * @returns {Promise<void>}
 */
export async function downloadErrorRowsExcel(request) {
  // 서버에 오류 행 다운로드 요청을 보낸다.
  const response = await api.post("/api/excel/error-rows/download", request, {
    responseType: "blob",
  });

  // 파일 다운로드를 처리한다.
  handleExcelDownloadResponse(
    response,
    request?.fileName || "excel-error-rows.xlsx",
  );
}
