import { useEffect, useState } from "react";
import api from "../api/axios";

export default function CacheMonitorPage() {
  const [codes, setCodes] = useState({});
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchCodes();
    fetchStats();
  }, []);

  const fetchCodes = async () => {
    const res = await api.post("/api/common-code/batch", [
      "CATEGORY",
      "COUNTRY",
      "DISTRIBUTOR",
      "PROCESS",
    ]);
    setCodes(res.data);
  };

  const fetchStats = async () => {
    const res = await api.get("/api/common-code/cache/stats");
    setStats(res.data);
  };

  const evictAll = async () => {
    await api.delete("/api/common-code/cache/all");
    await fetchStats();
    alert("전체 캐시 삭제 완료");
  };

  return (
    <div>
      <h2>공통코드 테스트</h2>

      <div style={{ marginBottom: "16px" }}>
        <button onClick={fetchCodes}>공통코드 조회</button>
        <button onClick={fetchStats} style={{ marginLeft: "8px" }}>
          통계 조회
        </button>
        <button onClick={evictAll} style={{ marginLeft: "8px" }}>
          전체 캐시 삭제
        </button>
      </div>

      <div>
        <div>Category</div>
        <select>
          {codes.CATEGORY?.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div>Country</div>
        <select>
          {codes.COUNTRY?.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div>Distributor</div>
        <select>
          {codes.DISTRIBUTOR?.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div>Process</div>
        <select>
          {codes.PROCESS?.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {stats && (
        <div style={{ marginTop: "24px" }}>
          <h3>캐시 통계</h3>
          <div>hitCount: {stats.hitCount}</div>
          <div>missCount: {stats.missCount}</div>
          <div>successCount: {stats.successCount}</div>
          <div>evictionCount: {stats.evictionCount}</div>
          <div>hitRate: {stats.hitRate}</div>
          <div>estimatedSize: {stats.estimatedSize}</div>
        </div>
      )}
    </div>
  );
}
