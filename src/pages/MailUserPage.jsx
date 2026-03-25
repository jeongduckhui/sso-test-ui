import { useState } from "react";
import api from "../api/axios";
import PageContainer from "../components/common/PageContainer";

export default function MailUserPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSendMail = async () => {
    if (!to || !subject || !content) {
      alert("모든 값을 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      const emails = to
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e !== "");

      const formData = new FormData();
      formData.append("to", JSON.stringify(emails));
      formData.append("subject", subject);
      formData.append("content", content);

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      await api.post("/mail/user", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("메일 발송 성공");

    } catch (e) {
      console.error(e);
      alert("메일 발송 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="개인 메일 발송">
      <input type="text" placeholder="이메일 (콤마 구분)" onChange={(e)=>setTo(e.target.value)} />
      <input type="text" placeholder="제목" onChange={(e)=>setSubject(e.target.value)} />
      <textarea onChange={(e)=>setContent(e.target.value)} />

      {/* 🔥 파일 추가 */}
      <input type="file" multiple onChange={(e)=>setFiles(e.target.files)} />

      <button onClick={handleSendMail}>메일 발송</button>
    </PageContainer>
  );
}