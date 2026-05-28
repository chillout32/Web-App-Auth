import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const DEMO_USERS = [
  { username: "alice", password: "password123", role: "admin" },
  { username: "bob", password: "secret456", role: "editor" },
  { username: "carol", password: "viewer789", role: "viewer" },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.token, data.user, data.decoded);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(u) {
    setUsername(u.username);
    setPassword(u.password);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>AUTH<span style={{ color: "var(--text3)", fontSize: 11 }}>DEMO</span></div>
          <p style={styles.sub}>JWT + bcrypt + RBAC DEMO</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Användarnamn</label>
            <input
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alice"
              autoComplete="username"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Lösenord</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? "Loggar in..." : "Logga in →"}
          </button>
        </form>

        <div style={styles.demoSection}>
          <div style={styles.demoLabel}>Demo-användare (klicka för att fylla i)</div>
          <div style={styles.demoGrid}>
            {DEMO_USERS.map((u) => (
              <button key={u.username} style={styles.demoBtn} onClick={() => quickLogin(u)}>
                <span style={{ ...styles.demoRole, color: roleColor[u.role] }}>{u.role}</span>
                <span style={styles.demoName}>{u.username}</span>
                <span style={styles.demoPw}>{u.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const roleColor = { admin: "#7c6dfa", editor: "#22d3a0", viewer: "#fbbf24" };

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--bg)", padding: 24,
  },
  card: {
    width: "100%", maxWidth: 420, background: "var(--surface)",
    border: "1px solid var(--border)", borderRadius: 12, padding: 32,
  },
  header: { marginBottom: 28 },
  logo: { fontFamily: "var(--mono)", fontSize: 22, fontWeight: 500, color: "#7c6dfa", letterSpacing: 3, marginBottom: 8 },
  sub: { color: "var(--text2)", fontSize: 13 },
  form: { display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "var(--text2)", letterSpacing: 0.5 },
  input: {
    padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border)",
    borderRadius: 6, color: "var(--text)", fontFamily: "var(--sans)", fontSize: 14,
    outline: "none", transition: "border-color 0.15s",
  },
  error: { background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.3)", borderRadius: 6, padding: "10px 14px", color: "#ff5252", fontSize: 13 },
  btn: {
    padding: "11px 0", background: "#7c6dfa", border: "none", borderRadius: 6,
    color: "#fff", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 500,
    cursor: "pointer", transition: "background 0.15s",
  },
  demoSection: {},
  demoLabel: { fontSize: 11, color: "var(--text3)", letterSpacing: 0.5, marginBottom: 10 },
  demoGrid: { display: "flex", flexDirection: "column", gap: 6 },
  demoBtn: {
    display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
    background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6,
    cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
  },
  demoRole: { fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500, minWidth: 46 },
  demoName: { fontSize: 13, color: "var(--text)", flex: 1 },
  demoPw: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" },
};
