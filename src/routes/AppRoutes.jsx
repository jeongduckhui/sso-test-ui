import { Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import AutoLoginPage from "../pages/AutoLoginPage";
import S3FilePage from "../pages/S3FilePage";
import PagingPage from "../pages/PagingPage";
import MailLogPage from "../pages/MailLogPage";
import MailSystemPage from "../pages/MailSystemPage";
import MailUserPage from "../pages/MailUserPage";
import MessageTestPage from "../pages/MessageTestPage";
import CachePage from "../pages/CachePage";
import CacheAdminPage from "../pages/CacheAdminPage";
import CacheMonitorPage from "../pages/CacheMonitorPage";
import TxLogTestPage from "../pages/TxLogTestPage";
import TxLogTestPageDBSetting from "../pages/TxLogTestPageDBSetting";
import SnapshotGridPage from "../pages/SnapshotGridPage";
import DynamicGridExcelPage from "../pages/DynamicGridExcelPage";
import ExcelRegressionTestPage from "../pages/ExcelRegressionTestPage";
import ExceptionSamplePage from "../pages/ExceptionSamplePage";
import MultiTabDimensionTemplatePage from "../pages/MultiTabDimensionTemplatePage";
import MultiTabSplitDimensionPage from "../pages/MultiTabSplitDimensionPage";
import NasFilePage from "../pages/NasFilePage";

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
        <Route path="files/s3" element={<S3FilePage />} />
        <Route path="files/nas" element={<NasFilePage />} />
        <Route path="mail/user" element={<MailUserPage />} />
        <Route path="mail/system" element={<MailSystemPage />} />
        <Route path="mail/log" element={<MailLogPage />} />
        <Route path="message" element={<MessageTestPage />} />
        <Route path="cache" element={<CachePage />} />
        <Route path="cache/admin" element={<CacheAdminPage />} />
        <Route path="cache/monitor" element={<CacheMonitorPage />} />
        <Route path="paging" element={<PagingPage />} />
        <Route path="txlog" element={<TxLogTestPage />} />
        <Route path="txlogdbsetting" element={<TxLogTestPageDBSetting />} />
        <Route path="snapshot-grid" element={<SnapshotGridPage />} />
        <Route path="dynamic-grid-excel" element={<DynamicGridExcelPage />} />
        <Route
          path="dynamic-grid-excel-test"
          element={<ExcelRegressionTestPage />}
        />
        <Route path="exception-sample" element={<ExceptionSamplePage />} />
        <Route
          path="multi-tab-dimension-template"
          element={<MultiTabDimensionTemplatePage />}
        />
        <Route
          path="multi-tab-split-dimension-template"
          element={<MultiTabSplitDimensionPage />}
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
