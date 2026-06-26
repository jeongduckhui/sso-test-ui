import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "../styles/ReverseLHeaderGridPage.css";

/**
 * 조회범위 체크박스 옵션.
 */
const PERIOD_OPTIONS = [
  { value: "month", label: "월" },
  { value: "quarter", label: "분기" },
  { value: "half", label: "반기" },
  { value: "year", label: "연간" },
];

/**
 * 조회범위별 마지막 자식 컬럼 정의.
 */
const PERIOD_COLUMN_MAP = {
  month: [
    { id: "m01", label: "1월" },
    { id: "m02", label: "2월" },
    { id: "m03", label: "3월" },
    { id: "m04", label: "4월" },
    { id: "m05", label: "5월" },
    { id: "m06", label: "6월" },
    { id: "m07", label: "7월" },
    { id: "m08", label: "8월" },
    { id: "m09", label: "9월" },
    { id: "m10", label: "10월" },
    { id: "m11", label: "11월" },
    { id: "m12", label: "12월" },
  ],
  quarter: [
    { id: "q1", label: "1Q" },
    { id: "q2", label: "2Q" },
    { id: "q3", label: "3Q" },
    { id: "q4", label: "4Q" },
  ],
  half: [
    { id: "h1", label: "상반기" },
    { id: "h2", label: "하반기" },
  ],
  year: [{ id: "y", label: "연간" }],
};

/**
 * 최초 체크 조회범위.
 */
const DEFAULT_CHECKED_PERIODS = ["half", "year"];

/**
 * 선택된 조회범위 기준 마지막 자식 컬럼 목록 반환.
 */
function getSelectedPeriods(checkedPeriodTypes) {
  return checkedPeriodTypes.flatMap(
    (periodType) => PERIOD_COLUMN_MAP[periodType] ?? [],
  );
}

/**
 * 마지막 depth에 표시될 실제 데이터 컬럼 생성.
 *
 * leafHeaderClass를 함께 지정해야 연간/상반기/하반기 같은 마지막 자식 컬럼도
 * 부모 헤더와 동일한 배경색으로 표시된다.
 */
function createPeriodColumns(columnKey, selectedPeriods, leafHeaderClass) {
  return selectedPeriods.map((period) => ({
    headerName: period.label,
    field: `${columnKey}_${period.id}`,
    width: 120,
    editable: true,
    type: "numericColumn",
    headerClass: leafHeaderClass,
    cellClass: "reverse-l-body-cell",
    valueFormatter: (params) => {
      if (params.value === null || params.value === undefined) {
        return "";
      }

      return Number(params.value).toLocaleString();
    },
  }));
}

/**
 * 마지막 자식 컬럼이 항상 맨 아래 1칸에만 위치하도록 빈 그룹 헤더 생성.
 *
 * AG Grid는 그룹 depth가 서로 다르면 leaf 컬럼 헤더를 자동으로 늘려서 맞춘다.
 * 그래서 Col A 바로 아래에 "연간" leaf 컬럼을 넣으면 연간 헤더가 세로로 커진다.
 *
 * 이를 방지하기 위해 빈 그룹을 끼워 넣고,
 * 실제 기간 컬럼은 항상 마지막 header row에만 배치한다.
 */
function createPaddingGroup(headerClass, paddingDepth, children) {
  let nextChildren = children;

  for (let i = 0; i < paddingDepth; i += 1) {
    nextChildren = [
      {
        headerName: "",
        marryChildren: true,
        headerClass,
        children: nextChildren,
      },
    ];
  }

  return nextChildren[0];
}

/**
 * 역 ㄱ자 형태의 비정형 그룹 헤더 생성.
 *
 * 화면 구조:
 *
 * Col A
 * ├─ 빈 그룹
 * │  └─ 빈 그룹
 * │     └─ 기간 컬럼
 * └─ Col B
 *    ├─ 빈 그룹
 *    │  └─ 기간 컬럼
 *    ├─ Col C
 *    │  └─ 기간 컬럼
 *    └─ Col D
 *       └─ 기간 컬럼
 */
function createReverseLColumnDefs(checkedPeriodTypes) {
  const selectedPeriods = getSelectedPeriods(checkedPeriodTypes);

  return [
    {
      headerName: "Col A",
      marryChildren: true,
      headerClass: "reverse-l-header-a",
      children: [
        createPaddingGroup(
          "reverse-l-header-a",
          2,
          createPeriodColumns("colA", selectedPeriods, "reverse-l-header-a"),
        ),
        {
          headerName: "Col B",
          marryChildren: true,
          headerClass: "reverse-l-header-b",
          children: [
            createPaddingGroup(
              "reverse-l-header-b",
              1,
              createPeriodColumns(
                "colB",
                selectedPeriods,
                "reverse-l-header-b",
              ),
            ),
            {
              headerName: "Col C",
              marryChildren: true,
              headerClass: "reverse-l-header-c",
              children: createPeriodColumns(
                "colC",
                selectedPeriods,
                "reverse-l-header-c",
              ),
            },
            {
              headerName: "Col D",
              marryChildren: true,
              headerClass: "reverse-l-header-d",
              children: createPeriodColumns(
                "colD",
                selectedPeriods,
                "reverse-l-header-d",
              ),
            },
          ],
        },
      ],
    },
  ];
}

/**
 * 더미 rowData 생성.
 */
function createDummyRowData() {
  return Array.from({ length: 10 }, (_, rowIndex) => {
    const row = {
      id: rowIndex + 1,
    };

    const columnKeys = ["colA", "colB", "colC", "colD"];
    const allPeriods = Object.values(PERIOD_COLUMN_MAP).flat();

    columnKeys.forEach((columnKey, columnIndex) => {
      allPeriods.forEach((period, periodIndex) => {
        row[`${columnKey}_${period.id}`] =
          (rowIndex + 1) * 100 + columnIndex * 10 + periodIndex + 8;
      });
    });

    return row;
  });
}

/**
 * AG Grid 역 ㄱ자 동적 헤더 예제 화면.
 */
export default function ReverseLHeaderGridPage() {
  const [checkedPeriodTypes, setCheckedPeriodTypes] = useState(
    DEFAULT_CHECKED_PERIODS,
  );

  const [searchedPeriodTypes, setSearchedPeriodTypes] = useState(
    DEFAULT_CHECKED_PERIODS,
  );

  const columnDefs = useMemo(
    () => createReverseLColumnDefs(searchedPeriodTypes),
    [searchedPeriodTypes],
  );

  console.log("################3 columnDefs: ", columnDefs);

  const rowData = useMemo(() => createDummyRowData(), []);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: false,
      filter: false,
      suppressMovable: true,
    }),
    [],
  );

  /**
   * 조회범위 체크 변경 처리.
   */
  const handlePeriodChange = (periodType, checked) => {
    setCheckedPeriodTypes((prev) => {
      if (checked) {
        return [...prev, periodType];
      }

      return prev.filter((item) => item !== periodType);
    });
  };

  /**
   * 조회 처리.
   */
  const handleSearch = () => {
    if (checkedPeriodTypes.length === 0) {
      alert("조회범위를 1개 이상 선택하세요.");
      return;
    }

    setSearchedPeriodTypes(checkedPeriodTypes);
  };

  return (
    <div className="reverse-l-page">
      <h2>AG Grid 역 ㄱ자 동적 헤더 예제</h2>

      <div className="reverse-l-search-box">
        <strong>조회범위</strong>

        {PERIOD_OPTIONS.map((option) => (
          <label key={option.value} className="reverse-l-checkbox-label">
            <input
              type="checkbox"
              checked={checkedPeriodTypes.includes(option.value)}
              onChange={(event) =>
                handlePeriodChange(option.value, event.target.checked)
              }
            />
            {option.label}
          </label>
        ))}

        <button
          type="button"
          className="reverse-l-search-button"
          onClick={handleSearch}
        >
          조회
        </button>
      </div>

      <div className="reverse-l-grid-wrap">
        <div className="ag-theme-quartz reverse-l-grid">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={34}
            headerHeight={36}
            groupHeaderHeight={36}
            suppressColumnMoveAnimation
          />
        </div>
      </div>
    </div>
  );
}
