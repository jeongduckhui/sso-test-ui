import React from "react";
import { setCurrentTxLog } from "../../txlog/txLogContext";

export default function CommonActionButtons({ buttons = [], onAction }) {
  const handleClick = (type) => {
    // ⭐ 로그 대상 여부 판단
    const loggable = type === "SEARCH" || type === "SAVE";

    setCurrentTxLog({
      svcId: "COMMON",
      transactionType: type,
      loggable, // ⭐ 핵심
    });

    if (onAction) {
      onAction(type);
    }
  };

  return (
    <>
      {buttons.includes("search") && (
        <button onClick={() => handleClick("SEARCH")}>조회</button>
      )}

      {buttons.includes("save") && (
        <button onClick={() => handleClick("SAVE")}>저장</button>
      )}

      {buttons.includes("option") && (
        <button onClick={() => handleClick("OPTION")}>옵션</button>
      )}

      {buttons.includes("reset") && (
        <button onClick={() => handleClick("RESET")}>초기화</button>
      )}
    </>
  );
}
