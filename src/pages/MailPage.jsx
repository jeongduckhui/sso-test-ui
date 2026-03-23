import { useState } from "react";
import api from "../api/axios";
import PageContainer from "../components/common/PageContainer";

export default function MailPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMail = async () => {
    if (!to || !subject || !content) {
      alert("모든 값을 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      api.post("/mail/test", {
        to: "jeongduckhui@gmail.com",
        subject: subject,
        content: content,
      });

      alert("메일 발송 성공");

      // 초기화
      setSubject("");
      setContent("");
    } catch (e) {
      console.error(e);
      alert("메일 발송 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="메일 테스트"
      description="SMTP 메일 발송 기능을 테스트하는 화면"
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
          <label>수신자 이메일</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="example@gmail.com"
          />
        </div>

        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="메일 제목"
          />
        </div>

        <div className="form-group">
          <label>내용</label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="메일 내용을 입력하세요"
          />
        </div>
      </div>
    </PageContainer>
  );
}
