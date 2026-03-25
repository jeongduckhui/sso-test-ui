import { useState } from "react";
import api from "../api/axios";
import PageContainer from "../components/common/PageContainer";

export default function MailSendPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [mailType, setMailType] = useState("AUTH");
  const [loading, setLoading] = useState(false);

  const handleSendMail = async () => {
    if (!to || !subject || !content) {
      alert("모든 값을 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      // 🔥 핵심: 문자열 → 배열 변환
      const emails = to
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e !== "");

      await api.post("/mail/test", {
        to: emails, // 🔥 배열로 전달
        subject,
        content,
        mailType,
      });

      alert("메일 발송 성공");

      setTo("");
      setSubject("");
      setContent("");
      setMailType("AUTH");
    } catch (e) {
      console.error(e);
      alert("메일 발송 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="메일 발송"
      description="메일 발송 테스트 및 운영용 발송 화면"
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
        {/* 메일 타입 */}
        <div className="form-group">
          <label>메일 타입</label>
          <div>
            <label>
              <input
                type="radio"
                value="AUTH"
                checked={mailType === "AUTH"}
                onChange={(e) => setMailType(e.target.value)}
              />
              인증
            </label>

            <label>
              <input
                type="radio"
                value="PASSWORD_RESET"
                checked={mailType === "PASSWORD_RESET"}
                onChange={(e) => setMailType(e.target.value)}
              />
              비밀번호 재설정
            </label>

            <label>
              <input
                type="radio"
                value="NOTIFICATION"
                checked={mailType === "NOTIFICATION"}
                onChange={(e) => setMailType(e.target.value)}
              />
              알림
            </label>
          </div>
        </div>

        {/* 🔥 수신자 (여러 개 입력 가능) */}
        <div className="form-group">
          <label>수신자 이메일</label>
          <input
            type="text"
            placeholder="이메일 여러 개 입력 (콤마로 구분)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>내용</label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    </PageContainer>
  );
}
