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
import { api } from "../../api/axios"; // 🔥 추가

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
      const result = openMenuTab(menu);

      setTabs(result.tabs);
      return;
    }

    activateTabByPath(pathname);
    setTabs(getOpenedTabs());
  }, [location.pathname]);

  const handleTabClick = (path) => {
    activateTabByPath(path);
    navigate(path);
  };

  const closeTab = async (path, e) => {
    e.stopPropagation();

    // 🔥 현재 탭 정보 찾기 (funcId용)
    const tab = tabs.find((t) => t.path === path);
    const funcId = tab?.key;

    // 🔥 종료 로그 API 호출
    try {
      await api.post("/user-access-log/end", null, {
        headers: {
          "X-Func-Id": funcId,
        },
      });
    } catch (err) {
      console.error("접속 종료 로그 실패", err);
    }

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
