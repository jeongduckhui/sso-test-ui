// snapshotConfig.js 에서 기본 조회조건 생성 함수 import
// 탭별(default total / demand / supply) 조회조건 초기값 생성용
import { getDefaultSearchForm } from "./snapshotConfig";

// 더미 DB 데이터 import
// 실제 API 대신 현재는 메모리 기반 mock 데이터 사용
import { MOCK_DB } from "./snapshotMockData";

// ========================================
// 탭 최초 상태 생성
// ========================================

export function createInitialTabState(tabId) {
  return {
    // 조회조건 기억 여부
    // true면 탭 이동 시 조회조건 유지
    // false면 탭 이동 시 초기화
    rememberCondition: false,

    // 탭별 기본 조회조건 생성
    // ex) total / demand / supply 각각 구조 다름
    searchForm: getDefaultSearchForm(tabId),

    // 스냅샷 사용 여부
    // true면 조회 시 하단 snapshot 탭 생성
    snapshotEnabled: false,

    // snapshot 생성 시 사용할 title 입력값
    snapshotTitle: "",

    // snapshot 목록
    // 기본 snapshot 하나 생성
    snapshots: {
      // 기본 snapshot key
      base: createBaseSnapshot(createMockRows(tabId, {})),
    },

    // snapshot 탭 순서
    // 화면 렌더링 순서용
    snapshotOrder: ["base"],

    // 현재 활성화된 snapshot id
    activeSnapshotId: "base",
  };
}

// ========================================
// 기본 snapshot 생성
// ========================================

export function createBaseSnapshot(rowData) {
  return {
    // snapshot id
    snapshotId: "base",

    // snapshot title
    title: "기본 조회",

    // 기본 snapshot 여부
    // 삭제 불가능 처리 등에 사용 가능
    base: true,

    // grid row 데이터
    rowData,

    // 신규 등록 행 목록
    createdRows: [],

    // 수정 행 목록
    updatedRows: [],

    // 삭제 행 목록
    deletedRows: [],
  };
}

// ========================================
// 일반 snapshot 생성
// ========================================

export function createSnapshot(snapshotId, title, rowData) {
  return {
    // snapshot uuid
    snapshotId,

    // snapshot 탭 title
    title,

    // 기본 snapshot 여부
    base: false,

    // snapshot별 row 데이터
    rowData,

    // 등록 행 목록
    createdRows: [],

    // 수정 행 목록
    updatedRows: [],

    // 삭제 행 목록
    deletedRows: [],
  };
}

// ========================================
// snapshot 기본 title 생성
// ex) 202605221130
// ========================================

export function createSnapshotTitle() {
  // 현재 시간 생성
  const now = new Date();

  // 년도 추출
  const yyyy = now.getFullYear();

  // 월 추출
  // +1 하는 이유:
  // javascript month는 0부터 시작
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  // 일 추출
  const dd = String(now.getDate()).padStart(2, "0");

  // 시 추출
  const hh = String(now.getHours()).padStart(2, "0");

  // 분 추출
  const mi = String(now.getMinutes()).padStart(2, "0");

  // yyyyMMddHHmm 형태로 리턴
  return `${yyyy}${mm}${dd}${hh}${mi}`;
}

// ========================================
// 조회조건 기반 mock row 생성
// ========================================

export function createMockRows(tabId, searchForm) {
  // 현재 탭에 해당하는 mock 데이터 조회
  // 없으면 빈 배열
  let rows = [...(MOCK_DB[tabId] ?? [])];

  // ========================================
  // TOTAL 탭 조회조건 처리
  // ========================================

  if (tabId === "total") {
    // 검색어가 있으면 itemName LIKE 검색
    if (searchForm.keyword) {
      rows = rows.filter((row) =>
        // 대소문자 구분 제거 후 contains 검색
        row.itemName.toLowerCase().includes(searchForm.keyword.toLowerCase()),
      );
    }

    // region 조건 존재 시 exact match
    if (searchForm.region) {
      rows = rows.filter((row) => row.region === searchForm.region);
    }

    // periodType 조건 존재 시 exact match
    if (searchForm.periodType) {
      rows = rows.filter((row) => row.periodType === searchForm.periodType);
    }

    // includeClosed 체크 안했으면
    // includeClosed=true 데이터 제거
    if (!searchForm.includeClosed) {
      rows = rows.filter((row) => !row.includeClosed);
    }
  }

  // ========================================
  // DEMAND 탭 조회조건 처리
  // ========================================

  if (tabId === "demand") {
    // demandType 조건 exact match
    if (searchForm.demandType) {
      rows = rows.filter((row) => row.demandType === searchForm.demandType);
    }

    // customerName LIKE 검색
    if (searchForm.customerName) {
      rows = rows.filter((row) =>
        row.customerName.includes(searchForm.customerName),
      );
    }
  }

  // ========================================
  // SUPPLY 탭 조회조건 처리
  // ========================================

  if (tabId === "supply") {
    // factory exact match
    if (searchForm.factory) {
      rows = rows.filter((row) => row.factory === searchForm.factory);
    }

    // ALL이 아니면 supplyStatus filtering
    if (searchForm.supplyStatus && searchForm.supplyStatus !== "ALL") {
      rows = rows.filter((row) => row.supplyStatus === searchForm.supplyStatus);
    }

    // 부족분만 체크 시
    // onlyShortage=true 데이터만 조회
    if (searchForm.onlyShortage) {
      rows = rows.filter((row) => row.onlyShortage);
    }

    // materialCode LIKE 검색
    if (searchForm.materialCode) {
      rows = rows.filter((row) =>
        row.materialCode
          .toLowerCase()
          .includes(searchForm.materialCode.toLowerCase()),
      );
    }
  }

  // 최종 row 변환
  return rows.map((row) => ({
    // ag-grid row 고유 id
    rowId: crypto.randomUUID(),

    // 기존 데이터 spread
    ...row,

    // 현재 조회조건 문자열 저장
    // snapshot별 조회조건 확인용
    conditionText: JSON.stringify(searchForm),

    // row 상태값
    // C: create
    // U: update
    // D: delete
    // "" : normal
    rowStatus: "",
  }));
}

// ========================================
// 신규 행 생성
// ========================================

export function createEmptyRow(tabId) {
  return {
    // ag-grid 고유 row id
    rowId: crypto.randomUUID(),

    // 업무 id
    id: "",

    // 현재 탭 category
    category: tabId,

    // 품목명
    itemName: "",

    // 수량
    qty: 0,

    // 상태
    status: "신규",

    // 조회조건 표시용
    conditionText: "신규 추가",

    // 신규 등록 상태
    // C = Create
    rowStatus: "C",
  };
}
