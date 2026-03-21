import { useState } from "react";
import api from "../api/axios";
import DeviceSessions from "./DeviceSessions";
import { useAuth } from "../auth/AuthContext";
import PageContainer from "../components/common/PageContainer";

export default function Home() {
  const { user, isLoggedIn } = useAuth();
  const [showDevices, setShowDevices] = useState(false);

  const getMe = async () => {
    const res = await api.get("/auth/me");
    console.log(res.data);
    alert("콘솔 확인");
  };

  return (
    <PageContainer
      title="SSO 테스트 홈"
      description="인증 상태, 사용자 정보, 세션 기능을 확인하는 화면"
      actions={
        <>
          <button className="primary-btn" onClick={getMe}>
            Get Me
          </button>
          <button
            className="secondary-btn"
            onClick={() => setShowDevices((prev) => !prev)}
          >
            Device Sessions
          </button>
        </>
      }
    >
      {isLoggedIn ? (
        <div className="info-grid">
          <div className="info-card">
            <div className="info-label">UserId</div>
            <div className="info-value">{user?.userId}</div>
          </div>

          <div className="info-card">
            <div className="info-label">Email</div>
            <div className="info-value">{user?.email}</div>
          </div>

          <div className="info-card">
            <div className="info-label">Provider</div>
            <div className="info-value">{user?.provider}</div>
          </div>
        </div>
      ) : (
        <div>로그인이 필요합니다.</div>
      )}

      {showDevices && <DeviceSessions />}
    </PageContainer>
  );
}
