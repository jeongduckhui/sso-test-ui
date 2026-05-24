// 기본 조회조건 생성 함수 import
import { getDefaultSearchForm } from "./snapshotConfig";

// 탭 최초 상태 생성 함수
export function createInitialTabState(tabId) {
  return {
    // 조회조건 기억 여부
    rememberCondition: false,

    // 탭별 기본 조회조건
    searchForm: getDefaultSearchForm(tabId),

    // 스냅샷 사용 여부
    snapshotEnabled: false,

    // 스냅샷 제목 입력값
    snapshotTitle: "",

    // snapshot 목록
    snapshots: {
      // 실무 구조에서는 최초 데이터 없음
      base: createBaseSnapshot([]),
    },

    // snapshot 탭 순서
    snapshotOrder: ["base"],

    // 현재 활성 snapshot id
    activeSnapshotId: "base",
  };
}

// 기본 snapshot 생성
export function createBaseSnapshot(rowData) {
  return {
    // 기본 snapshot id
    snapshotId: "base",

    // 기본 snapshot 제목
    title: "기본 조회",

    // 기본 snapshot 여부
    base: true,

    // grid row 데이터
    rowData,

    // 등록행 목록
    createdRows: [],

    // 수정행 목록
    updatedRows: [],

    // 삭제행 목록
    deletedRows: [],
  };
}

// 일반 snapshot 생성
export function createSnapshot(snapshotId, title, rowData) {
  return {
    // snapshot 고유 id
    snapshotId,

    // snapshot 제목
    title,

    // 기본 snapshot 여부
    base: false,

    // snapshot별 row 데이터
    rowData,

    // 등록행 목록
    createdRows: [],

    // 수정행 목록
    updatedRows: [],

    // 삭제행 목록
    deletedRows: [],
  };
}

// snapshot 기본 제목 생성
export function createSnapshotTitle() {
  // 현재 일시
  const now = new Date();

  // 년
  const yyyy = now.getFullYear();

  // 월
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  // 일
  const dd = String(now.getDate()).padStart(2, "0");

  // 시
  const hh = String(now.getHours()).padStart(2, "0");

  // 분
  const mi = String(now.getMinutes()).padStart(2, "0");

  // yyyyMMddHHmm 반환
  return `${yyyy}${mm}${dd}${hh}${mi}`;
}

// 신규 행 생성
export function createEmptyRow(tabId) {
  return {
    // ag-grid row 고유 id
    rowId: crypto.randomUUID(),

    // 업무 id
    id: "",

    // 현재 탭 구분
    category: tabId,

    // 품목명
    itemName: "",

    // 수량
    qty: 0,

    // 상태
    status: "신규",

    // 조회조건 표시
    conditionText: "신규 추가",

    // 신규 상태
    rowStatus: "C",
  };
}
