// React Hook을 import한다.
import { useCallback, useState } from "react";

// DRAM/NAND 탭 안에서 공통으로 사용하는 그리드 화면을 import한다.
import MultiTabDimensionGridPanel, {
  createInitialTabState,
} from "./MultiTabDimensionGridPanel";

// ============================================================
// MultiTabSplitDimensionPage
// ============================================================
// 기존 MultiTabDimensionTemplatePage는 그대로 보관한다.
// 이 파일은 탭 화면을 분리한 최종 버전이다.
//
// 핵심 구조
// 1. 탭 key는 실제 차세대처럼 "1", "2"를 사용한다.
// 2. DRAM / NAND 탭 모두 같은 Grid Panel 파일을 사용한다.
// 3. 조회조건, 조회결과, 컬럼정보, 옵션정보는 부모의 tabStates에서 탭별로 관리한다.
// 4. Grid Panel 내부에는 searchForm/rowData/columnDefs 상태를 두지 않는다.
// 5. 탭을 이동해도 부모 tabStates에 저장된 상태를 다시 전달하므로 조회조건과 그리드가 유지된다.
// ============================================================

/*
<Tabs.TabPane key="1" tab="DRAM">
    <SampleGridPage
        tabKey="1"
        tabName="DRAM"
        tabState={tabStates["1"]}
        updateTabState={updateTabState}
    />
</Tabs.TabPane>

<Tabs.TabPane key="2" tab="NAND">
    <SampleGridPage
        tabKey="2"
        tabName="NAND"
        tabState={tabStates["2"]}
        updateTabState={updateTabState}
    />
</Tabs.TabPane>

<Tabs.TabPane key="1">
    <SampleGridPage
        commonCodes={commonCodes}
        loginUser={loginUser}
    />
</Tabs.TabPane>

<Tabs.TabPane key="2">
    <SampleGridPage
        commonCodes={commonCodes}
        loginUser={loginUser}
    />
</Tabs.TabPane>
*/

// 실제 차세대와 동일하게 key를 사용한다.
const TAB_KEYS = {
  DRAM: "1",
  NAND: "2",
};

// 탭 목록이다.
const TAB_ITEMS = [
  {
    key: TAB_KEYS.DRAM,
    label: "DRAM",
  },
  {
    key: TAB_KEYS.NAND,
    label: "NAND",
  },
];

// 탭별 초기 상태를 생성한다.
function createInitialTabStates() {
  return {
    [TAB_KEYS.DRAM]: createInitialTabState(),
    [TAB_KEYS.NAND]: createInitialTabState(),
  };
}

// 특정 탭 상태만 변경한다.
// updater는 객체 또는 함수 둘 다 받을 수 있다.
function updateTabStateByKey(tabStates, tabKey, updater) {
  const currentTabState = tabStates[tabKey];

  const nextTabState =
    typeof updater === "function"
      ? updater(currentTabState)
      : {
          ...currentTabState,
          ...updater,
        };

  return {
    ...tabStates,
    [tabKey]: nextTabState,
  };
}

export default function MultiTabSplitDimensionPage() {
  // 현재 활성 탭 key를 관리한다.
  const [activeTabKey, setActiveTabKey] = useState(TAB_KEYS.DRAM);

  // DRAM/NAND 탭별 상태를 부모에서 관리한다.
  // 이 상태 안에 각 탭의 searchForm, rowData, columnDefs, 옵션정보가 들어간다.
  const [tabStates, setTabStates] = useState(createInitialTabStates);

  // 현재 활성 탭 메타 정보를 계산한다.
  const activeTab =
    TAB_ITEMS.find((tab) => tab.key === activeTabKey) ?? TAB_ITEMS[0];

  // 현재 활성 탭의 상태를 계산한다.
  const activeTabState = tabStates[activeTab.key];

  // 특정 탭 상태를 갱신하는 함수이다.
  // useCallback으로 함수 참조를 고정해서 자식 useEffect가 무한 반복되지 않게 한다.
  const updateTabState = useCallback((tabKey, updater) => {
    setTabStates((prev) => updateTabStateByKey(prev, tabKey, updater));
  }, []);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Multi Tab Split Dimension Page</h2>

      <p style={styles.description}>
        DRAM/NAND 탭을 분리했지만 동일한 Grid Panel을 사용하고, 탭별 상태는
        부모의 tabStates에서 관리하는 최종 구조입니다.
      </p>

      {/* 탭 버튼 */}
      <div style={styles.tabPanel}>
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            style={{
              ...styles.tabButton,
              ...(activeTabKey === tab.key ? styles.activeTabButton : {}),
            }}
            onClick={() => setActiveTabKey(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 현재 탭 화면 */}
      {/* 상태는 부모 tabStates에 있으므로 현재 탭 컴포넌트만 렌더링해도 상태가 유지된다. */}
      <MultiTabDimensionGridPanel
        activeTabKey={activeTab.key}
        activeTabName={activeTab.label}
        isActive
        tabState={activeTabState}
        updateTabState={updateTabState}
      />
    </div>
  );
}

const styles = {
  page: {
    padding: 16,
  },

  title: {
    margin: "0 0 8px 0",
  },

  description: {
    margin: "0 0 12px 0",
    color: "#555",
    fontSize: 13,
  },

  tabPanel: {
    display: "flex",
    gap: 6,
    marginBottom: 12,
  },

  tabButton: {
    padding: "8px 16px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    borderRadius: 4,
  },

  activeTabButton: {
    background: "#111",
    color: "#fff",
    borderColor: "#111",
  },
};
