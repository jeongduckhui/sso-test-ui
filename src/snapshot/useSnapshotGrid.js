// React의 useMemo, useState Hook import
import { useMemo, useState } from "react";

// snapshot 관련 유틸 함수들을 import
import {
  // 기본 snapshot 객체 생성 함수
  createBaseSnapshot,

  // 신규 행 생성 함수
  createEmptyRow,

  // 탭별 초기 상태 생성 함수
  createInitialTabState,

  // 조회조건 기반 mock row 생성 함수
  createMockRows,

  // 일반 snapshot 객체 생성 함수
  createSnapshot,

  // snapshot 기본 제목 생성 함수
  createSnapshotTitle,
} from "./snapshotUtils";

// 상위 탭 목록과 기본 조회조건 생성 함수를 import
import { BIG_TABS, getDefaultSearchForm } from "./snapshotConfig";

// 전체 페이지의 초기 상태를 생성하는 함수
function createInitialPageState() {
  // BIG_TABS 배열을 순회하면서 탭별 상태 객체를 만든다
  return BIG_TABS.reduce((acc, tab) => {
    // acc 객체에 tab.id를 key로 사용해서 탭별 초기 상태 저장
    acc[tab.id] = createInitialTabState(tab.id);

    // 다음 reduce 순회를 위해 누적 객체 반환
    return acc;

    // 초기 누적값은 빈 객체
  }, {});
}

// 스냅샷 그리드 상태와 이벤트 로직을 관리하는 custom hook
export function useSnapshotGrid(gridRef) {
  // 현재 활성화된 상위 탭 id 상태
  const [activeTabId, setActiveTabIdState] = useState("total");

  // 전체 탭 상태 map
  // total / demand / supply 탭별 상태를 각각 저장
  const [tabStateMap, setTabStateMap] = useState(createInitialPageState);

  // 현재 활성화된 탭의 상태만 꺼냄
  const activeTabState = tabStateMap[activeTabId];

  // 현재 활성화된 snapshot 객체 계산
  const activeSnapshot = useMemo(() => {
    // 현재 탭 상태 안에서 activeSnapshotId에 해당하는 snapshot 반환
    return activeTabState.snapshots[activeTabState.activeSnapshotId];

    // activeTabState가 바뀔 때만 다시 계산
  }, [activeTabState]);

  // 현재 활성 탭 상태만 안전하게 수정하는 공통 함수
  const updateActiveTabState = (updater) => {
    // 전체 탭 상태 map 갱신
    setTabStateMap((prev) => ({
      // 기존 전체 탭 상태 유지
      ...prev,

      // 현재 활성 탭 상태만 updater 결과로 교체
      [activeTabId]: updater(prev[activeTabId]),
    }));
  };

  // 상위 탭 변경 함수
  const setActiveTabId = (nextTabId) => {
    // 탭 변경 전에 다음 탭의 조회조건 초기화 여부 처리
    setTabStateMap((prev) => {
      // 이동할 탭의 현재 상태 조회
      const current = prev[nextTabId];

      // 조회조건 기억이 체크되어 있으면 기존 상태 그대로 유지
      if (current.rememberCondition) {
        // 아무 것도 변경하지 않고 기존 상태 반환
        return prev;
      }

      // 조회조건 기억이 체크되어 있지 않으면 조회조건 초기화
      return {
        // 기존 전체 탭 상태 유지
        ...prev,

        // 이동할 탭 상태만 수정
        [nextTabId]: {
          // 이동할 탭의 기존 상태 유지
          ...current,

          // 이동할 탭의 조회조건을 기본값으로 초기화
          searchForm: getDefaultSearchForm(nextTabId),
        },
      };
    });

    // 실제 활성 탭 id 변경
    setActiveTabIdState(nextTabId);
  };

  // 조회조건 값 변경 함수
  const handleConditionChange = (name, value) => {
    // 현재 활성 탭 상태 갱신
    updateActiveTabState((prev) => ({
      // 현재 탭 기존 상태 유지
      ...prev,

      // searchForm만 수정
      searchForm: {
        // 기존 조회조건 유지
        ...prev.searchForm,

        // 변경된 필드만 새 값으로 교체
        [name]: value,
      },
    }));
  };

  // 조회조건 기억 체크박스 변경 함수
  const handleRememberChange = (checked) => {
    // 현재 활성 탭 상태 갱신
    updateActiveTabState((prev) => ({
      // 기존 상태 유지
      ...prev,

      // 조회조건 기억 여부 변경
      rememberCondition: checked,
    }));
  };

  // snapshot 옵션 변경 함수
  const handleSnapshotOptionChange = (name, value) => {
    // 현재 활성 탭 상태 갱신
    updateActiveTabState((prev) => ({
      // 기존 상태 유지
      ...prev,

      // snapshotEnabled 또는 snapshotTitle 같은 필드 변경
      [name]: value,
    }));
  };

  // 조회 버튼 처리 함수
  const handleSearch = () => {
    // 현재 활성 탭 상태 갱신
    updateActiveTabState((prev) => {
      // 현재 탭 id와 조회조건으로 mock row 데이터 생성
      const rowData = createMockRows(activeTabId, prev.searchForm);

      // 그리드 스냅샷 체크가 안 되어 있으면 기본 조회 결과만 교체
      if (!prev.snapshotEnabled) {
        // 현재 탭 상태 반환
        return {
          // 기존 탭 상태 유지
          ...prev,

          // snapshot 목록을 기본 snapshot 하나로 교체
          snapshots: {
            // base snapshot에 조회 결과 저장
            base: createBaseSnapshot(rowData),
          },

          // snapshot 순서도 base 하나만 유지
          snapshotOrder: ["base"],

          // 활성 snapshot도 base로 지정
          activeSnapshotId: "base",
        };
      }

      // snapshot 체크가 되어 있으면 신규 snapshot id 생성
      const snapshotId = crypto.randomUUID();

      // 신규 snapshot 객체 생성
      const snapshot = createSnapshot(
        // 새 snapshot id
        snapshotId,

        // 사용자가 입력한 제목이 있으면 사용하고 없으면 현재일시 사용
        prev.snapshotTitle.trim() || createSnapshotTitle(),

        // 조회 결과 rowData 저장
        rowData,
      );

      // 신규 snapshot을 기존 목록에 추가한 상태 반환
      return {
        // 기존 탭 상태 유지
        ...prev,

        // snapshot 목록 갱신
        snapshots: {
          // 기존 snapshot 유지
          ...prev.snapshots,

          // 신규 snapshot 추가
          [snapshotId]: snapshot,
        },

        // snapshot 탭 순서에 신규 snapshot id 추가
        snapshotOrder: [...prev.snapshotOrder, snapshotId],

        // 방금 만든 snapshot을 활성 snapshot으로 지정
        activeSnapshotId: snapshotId,

        // snapshot 제목 입력값 초기화
        snapshotTitle: "",
      };
    });
  };

  // 저장 버튼 처리 함수
  const handleSave = () => {
    // 현재는 서버 저장 대신 mock alert 처리
    alert("저장 완료(mock)");

    // 저장 후 현재 snapshot의 상태값 초기화
    updateActiveTabState((prev) => {
      // 현재 활성 snapshot 조회
      const snapshot = prev.snapshots[prev.activeSnapshotId];

      // 삭제 상태가 아닌 row만 남기고 rowStatus 초기화
      const savedRows = snapshot.rowData
        // rowStatus가 D인 행은 저장 후 제거
        .filter((row) => row.rowStatus !== "D")

        // 남은 행의 상태값 초기화
        .map((row) => ({
          // 기존 row 데이터 유지
          ...row,

          // 상태값 초기화
          rowStatus: "",
        }));

      // 저장 처리된 snapshot 상태 반환
      return {
        // 기존 탭 상태 유지
        ...prev,

        // snapshots map 갱신
        snapshots: {
          // 기존 snapshot들 유지
          ...prev.snapshots,

          // 현재 snapshot만 저장 완료 상태로 교체
          [snapshot.snapshotId]: {
            // 기존 snapshot 정보 유지
            ...snapshot,

            // 삭제 제거 및 상태 초기화된 rowData 반영
            rowData: savedRows,

            // 등록 행 목록 초기화
            createdRows: [],

            // 수정 행 목록 초기화
            updatedRows: [],

            // 삭제 행 목록 초기화
            deletedRows: [],
          },
        },
      };
    });
  };

  // 공통 버튼 action 처리 함수
  const handleAction = (type) => {
    // 조회 버튼이면 조회 실행
    if (type === "SEARCH") {
      // 조회 처리
      handleSearch();

      // 이후 로직 실행 방지
      return;
    }

    // 저장 버튼이면 저장 실행
    if (type === "SAVE") {
      // 저장 처리
      handleSave();
    }
  };

  // snapshot 탭 클릭 처리 함수
  const handleSnapshotClick = (snapshotId) => {
    // 현재 활성 탭 상태 갱신
    updateActiveTabState((prev) => ({
      // 기존 상태 유지
      ...prev,

      // 클릭한 snapshot을 활성화
      activeSnapshotId: snapshotId,
    }));
  };

  // snapshot 탭 삭제 처리 함수
  const handleDeleteSnapshot = (snapshotId) => {
    // 현재 활성 탭 상태 갱신
    updateActiveTabState((prev) => {
      // 기존 snapshot map 복사
      const nextSnapshots = { ...prev.snapshots };

      // 삭제 대상 snapshot 제거
      delete nextSnapshots[snapshotId];

      // snapshot 순서 목록에서도 삭제 대상 제거
      const nextOrder = prev.snapshotOrder.filter((id) => id !== snapshotId);

      // 삭제 후 상태 반환
      return {
        // 기존 탭 상태 유지
        ...prev,

        // 삭제 반영된 snapshot map
        snapshots: nextSnapshots,

        // 삭제 반영된 snapshot 순서
        snapshotOrder: nextOrder,

        // 마지막 snapshot을 활성화하고 없으면 base로 fallback
        activeSnapshotId: nextOrder[nextOrder.length - 1] ?? "base",
      };
    });
  };

  // 행 추가 처리 함수
  const handleAddRow = () => {
    // 현재 활성 탭 상태 갱신
    updateActiveTabState((prev) => {
      // 현재 활성 snapshot 조회
      const snapshot = prev.snapshots[prev.activeSnapshotId];

      // 현재 탭 기준 신규 행 생성
      const newRow = createEmptyRow(activeTabId);

      // 신규 행이 추가된 상태 반환
      return {
        // 기존 탭 상태 유지
        ...prev,

        // snapshots map 갱신
        snapshots: {
          // 기존 snapshot 유지
          ...prev.snapshots,

          // 현재 snapshot만 변경
          [snapshot.snapshotId]: {
            // 기존 snapshot 정보 유지
            ...snapshot,

            // 신규 행을 grid 최상단에 추가
            rowData: [newRow, ...snapshot.rowData],

            // createdRows에도 신규 행 추가
            createdRows: [newRow, ...snapshot.createdRows],
          },
        },
      };
    });
  };

  // 선택 행 삭제 처리 함수
  const handleDeleteSelectedRows = () => {
    // ag-grid api에서 현재 선택된 행 목록 조회
    const selectedRows = gridRef.current?.api?.getSelectedRows?.() ?? [];

    // 선택된 행이 없으면 중단
    if (selectedRows.length === 0) {
      // 사용자 안내
      alert("선택된 행이 없습니다.");

      // 함수 종료
      return;
    }

    // 현재 활성 탭 상태 갱신
    updateActiveTabState((prev) => {
      // 현재 활성 snapshot 조회
      const snapshot = prev.snapshots[prev.activeSnapshotId];

      // 선택된 행들의 rowId 목록 생성
      const selectedIds = selectedRows.map((row) => row.rowId);

      // rowData를 순회하면서 선택된 행만 삭제 상태로 변경
      const nextRowData = snapshot.rowData.map((row) => {
        // 선택되지 않은 행은 그대로 반환
        if (!selectedIds.includes(row.rowId)) {
          // 기존 row 유지
          return row;
        }

        // 선택된 행은 삭제 상태로 변경
        return {
          // 기존 row 데이터 유지
          ...row,

          // 삭제 상태 지정
          rowStatus: "D",
        };
      });

      // 삭제 상태인 행 목록 생성
      const deletedRows = nextRowData.filter((row) => row.rowStatus === "D");

      // 삭제 상태 반영된 탭 상태 반환
      return {
        // 기존 탭 상태 유지
        ...prev,

        // snapshots map 갱신
        snapshots: {
          // 기존 snapshot 유지
          ...prev.snapshots,

          // 현재 snapshot만 변경
          [snapshot.snapshotId]: {
            // 기존 snapshot 정보 유지
            ...snapshot,

            // 삭제 상태 반영된 rowData
            rowData: nextRowData,

            // deletedRows 갱신
            deletedRows,
          },
        },
      };
    });
  };

  // ag-grid 셀 값 변경 처리 함수
  const handleCellValueChanged = (event) => {
    // 변경된 행 데이터
    const changedRow = event.data;

    // 현재 활성 탭 상태 갱신
    updateActiveTabState((prev) => {
      // 현재 활성 snapshot 조회
      const snapshot = prev.snapshots[prev.activeSnapshotId];

      // rowData를 순회하면서 변경된 행만 찾아 상태 변경
      const nextRowData = snapshot.rowData.map((row) => {
        // 변경된 행이 아니면 그대로 반환
        if (row.rowId !== changedRow.rowId) {
          // 기존 row 유지
          return row;
        }

        // 신규 행은 이미 C 상태이므로 U로 바꾸지 않음
        if (row.rowStatus === "C") {
          // 신규 행 상태 유지
          return row;
        }

        // 기존 행은 수정 상태로 변경
        return {
          // ag-grid에서 변경된 최신 row 데이터 반영
          ...changedRow,

          // 수정 상태 지정
          rowStatus: "U",
        };
      });

      // 수정 상태인 행 목록 생성
      const updatedRows = nextRowData.filter((row) => row.rowStatus === "U");

      // 수정 상태 반영된 탭 상태 반환
      return {
        // 기존 탭 상태 유지
        ...prev,

        // snapshots map 갱신
        snapshots: {
          // 기존 snapshot 유지
          ...prev.snapshots,

          // 현재 snapshot만 변경
          [snapshot.snapshotId]: {
            // 기존 snapshot 정보 유지
            ...snapshot,

            // 수정 상태 반영된 rowData
            rowData: nextRowData,

            // updatedRows 갱신
            updatedRows,
          },
        },
      };
    });
  };

  // 화면 컴포넌트에서 사용할 값과 함수 반환
  return {
    // 현재 활성 상위 탭 id
    activeTabId,

    // 현재 활성 상위 탭 상태
    activeTabState,

    // 현재 활성 snapshot
    activeSnapshot,

    // 상위 탭 변경 함수
    setActiveTabId,

    // 조회조건 변경 함수
    handleConditionChange,

    // 조회조건 기억 변경 함수
    handleRememberChange,

    // snapshot 옵션 변경 함수
    handleSnapshotOptionChange,

    // 공통 버튼 액션 함수
    handleAction,

    // snapshot 탭 클릭 함수
    handleSnapshotClick,

    // snapshot 삭제 함수
    handleDeleteSnapshot,

    // 신규 행 추가 함수
    handleAddRow,

    // 선택 행 삭제 함수
    handleDeleteSelectedRows,

    // 셀 값 변경 함수
    handleCellValueChanged,
  };
}
