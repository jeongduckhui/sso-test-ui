import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { menuConfig } from "../../config/menuConfig";

function getMenuLabel(pathname) {
  for (const section of menuConfig) {
    for (const item of section.items) {
      if (item.path === pathname) return item.label;
    }
  }
  return pathname;
}

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const pathname = location.pathname;

    if (pathname === "/login" || pathname === "/auto-login") return;

    setTabs((prev) => {
      const exists = prev.find((tab) => tab.path === pathname);
      if (exists) return prev;

      return [...prev, { path: pathname, label: getMenuLabel(pathname) }];
    });
  }, [location.pathname]);

  const closeTab = (path, e) => {
    e.stopPropagation();

    setTabs((prev) => {
      const nextTabs = prev.filter((tab) => tab.path !== path);

      if (location.pathname === path) {
        const fallback = nextTabs[nextTabs.length - 1] || { path: "/" };
        navigate(fallback.path);
      }

      return nextTabs;
    });
  };

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={`tab-item ${location.pathname === tab.path ? "active" : ""}`}
          onClick={() => navigate(tab.path)}
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
