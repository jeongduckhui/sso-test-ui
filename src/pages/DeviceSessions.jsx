import { useEffect, useState } from "react";
import api from "../api/axios";

function DeviceSessions() {
  const [devices, setDevices] = useState([]);

  const loadDevices = async () => {
    const res = await api.get("/auth/devices");
    setDevices(res.data);
  };

  const logoutDevice = async (deviceId) => {
    if (!window.confirm("이 기기를 로그아웃하시겠습니까?")) {
      return;
    }

    await api.delete(`/auth/devices/${deviceId}`);

    await loadDevices();
  };

  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Device Sessions</h2>

      {devices.map((device) => (
        <div
          key={device.deviceId}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
          }}
        >
          <div>
            <b>Device</b>: {device.userAgent}
          </div>

          <div>
            <b>IP</b>: {device.ipAddress}
          </div>

          <div>
            <b>Login Time</b>: {device.createdAt}
          </div>

          <div>
            <b>Expire</b>: {device.expiresAt}
          </div>

          {device.current ? (
            <div style={{ color: "green" }}>현재 세션</div>
          ) : (
            <button
              onClick={() => logoutDevice(device.deviceId)}
              style={{ marginTop: 10 }}
            >
              로그아웃
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default DeviceSessions;
