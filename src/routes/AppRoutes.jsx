import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import AutoLoginPage from "../pages/AutoLoginPage";
import FilePage from "../pages/FilePage";

function MailPage() {
  return <div>메일 화면 준비 중</div>;
}

function CachePage() {
  return <div>캐시 화면 준비 중</div>;
}

function NotFoundPage() {
  return <div style={{ padding: 24 }}>404 - 페이지를 찾을 수 없습니다.</div>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auto-login" element={<AutoLoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="files" element={<FilePage />} />
        <Route path="mail" element={<MailPage />} />
        <Route path="cache" element={<CachePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
