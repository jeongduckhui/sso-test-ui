/**
 * 전역 트랜잭션 로그 컨텍스트
 * 버튼 클릭 시 세팅되고, axios interceptor에서 읽는다
 */

let currentTxLog = null;

export function setCurrentTxLog(txLog) {
  currentTxLog = txLog;
}

export function getCurrentTxLog() {
  return currentTxLog;
}

export function clearCurrentTxLog() {
  currentTxLog = null;
}
