import React from "react";
import { useAuth } from "../AuthContext";

const ROLES = ["viewer", "editor", "admin"];
const ACTIONS = [
  { label: "Läsa innehåll", key: "read", roles: ["viewer", "editor", "admin"] },
  { label: "Skapa innehåll", key: "create", roles: ["editor", "admin"] },
  { label: "Redigera innehåll", key: "edit", roles: ["editor", "admin"] },
  { label: "Radera innehåll", key: "delete", roles: ["admin"] },
  { label: "Se adminpanel", key: "admin", roles: ["admin"] },
];

const roleColor = { admin: "#7c6dfa", editor: "#22d3a0", viewer: "#fbbf24" };
const roleDesc = {
  admin: "Full åtkomst till alla resurser och adminpanelen.",
  editor: "Kan läsa, skapa och redigera innehåll. Kan inte radera eller se adminpanelen.",
  viewer: "Skrivskyddad åtkomst, kan bara läsa innehåll.",
};

export default function RbacPage() {
  const { user, decodedJwt } = useAuth();

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Roller & behörighet</h1>
      <p style={styles.sub}>
        Du är inloggad som <strong style={{ color: roleColor[user?.role] }}>{user?.role}</strong>.
      </p>

      <div style={styles.matrix}>
        <div style={styles.matrixHeader}>
          <div style={styles.matrixActionCol} />
          {ROLES.map((role) => (
            <div key={role} style={styles.matrixRoleCol}>
              <span style={{ ...styles.roleBadge, color: roleColor[role], background: `${roleColor[role]}18` }}>
                {role}
              </span>
              {role === user?.role && <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>← du</div>}
            </div>
          ))}
        </div>

        {ACTIONS.map((action) => (
          <div key={action.key} style={styles.matrixRow}>
            <div style={styles.matrixActionCol}>
              <span style={styles.actionLabel}>{action.label}</span>
            </div>
            {ROLES.map((role) => {
              const hasAccess = action.roles.includes(role);
              const isYou = role === user?.role;
              return (
                <div
                  key={role}
                  style={{
                    ...styles.matrixCell,
                    background: hasAccess
                      ? isYou ? "rgba(34,211,160,0.15)" : "rgba(34,211,160,0.06)"
                      : isYou ? "rgba(255,82,82,0.12)" : "rgba(255,82,82,0.04)",
                    border: `1px solid ${hasAccess ? "rgba(34,211,160,0.25)" : "rgba(255,82,82,0.15)"}`,
                    outline: isYou ? `2px solid ${hasAccess ? "rgba(34,211,160,0.4)" : "rgba(255,82,82,0.3)"}` : "none",
                  }}
                >
                  <span style={{ color: hasAccess ? "#22d3a0" : "#ff5252", fontSize: 16 }}>
                    {hasAccess ? "✓" : "✗"}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={styles.rolesGrid}>
        {ROLES.map((role) => (
          <div
            key={role}
            style={{
              ...styles.roleCard,
              borderColor: role === user?.role ? roleColor[role] : "var(--border)",
              borderWidth: role === user?.role ? 1.5 : 1,
            }}
          >
            <div style={{ ...styles.roleTitle, color: roleColor[role] }}>{role}</div>
            <div style={styles.roleDesc}>{roleDesc[role]}</div>
            <div style={styles.rolePerms}>
              {ACTIONS.filter((a) => a.roles.includes(role)).map((a) => (
                <span key={a.key} style={styles.permTag}>{a.label}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {decodedJwt && (
        <div style={styles.jwtBox}>
          <div style={styles.jwtTitle}>Din roll i JWT-payloaden</div>
          <pre style={styles.pre}>{JSON.stringify({ sub: decodedJwt.payload?.sub, username: decodedJwt.payload?.username, role: decodedJwt.payload?.role, exp: decodedJwt.payload?.exp }, null, 2)}</pre>
          <div style={styles.jwtNote}>
            Rollen läses direkt från JWT vid varje request.
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 32, maxWidth: 860 },
  title: { fontSize: 22, fontWeight: 500, marginBottom: 10 },
  sub: { color: "var(--text2)", marginBottom: 28, lineHeight: 1.6 },
  matrix: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 20 },
  matrixHeader: { display: "grid", gridTemplateColumns: "1fr repeat(3, 100px)", borderBottom: "1px solid var(--border)" },
  matrixRoleCol: { padding: "14px 16px", textAlign: "center", borderLeft: "1px solid var(--border)" },
  matrixActionCol: { padding: "14px 16px" },
  roleBadge: { fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 99 },
  matrixRow: { display: "grid", gridTemplateColumns: "1fr repeat(3, 100px)", borderBottom: "1px solid var(--border2)" },
  actionLabel: { fontSize: 13, color: "var(--text2)" },
  matrixCell: { borderLeft: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 0 },
  rolesGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 },
  roleCard: { background: "var(--surface)", border: "solid", borderRadius: 8, padding: 16 },
  roleTitle: { fontFamily: "var(--mono)", fontSize: 13, fontWeight: 500, marginBottom: 8 },
  roleDesc: { fontSize: 12, color: "var(--text2)", lineHeight: 1.6, marginBottom: 12 },
  rolePerms: { display: "flex", flexWrap: "wrap", gap: 4 },
  permTag: { fontSize: 11, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 8px", color: "var(--text2)" },
  jwtBox: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 },
  jwtTitle: { fontSize: 13, fontWeight: 500, marginBottom: 12 },
  pre: { fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)", marginBottom: 12, lineHeight: 1.7 },
  jwtNote: { fontSize: 12, color: "var(--text3)", lineHeight: 1.6 },
};
