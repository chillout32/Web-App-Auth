import React, { useState } from "react";
import { useAuth } from "../AuthContext";

export default function PasswordPage() {
  const { apiFetch } = useAuth();
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleHash() {
    if (!password) return;
    setLoading(true);
    const res = await apiFetch("/auth/hash-demo", { method: "POST", body: { password } });
    setResult(res.data);
    setLoading(false);
  }

  function getStrength(pw) {
    if (!pw) return { score: 0, label: "Ange lösenord", color: "var(--text3)" };
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const labels = ["Mycket svagt", "Svagt", "Okej", "Bra", "Starkt", "Mycket starkt"];
    const colors = ["#ff5252", "#ff5252", "#fbbf24", "#22d3a0", "#22d3a0", "#22d3a0"];
    return { score: Math.min(s, 5), label: labels[Math.min(s, 5)], color: colors[Math.min(s, 5)] };
  }

  const strength = getStrength(password);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Lösenord & bcrypt</h1>
      <p style={styles.sub}>
        Ange ett lösenord och se hur bcrypt hashar det på riktigt via backend-anropet{" "}
        <code style={styles.code}>POST /api/auth/hash-demo</code>. Varje anrop ger en ny hash tack vare saltet.
      </p>

      <div style={styles.inputCard}>
        <label style={styles.label}>Skriv ett lösenord att hasha</label>
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="t.ex. MittSäkraLösenord!99"
            onKeyDown={(e) => e.key === "Enter" && handleHash()}
          />
          <button style={styles.btn} onClick={handleHash} disabled={!password || loading}>
            {loading ? "Hashar..." : "Hasha →"}
          </button>
        </div>

        {password && (
          <div style={styles.strengthBar}>
            <div style={styles.strengthTrack}>
              <div style={{ ...styles.strengthFill, width: `${(strength.score / 5) * 100}%`, background: strength.color }} />
            </div>
            <span style={{ fontSize: 12, color: strength.color }}>{strength.label}</span>
          </div>
        )}
      </div>

      {result && (
        <>
          <div style={styles.comparisonGrid}>
            <div style={styles.col}>
              <div style={styles.colLabel}>Klartext (osäkert)</div>
              <div style={{ ...styles.colValue, color: "#ff5252", fontFamily: "var(--sans)" }}>{result.original}</div>
              <div style={styles.colNote}>Lagras aldrig i databasen</div>
            </div>
            <div style={styles.arrow}>→</div>
            <div style={styles.col}>
              <div style={styles.colLabel}>bcrypt hash #1</div>
              <div style={styles.colValue}>{result.hash1}</div>
            </div>
            <div style={styles.arrow}>≠</div>
            <div style={styles.col}>
              <div style={styles.colLabel}>bcrypt hash #2 (samma input!)</div>
              <div style={{ ...styles.colValue, color: "#22d3a0" }}>{result.hash2}</div>
              <div style={styles.colNote}>Olika tack vare slumpmässigt salt</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfoCard({ label, value, color }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={{ fontSize: 18, fontFamily: "var(--mono)", fontWeight: 500, color }}>{value}</div>
    </div>
  );
}

const styles = {
  page: { padding: 32, maxWidth: 860 },
  title: { fontSize: 22, fontWeight: 500, marginBottom: 10 },
  sub: { color: "var(--text2)", marginBottom: 24, lineHeight: 1.6 },
  code: { fontFamily: "var(--mono)", fontSize: 12, background: "var(--surface2)", padding: "1px 6px", borderRadius: 4 },
  inputCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, marginBottom: 20 },
  label: { display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 10 },
  inputRow: { display: "flex", gap: 10 },
  input: {
    flex: 1, padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border)",
    borderRadius: 6, color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13, outline: "none",
  },
  btn: {
    padding: "10px 20px", background: "#7c6dfa", border: "none", borderRadius: 6,
    color: "#fff", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500,
    whiteSpace: "nowrap",
  },
  strengthBar: { display: "flex", alignItems: "center", gap: 12, marginTop: 12 },
  strengthTrack: { flex: 1, height: 4, background: "var(--surface2)", borderRadius: 2, overflow: "hidden" },
  strengthFill: { height: "100%", borderRadius: 2, transition: "width 0.3s, background 0.3s" },
  comparisonGrid: {
    display: "grid", gridTemplateColumns: "1fr 24px 1fr 24px 1fr", gap: 10,
    alignItems: "center", marginBottom: 16,
  },
  col: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 },
  colLabel: { fontSize: 11, color: "var(--text3)", marginBottom: 8 },
  colValue: { fontFamily: "var(--mono)", fontSize: 11, wordBreak: "break-all", lineHeight: 1.7 },
  colNote: { fontSize: 11, color: "var(--text3)", marginTop: 8 },
  arrow: { textAlign: "center", color: "var(--text3)", fontSize: 18 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 },
  infoCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" },
  infoLabel: { fontSize: 11, color: "var(--text3)", marginBottom: 8 },
  noteBox: { background: "rgba(34,211,160,0.06)", border: "1px solid rgba(34,211,160,0.2)", borderRadius: 8, padding: 16, marginBottom: 24 },
  noteTitle: { fontSize: 13, fontWeight: 500, color: "#22d3a0", marginBottom: 8 },
  noteText: { fontSize: 13, color: "var(--text2)", lineHeight: 1.6 },
  explainBox: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 },
  explainTitle: { fontSize: 14, fontWeight: 500, marginBottom: 14 },
  compareTable: { display: "flex", flexDirection: "column" },
  tableRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 12px", borderRadius: 4 },
  cell: { fontSize: 13 },
};
