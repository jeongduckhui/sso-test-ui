import { Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import AutoLoginPage from "../pages/AutoLoginPage";
import FilePage from "../pages/FilePage";
import PagingPage from "../pages/PagingPage";
import MailLogPage from "../pages/MailLogPage";
import MailSystemPage from "../pages/MailSystemPage";
import MailUserPage from "../pages/MailUserPage";
import MessageTestPage from "../pages/MessageTestPage";
import CachePage from "../pages/CachePage";
import CacheAdminPage from "../pages/CacheAdminPage";
import CacheMonitorPage from "../pages/CacheMonitorPage";

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
        <Route path="mail/user" element={<MailUserPage />} />
        <Route path="mail/system" element={<MailSystemPage />} />
        <Route path="mail/log" element={<MailLogPage />} />
        <Route path="message" element={<MessageTestPage />} />
        <Route path="cache" element={<CachePage />} />
        <Route path="cache/admin" element={<CacheAdminPage />} />
        <Route path="cache/monitor" element={<CacheMonitorPage />} />
        <Route path="paging" element={<PagingPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
