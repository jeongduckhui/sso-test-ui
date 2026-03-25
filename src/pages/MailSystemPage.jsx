import { useState } from "react";
import api from "../api/axios";
import PageContainer from "../components/common/PageContainer";

export default function MailSystemPage() {
  const [mailType, setMailType] = useState("AUTH");
  const [loading, setLoading] = useState(false);

  const handleSendMail = async () => {
    try {
      setLoading(true);

      await api.post("/mail/system", {
        mailType,
      });

      alert("시스템 메일 발송 완료");
    } catch (e) {
      console.error(e);
      alert("메일 발송 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="시스템 메일 발송"
      description="시스템 테스트용 메일 발송"
      actions={
        <button
          className="primary-btn"
          onClick={handleSendMail}
          disabled={loading}
        >
          {loading ? "발송 중..." : "메일 발송"}
        </button>
      }
    >
      <div className="form-grid">
        <div className="form-group">
          <label>메일 타입</label>
          <select
            value={mailType}
            onChange={(e) => setMailType(e.target.value)}
          >
            <option value="AUTH">인증</option>
            <option value="PASSWORD_RESET">비밀번호 재설정</option>
            <option value="NOTIFICATION">알림</option>
          </select>
        </div>
      </div>
    </PageContainer>
  );
}
