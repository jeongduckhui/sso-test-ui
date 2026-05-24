// React의 useMemo, useState Hook import
import { useMemo, useState } from "react";

// snapshot 객체 생성 관련 유틸 import
import {
  createBaseSnapshot,
  createEmptyRow,
  createInitialTabState,
  createSnapshot,
  createSnapshotTitle,
} from "./snapshotUtils";

// 상위 탭 목록과 기본 조회조건 생성 함수 import
import { BIG_TABS, getDefaultSearchForm } from "./snapshotConfig";

// 전체 페이지 초기 상태 생성 함수
function createInitialPageState() {
  // BIG_TABS를 순회하며 탭별 상태 생성
  return BIG_TABS.reduce((acc, tab) => {
    // tab.id를 key로 탭별 초기 상태 저장
    acc[tab.id] = createInitialTabState(tab.id);

    // 누적 객체 반환
    return acc;

    // 초기값은 빈 객체
  }, {});
}

// 스냅샷 그리드 상태관리 custom hook
export function useSnapshotGrid(gridRef) {
  // 현재 활성 상위 탭 id 상태
  const [activeTabId, setActiveTabIdState] = useState("total");

  // 전체 탭 상태 map
  const [tabStateMap, setTabStateMap] = useState(createInitialPageState);

  // 현재 활성 탭 상태
  const activeTabState = tabStateMap[activeTabId];

  // 현재 활성 snapshot 계산
  const activeSnapshot = useMemo(() => {
    // activeSnapshotId로 snapshot 조회
    return activeTabState.snapshots[activeTabState.activeSnapshotId];

    // activeTabState 변경 시 재계산
  }, [activeTabState]);

  // 현재 활성 탭 상태만 수정하는 공통 함수
  const updateActiveTabState = (updater) => {
    // 전체 탭 상태 갱신
    setTabStateMap((prev) => ({
      // 기존 전체 상태 유지
      ...prev,

      // 현재 활성 탭만 updater 결과로 교체
      [activeTabId]: updater(prev[activeTabId]),
    }));
  };

  // 상위 탭 변경 함수
  const setActiveTabId = (nextTabId) => {
    // 탭 변경 전 조회조건 초기화 여부 처리
    setTabStateMap((prev) => {
      // 이동할 탭의 상태 조회
      const current = prev[nextTabId];

      // 조회조건 기억이면 그대로 유지
      if (current.rememberCondition) {
        return prev;
      }

      // 조회조건 기억이 아니면 조회조건 초기화
      return {
        // 기존 전체 상태 유지
        ...prev,

        // 이동할 탭만 수정
        [nextTabId]: {
          // 기존 탭 상태 유지
          ...current,

          // 조회조건 기본값으로 초기화
          searchForm: getDefaultSearchForm(nextTabId),
        },
      };
    });

    // 활성 탭 id 변경
    setActiveTabIdState(nextTabId);
  };

  // 조회조건 변경 함수
  const handleConditionChange = (name, value) => {
    // 현재 활성 탭 상태 수정
    updateActiveTabState((prev) => ({
      // 기존 상태 유지
      ...prev,

      // searchForm 수정
      searchForm: {
        // 기존 조회조건 유지
        ...prev.searchForm,

        // 변경 필드만 교체
        [name]: value,
      },
    }));
  };

  // 조회조건 기억 변경 함수
  const handleRememberChange = (checked) => {
    // 현재 활성 탭 상태 수정
    updateActiveTabState((prev) => ({
      // 기존 상태 유지
      ...prev,

      // 조회조건 기억 여부 변경
      rememberCondition: checked,
    }));
  };

  // snapshot 옵션 변경 함수
  const handleSnapshotOptionChange = (name, value) => {
    // 현재 활성 탭 상태 수정
    updateActiveTabState((prev) => ({
      // 기존 상태 유지
      ...prev,

      // 전달받은 필드명으로 값 변경
      [name]: value,
    }));
  };

  // 조회결과를 snapshot에 반영하는 함수
  const handleSearch = (rowData) => {
    // 현재 활성 탭 상태 수정
    updateActiveTabState((prev) => {
      // 스냅샷 사용 안 하면 base snapshot만 교체
      if (!prev.snapshotEnabled) {
        return {
          // 기존 상태 유지
          ...prev,

          // 기본 snapshot 하나로 교체
          snapshots: {
            // base snapshot에 조회결과 저장
            base: createBaseSnapshot(rowData),
          },

          // snapshot 순서도 base 하나
          snapshotOrder: ["base"],

          // 활성 snapshot도 base
          activeSnapshotId: "base",
        };
      }

      // 스냅샷 사용이면 신규 snapshot id 생성
      const snapshotId = crypto.randomUUID();

      // 신규 snapshot 생성
      const snapshot = createSnapshot(
        // snapshot id
        snapshotId,

        // 제목 입력값이 있으면 사용, 없으면 현재일시
        prev.snapshotTitle.trim() || createSnapshotTitle(),

        // 외부에서 전달받은 조회결과
        rowData,
      );

      // 신규 snapshot 추가 상태 반환
      return {
        // 기존 상태 유지
        ...prev,

        // snapshot map 갱신
        snapshots: {
          // 기존 snapshot 유지
          ...prev.snapshots,

          // 신규 snapshot 추가
          [snapshotId]: snapshot,
        },

        // snapshot 순서 추가
        snapshotOrder: [...prev.snapshotOrder, snapshotId],

        // 신규 snapshot 활성화
        activeSnapshotId: snapshotId,

        // snapshot 제목 입력값 초기화
        snapshotTitle: "",
      };
    });
  };

  // 저장 처리 함수
  const handleSave = () => {
    // 현재는 mock 저장
    alert("저장 완료(mock)");

    // 저장 후 상태 초기화
    updateActiveTabState((prev) => {
      // 현재 snapshot 조회
      const snapshot = prev.snapshots[prev.activeSnapshotId];

      // 삭제행 제거 + 상태값 초기화
      const savedRows = snapshot.rowData
        .filter((row) => row.rowStatus !== "D")
        .map((row) => ({
          ...row,
          rowStatus: "",
        }));

      // 저장 후 snapshot 갱신
      return {
        // 기존 상태 유지
        ...prev,

        // snapshot map 갱신
        snapshots: {
          // 기존 snapshot 유지
          ...prev.snapshots,

          // 현재 snapshot만 갱신
          [snapshot.snapshotId]: {
            // 기존 snapshot 정보 유지
            ...snapshot,

            // 저장된 rowData 반영
            rowData: savedRows,

            // 등록 목록 초기화
            createdRows: [],

            // 수정 목록 초기화
            updatedRows: [],

            // 삭제 목록 초기화
            deletedRows: [],
          },
        },
      };
    });
  };

  // snapshot 탭 클릭 함수
  const handleSnapshotClick = (snapshotId) => {
    // 활성 snapshot 변경
    updateActiveTabState((prev) => ({
      ...prev,
      activeSnapshotId: snapshotId,
    }));
  };

  // snapshot 삭제 함수
  const handleDeleteSnapshot = (snapshotId) => {
    // 현재 활성 탭 상태 수정
    updateActiveTabState((prev) => {
      // snapshot map 복사
      const nextSnapshots = { ...prev.snapshots };

      // 대상 snapshot 삭제
      delete nextSnapshots[snapshotId];

      // snapshot 순서에서도 제거
      const nextOrder = prev.snapshotOrder.filter((id) => id !== snapshotId);

      // 삭제 후 상태 반환
      return {
        // 기존 상태 유지
        ...prev,

        // 삭제된 snapshot map 반영
        snapshots: nextSnapshots,

        // 삭제된 순서 반영
        snapshotOrder: nextOrder,

        // 마지막 snapshot 활성화
        activeSnapshotId: nextOrder[nextOrder.length - 1] ?? "base",
      };
    });
  };

  // 행 추가 함수
  const handleAddRow = () => {
    // 현재 활성 탭 상태 수정
    updateActiveTabState((prev) => {
      // 현재 snapshot 조회
      const snapshot = prev.snapshots[prev.activeSnapshotId];

      // 신규 행 생성
      const newRow = createEmptyRow(activeTabId);

      // 신규 행 반영
      return {
        // 기존 상태 유지
        ...prev,

        // snapshot map 갱신
        snapshots: {
          // 기존 snapshot 유지
          ...prev.snapshots,

          // 현재 snapshot만 갱신
          [snapshot.snapshotId]: {
            // 기존 snapshot 정보 유지
            ...snapshot,

            // 신규 행을 맨 앞에 추가
            rowData: [newRow, ...snapshot.rowData],

            // 등록행 목록에도 추가
            createdRows: [newRow, ...snapshot.createdRows],
          },
        },
      };
    });
  };

  // 선택 삭제 함수
  const handleDeleteSelectedRows = () => {
    // ag-grid에서 선택된 행 조회
    const selectedRows = gridRef.current?.api?.getSelectedRows?.() ?? [];

    // 선택 행 없으면 중단
    if (selectedRows.length === 0) {
      alert("선택된 행이 없습니다.");
      return;
    }

    // 현재 활성 탭 상태 수정
    updateActiveTabState((prev) => {
      // 현재 snapshot 조회
      const snapshot = prev.snapshots[prev.activeSnapshotId];

      // 선택된 rowId 목록 생성
      const selectedIds = selectedRows.map((row) => row.rowId);

      // 선택된 행만 D 상태로 변경
      const nextRowData = snapshot.rowData.map((row) => {
        // 선택 안 된 행은 유지
        if (!selectedIds.includes(row.rowId)) {
          return row;
        }

        // 선택된 행은 삭제 상태
        return {
          ...row,
          rowStatus: "D",
        };
      });

      // 삭제행 목록 생성
      const deletedRows = nextRowData.filter((row) => row.rowStatus === "D");

      // 삭제 상태 반영
      return {
        // 기존 상태 유지
        ...prev,

        // snapshot map 갱신
        snapshots: {
          // 기존 snapshot 유지
          ...prev.snapshots,

          // 현재 snapshot만 갱신
          [snapshot.snapshotId]: {
            // 기존 snapshot 정보 유지
            ...snapshot,

            // 삭제 상태 반영 rowData
            rowData: nextRowData,

            // 삭제행 목록 반영
            deletedRows,
          },
        },
      };
    });
  };

  // 셀 값 변경 함수
  const handleCellValueChanged = (event) => {
    // 변경된 행 데이터
    const changedRow = event.data;

    // 현재 활성 탭 상태 수정
    updateActiveTabState((prev) => {
      // 현재 snapshot 조회
      const snapshot = prev.snapshots[prev.activeSnapshotId];

      // 변경된 행 상태 반영
      const nextRowData = snapshot.rowData.map((row) => {
        // 변경된 행이 아니면 유지
        if (row.rowId !== changedRow.rowId) {
          return row;
        }

        // 신규 행은 C 유지
        if (row.rowStatus === "C") {
          return row;
        }

        // 기존 행은 U 상태로 변경
        return {
          ...changedRow,
          rowStatus: "U",
        };
      });

      // 수정행 목록 생성
      const updatedRows = nextRowData.filter((row) => row.rowStatus === "U");

      // 수정 상태 반영
      return {
        // 기존 상태 유지
        ...prev,

        // snapshot map 갱신
        snapshots: {
          // 기존 snapshot 유지
          ...prev.snapshots,

          // 현재 snapshot만 갱신
          [snapshot.snapshotId]: {
            // 기존 snapshot 정보 유지
            ...snapshot,

            // 수정 상태 반영 rowData
            rowData: nextRowData,

            // 수정행 목록 반영
            updatedRows,
          },
        },
      };
    });
  };

  // 화면에서 사용할 값과 함수 반환
  return {
    activeTabId,
    activeTabState,
    activeSnapshot,
    setActiveTabId,
    handleConditionChange,
    handleRememberChange,
    handleSnapshotOptionChange,
    handleSearch,
    handleSave,
    handleSnapshotClick,
    handleDeleteSnapshot,
    handleAddRow,
    handleDeleteSelectedRows,
    handleCellValueChanged,
  };
}
