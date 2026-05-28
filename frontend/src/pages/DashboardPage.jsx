import React, { useState } from "react";
import { useAuth } from "../AuthContext";

const ENDPOINTS = [
  { method: "GET", path: "/content", label: "Hämta innehåll", roles: ["viewer", "editor", "admin"] },
  { method: "POST", path: "/content", label: "Skapa innehåll", roles: ["editor", "admin"], body: { title: "Ny artikel" } },
  { method: "PUT", path: "/content/1", label: "Redigera innehåll", roles: ["editor", "admin"] },
  { method: "DELETE", path: "/content/1", label: "Radera innehåll", roles: ["admin"] },
  { method: "GET", path: "/admin/dashboard", label: "Admin-dashboard", roles: ["admin"] },
];

export default function DashboardPage() {
  const { user, apiFetch } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  async function callEndpoint(ep) {
    setLoading((prev) => ({ ...prev, [ep.path + ep.method]: true }));
    const result = await apiFetch(ep.path, { method: ep.method, body: ep.body });
    setResults((prev) => ({ ...prev, [ep.path + ep.method]: result }));
    setLoading((prev) => ({ ...prev, [ep.path + ep.method]: false }));
  }

  const methodColor = { GET: "#22d3a0", POST: "#7c6dfa", PUT: "#fbbf24", DELETE: "#ff5252" };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>API Explorer</h1>
        <p style={styles.sub}>
          Inloggad som <strong style={{ color: "#a593ff" }}>{user?.username}</strong> med rollen{" "}
          <strong style={{ color: roleColor[user?.role] }}>{user?.role}</strong>. Testa endpoints nedan servern
          validerar användarens JWT och kontrollerar din roll.
        </p>
      </div>

      <div style={styles.endpointList}>
        {ENDPOINTS.map((ep) => {
          const key = ep.path + ep.method;
          const result = results[key];
          const hasAccess = ep.roles.includes(user?.role);

          return (
            <div key={key} style={{ ...styles.endpointCard, opacity: hasAccess ? 1 : 0.6 }}>
              <div style={styles.endpointHeader}>
                <div style={styles.endpointMeta}>
                  <span style={{ ...styles.method, color: methodColor[ep.method] }}>{ep.method}</span>
                  <span style={styles.path}>/api{ep.path}</span>
                  <span style={styles.epLabel}>{ep.label}</span>
                </div>
                <div style={styles.endpointRight}>
                  <div style={styles.rolesRequired}>
                    {ep.roles.map((r) => (
                      <span key={r} style={{ ...styles.roleTag, color: roleColor[r], background: `${roleColor[r]}18` }}>
                        {r}
                      </span>
                    ))}
                  </div>
                  <button
                    style={{ ...styles.callBtn, background: hasAccess ? "rgba(124,109,250,0.15)" : "rgba(255,255,255,0.04)" }}
                    onClick={() => callEndpoint(ep)}
                    disabled={loading[key]}
                  >
                    {loading[key] ? "..." : "Anropa →"}
                  </button>
                </div>
              </div>

              {result && (
                <div style={{ ...styles.result, borderColor: result.ok ? "rgba(34,211,160,0.3)" : "rgba(255,82,82,0.3)" }}>
                  <div style={{ ...styles.statusBadge, color: result.ok ? "#22d3a0" : "#ff5252" }}>
                    HTTP {result.status} {result.ok ? "OK" : "ERROR"}
                  </div>
                  <pre style={styles.pre}>{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const roleColor = { admin: "#7c6dfa", editor: "#22d3a0", viewer: "#fbbf24" };

const styles = {
  page: { padding: 32, maxWidth: 860 },
  header: { marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 500, marginBottom: 10 },
  sub: { color: "var(--text2)", lineHeight: 1.6 },
  endpointList: { display: "flex", flexDirection: "column", gap: 10 },
  endpointCard: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, overflow: "hidden",
  },
  endpointHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px", gap: 12, flexWrap: "wrap",
  },
  endpointMeta: { display: "flex", alignItems: "center", gap: 12, flex: 1 },
  method: { fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500, minWidth: 44 },
  path: { fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)" },
  epLabel: { fontSize: 13, color: "var(--text2)" },
  endpointRight: { display: "flex", alignItems: "center", gap: 10 },
  rolesRequired: { display: "flex", gap: 4 },
  roleTag: { fontSize: 10, fontFamily: "var(--mono)", padding: "2px 8px", borderRadius: 99, fontWeight: 500 },
  callBtn: {
    padding: "6px 14px", border: "1px solid var(--border)", borderRadius: 6,
    color: "#a593ff", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 12,
  },
  result: { margin: "0 16px 16px", border: "1px solid", borderRadius: 6, overflow: "hidden" },
  statusBadge: { padding: "4px 12px", fontSize: 11, fontFamily: "var(--mono)", borderBottom: "1px solid var(--border)" },
  pre: { padding: 12, fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)", overflowX: "auto", margin: 0 },
};
