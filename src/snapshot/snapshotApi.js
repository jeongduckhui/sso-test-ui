// mock DB import
import { MOCK_DB } from "../snapshot/snapshotMockData";

// mock 조회 API 함수
export async function searchSnapshotRows(tabId, searchForm) {
  // 실제 axios처럼 비동기 느낌을 주기 위한 delay
  await delay(300);

  // 탭에 맞는 mock 데이터 복사
  let rows = [...(MOCK_DB[tabId] ?? [])];

  // Total 탭 조회조건 처리
  if (tabId === "total") {
    // 통합검색어 조건
    if (searchForm.keyword) {
      rows = rows.filter((row) =>
        row.itemName.toLowerCase().includes(searchForm.keyword.toLowerCase()),
      );
    }

    // 지역 조건
    if (searchForm.region) {
      rows = rows.filter((row) => row.region === searchForm.region);
    }

    // 기간 조건
    if (searchForm.periodType) {
      rows = rows.filter((row) => row.periodType === searchForm.periodType);
    }

    // 마감 포함 미체크 시 마감 데이터 제외
    if (!searchForm.includeClosed) {
      rows = rows.filter((row) => !row.includeClosed);
    }
  }

  // 수요 탭 조회조건 처리
  if (tabId === "demand") {
    // 수요구분 조건
    if (searchForm.demandType) {
      rows = rows.filter((row) => row.demandType === searchForm.demandType);
    }

    // 고객명 조건
    if (searchForm.customerName) {
      rows = rows.filter((row) =>
        row.customerName.includes(searchForm.customerName),
      );
    }
  }

  // 공급 탭 조회조건 처리
  if (tabId === "supply") {
    // 공장 조건
    if (searchForm.factory) {
      rows = rows.filter((row) => row.factory === searchForm.factory);
    }

    // 공급상태 조건
    if (searchForm.supplyStatus && searchForm.supplyStatus !== "ALL") {
      rows = rows.filter((row) => row.supplyStatus === searchForm.supplyStatus);
    }

    // 부족분만 조건
    if (searchForm.onlyShortage) {
      rows = rows.filter((row) => row.onlyShortage);
    }

    // 자재코드 조건
    if (searchForm.materialCode) {
      rows = rows.filter((row) =>
        row.materialCode
          .toLowerCase()
          .includes(searchForm.materialCode.toLowerCase()),
      );
    }
  }

  // ag-grid에서 사용할 rowData 형태로 변환
  return rows.map((row) => ({
    // ag-grid row 고유 id
    rowId: crypto.randomUUID(),

    // 원본 row 데이터
    ...row,

    // 조회조건 표시용 문자열
    conditionText: JSON.stringify(searchForm),

    // 최초 조회 상태는 일반행
    rowStatus: "",
  }));
}

// mock API 지연 함수
function delay(ms) {
  // ms 이후 resolve
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
