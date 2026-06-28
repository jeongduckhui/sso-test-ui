import api from "./axios";

function unwrapApiResult(response) {
  return response.data?.data ?? response.data;
}

function screenHeaders() {
  return {
    "X-Screen-Id": window.location.pathname,
  };
}

export async function searchQueryTraceSample(request) {
  const response = await api.post("/api/query-trace/sample/search", request, {
    headers: screenHeaders(),
  });

  return unwrapApiResult(response);
}

export async function fetchQueryTraces() {
  const response = await api.get("/api/query-traces", {
    headers: screenHeaders(),
  });

  return unwrapApiResult(response);
}

export async function fetchQueryTraceSqls(traceId) {
  const response = await api.get(`/api/query-traces/${traceId}/sqls`, {
    headers: screenHeaders(),
  });

  return unwrapApiResult(response);
}
