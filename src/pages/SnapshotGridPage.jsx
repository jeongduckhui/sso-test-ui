// React의 useMemo, useRef Hook import
import { useMemo, useRef } from "react";

// ag-grid React 컴포넌트 import
import { AgGridReact } from "ag-grid-react";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

// 기존 공통 페이지 레이아웃 컴포넌트 import
import PageContainer from "../components/common/PageContainer";

// 기존 공통 버튼 컴포넌트 import
import CommonActionButtons from "../components/common/CommonActionButtons";

// 스냅샷 화면 설정값 import
import {
  // 상위 탭 목록
  BIG_TABS,

  // ag-grid 컬럼 정의
  SNAPSHOT_GRID_COLUMN_DEFS,

  // 탭별 조회조건 설정을 가져오는 함수
  getConditionConfig,
} from "../snapshot/snapshotConfig";

// 스냅샷 그리드 상태관리 custom hook import
import { useSnapshotGrid } from "../snapshot/useSnapshotGrid";

// ag-grid 기본 css import
import "ag-grid-community/styles/ag-grid.css";

// ag-grid alpine theme css import
import "ag-grid-community/styles/ag-theme-alpine.css";

// 스냅샷 그리드 페이지 컴포넌트
export default function SnapshotGridPage() {
  // ag-grid api에 접근하기 위한 ref
  const gridRef = useRef(null);

  // 스냅샷 그리드 상태와 이벤트 함수들을 custom hook에서 가져옴
  const {
    // 현재 활성화된 상위 탭 id
    activeTabId,

    // 현재 활성화된 상위 탭 상태
    activeTabState,

    // 현재 활성화된 snapshot 객체
    activeSnapshot,

    // 상위 탭 변경 함수
    setActiveTabId,

    // 조회조건 변경 함수
    handleConditionChange,

    // 조회조건기억 체크박스 변경 함수
    handleRememberChange,

    // snapshot 관련 옵션 변경 함수
    handleSnapshotOptionChange,

    // 공통 버튼 액션 처리 함수
    handleAction,

    // snapshot 탭 클릭 함수
    handleSnapshotClick,

    // snapshot 탭 삭제 함수
    handleDeleteSnapshot,

    // grid 신규 행 추가 함수
    handleAddRow,

    // grid 선택 행 삭제 함수
    handleDeleteSelectedRows,

    // grid 셀 값 변경 함수
    handleCellValueChanged,
  } = useSnapshotGrid(gridRef);

  // ag-grid 기본 컬럼 옵션
  const defaultColDef = useMemo(
    // 컬럼 기본 설정 객체 반환
    () => ({
      // 정렬 가능
      sortable: true,

      // 컬럼 사이즈 조절 가능
      resizable: true,

      // 컬럼 필터 사용 가능
      filter: true,

      // 기본적으로 셀 수정 가능
      editable: true,
    }),

    // 최초 렌더링 시 한 번만 생성
    [],
  );

  // 현재 활성 탭에 맞는 조회조건 설정 조회
  const conditionConfig = getConditionConfig(activeTabId);

  // 화면 렌더링
  return (
    // 기존 공통 PageContainer 사용
    <PageContainer
      // 화면 제목
      title="스냅샷 그리드"
      // 화면 설명
      description="탭 + 스냅샷 + ag-grid 상태 분리 관리"
      // 우측 상단 공통 버튼 영역
      actions={
        // 조회/저장 공통 버튼 사용
        <CommonActionButtons
          // 조회, 저장 버튼 표시
          buttons={["search", "save"]}
          // 버튼 클릭 시 custom hook의 handleAction 실행
          onAction={handleAction}
        />
      }
    >
      {/* 전체 페이지 wrapper */}
      <div className="snapshot-page">
        {/* 조회조건 영역 */}
        <div className="snapshot-search-card">
          {/* 조회조건 grid layout */}
          <div className="snapshot-condition-grid">
            {/* 현재 탭의 조회조건 설정을 순회하면서 입력 컴포넌트 생성 */}
            {conditionConfig.map((item) => (
              // 조회조건 타입별 field 렌더링
              <ConditionField
                // React 반복 렌더링 key
                key={item.name}
                // 조회조건 설정 객체
                item={item}
                // 현재 조회조건 값
                value={activeTabState.searchForm[item.name]}
                // 조회조건 변경 함수
                onChange={handleConditionChange}
              />
            ))}

            {/* 조회조건 기억 체크박스 */}
            <label className="snapshot-check-label">
              {/* 체크박스 input */}
              <input
                // checkbox 타입
                type="checkbox"
                // 현재 탭의 조회조건 기억 여부
                checked={activeTabState.rememberCondition}
                // 변경 시 조회조건 기억 상태 변경
                onChange={(e) => handleRememberChange(e.target.checked)}
              />
              {/* 체크박스 라벨 */}
              조회조건기억
            </label>

            {/* 그리드 스냅샷 체크박스 */}
            <label className="snapshot-check-label">
              {/* 체크박스 input */}
              <input
                // checkbox 타입
                type="checkbox"
                // 현재 탭의 snapshot 사용 여부
                checked={activeTabState.snapshotEnabled}
                // 변경 시 snapshotEnabled 값 변경
                onChange={(e) =>
                  handleSnapshotOptionChange(
                    // 변경할 상태 필드명
                    "snapshotEnabled",

                    // 체크 여부
                    e.target.checked,
                  )
                }
              />
              {/* 체크박스 라벨 */}
              그리드 스냅샷
            </label>

            {/* snapshot 제목 입력 input */}
            <input
              // snapshot title 전용 class
              className="snapshot-title-input"
              // 현재 입력된 snapshot 제목
              value={activeTabState.snapshotTitle}
              // 입력값 변경 시 snapshotTitle 상태 변경
              onChange={(e) =>
                handleSnapshotOptionChange("snapshotTitle", e.target.value)
              }
              // placeholder 문구
              placeholder="입력하세요"
            />
          </div>
        </div>

        {/* 상위 메인 탭 영역 */}
        <div className="snapshot-main-tab-row">
          {/* 상위 탭 목록 반복 렌더링 */}
          {BIG_TABS.map((tab) => (
            // 상위 탭 버튼
            <button
              // React 반복 렌더링 key
              key={tab.id}
              // 현재 활성 탭이면 active class 부여
              className={`snapshot-main-tab ${
                activeTabId === tab.id ? "active" : ""
              }`}
              // 클릭 시 활성 탭 변경
              onClick={() => setActiveTabId(tab.id)}
            >
              {/* 탭 표시명 */}
              {tab.label}
            </button>
          ))}
        </div>

        {/* grid 전체 카드 영역 */}
        <div className="snapshot-grid-card">
          {/* grid 상단 toolbar */}
          <div className="snapshot-grid-toolbar">
            {/* 현재 탭 / snapshot 표시 영역 */}
            <div>
              {/* 현재 탭 라벨 */}
              <strong>현재 탭:</strong> {activeTabId}
              {/* 구분 문자열 */}
              {" / "}
              {/* 현재 snapshot title */}
              <strong>스냅샷:</strong> {activeSnapshot?.title}
            </div>

            {/* grid 버튼 영역 */}
            <div className="snapshot-grid-buttons">
              {/* 신규 행 추가 버튼 */}
              <button className="secondary-btn" onClick={handleAddRow}>
                행 추가
              </button>

              {/* 선택 행 삭제 버튼 */}
              <button className="danger-btn" onClick={handleDeleteSelectedRows}>
                선택 삭제
              </button>
            </div>
          </div>

          {/* ag-grid theme wrapper */}
          <div className="ag-theme-alpine snapshot-grid">
            {/* ag-grid 컴포넌트 */}
            <AgGridReact
              // grid api 접근용 ref 연결
              ref={gridRef}
              // 현재 snapshot의 rowData를 grid에 표시
              rowData={activeSnapshot?.rowData ?? []}
              // 컬럼 정의
              columnDefs={SNAPSHOT_GRID_COLUMN_DEFS}
              // 기본 컬럼 옵션
              defaultColDef={defaultColDef}
              // 여러 행 선택 가능
              rowSelection="multiple"
              // 행 클릭만으로 선택되지 않게 설정
              suppressRowClickSelection={true}
              // row 고유 id 지정
              getRowId={(params) => params.data.rowId}
              // 셀 값 변경 시 실행
              onCellValueChanged={handleCellValueChanged}
              // rowStatus에 따라 row class 지정
              getRowClass={(params) => {
                // 신규 행이면 생성 스타일 class 반환
                if (params.data?.rowStatus === "C") return "grid-row-created";

                // 수정 행이면 수정 스타일 class 반환
                if (params.data?.rowStatus === "U") return "grid-row-updated";

                // 삭제 행이면 삭제 스타일 class 반환
                if (params.data?.rowStatus === "D") return "grid-row-deleted";

                // 그 외에는 별도 class 없음
                return "";
              }}
            />
          </div>

          {/* 하단 스냅샷 탭 영역 */}
          <div className="snapshot-sub-tab-row">
            {/* 현재 탭의 snapshot 순서 목록 반복 */}
            {activeTabState.snapshotOrder.map((snapshotId) => {
              // snapshotId로 실제 snapshot 객체 조회
              const snapshot = activeTabState.snapshots[snapshotId];

              // snapshot 탭 JSX 반환
              return (
                // snapshot 탭 wrapper
                <div
                  // React 반복 렌더링 key
                  key={snapshotId}
                  // 현재 활성 snapshot이면 active class 부여
                  className={`snapshot-sub-tab ${
                    activeTabState.activeSnapshotId === snapshotId
                      ? "active"
                      : ""
                  }`}
                  // 클릭 시 해당 snapshot 활성화
                  onClick={() => handleSnapshotClick(snapshotId)}
                >
                  {/* snapshot 제목 표시 */}
                  <span>{snapshot.title}</span>

                  {/* 기본 snapshot이 아니면 삭제 버튼 표시 */}
                  {!snapshot.base && (
                    // snapshot 삭제 버튼
                    <button
                      // 삭제 버튼 class
                      className="snapshot-sub-tab-close"
                      // 삭제 버튼 클릭 이벤트
                      onClick={(e) => {
                        // 부모 div의 snapshot 클릭 이벤트 전파 방지
                        e.stopPropagation();

                        // snapshot 삭제 처리
                        handleDeleteSnapshot(snapshotId);
                      }}
                    >
                      {/* 삭제 아이콘 문자 */}×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* 등록/수정/삭제 카운트 표시 영역 */}
          <div className="snapshot-status-bar">
            {/* 현재 snapshot의 등록 행 수 */}
            <span>등록: {activeSnapshot?.createdRows.length ?? 0}</span>

            {/* 현재 snapshot의 수정 행 수 */}
            <span>수정: {activeSnapshot?.updatedRows.length ?? 0}</span>

            {/* 현재 snapshot의 삭제 행 수 */}
            <span>삭제: {activeSnapshot?.deletedRows.length ?? 0}</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

// 조회조건 필드 렌더링 컴포넌트
function ConditionField({ item, value, onChange }) {
  // 조회조건 타입이 select인 경우
  if (item.type === "select") {
    // select field 반환
    return (
      // 조회조건 item wrapper
      <div className="snapshot-condition-item">
        {/* field label */}
        <label>{item.label}</label>

        {/* select box */}
        <select
          // 현재 선택값
          value={value}
          // 선택값 변경 시 부모로 name/value 전달
          onChange={(e) => onChange(item.name, e.target.value)}
        >
          {/* select option 반복 렌더링 */}
          {item.options.map((option) => (
            // option 태그
            <option
              // React 반복 렌더링 key
              key={option.value}
              // option 실제 값
              value={option.value}
            >
              {/* option 표시명 */}
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // 조회조건 타입이 checkbox인 경우
  if (item.type === "checkbox") {
    // checkbox field 반환
    return (
      // checkbox label wrapper
      <label className="snapshot-check-label">
        {/* checkbox input */}
        <input
          // checkbox 타입
          type="checkbox"
          // 현재 체크 상태
          checked={value}
          // 체크 변경 시 부모로 name/checked 전달
          onChange={(e) => onChange(item.name, e.target.checked)}
        />

        {/* checkbox 표시명 */}
        {item.label}
      </label>
    );
  }

  // 조회조건 타입이 radio인 경우
  if (item.type === "radio") {
    // radio group 반환
    return (
      // 조회조건 item wrapper
      <div className="snapshot-condition-item">
        {/* radio group label */}
        <label>{item.label}</label>

        {/* radio group wrapper */}
        <div className="snapshot-radio-group">
          {/* radio option 반복 렌더링 */}
          {item.options.map((option) => (
            // 개별 radio label
            <label key={option.value}>
              {/* radio input */}
              <input
                // radio 타입
                type="radio"
                // 같은 name을 써야 하나의 그룹으로 동작
                name={item.name}
                // radio 실제 값
                value={option.value}
                // 현재 값과 option 값이 같으면 체크
                checked={value === option.value}
                // 변경 시 부모로 name/value 전달
                onChange={(e) => onChange(item.name, e.target.value)}
              />

              {/* radio 표시명 */}
              {option.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  // 위 타입이 아니면 기본 input/date 타입으로 처리
  return (
    // 조회조건 item wrapper
    <div className="snapshot-condition-item">
      {/* input label */}
      <label>{item.label}</label>

      {/* input field */}
      <input
        // input 타입
        // item.type이 input이면 text처럼 동작하고 date면 날짜 input으로 동작
        type={item.type}
        // 현재 값
        value={value}
        // 값 변경 시 부모로 name/value 전달
        onChange={(e) => onChange(item.name, e.target.value)}
        // placeholder 문구
        placeholder={item.placeholder}
      />
    </div>
  );
}
