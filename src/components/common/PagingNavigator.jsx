export default function PagingNavigator({ page_no, tot_page, onPageChange }) {
  if (!tot_page || tot_page < 2) {
    return null;
  }

  const pageNumbers = [];
  const maxVisible = 10;

  let startPage = Math.max(1, page_no - 4);
  let endPage = Math.min(tot_page, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="paging-nav">
      <button
        className="paging-btn"
        disabled={page_no === 1}
        onClick={() => onPageChange(1)}
      >
        처음
      </button>

      <button
        className="paging-btn"
        disabled={page_no === 1}
        onClick={() => onPageChange(page_no - 1)}
      >
        이전
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          className={`paging-btn ${page === page_no ? "active" : ""}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="paging-btn"
        disabled={page_no === tot_page}
        onClick={() => onPageChange(page_no + 1)}
      >
        다음
      </button>

      <button
        className="paging-btn"
        disabled={page_no === tot_page}
        onClick={() => onPageChange(tot_page)}
      >
        마지막
      </button>
    </div>
  );
}
