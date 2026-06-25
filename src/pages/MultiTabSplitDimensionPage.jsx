import { useCallback, useState } from "react";

import DRAMTabPanel from "./DRAMTabPanel";
import NANDTabPanel from "./NANDTabPanel";
import { createInitialTabState } from "./MultiTabDimensionGridPanelVer2";

const TAB_KEYS = {
  DRAM: "1",
  NAND: "2",
};

const TAB_ITEMS = [
  { key: TAB_KEYS.DRAM, label: "DRAM" },
  { key: TAB_KEYS.NAND, label: "NAND" },
];

// 공통 셀렉트박스 옵션
const COMMON_SELECT_OPTIONS = [
  { value: "", label: "전체" },
  { value: "DOMESTIC", label: "국내" },
  { value: "OVERSEAS", label: "해외" },
];

function createInitialTabStates() {
  return {
    [TAB_KEYS.DRAM]: createInitialTabState(),
    [TAB_KEYS.NAND]: createInitialTabState(),
  };
}

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
  // 접속자ID는 공통 상태
  const [loginUserId] = useState("duckhui");

  // 모든 탭이 같이 쓰는 공통 셀렉트박스 값
  const [commonSelectValue, setCommonSelectValue] = useState("");

  // 현재 활성 탭
  const [activeTabKey, setActiveTabKey] = useState(TAB_KEYS.DRAM);

  // 탭별 상태
  const [tabStates, setTabStates] = useState(createInitialTabStates);

  const activeTab =
    TAB_ITEMS.find((tab) => tab.key === activeTabKey) ?? TAB_ITEMS[0];

  const updateTabState = useCallback((tabKey, updater) => {
    setTabStates((prev) => updateTabStateByKey(prev, tabKey, updater));
  }, []);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Multi Tab Split Dimension Page Ver2</h2>

      <p style={styles.description}>
        DRAM/NAND 탭 화면 파일은 분리하고, 실제 조회조건/그리드 공통 로직은
        MultiTabDimensionGridPanelVer2에서 관리합니다.
      </p>

      <div style={styles.commonBox}>
        <span>접속자ID: {loginUserId}</span>

        <label>
          공통 구분{" "}
          <select
            value={commonSelectValue}
            onChange={(event) => setCommonSelectValue(event.target.value)}
          >
            {COMMON_SELECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

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

      {activeTab.key === TAB_KEYS.DRAM && (
        <DRAMTabPanel
          isActive
          loginUserId={loginUserId}
          commonSelectValue={commonSelectValue}
          commonSelectOptions={COMMON_SELECT_OPTIONS}
          tabState={tabStates[TAB_KEYS.DRAM]}
          updateTabState={updateTabState}
        />
      )}

      {activeTab.key === TAB_KEYS.NAND && (
        <NANDTabPanel
          isActive
          loginUserId={loginUserId}
          commonSelectValue={commonSelectValue}
          commonSelectOptions={COMMON_SELECT_OPTIONS}
          tabState={tabStates[TAB_KEYS.NAND]}
          updateTabState={updateTabState}
        />
      )}
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

  commonBox: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    padding: "8px 10px",
    marginBottom: 12,
    border: "1px solid #ddd",
    borderRadius: 4,
    background: "#f7f7f7",
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
