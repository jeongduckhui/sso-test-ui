import { Menu, LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { logout } from "../../services/authService";

export default function AppHeader({ title, onToggleSidebar }) {
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <header className="app-header">
      <div className="app-header-left">
        <button className="icon-btn" onClick={onToggleSidebar}>
          <Menu size={18} />
        </button>
        <h1 className="app-page-title">{title}</h1>
      </div>

      <div className="app-header-right">
        <div className="app-user-box">
          <UserCircle2 size={18} />
          <span>{user?.email ?? "unknown"}</span>
        </div>

        <button className="primary-outline-btn" onClick={handleLogout}>
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </header>
  );
}
