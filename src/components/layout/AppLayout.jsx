import { Outlet, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import TabBar from "./TabBar";
import { menuConfig } from "../../config/menuConfig";

function findMenuByPath(pathname) {
  for (const section of menuConfig) {
    for (const item of section.items) {
      if (item.path === pathname) {
        return item;
      }
    }
  }
  return null;
}

export default function AppLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentMenu = useMemo(() => {
    return findMenuByPath(location.pathname);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="app-main">
        <AppHeader
          title={currentMenu?.label ?? "대시보드"}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />

        <TabBar />

        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
