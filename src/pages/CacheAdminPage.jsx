import api from "../api/axios";

export default function CacheAdminPage() {
  const evictCategory = async () => {
    await api.delete("/api/common-code/cache/CATEGORY");
    alert("CATEGORY 캐시 삭제 완료");
  };

  const evictAll = async () => {
    await api.delete("/api/common-code/cache/all");
    alert("전체 캐시 삭제 완료");
  };

  return (
    <div>
      <h2>공통코드 캐시 관리</h2>

      <button onClick={evictCategory}>CATEGORY 캐시 삭제</button>

      <button onClick={evictAll}>전체 캐시 삭제</button>
    </div>
  );
}
