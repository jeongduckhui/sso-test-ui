import { useEffect } from "react";

export default function AutoLoginPage() {
  useEffect(() => {
    window.location.href =
      "http://localhost:8081/oauth2/authorization/keycloak";
  }, []);

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>SSO 로그인 진행 중...</h2>
        <p>Keycloak 인증 서버로 이동합니다.</p>
      </div>
    </div>
  );
}
