import { useState } from "react";
import { api } from "../api/axios";

export default function MessageTestPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  const testValidation = async () => {
    try {
      await api.post("/test/save", { name, code });
      setMsg("성공");
    } catch (e) {
      setMsg(e.response?.data?.error?.message);
    }
  };

  const testFind = async () => {
    try {
      await api.get("/test/find?id=none");
    } catch (e) {
      setMsg(e.response?.data?.error?.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>메시지 테스트</h2>

      <div>
        <input
          placeholder="name (필수)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <input
          placeholder="code (max 5)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      <button onClick={testValidation}>Validation 테스트</button>
      <button onClick={testFind}>조회 실패 테스트</button>

      <h3>결과</h3>
      <div>{msg}</div>
    </div>
  );
}
