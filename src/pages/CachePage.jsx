import { useEffect, useState } from "react";
import api from "../api/axios";

export default function CachePage() {
  const [codes, setCodes] = useState({});

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    debugger;
    const res = await api.post("/api/common-code/batch", [
      "CATEGORY",
      "COUNTRY",
      "DISTRIBUTOR",
      "PROCESS",
    ]);

    setCodes(res.data);
  };

  return (
    <div>
      <h2>공통코드 테스트</h2>

      <select>
        {codes.CATEGORY?.map((c) => (
          <option key={c.code}>{c.name}</option>
        ))}
      </select>

      <select>
        {codes.COUNTRY?.map((c) => (
          <option key={c.code}>{c.name}</option>
        ))}
      </select>

      <select>
        {codes.DISTRIBUTOR?.map((c) => (
          <option key={c.code}>{c.name}</option>
        ))}
      </select>

      <select>
        {codes.PROCESS?.map((c) => (
          <option key={c.code}>{c.name}</option>
        ))}
      </select>

      <button onClick={fetchCodes}>다시 조회</button>
    </div>
  );
}
