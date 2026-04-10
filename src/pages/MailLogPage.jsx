import { useEffect, useState } from "react";
import api from "../api/axios";
import PageContainer from "../components/common/PageContainer";

export default function MailLogPage() {
  const [list, setList] = useState([]);

  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const res = await api.get("/mail/logs", {
        params: {
          recipient,
          subject,
          status,
        },
      });

      setList(res.data.data);
    } catch (e) {
      console.error(e);
      alert("조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRetry = async (id) => {
    if (!window.confirm("재시도 하시겠습니까?")) return;

    try {
      await api.post(`/mail/retry/${id}`);
      alert("재시도 요청 완료");

      fetchLogs(); // 재조회
    } catch (e) {
      console.error(e);
      alert("재시도 실패");
    }
  };

  const getStatusStyle = (status) => {
    if (status === "SUCCESS") return { color: "green", fontWeight: "bold" };
    if (status === "FAIL") return { color: "red", fontWeight: "bold" };
    return {};
  };

  return (
    <PageContainer
      title="메일 로그 관리"
      description="메일 발송 이력 조회 및 장애 확인 화면"
      actions={
        <button className="primary-btn" onClick={fetchLogs}>
          조회
        </button>
      }
    >
      {/* 🔍 검색 영역 */}
      <div className="form-grid" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label>수신자</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="이메일 검색"
          />
        </div>

        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="제목 검색"
          />
        </div>

        <div className="form-group">
          <label>상태</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">전체</option>
            <option value="SUCCESS">성공</option>
            <option value="FAIL">실패</option>
          </select>
        </div>
      </div>

      {/* 📋 테이블 */}
      <div className="table-card">
        <table className="app-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>수신자</th>
              <th>제목</th>
              <th>상태</th>
              <th>재시도횟수</th>
              <th>오류</th>
              <th>발송시간</th>
              <th>생성일</th>
              <th>재처리</th>
            </tr>
          </thead>

          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.recipient}</td>
                <td>{item.subject}</td>

                <td style={getStatusStyle(item.status)}>{item.status}</td>

                <td>{item.retryCount}</td>

                <td style={{ maxWidth: 200 }}>{item.errorMessage || "-"}</td>

                <td>{item.sentAt || "-"}</td>
                <td>{item.createdAt}</td>

                <td>
                  {item.status === "FAIL" && (
                    <button
                      className="primary-btn"
                      onClick={() => handleRetry(item.id)}
                    >
                      재시도
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <div style={{ marginTop: 10 }}>로딩 중...</div>}
    </PageContainer>
  );
}
