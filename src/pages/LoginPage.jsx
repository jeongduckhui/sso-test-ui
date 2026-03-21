export default function LoginPage() {
  const loginGoogle = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  const loginKeyCloak = () => {
    window.location.href =
      "http://localhost:8081/oauth2/authorization/keycloak";
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>로그인</h2>
        <p>SSO 인증을 진행하세요.</p>

        <button className="primary-btn full-width" onClick={loginGoogle}>
          Google 로그인
        </button>

        <button className="secondary-btn full-width" onClick={loginKeyCloak}>
          Keycloak 로그인
        </button>
      </div>
    </div>
  );
}
