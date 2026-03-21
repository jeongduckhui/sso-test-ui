import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { menuConfig } from "../../config/menuConfig";

export default function AppSidebar({ collapsed, onToggle }) {
  return (
    <aside className={`app-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="app-sidebar-header">
        {!collapsed && <h2 className="app-logo">Unified Admin</h2>}

        <button className="icon-btn" onClick={onToggle}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="app-sidebar-body">
        {menuConfig.map((section) => (
          <div key={section.section} className="sidebar-section">
            {!collapsed && (
              <div className="sidebar-section-title">{section.section}</div>
            )}

            <div className="sidebar-menu-list">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `sidebar-menu-item ${isActive ? "active" : ""}`
                    }
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
