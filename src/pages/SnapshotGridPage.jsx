// React의 useMemo, useRef, useState Hook import
import { useMemo, useRef, useState } from "react";

// ag-grid React 컴포넌트 import
import { AgGridReact } from "ag-grid-react";

// ag-grid 모듈 등록용 import
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// ag-grid 전체 Community 기능 등록
ModuleRegistry.registerModules([AllCommunityModule]);

// 기존 공통 페이지 레이아웃 컴포넌트 import
import PageContainer from "../components/common/PageContainer";

// 기존 공통 버튼 컴포넌트 import
import CommonActionButtons from "../components/common/CommonActionButtons";

// mock API 조회 함수 import
import { searchSnapshotRows } from "../snapshot/snapshotApi";

// 스냅샷 화면 설정값 import
import {
  // 상위 탭 목록
  BIG_TABS,

  // ag-grid 컬럼 정의
  SNAPSHOT_GRID_COLUMN_DEFS,

  // 탭별 조회조건 설정 조회 함수
  getConditionConfig,
} from "../snapshot/snapshotConfig";

// 스냅샷 상태관리 custom hook import
import { useSnapshotGrid } from "../snapshot/useSnapshotGrid";

// ag-grid 기본 css import
import "ag-grid-community/styles/ag-grid.css";

// ag-grid alpine theme css import
import "ag-grid-community/styles/ag-theme-alpine.css";

// 스냅샷 그리드 페이지 컴포넌트
export default function SnapshotGridPage() {
  // ag-grid api 접근용 ref
  const gridRef = useRef(null);

  // 조회 로딩 상태
  const [loading, setLoading] = useState(false);

  // 스냅샷 상태와 이벤트 함수 가져오기
  const {
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
  } = useSnapshotGrid(gridRef);

  // ag-grid 기본 컬럼 옵션
  const defaultColDef = useMemo(
    () => ({
      // 정렬 가능
      sortable: true,

      // 컬럼 크기 조절 가능
      resizable: true,

      // 필터 가능
      filter: true,

      // 기본 수정 가능
      editable: true,
    }),
    [],
  );

  // 현재 활성 탭의 조회조건 설정 조회
  const conditionConfig = getConditionConfig(activeTabId);

  // 공통 버튼 클릭 처리
  const handlePageAction = async (type) => {
    // 조회 버튼 클릭이면
    if (type === "SEARCH") {
      try {
        // 로딩 시작
        setLoading(true);

        // 실무에서는 여기서 axios 호출
        // 현재는 mock API 호출
        const rowData = await searchSnapshotRows(
          activeTabId,
          activeTabState.searchForm,
        );

        // 조회결과를 hook으로 전달
        handleSearch(rowData);
      } catch (e) {
        // 조회 실패 로그
        console.error(e);

        // 사용자 안내
        alert("조회 실패");
      } finally {
        // 로딩 종료
        setLoading(false);
      }

      // 조회 처리 후 종료
      return;
    }

    // 저장 버튼 클릭이면
    if (type === "SAVE") {
      // hook의 저장 처리 실행
      handleSave();
    }
  };

  // 화면 렌더링
  return (
    <PageContainer
      title="스냅샷 그리드"
      description="mock API 호출 → rowData 전달 → snapshot 상태 반영 구조"
      actions={
        <CommonActionButtons
          buttons={["search", "save"]}
          onAction={handlePageAction}
        />
      }
    >
      <div className="snapshot-page">
        <div className="snapshot-search-card">
          <div className="snapshot-condition-grid">
            {conditionConfig.map((item) => (
              <ConditionField
                key={item.name}
                item={item}
                value={activeTabState.searchForm[item.name]}
                onChange={handleConditionChange}
              />
            ))}

            <label className="snapshot-check-label">
              <input
                type="checkbox"
                checked={activeTabState.rememberCondition}
                onChange={(e) => handleRememberChange(e.target.checked)}
              />
              조회조건기억
            </label>

            <label className="snapshot-check-label">
              <input
                type="checkbox"
                checked={activeTabState.snapshotEnabled}
                onChange={(e) =>
                  handleSnapshotOptionChange(
                    "snapshotEnabled",
                    e.target.checked,
                  )
                }
              />
              그리드 스냅샷
            </label>

            <input
              className="snapshot-title-input"
              value={activeTabState.snapshotTitle}
              onChange={(e) =>
                handleSnapshotOptionChange("snapshotTitle", e.target.value)
              }
              placeholder="입력하세요"
            />
          </div>
        </div>

        <div className="snapshot-main-tab-row">
          {BIG_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`snapshot-main-tab ${
                activeTabId === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="snapshot-grid-card">
          <div className="snapshot-grid-toolbar">
            <div>
              <strong>현재 탭:</strong> {activeTabId}
              {" / "}
              <strong>스냅샷:</strong> {activeSnapshot?.title}
              {" / "}
              <strong>조회상태:</strong> {loading ? "조회 중" : "대기"}
            </div>

            <div className="snapshot-grid-buttons">
              <button className="secondary-btn" onClick={handleAddRow}>
                행 추가
              </button>

              <button className="danger-btn" onClick={handleDeleteSelectedRows}>
                선택 삭제
              </button>
            </div>
          </div>

          <div className="ag-theme-alpine snapshot-grid">
            <AgGridReact
              ref={gridRef}
              rowData={activeSnapshot?.rowData ?? []}
              columnDefs={SNAPSHOT_GRID_COLUMN_DEFS}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              getRowId={(params) => params.data.rowId}
              onCellValueChanged={handleCellValueChanged}
              getRowClass={(params) => {
                if (params.data?.rowStatus === "C") return "grid-row-created";
                if (params.data?.rowStatus === "U") return "grid-row-updated";
                if (params.data?.rowStatus === "D") return "grid-row-deleted";
                return "";
              }}
            />
          </div>

          <div className="snapshot-sub-tab-row">
            {activeTabState.snapshotOrder.map((snapshotId) => {
              const snapshot = activeTabState.snapshots[snapshotId];

              return (
                <div
                  key={snapshotId}
                  className={`snapshot-sub-tab ${
                    activeTabState.activeSnapshotId === snapshotId
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSnapshotClick(snapshotId)}
                >
                  <span>{snapshot.title}</span>

                  {!snapshot.base && (
                    <button
                      className="snapshot-sub-tab-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSnapshot(snapshotId);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="snapshot-status-bar">
            <span>등록: {activeSnapshot?.createdRows.length ?? 0}</span>
            <span>수정: {activeSnapshot?.updatedRows.length ?? 0}</span>
            <span>삭제: {activeSnapshot?.deletedRows.length ?? 0}</span>
            <span>조회결과: {activeSnapshot?.rowData.length ?? 0}</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

// 조회조건 필드 렌더링 컴포넌트
function ConditionField({ item, value, onChange }) {
  // select 타입 처리
  if (item.type === "select") {
    return (
      <div className="snapshot-condition-item">
        <label>{item.label}</label>

        <select
          value={value}
          onChange={(e) => onChange(item.name, e.target.value)}
        >
          {item.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // checkbox 타입 처리
  if (item.type === "checkbox") {
    return (
      <label className="snapshot-check-label">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(item.name, e.target.checked)}
        />
        {item.label}
      </label>
    );
  }

  // radio 타입 처리
  if (item.type === "radio") {
    return (
      <div className="snapshot-condition-item">
        <label>{item.label}</label>

        <div className="snapshot-radio-group">
          {item.options.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name={item.name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(item.name, e.target.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  // input/date 기본 처리
  return (
    <div className="snapshot-condition-item">
      <label>{item.label}</label>

      <input
        type={item.type}
        value={value}
        onChange={(e) => onChange(item.name, e.target.value)}
        placeholder={item.placeholder}
      />
    </div>
  );
}
