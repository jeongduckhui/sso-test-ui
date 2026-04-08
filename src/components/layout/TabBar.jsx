import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { findMenuByPath } from "../../config/menuConfig";
import {
  activateTabByPath,
  closeTabByPath,
  getOpenedTabs,
  openMenuTab,
} from "../../txlog/screenContext";

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState(() => getOpenedTabs());

  useEffect(() => {
    const pathname = location.pathname;

    if (pathname === "/login" || pathname === "/auto-login") {
      return;
    }

    const menu = findMenuByPath(pathname);

    if (menu) {
      const nextTabs = openMenuTab(menu);
      setTabs(nextTabs);
      return;
    }

    activateTabByPath(pathname);
    setTabs(getOpenedTabs());
  }, [location.pathname]);

  const handleTabClick = (path) => {
    activateTabByPath(path);
    navigate(path);
  };

  const closeTab = (path, e) => {
    e.stopPropagation();

    const nextTabs = closeTabByPath(path);
    setTabs(nextTabs);

    if (location.pathname === path) {
      const fallback = nextTabs[nextTabs.length - 1] || { path: "/" };
      activateTabByPath(fallback.path);
      navigate(fallback.path);
    }
  };

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={`tab-item ${location.pathname === tab.path ? "active" : ""}`}
          onClick={() => handleTabClick(tab.path)}
        >
          <span>{tab.label}</span>

          {tab.path !== "/" && (
            <button
              className="tab-close-btn"
              onClick={(e) => closeTab(tab.path, e)}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
