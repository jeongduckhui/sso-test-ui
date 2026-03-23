import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import api from "../api/axios";
import PageContainer from "../components/common/PageContainer";
import PagingNavigator from "../components/common/PagingNavigator";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

const DEFAULT_ROW_PER_PAGE = 10;

export default function PagingPage() {
  ModuleRegistry.registerModules([AllCommunityModule]);

  const [searchForm, setSearchForm] = useState({
    title: "",
    category: "",
    use_yn: "",
    all_view: false,
  });

  const [request, setRequest] = useState({
    title: "",
    category: "",
    use_yn: "",
    all_view: false,
    page_no: 1,
    row_per_page: DEFAULT_ROW_PER_PAGE,
  });

  const [rowData, setRowData] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page_no: 1,
    row_per_page: DEFAULT_ROW_PER_PAGE,
    tot_page: 0,
    tot_count: 0,
  });

  const [loading, setLoading] = useState(false);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "ID",
        field: "sampleId",
        width: 100,
      },
      {
        headerName: "제목",
        field: "title",
        flex: 1,
        minWidth: 220,
      },
      {
        headerName: "카테고리",
        field: "category",
        width: 140,
      },
      {
        headerName: "사용여부",
        field: "useYn",
        width: 120,
      },
      {
        headerName: "등록일시",
        field: "createdAt",
        width: 180,
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: false,
      resizable: true,
      filter: false,
    }),
    [],
  );

  const fetchPagingSamples = async (params) => {
    setLoading(true);
    try {
      const res = await api.get("/paging-samples", { params });

      setRowData(res.data.list || []);
      setPageInfo({
        page_no: res.data.page_no,
        row_per_page: res.data.row_per_page,
        tot_page: res.data.tot_page,
        tot_count: res.data.tot_count,
      });
    } catch (e) {
      console.error(e);
      alert("페이징 샘플 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagingSamples(request);
  }, [request]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSearchForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSearch = () => {
    setRequest({
      ...request,
      title: searchForm.title,
      category: searchForm.category,
      use_yn: searchForm.use_yn,
      all_view: searchForm.all_view,
      page_no: 1,
    });
  };

  const handleReset = () => {
    const resetForm = {
      title: "",
      category: "",
      use_yn: "",
      all_view: false,
    };

    setSearchForm(resetForm);
    setRequest({
      ...resetForm,
      page_no: 1,
      row_per_page: DEFAULT_ROW_PER_PAGE,
    });
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pageInfo.tot_page) return;

    setRequest((prev) => ({
      ...prev,
      page_no: nextPage,
    }));
  };

  const handleRowPerPageChange = (e) => {
    const nextSize = Number(e.target.value);

    setRequest((prev) => ({
      ...prev,
      row_per_page: nextSize,
      page_no: 1,
    }));
  };

  return (
    <PageContainer
      title="페이징 샘플"
      description="조회조건 + 전체 보기 + 서버 페이징을 테스트하는 화면"
    >
      <div className="table-card">
        <div className="search-form">
          <div className="search-row">
            <div className="search-item">
              <label>제목</label>
              <input
                type="text"
                name="title"
                value={searchForm.title}
                onChange={handleChange}
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="search-item">
              <label>카테고리</label>
              <select
                name="category"
                value={searchForm.category}
                onChange={handleChange}
              >
                <option value="">전체</option>
                <option value="FILE">FILE</option>
                <option value="MAIL">MAIL</option>
                <option value="CACHE">CACHE</option>
                <option value="PAGING">PAGING</option>
                <option value="USER">USER</option>
                <option value="AUTH">AUTH</option>
                <option value="BATCH">BATCH</option>
                <option value="SYSTEM">SYSTEM</option>
                <option value="LOG">LOG</option>
                <option value="COMMON">COMMON</option>
                <option value="TEST">TEST</option>
              </select>
            </div>

            <div className="search-item">
              <label>사용여부</label>
              <select
                name="use_yn"
                value={searchForm.use_yn}
                onChange={handleChange}
              >
                <option value="">전체</option>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </div>

            <div className="search-item checkbox-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="all_view"
                  checked={searchForm.all_view}
                  onChange={handleChange}
                />
                전체 보기
              </label>
            </div>
          </div>

          <div className="search-actions">
            <button className="primary-btn" onClick={handleSearch}>
              조회
            </button>
            <button className="secondary-btn" onClick={handleReset}>
              초기화
            </button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="paging-top-info">
          <div>
            전체 건수: <strong>{pageInfo.tot_count}</strong>
          </div>

          {!request.all_view && (
            <div className="row-per-page-box">
              <span>페이지당 건수</span>
              <select
                value={request.row_per_page}
                onChange={handleRowPerPageChange}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>
          )}
        </div>

        <div className="ag-theme-alpine paging-grid">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            overlayLoadingTemplate={
              '<span class="ag-overlay-loading-center">조회 중...</span>'
            }
            loading={loading}
          />
        </div>

        {!request.all_view && (
          <>
            <div className="paging-summary">
              <span>
                page_no: <strong>{pageInfo.page_no}</strong>
              </span>
              <span>
                row_per_page: <strong>{pageInfo.row_per_page}</strong>
              </span>
              <span>
                tot_page: <strong>{pageInfo.tot_page}</strong>
              </span>
              <span>
                tot_count: <strong>{pageInfo.tot_count}</strong>
              </span>
            </div>

            <PagingNavigator
              page_no={pageInfo.page_no}
              tot_page={pageInfo.tot_page}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
