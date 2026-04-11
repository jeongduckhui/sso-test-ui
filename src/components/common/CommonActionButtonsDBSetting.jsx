import React from "react";
import { setCurrentTxLog } from "../../txlog/txLogContext";
import { getCurrentScreenContext } from "../../txlog/screenContext";

/**
 * 완전 자동 공통버튼
 * 👉 화면에서 props 필요 없음
 */
export default function CommonActionButtonsDBSetting({ onAction }) {
  const screenContext = getCurrentScreenContext();
  const buttons = screenContext?.buttons ?? [];
  const svcId = screenContext?.programId ?? "COMMON";

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
