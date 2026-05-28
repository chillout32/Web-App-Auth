import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "⬡" },
  { to: "/jwt", label: "JWT Inspector", icon: "◈" },
  { to: "/password", label: "Lösenord & bcrypt", icon: "◉" },
  { to: "/rbac", label: "Roller & behörighet", icon: "◧" },
];

const roleColor = { admin: "#7c6dfa", editor: "#22d3a0", viewer: "#fbbf24" };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoMark}>AUTH</span>
          <span style={styles.logoSub}>DEMO</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => ({
                ...styles.navItem,
                background: isActive ? "rgba(124,109,250,0.12)" : "transparent",
                color: isActive ? "#a593ff" : "#8888aa",
                borderLeft: isActive ? "2px solid #7c6dfa" : "2px solid transparent",
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.userBox}>
          <div style={styles.userRole}>
            <span style={{ ...styles.roleBadge, background: `${roleColor[user?.role]}22`, color: roleColor[user?.role] }}>
              {user?.role}
            </span>
          </div>
          <div style={styles.username}>{user?.username}</div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logga ut
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  root: { display: "flex", minHeight: "100vh" },
  sidebar: {
    width: 220,
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
    flexShrink: 0,
  },
  logo: { padding: "0 20px 32px", display: "flex", alignItems: "baseline", gap: 6 },
  logoMark: { fontFamily: "var(--mono)", fontSize: 18, fontWeight: 500, color: "#7c6dfa", letterSpacing: 3 },
  logoSub: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", letterSpacing: 2 },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" },
  navItem: {
    display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
    borderRadius: 6, textDecoration: "none", fontSize: 13,
    fontFamily: "var(--sans)", transition: "all 0.15s",
  },
  navIcon: { fontSize: 16, lineHeight: 1 },
  userBox: {
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    marginTop: "auto",
  },
  userRole: { marginBottom: 6 },
  roleBadge: {
    display: "inline-block", padding: "2px 10px", borderRadius: 99,
    fontSize: 11, fontFamily: "var(--mono)", fontWeight: 500, letterSpacing: 1,
  },
  username: { fontSize: 13, color: "var(--text)", marginBottom: 12 },
  logoutBtn: {
    width: "100%", padding: "7px 0", background: "transparent",
    border: "1px solid var(--border)", borderRadius: 6,
    color: "var(--text2)", cursor: "pointer", fontSize: 12,
    fontFamily: "var(--sans)", transition: "border-color 0.15s",
  },
};
