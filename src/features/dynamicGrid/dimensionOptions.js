// src/features/dynamicGrid/dimensionOptions.js

/**
 * 다이나믹 그리드에서 선택 가능한 Dimension 목록.
 *
 * <p>
 * Dimension 선택 팝업의 좌측 목록에 표시된다.
 * 사용자는 좌측 목록에서 우측 선택 목록으로 이동시켜 표시 순서를 결정한다.
 * </p>
 */
export const DIMENSION_OPTIONS = [
  {
    id: "QTY",
    label: "QTY",
    metricType: "QTY",
    dataType: "BIG_DECIMAL",
    exampleValue: "100",
  },
  {
    id: "ASP",
    label: "ASP",
    metricType: "ASP",
    dataType: "BIG_DECIMAL",
    exampleValue: "10.5",
  },
  {
    id: "AMT",
    label: "AMT",
    metricType: "AMT",
    dataType: "BIG_DECIMAL",
    exampleValue: "1000",
  },
  {
    id: "Quarter",
    label: "Quarter",
    metricType: "Quarter",
    dataType: "BIG_DECIMAL",
    exampleValue: "1",
  },
  {
    id: "Ratio",
    label: "Ratio",
    metricType: "Ratio",
    dataType: "BIG_DECIMAL",
    exampleValue: "50",
  },
];

/**
 * 기본 선택 Dimension.
 *
 * <p>
 * 화면 최초 진입 시 사용할 Dimension 목록이다.
 * 우측 선택 목록의 기본값으로 사용한다.
 * </p>
 */
export const DEFAULT_SELECTED_DIMENSIONS = ["QTY", "ASP", "AMT"];

/**
 * Dimension id로 Dimension option을 찾는다.
 *
 * @param {string} dimensionId Dimension id
 * @returns {object|null} Dimension option
 */
export function findDimensionOption(dimensionId) {
  return DIMENSION_OPTIONS.find((option) => option.id === dimensionId) ?? null;
}

/**
 * 선택된 Dimension id 목록을 option 목록으로 변환한다.
 *
 * @param {Array<string>} selectedDimensionIds 선택된 Dimension id 목록
 * @returns {Array<object>} 선택된 Dimension option 목록
 */
export function resolveSelectedDimensions(selectedDimensionIds) {
  if (!Array.isArray(selectedDimensionIds)) {
    return [];
  }

  return selectedDimensionIds
    .map((dimensionId) => findDimensionOption(dimensionId))
    .filter(Boolean);
}
