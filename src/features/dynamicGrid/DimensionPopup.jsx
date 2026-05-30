// src/features/dynamicGrid/DimensionPopup.jsx

import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_SELECTED_DIMENSIONS,
  DIMENSION_OPTIONS,
} from "./dimensionOptions";

/**
 * Dimension 선택 팝업.
 *
 * <p>
 * 좌측 목록에서 선택 가능한 Dimension을 보여주고,
 * 우측 목록에서 실제 Grid에 표시할 Dimension과 순서를 관리한다.
 * </p>
 *
 * 기능:
 * 1. 좌측 → 우측 이동
 * 2. 우측 → 좌측 이동
 * 3. 우측 선택 항목 위/아래 이동
 * 4. Default 복원
 * 5. Apply
 * 6. OK
 * 7. Cancel
 *
 * @param {object} props props
 * @param {boolean} props.open 팝업 열림 여부
 * @param {Array<string>} props.selectedDimensionIds 현재 선택된 Dimension id 목록
 * @param {Function} props.onApply 적용 콜백
 * @param {Function} props.onClose 닫기 콜백
 */
export default function DimensionPopup({
  open,
  selectedDimensionIds = DEFAULT_SELECTED_DIMENSIONS,
  onApply,
  onClose,
}) {
  // 팝업 내부 임시 선택 Dimension 목록이다.
  const [draftSelectedIds, setDraftSelectedIds] =
    useState(selectedDimensionIds);

  // 좌측 목록에서 선택한 Dimension id.
  const [leftActiveId, setLeftActiveId] = useState(null);

  // 우측 목록에서 선택한 Dimension id.
  const [rightActiveId, setRightActiveId] = useState(null);

  /**
   * 팝업이 열릴 때마다 외부 선택값을 내부 draft로 복사한다.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftSelectedIds(selectedDimensionIds);
    setLeftActiveId(null);
    setRightActiveId(null);
  }, [open, selectedDimensionIds]);

  /**
   * 좌측 선택 가능 목록.
   *
   * 현재 우측에 선택되지 않은 Dimension만 보여준다.
   */
  const availableOptions = useMemo(() => {
    return DIMENSION_OPTIONS.filter(
      (option) => !draftSelectedIds.includes(option.id),
    );
  }, [draftSelectedIds]);

  /**
   * 우측 선택 목록.
   *
   * draftSelectedIds 순서대로 Dimension option을 구성한다.
   */
  const selectedOptions = useMemo(() => {
    return draftSelectedIds
      .map((id) => DIMENSION_OPTIONS.find((option) => option.id === id))
      .filter(Boolean);
  }, [draftSelectedIds]);

  /**
   * 팝업이 닫힌 상태면 렌더링하지 않는다.
   */
  if (!open) {
    return null;
  }

  /**
   * 좌측 선택 항목을 우측으로 이동한다.
   */
  function handleMoveRight() {
    if (!leftActiveId) {
      return;
    }

    if (draftSelectedIds.includes(leftActiveId)) {
      return;
    }

    setDraftSelectedIds((prev) => [...prev, leftActiveId]);
    setLeftActiveId(null);
  }

  /**
   * 우측 선택 항목을 좌측으로 이동한다.
   */
  function handleMoveLeft() {
    if (!rightActiveId) {
      return;
    }

    setDraftSelectedIds((prev) => prev.filter((id) => id !== rightActiveId));
    setRightActiveId(null);
  }

  /**
   * 우측 선택 항목을 위로 이동한다.
   */
  function handleMoveUp() {
    if (!rightActiveId) {
      return;
    }

    setDraftSelectedIds((prev) => {
      const index = prev.indexOf(rightActiveId);

      if (index <= 0) {
        return prev;
      }

      const next = [...prev];
      const temp = next[index - 1];

      next[index - 1] = next[index];
      next[index] = temp;

      return next;
    });
  }

  /**
   * 우측 선택 항목을 아래로 이동한다.
   */
  function handleMoveDown() {
    if (!rightActiveId) {
      return;
    }

    setDraftSelectedIds((prev) => {
      const index = prev.indexOf(rightActiveId);

      if (index < 0 || index >= prev.length - 1) {
        return prev;
      }

      const next = [...prev];
      const temp = next[index + 1];

      next[index + 1] = next[index];
      next[index] = temp;

      return next;
    });
  }

  /**
   * 기본 Dimension 선택값으로 복원한다.
   */
  function handleDefault() {
    setDraftSelectedIds(DEFAULT_SELECTED_DIMENSIONS);
    setLeftActiveId(null);
    setRightActiveId(null);
  }

  /**
   * 변경사항을 외부에 적용한다.
   */
  function handleApply() {
    if (typeof onApply === "function") {
      onApply(draftSelectedIds);
    }
  }

  /**
   * 변경사항을 적용하고 팝업을 닫는다.
   */
  function handleOk() {
    handleApply();

    if (typeof onClose === "function") {
      onClose();
    }
  }

  /**
   * 변경사항을 버리고 팝업을 닫는다.
   */
  function handleCancel() {
    setDraftSelectedIds(selectedDimensionIds);

    if (typeof onClose === "function") {
      onClose();
    }
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.popup}>
        <div style={styles.header}>
          <div style={styles.title}>Dimension Selection</div>

          <button
            type="button"
            onClick={handleCancel}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Available</div>

            <div style={styles.listBox}>
              {availableOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setLeftActiveId(option.id)}
                  onDoubleClick={handleMoveRight}
                  style={{
                    ...styles.listItem,
                    ...(leftActiveId === option.id
                      ? styles.activeListItem
                      : {}),
                  }}
                >
                  {option.label}
                </button>
              ))}

              {availableOptions.length === 0 && (
                <div style={styles.emptyText}>선택 가능한 항목이 없습니다.</div>
              )}
            </div>
          </div>

          <div style={styles.centerButtons}>
            <button
              type="button"
              onClick={handleMoveRight}
              disabled={!leftActiveId}
              style={styles.moveButton}
            >
              →
            </button>

            <button
              type="button"
              onClick={handleMoveLeft}
              disabled={!rightActiveId}
              style={styles.moveButton}
            >
              ←
            </button>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Selected</div>

            <div style={styles.selectedPanelContent}>
              <div style={styles.listBox}>
                {selectedOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRightActiveId(option.id)}
                    onDoubleClick={handleMoveLeft}
                    style={{
                      ...styles.listItem,
                      ...(rightActiveId === option.id
                        ? styles.activeListItem
                        : {}),
                    }}
                  >
                    {option.label}
                  </button>
                ))}

                {selectedOptions.length === 0 && (
                  <div style={styles.emptyText}>선택된 항목이 없습니다.</div>
                )}
              </div>

              <div style={styles.orderButtons}>
                <button
                  type="button"
                  onClick={handleMoveUp}
                  disabled={!rightActiveId}
                  style={styles.orderButton}
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={handleMoveDown}
                  disabled={!rightActiveId}
                  style={styles.orderButton}
                >
                  ↓
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={handleDefault}
            style={styles.footerButton}
          >
            Default
          </button>

          <div style={styles.footerRight}>
            <button
              type="button"
              onClick={handleApply}
              style={styles.footerButton}
            >
              Apply
            </button>

            <button
              type="button"
              onClick={handleOk}
              style={styles.primaryButton}
            >
              OK
            </button>

            <button
              type="button"
              onClick={handleCancel}
              style={styles.footerButton}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 임시 인라인 스타일.
 *
 * 실무에서는 CSS Module 또는 공통 스타일 파일로 분리하면 된다.
 */
const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  popup: {
    width: "720px",
    background: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
  },
  header: {
    height: "48px",
    padding: "0 16px",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "16px",
    fontWeight: 700,
  },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "24px",
    cursor: "pointer",
  },
  body: {
    display: "grid",
    gridTemplateColumns: "1fr 80px 1fr",
    gap: "12px",
    padding: "16px",
  },
  panel: {
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    overflow: "hidden",
  },
  panelTitle: {
    padding: "8px 10px",
    background: "#f5f5f5",
    borderBottom: "1px solid #d0d0d0",
    fontWeight: 700,
    fontSize: "13px",
  },
  listBox: {
    height: "280px",
    padding: "8px",
    overflowY: "auto",
  },
  listItem: {
    width: "100%",
    display: "block",
    padding: "8px 10px",
    marginBottom: "4px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    background: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
  },
  activeListItem: {
    background: "#e3f2fd",
    borderColor: "#2196f3",
    fontWeight: 700,
  },
  emptyText: {
    padding: "16px 8px",
    color: "#888",
    fontSize: "13px",
    textAlign: "center",
  },
  centerButtons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  moveButton: {
    width: "48px",
    height: "36px",
    border: "1px solid #bdbdbd",
    borderRadius: "4px",
    background: "#ffffff",
    cursor: "pointer",
  },
  selectedPanelContent: {
    display: "grid",
    gridTemplateColumns: "1fr 48px",
  },
  orderButtons: {
    borderLeft: "1px solid #e0e0e0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  orderButton: {
    width: "32px",
    height: "32px",
    border: "1px solid #bdbdbd",
    borderRadius: "4px",
    background: "#ffffff",
    cursor: "pointer",
  },
  footer: {
    height: "56px",
    padding: "0 16px",
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  footerButton: {
    padding: "7px 14px",
    border: "1px solid #bdbdbd",
    borderRadius: "4px",
    background: "#ffffff",
    cursor: "pointer",
  },
  primaryButton: {
    padding: "7px 14px",
    border: "1px solid #1976d2",
    borderRadius: "4px",
    background: "#1976d2",
    color: "#ffffff",
    cursor: "pointer",
  },
};
