import MultiTabDimensionGridPanelVer2 from "./MultiTabDimensionGridPanelVer2";

const NAND_TAB_KEY = "2";
const NAND_TAB_NAME = "NAND";

export default function NANDTabPanel({
  isActive,
  loginUserId,
  commonSelectValue,
  commonSelectOptions,
  tabState,
  updateTabState,
}) {
  return (
    <MultiTabDimensionGridPanelVer2
      activeTabKey={NAND_TAB_KEY}
      activeTabName={NAND_TAB_NAME}
      isActive={isActive}
      loginUserId={loginUserId}
      commonSelectValue={commonSelectValue}
      commonSelectOptions={commonSelectOptions}
      tabState={tabState}
      updateTabState={updateTabState}
    />
  );
}
