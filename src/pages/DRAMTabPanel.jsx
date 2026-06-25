import MultiTabDimensionGridPanelVer2 from "./MultiTabDimensionGridPanelVer2";

const DRAM_TAB_KEY = "1";
const DRAM_TAB_NAME = "DRAM";

export default function DRAMTabPanel({
  isActive,
  loginUserId,
  commonSelectValue,
  commonSelectOptions,
  tabState,
  updateTabState,
}) {
  return (
    <MultiTabDimensionGridPanelVer2
      activeTabKey={DRAM_TAB_KEY}
      activeTabName={DRAM_TAB_NAME}
      isActive={isActive}
      loginUserId={loginUserId}
      commonSelectValue={commonSelectValue}
      commonSelectOptions={commonSelectOptions}
      tabState={tabState}
      updateTabState={updateTabState}
    />
  );
}
