import React from "react";
import { setCurrentTxLog } from "../../txlog/txLogContext";

/**
 * DB 기반 공통 버튼
 *
 * props:
 * - buttons: [{ type: "SEARCH", useYn: "Y" }]
 * - svcId: 서비스 ID (화면별)
 * - onAction
 */
export default function CommonActionButtonsDBSetting({
  buttons = [],
  svcId = "COMMON",
  onAction,
}) {
  /**
   * 버튼 클릭
   */
  const handleClick = (type) => {
    const loggable = type === "SEARCH" || type === "SAVE";

    setCurrentTxLog({
      svcId,
      transactionType: type,
      loggable,
    });

    if (onAction) {
      onAction(type);
    }
  };

  /**
   * 버튼 렌더링
   */
  const renderButton = (btn) => {
    if (btn.useYn !== "Y") return null;

    switch (btn.type) {
      case "SEARCH":
        return (
          <button key="SEARCH" onClick={() => handleClick("SEARCH")}>
            조회
          </button>
        );

      case "SAVE":
        return (
          <button key="SAVE" onClick={() => handleClick("SAVE")}>
            저장
          </button>
        );

      case "OPTION":
        return (
          <button key="OPTION" onClick={() => handleClick("OPTION")}>
            옵션
          </button>
        );

      case "RESET":
        return (
          <button key="RESET" onClick={() => handleClick("RESET")}>
            초기화
          </button>
        );

      default:
        return null;
    }
  };

  return <>{buttons.map(renderButton)}</>;
}
