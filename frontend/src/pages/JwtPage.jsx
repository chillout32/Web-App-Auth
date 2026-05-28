import React, { useState } from "react";
import { useAuth } from "../AuthContext";

export default function JwtPage() {
  const { token, decodedJwt } = useAuth();
  const [selected, setSelected] = useState(null);

  if (!token || !decodedJwt) return <div style={styles.page}><p style={{ color: "var(--text2)" }}>Ingen JWT hittad. Logga in igen.</p></div>;

  const parts = token.split(".");
  const sections = [
    {
      key: "header",
      label: "Header",
      color: "#7c6dfa",
      bg: "rgba(124,109,250,0.12)",
      part: parts[0],
      data: decodedJwt.header,
      desc: "Definierar hash-algoritmen (HS256) och tokentypen (JWT).",
    },
    {
      key: "payload",
      label: "Payload",
      color: "#22d3a0",
      bg: "rgba(34,211,160,0.1)",
      part: parts[1],
      data: decodedJwt.payload,
      desc: "Innehåller data om användaren. sub=user-id, role=behörighet, iat=skapad, exp=utgångstid. Aldrig känslig data här",
    },
    {
      key: "sig",
      label: "Signatur",
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.1)",
      part: parts[2],
      data: { info: "HMACSHA256(base64(header) + '.' + base64(payload), SECRET_KEY)" },
      desc: "Verifierar att token inte modifierats. Skapas med hemlig nyckel utan den här nyckeln kan signaturen inte förfalskas.",
    },
  ];

  const now = Math.floor(Date.now() / 1000);
  const exp = decodedJwt.payload?.exp;
  const iat = decodedJwt.payload?.iat;
  const isValid = exp ? exp > now : true;
  const expiresIn = exp ? Math.max(0, exp - now) : null;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>JWT Inspector</h1>
      <p style={styles.sub}>
        Klicka på en del av token för att förstå vad den innehåller.
      </p>

      <div style={styles.tokenBox}>
        <div style={styles.tokenLabel}>Ditt nuvarande token</div>
        <div style={styles.tokenText}>
          {sections.map((s, i) => (
            <span key={s.key}>
              <span
                style={{
                  ...styles.tokenPart,
                  color: s.color,
                  background: selected === s.key ? s.bg : "transparent",
                  borderRadius: 3,
                  cursor: "pointer",
                }}
                onClick={() => setSelected(selected === s.key ? null : s.key)}
              >
                {s.part}
              </span>
              {i < 2 && <span style={{ color: "var(--text3)" }}>.</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.partsGrid}>
        {sections.map((s) => (
          <div
            key={s.key}
            style={{
              ...styles.partCard,
              borderColor: selected === s.key ? s.color : "var(--border)",
              cursor: "pointer",
            }}
            onClick={() => setSelected(selected === s.key ? null : s.key)}
          >
            <div style={{ ...styles.partLabel, color: s.color }}>{s.label}</div>
            <div style={styles.partDesc}>{s.desc}</div>
            {selected === s.key && (
              <pre style={{ ...styles.partData, borderTop: `1px solid ${s.color}33` }}>
                {JSON.stringify(s.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>

      <div style={styles.statusSection}>
        <h2 style={styles.sectionTitle}>Token-status</h2>
        <div style={styles.statusGrid}>
          <StatusCard label="Giltig" value={isValid ? "Ja ✓" : "Nej ✗"} color={isValid ? "#22d3a0" : "#ff5252"} />
          <StatusCard label="Algoritm" value={decodedJwt.header?.alg} color="#7c6dfa" />
          <StatusCard label="Användarroll" value={decodedJwt.payload?.role} color="#fbbf24" />
          {expiresIn !== null && (
            <StatusCard
              label="Utgår om"
              value={`${Math.floor(expiresIn / 60)} min`}
              color={expiresIn < 300 ? "#ff5252" : "#22d3a0"}
            />
          )}
        </div>
      </div>

      <div style={styles.explainBox}>
        <div style={styles.explainTitle}>Hur verifiering fungerar på servern</div>
        <div style={styles.steps}>
          {[
            "Ta emot token från 'Authorization: Bearer <token>' ",
            "Dela upp i header, payload, signatur",
            "Räkna ut HMACSHA256(header + payload) med hemlig nyckel",
            "Jämför med signaturen, om de matchar är token äkta",
            "Kontrollera expiration, har token löpt ut?",
            "Läs role-claim och kör en rollbaserad kontroll",
          ].map((step, i) => (
            <div key={i} style={styles.step}>
              <span style={styles.stepNum}>{i + 1}</span>
              <span style={styles.stepText}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, color }) {
  return (
    <div style={styles.statusCard}>
      <div style={styles.statusLabel}>{label}</div>
      <div style={{ ...styles.statusValue, color }}>{value}</div>
    </div>
  );
}

const styles = {
  page: { padding: 32, maxWidth: 860 },
  title: { fontSize: 22, fontWeight: 500, marginBottom: 10 },
  sub: { color: "var(--text2)", marginBottom: 24 },
  tokenBox: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, padding: 20, marginBottom: 20,
  },
  tokenLabel: { fontSize: 11, color: "var(--text3)", letterSpacing: 0.5, marginBottom: 10 },
  tokenText: { fontFamily: "var(--mono)", fontSize: 11, wordBreak: "break-all", lineHeight: 1.8 },
  tokenPart: { padding: "2px 4px", transition: "background 0.15s" },
  partsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 },
  partCard: {
    background: "var(--surface)", border: "1px solid", borderRadius: 8,
    padding: 16, transition: "border-color 0.15s",
  },
  partLabel: { fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500, marginBottom: 8 },
  partDesc: { fontSize: 12, color: "var(--text2)", lineHeight: 1.6 },
  partData: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", marginTop: 12, paddingTop: 12, overflowX: "auto" },
  statusSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: 500, marginBottom: 12 },
  statusGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 },
  statusCard: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, padding: "14px 16px",
  },
  statusLabel: { fontSize: 11, color: "var(--text3)", marginBottom: 6 },
  statusValue: { fontSize: 16, fontFamily: "var(--mono)", fontWeight: 500 },
  explainBox: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, padding: 20,
  },
  explainTitle: { fontSize: 13, fontWeight: 500, marginBottom: 14, color: "var(--text2)" },
  steps: { display: "flex", flexDirection: "column", gap: 8 },
  step: { display: "flex", alignItems: "flex-start", gap: 12 },
  stepNum: {
    minWidth: 22, height: 22, borderRadius: "50%", background: "rgba(124,109,250,0.15)",
    color: "#a593ff", fontSize: 11, fontFamily: "var(--mono)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  stepText: { fontSize: 13, color: "var(--text2)", lineHeight: 1.5, paddingTop: 2 },
};
