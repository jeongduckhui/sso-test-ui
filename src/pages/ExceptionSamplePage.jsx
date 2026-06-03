import { useState } from "react";
import api from "../api/axios";

export default function ExceptionSamplePage() {
  const [language, setLanguage] = useState("ko");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = async (config) => {
    setLoading(true);

    try {
      const response = await api({
        ...config,
        headers: {
          "Accept-Language": language,
          ...(config.headers || {}),
        },
      });

      setResult({
        status: response.status,
        data: response.data,
      });
    } catch (error) {
      setResult({
        status: error.response?.status || "NETWORK_ERROR",
        data: error.response?.data || {
          message: error.message,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const validationTest = () => {
    request({
      method: "post",
      url: "/api/common/exception/sample/validation",
      data: {
        userId: "",
        userName: "홍길동",
        description: "정상",
      },
    });
  };

  const multiValidationTest = () => {
    request({
      method: "post",
      url: "/api/common/exception/sample/multi-validation",
      data: {
        userId: "",
        userName: "",
        description: "123456789012345",
      },
    });
  };

  const businessExceptionTest = () => {
    request({
      method: "get",
      url: "/api/common/exception/sample/business",
    });
  };

  const systemExceptionTest = () => {
    request({
      method: "get",
      url: "/api/common/exception/sample/system",
    });
  };

  const duplicateKeyTest = () => {
    request({
      method: "get",
      url: "/api/common/exception/sample/duplicate-key",
    });
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>공통 예외 처리 테스트</h2>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>언어</h3>

        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="language"
            value="ko"
            checked={language === "ko"}
            onChange={() => setLanguage("ko")}
          />
          한국어
        </label>

        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="language"
            value="en"
            checked={language === "en"}
            onChange={() => setLanguage("en")}
          />
          English
        </label>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>테스트 버튼</h3>

        <div style={styles.buttonArea}>
          <button style={styles.button} onClick={validationTest}>
            Validation
          </button>

          <button style={styles.button} onClick={multiValidationTest}>
            Multi Validation
          </button>

          <button style={styles.button} onClick={businessExceptionTest}>
            BusinessException
          </button>

          <button style={styles.button} onClick={systemExceptionTest}>
            SystemException
          </button>

          <button style={styles.button} onClick={duplicateKeyTest}>
            Duplicate Key
          </button>
        </div>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>응답 결과</h3>

        {loading && <div style={styles.loading}>요청 중...</div>}

        <pre style={styles.result}>
          {result
            ? JSON.stringify(result, null, 2)
            : "아직 요청하지 않았습니다."}
        </pre>
      </section>
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },

  title: {
    marginBottom: "24px",
  },

  section: {
    marginBottom: "24px",
    padding: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "12px",
  },

  radioLabel: {
    marginRight: "16px",
    cursor: "pointer",
  },

  buttonArea: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  button: {
    padding: "8px 12px",
    border: "1px solid #aaa",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
  },

  loading: {
    marginBottom: "8px",
    color: "#666",
  },

  result: {
    minHeight: "240px",
    padding: "16px",
    backgroundColor: "#f7f7f7",
    border: "1px solid #ddd",
    borderRadius: "6px",
    overflow: "auto",
    whiteSpace: "pre-wrap",
  },
};
