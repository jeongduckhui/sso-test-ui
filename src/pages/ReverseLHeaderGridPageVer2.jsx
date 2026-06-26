import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "../styles/ReverseLHeaderGridPageVer2.css";

/**
 * 이미 실무에서 만들어진 컬럼 정의 예시.
 *
 * 이 예제의 핵심은 이 revCols를 다시 생성하지 않고,
 * 이 배열을 받아서 역 ㄱ자 헤더 구조로 재조립하는 것이다.
 */
const revCols = [
  {
    headerName: "Col A",
    marryChildren: true,
    children: [
      {
        headerName: "연간",
        field: "yearA",
      },
      {
        headerName: "상반기",
        field: "half01A",
      },
      {
        headerName: "하반기",
        field: "half02A",
      },
    ],
  },
  {
    headerName: "Col B",
    marryChildren: true,
    children: [
      {
        headerName: "연간",
        field: "yearB",
      },
      {
        headerName: "상반기",
        field: "half01B",
      },
      {
        headerName: "하반기",
        field: "half02B",
      },
    ],
  },
  {
    headerName: "Col C",
    marryChildren: true,
    children: [
      {
        headerName: "연간",
        field: "yearC",
      },
      {
        headerName: "상반기",
        field: "half01C",
      },
      {
        headerName: "하반기",
        field: "half02C",
      },
    ],
  },
  {
    headerName: "Col D",
    marryChildren: true,
    children: [
      {
        headerName: "연간",
        field: "yearD",
      },
      {
        headerName: "상반기",
        field: "half01D",
      },
      {
        headerName: "하반기",
        field: "half02D",
      },
    ],
  },
];

/**
 * 부모 컬럼별 헤더 클래스 매핑.
 *
 * 실무에서는 headerName 대신 field group id, metric id 같은 안정적인 key로
 * 매핑하는 것이 더 안전하다.
 */
const HEADER_CLASS_MAP = {
  "Col A": "reverse-l-header-a",
  "Col B": "reverse-l-header-b",
  "Col C": "reverse-l-header-c",
  "Col D": "reverse-l-header-d",
};

/**
 * 마지막 자식 컬럼 공통 옵션 적용.
 *
 * 이미 만들어진 컬럼 객체를 직접 수정하지 않고,
 * spread로 복사한 뒤 필요한 옵션만 보강한다.
 */
function decorateLeafColumns(columns, headerClass) {
  return columns.map((column) => ({
    ...column,
    width: column.width ?? 120,
    editable: column.editable ?? true,
    type: column.type ?? "numericColumn",
    headerClass,
    cellClass: ["reverse-l-body-cell", column.cellClass]
      .filter(Boolean)
      .join(" "),
    valueFormatter:
      column.valueFormatter ??
      ((params) => {
        if (params.value === null || params.value === undefined) {
          return "";
        }

        return Number(params.value).toLocaleString();
      }),
  }));
}

/**
 * 마지막 자식 컬럼이 항상 맨 아래 1칸에만 위치하도록 빈 그룹 헤더 생성.
 *
 * 예)
 * paddingDepth = 2
 *
 * 빈 그룹
 * └─ 빈 그룹
 *    └─ 연간 / 상반기 / 하반기
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
 * headerName으로 컬럼 그룹 조회.
 */
function findColumnGroup(columns, headerName) {
  return columns.find((column) => column.headerName === headerName);
}

/**
 * revCols에 이미 정의된 자식 컬럼을 꺼내서 헤더 색상/공통 옵션을 적용한다.
 */
function getLeafColumnsFromRevCols(columns, headerName) {
  const group = findColumnGroup(columns, headerName);

  if (!group) {
    return [];
  }

  const headerClass = HEADER_CLASS_MAP[headerName];

  return decorateLeafColumns(group.children ?? [], headerClass);
}

/**
 * 이미 만들어진 revCols 배열을 역 ㄱ자 헤더 구조로 변환한다.
 *
 * 입력:
 * [
 *   { headerName: "Col A", children: [연간, 상반기, 하반기] },
 *   { headerName: "Col B", children: [연간, 상반기, 하반기] },
 *   { headerName: "Col C", children: [연간, 상반기, 하반기] },
 *   { headerName: "Col D", children: [연간, 상반기, 하반기] },
 * ]
 *
 * 출력:
 * Col A
 * ├─ 빈 A
 * │  └─ 빈 A
 * │     └─ Col A의 기존 자식 컬럼들
 * └─ Col B
 *    ├─ 빈 B
 *    │  └─ Col B의 기존 자식 컬럼들
 *    ├─ Col C
 *    │  └─ Col C의 기존 자식 컬럼들
 *    └─ Col D
 *       └─ Col D의 기존 자식 컬럼들
 */
function createReverseLColumnDefsFromRevCols(columns) {
  const colAChildren = getLeafColumnsFromRevCols(columns, "Col A");
  const colBChildren = getLeafColumnsFromRevCols(columns, "Col B");
  const colCChildren = getLeafColumnsFromRevCols(columns, "Col C");
  const colDChildren = getLeafColumnsFromRevCols(columns, "Col D");

  return [
    {
      headerName: "Col A",
      marryChildren: true,
      headerClass: "reverse-l-header-a",
      children: [
        createPaddingGroup("reverse-l-header-a", 2, colAChildren),
        {
          headerName: "Col B",
          marryChildren: true,
          headerClass: "reverse-l-header-b",
          children: [
            createPaddingGroup("reverse-l-header-b", 1, colBChildren),
            {
              headerName: "Col C",
              marryChildren: true,
              headerClass: "reverse-l-header-c",
              children: colCChildren,
            },
            {
              headerName: "Col D",
              marryChildren: true,
              headerClass: "reverse-l-header-d",
              children: colDChildren,
            },
          ],
        },
      ],
    },
  ];
}

/**
 * revCols에 들어있는 모든 leaf field 추출.
 */
function getAllLeafFields(columns) {
  return columns.flatMap((group) =>
    (group.children ?? []).map((child) => child.field).filter(Boolean),
  );
}

/**
 * 더미 rowData 생성.
 *
 * revCols의 field를 기준으로 데이터를 생성하므로,
 * 실무 컬럼명이 바뀌어도 더미 데이터가 자동으로 맞춰진다.
 */
function createDummyRowData(columns) {
  const fields = getAllLeafFields(columns);

  return Array.from({ length: 10 }, (_, rowIndex) => {
    const row = {
      id: rowIndex + 1,
    };

    fields.forEach((field, fieldIndex) => {
      row[field] = (rowIndex + 1) * 100 + fieldIndex + 8;
    });

    return row;
  });
}

/**
 * AG Grid 역 ㄱ자 헤더 예제 화면.
 *
 * Ver2는 자식 컬럼이 이미 만들어진 revCols를 입력으로 받아
 * 역 ㄱ자 부모 헤더 구조만 재조립하는 방식이다.
 */
export default function ReverseLHeaderGridPageVer2() {
  const columnDefs = useMemo(() => createReverseLColumnDefsFromRevCols(revCols), []);

  const rowData = useMemo(() => createDummyRowData(revCols), []);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: false,
      filter: false,
      suppressMovable: true,
    }),
    [],
  );

  return (
    <div className="reverse-l-page">
      <h2>AG Grid 역 ㄱ자 헤더 예제 Ver2</h2>

      <div className="reverse-l-desc-box">
        이미 만들어진 <strong>revCols</strong> 배열을 받아서 역 ㄱ자 헤더로
        재조립하는 예제입니다.
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
