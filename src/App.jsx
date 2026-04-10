import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, ReferenceLine
} from "recharts";
// import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// ── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#060D1A",
  bg2: "#0A1628",
  bg3: "#0F2040",
  bg4: "#071020",
  border: "#1A3050",
  border2: "#1E3A5F",
  critical: "#E84545",
  effective: "#2ECC71",
  lower: "#7F8C9A",
  excess: "#F39C12",
  flood: "#3498DB",
  heat: "#E74C3C",
  social: "#9B59B6",
  gold: "#F1C40F",
  text: "#E8F0FE",
  muted: "#7F9EC0",
  dim: "#4A6080",
};

const PC_COLOR = {
  "Critical Gap": T.critical,
  "Effective Target": T.effective,
  "Lower Priority": T.lower,
  "Potential Excess": T.excess,
};

const PC_BG = {
  "Critical Gap": "#2A0A0A",
  "Effective Target": "#0A1F0A",
  "Lower Priority": "#111820",
  "Potential Excess": "#1F1400",
};

const fmt$ = v => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${Math.round(v)}`;
const fmt1 = v => (Math.round(v * 10) / 10).toFixed(1);
const fmtN = v => Math.round(v).toLocaleString();

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.bg2, border: `1px solid ${T.border}`,
    borderRadius: 12, padding: "18px 20px", ...style
  }}>{children}</div>
);

const CardTitle = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: ".06em", color: T.muted, marginBottom: 12
  }}>{children}</div>
);

const KPI = ({ value, label, sub, color = T.gold, borderColor }) => (
  <div style={{
    background: T.bg3, border: `1px solid ${borderColor || T.border}`,
    borderTop: `3px solid ${borderColor || color}`,
    borderRadius: 10, padding: "16px 18px", textAlign: "center",
  }}>
    <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
    {sub && <div style={{ fontSize: 10, color: T.dim, marginTop: 4 }}>{sub}</div>}
  </div>
);

const Badge = ({ cls }) => (
  <span style={{
    background: PC_BG[cls], color: PC_COLOR[cls],
    border: `1px solid ${PC_COLOR[cls]}44`,
    padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
  }}>{cls}</span>
);

const TT = ({ contentStyle, ...props }) => (
  <Tooltip contentStyle={{
    background: T.bg3, border: `1px solid ${T.border}`,
    borderRadius: 8, fontSize: 11, color: T.text, ...contentStyle
  }} {...props} />
);

// ── NAV ───────────────────────────────────────────────────────────────────────
const TABS = ["Intro", "Executive Summary", "Risk Map", "Investment Gap", "Station Search", "2050 Projections"];

const Nav = ({ active, setActive }) => (
  <div style={{
    position: "sticky", top: 0, zIndex: 200,
    background: "#040B16", borderBottom: `1px solid ${T.border}`,
    padding: "0 24px", display: "flex", alignItems: "center", gap: 0,
    boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
  }}>
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      paddingRight: 20, borderRight: `1px solid ${T.border}`, marginRight: 8
    }}>
      <div style={{
        width: 34, height: 34, background: T.critical, borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 800, color: "#fff"
      }}>T</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Transit VQ</div>
        <div style={{ fontSize: 9, color: T.muted }}>NYC Subway Risk Analysis</div>
      </div>
    </div>
    {TABS.map((tab, i) => (
      <button key={tab} onClick={() => setActive(i)} style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "16px 12px", fontSize: 11, fontWeight: 600,
        color: active === i ? T.text : T.muted,
        borderBottom: active === i ? `2px solid ${T.critical}` : "2px solid transparent",
        textTransform: "uppercase", letterSpacing: ".04em", transition: "all .15s",
        whiteSpace: "nowrap",
      }}>{tab}</button>
    ))}
    <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 10, color: T.dim }}>Pace University · MTA Analytics Expo 2026</span>
      <span style={{
        background: T.critical, color: "#fff", fontSize: 9,
        fontWeight: 700, padding: "3px 8px", borderRadius: 12
      }}>EXPO 2026</span>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 0 — INTRO
// ══════════════════════════════════════════════════════════════════════════════
const Page0 = ({ setActive }) => (
  <div style={{ padding: "40px 24px", maxWidth: 1200, margin: "0 auto" }}>
    {/* Hero */}
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: T.critical, textTransform: "uppercase",
        letterSpacing: ".12em", marginBottom: 12
      }}>MTA Analytics & Career Discovery Expo · Pace University · April 2026</div>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: T.text, marginBottom: 16, lineHeight: 1.2 }}>
        Transit VQ<br />
        <span style={{ color: T.critical }}>Transit Vulnerability Quotient</span>
      </h1>
      <p style={{ fontSize: 16, color: T.muted, maxWidth: 700, margin: "0 auto 24px", lineHeight: 1.8 }}>
        A data-driven framework scoring all <strong style={{ color: T.text }}>445 NYC subway station complexes</strong> on
        dual climate risk — flood and extreme heat — cross-referenced against capital investment equity.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {["Aayush Suresh Jain", "Atharv Prashant Tungatkar", "FNU Bhavya", "Radhika Kaw", "Rushabh Virendra Gandhi"].map(n => (
          <span key={n} style={{
            background: T.bg3, border: `1px solid ${T.border}`,
            borderRadius: 20, padding: "4px 14px", fontSize: 11, color: T.muted
          }}>{n}</span>
        ))}
      </div>
    </div>

    {/* 3 Claims */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 40 }}>
      {[
        {
          num: "Claim 1", icon: "🌊",
          title: "Dual Risk Is Real & Measurable",
          color: T.flood,
          body: "Both flooding and extreme heat are intensifying and measurable at the individual station level. Wilcoxon signed-rank on all 445 stations: every single station has higher risk by 2050. Stat=0 means zero exceptions — flood risk rises +15.4pts, heat +3.5pts on average.",
          stat: "stat=0, p < 0.0001",
          statLabel: "Wilcoxon signed-rank — flood +15.4pts, heat +3.5pts by 2050",
        },
        {
          num: "Claim 2", icon: "👥",
          title: "Risk Falls on the Vulnerable",
          color: T.social,
          body: "Disproportionate climate exposure in socioeconomically vulnerable neighborhoods. Stations in the most socially vulnerable quartile have VQ scores 19 points higher than the least vulnerable. KS=0.821 confirms the two groups barely overlap — this is structural, not noise. Supporting: Spearman VQ~poverty ρ=0.870.",
          stat: "VQ diff +19pts, KS=0.821",
          statLabel: "Mann-Whitney quartiles + KS test, both p<0.0001",
        },
        {
          num: "Claim 3", icon: "💰",
          title: "$6.2B Is Inequitably Distributed",
          color: T.critical,
          body: "The $6.2B capital budget is not distributed proportionally to risk. Dunn post-hoc reveals Effective Target and Potential Excess receive statistically identical investment (p=0.24) — the system only penalizes Critical Gap. Critical Gap receives 5.2× less per rider than Effective Target.",
          stat: "5.2× disparity, ET=PE p=0.24",
          statLabel: "Kruskal-Wallis H=339 + Dunn post-hoc Bonferroni corrected",
        },
      ].map(c => (
        <div key={c.num} style={{
          background: T.bg2, border: `1px solid ${c.color}44`,
          borderTop: `4px solid ${c.color}`,
          borderRadius: 12, padding: "24px",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: c.color, textTransform: "uppercase",
            letterSpacing: ".06em", marginBottom: 6
          }}>{c.num}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 12 }}>{c.title}</div>
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.8, marginBottom: 16 }}>{c.body}</div>
          <div style={{ background: T.bg3, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{c.stat}</div>
            <div style={{ fontSize: 10, color: T.dim }}>{c.statLabel}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Data sources */}
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "24px", marginBottom: 32 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase",
        letterSpacing: ".06em", marginBottom: 16
      }}>Data Sources — 9 APIs, 445 Station Complexes</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          ["MTA Station Complexes", "Station IDs, locations, lines served", T.flood],
          ["MTA Capital Projects", "$6.2B in 16 line-specific projects", T.effective],
          ["MTA Hourly Ridership", "Daily boardings Q1 2025", T.effective],
          ["NYC Flood Vulnerability Index", "FVI score per census tract", T.flood],
          ["NYC Stormwater Flood Maps", "Zone classification 1–3", T.flood],
          ["NYC Heat Vulnerability Index", "Borough-level HVI score", T.heat],
          ["subwayheat.org (AI-scraped)", "Platform temp at 317 stations", T.heat],
          ["NYCHA Developments", "Public housing units within 0.5mi", T.social],
          ["Census ACS 2023", "Poverty rate, vehicle ownership", T.social],
        ].map(([name, desc, col]) => (
          <div key={name} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 4, borderRadius: 2, background: col,
              flexShrink: 0, alignSelf: "stretch", marginTop: 2
            }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{name}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div style={{ textAlign: "center" }}>
      <button onClick={() => setActive(1)} style={{
        background: T.critical, color: "#fff", border: "none",
        borderRadius: 10, padding: "14px 40px", fontSize: 14,
        fontWeight: 700, cursor: "pointer", letterSpacing: ".04em",
      }}>Explore the Dashboard →</button>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — EXECUTIVE SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
const Page1 = ({ stations }) => {
  const [distCol, setDistCol] = useState("transit_vq");

  const DIST_OPTIONS = [
    { key: "transit_vq", label: "Transit VQ Score", color: T.critical, unit: "" },
    { key: "avg_daily_ridership", label: "Daily Ridership", color: T.effective, unit: "" },
    { key: "heat_risk_score", label: "Heat Risk Score", color: T.heat, unit: "" },
    { key: "flood_risk_score", label: "Flood Risk Score", color: T.flood, unit: "" },
    { key: "social_vuln_score", label: "Social Vulnerability", color: T.social, unit: "" },
  ];

  const selectedOpt = DIST_OPTIONS.find(o => o.key === distCol);

  // Build histogram - simple count only
  const distData = useMemo(() => {
    const vals = stations.map(s => s[distCol]).filter(v => v != null && v > 0);
    const mn = Math.min(...vals), mx = Math.max(...vals);
    const BINS = 24;
    const step = (mx - mn) / BINS;
    const bins = Array.from({ length: BINS }, (_, i) => {
      const binMin = mn + i * step;
      const binMax = binMin + step;
      const count = vals.filter(v => v >= binMin && v < binMax).length;
      return { bin: Math.round(binMin), count };
    });
    return bins;
  }, [stations, distCol]);

  const mean = useMemo(() => {
    const vals = stations.map(s => s[distCol]).filter(v => v > 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [stations, distCol]);

  const cg = stations.filter(s => s.priority_class === "Critical Gap");
  const et = stations.filter(s => s.priority_class === "Effective Target");

  const boroughData = ["Brooklyn", "Bronx", "Manhattan", "Queens", "Staten Island"].map(b => {
    const all = stations.filter(s => s.borough === b);
    const cgb = all.filter(s => s.priority_class === "Critical Gap");
    return { borough: b, pct: Math.round(cgb.length / all.length * 100), count: cgb.length, total: all.length };
  }).sort((a, b) => b.pct - a.pct);

  const capitalByClass = ["Critical Gap", "Effective Target", "Lower Priority", "Potential Excess"].map(pc => ({
    name: pc, value: Math.round(stations.filter(s => s.priority_class === pc)
      .reduce((a, s) => a + s.total_capital_usd, 0) / 1e9 * 10) / 10,
  }));

  return (
    <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, #0F2040, #1A1040)`,
        border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.critical}`,
        borderRadius: 12, padding: "16px 24px", marginBottom: 20
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 6 }}>
          Transit VQ — NYC Subway Climate Risk & Investment Equity
        </div>
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.7 }}>
          445 station complexes scored · <span style={{ color: T.critical, fontWeight: 600 }}>
            Brooklyn &amp; Bronx face highest risk</span> yet receive{" "}
          <span style={{ color: T.critical, fontWeight: 600 }}>5.2× less investment per rider</span>
        </div>
      </div>

      {/* KPI row — stat test results */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
        <KPI value="89" label="Critical Gap Stations" sub="20% of system" color={T.critical} borderColor={T.critical} />
        <KPI value="stat=0" label="Risk Intensifying" sub="Wilcoxon p<0.0001 · zero exceptions" color={T.flood} borderColor={T.flood} />
        <KPI value="+19 VQ" label="Vulnerable Communities" sub="Top vs bottom social quartile" color={T.social} borderColor={T.social} />
        <KPI value="5.2×" label="Investment Disparity" sub="Mann-Whitney p<0.0001" color={T.excess} borderColor={T.excess} />
        <KPI value="p=0.24" label="ET = PE Investment" sub="Dunn's — only CG is penalized" color={T.effective} borderColor={T.effective} />
      </div>

      {/* Distribution chart + Borough bars */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <CardTitle>Distribution across Priority Classes</CardTitle>
            <div style={{ display: "flex", gap: 6 }}>
              {DIST_OPTIONS.map(o => (
                <button key={o.key} onClick={() => setDistCol(o.key)} style={{
                  padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                  cursor: "pointer", border: `1px solid ${distCol === o.key ? o.color : T.border}`,
                  background: distCol === o.key ? o.color + "22" : "transparent",
                  color: distCol === o.key ? o.color : T.muted, transition: "all .15s",
                }}>{o.label}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="bin" tick={{ fill: T.dim, fontSize: 9 }}
                tickFormatter={v => distCol === "avg_daily_ridership" ? `${Math.round(v / 1000)}K` : Math.round(v)} />
              <YAxis tick={{ fill: T.dim, fontSize: 9 }} allowDecimals={false}
                label={{ value: "Stations", angle: -90, position: "insideLeft", fill: T.dim, fontSize: 9 }} />
              <TT contentStyle={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8 }}
                formatter={v => [v, "Stations"]}
                labelFormatter={v => distCol === "avg_daily_ridership" ? `~${fmtN(v)} riders` : `Score ~${v}`} />
              <ReferenceLine x={Math.round(mean)} stroke={selectedOpt.color}
                strokeDasharray="4 4"
                label={{ value: `Mean: ${distCol === "avg_daily_ridership" ? fmtN(mean) : fmt1(mean)}`, fill: selectedOpt.color, fontSize: 9, position: "insideTopRight" }} />
              <Bar dataKey="count" fill={selectedOpt.color} fillOpacity={0.75} radius={[3, 3, 0, 0]} name="Stations" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <CardTitle>Critical Gap % by Borough</CardTitle>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={boroughData} layout="vertical" margin={{ left: 0, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: T.dim, fontSize: 9 }} domain={[0, 55]} />
                <YAxis type="category" dataKey="borough" tick={{ fill: T.text, fontSize: 10 }} width={85} />
                <TT formatter={(v, n, p) => [`${v}% (${p.payload.count} stations)`, "Critical Gap"]} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}
                  label={{ position: "right", fill: T.muted, fontSize: 9, formatter: v => `${v}%` }}>
                  {boroughData.map(b => <Cell key={b.borough} fill={b.pct > 20 ? T.critical : T.effective} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card style={{ flex: 1 }}>
            <CardTitle>Capital Share by Priority Class</CardTitle>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={capitalByClass} dataKey="value" cx="40%" cy="50%"
                  innerRadius={35} outerRadius={60} paddingAngle={2}>
                  {capitalByClass.map(d => <Cell key={d.name} fill={PC_COLOR[d.name]} />)}
                </Pie>
                <TT formatter={v => [`$${v}B`, "Capital"]} />
                <Legend iconType="circle" iconSize={7} layout="vertical" align="right" verticalAlign="middle"
                  formatter={v => <span style={{ color: T.muted, fontSize: 9 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Stat proof row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { test: "Wilcoxon Signed-Rank", result: "stat=0, p<0.0001", claim: "Claim 1", note: "Every station has higher flood (+15.4pts) and heat (+3.5pts) risk by 2050 — zero exceptions", color: T.flood },
          { test: "Mann-Whitney + KS", result: "KS=0.821, p<0.0001", claim: "Claim 2", note: "Most vulnerable quartile has VQ 19 points higher. Distributions barely overlap (KS=0.821)", color: T.social },
          { test: "Kruskal-Wallis", result: "H=339.3, p<0.0001", claim: "Claim 3", note: "Investment differs significantly across all 4 priority classes. Critical Gap median: $1,151/rider", color: T.critical },
          { test: "Dunn Post-hoc", result: "ET vs PE: p=0.24", claim: "Claim 3", note: "System does not reward correct prioritization — only penalizes Critical Gap stations", color: T.excess },
        ].map(s => (
          <div key={s.test} style={{
            background: T.bg3, border: `1px solid ${s.color}33`,
            borderLeft: `3px solid ${s.color}`, borderRadius: 10, padding: "14px 16px"
          }}>
            <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{s.test} · {s.claim}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.result}</div>
            <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6 }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* Top 10 Critical Gap Table */}
      <div style={{ marginTop: 16 }}>
        <Card>
          <CardTitle>Top 10 Critical Gap Stations — Highest Risk, Lowest Investment</CardTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["#", "Station", "Borough", "Lines", "Transit VQ", "Flood", "Heat", "Social", "Invest/Rider", "Riders/Day"].map(h => (
                    <th key={h} style={{
                      padding: "6px 10px", textAlign: "left", color: T.dim,
                      fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...stations.filter(s => s.priority_class === "Critical Gap")]
                  .sort((a, b) => b.transit_vq - a.transit_vq)
                  .slice(0, 10)
                  .map((s, i) => (
                    <tr key={s.complex_id} style={{
                      borderBottom: `1px solid ${T.border}`,
                      background: i % 2 === 0 ? "transparent" : T.bg3,
                    }}>
                      <td style={{ padding: "8px 10px", color: T.dim, fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ padding: "8px 10px", color: T.text, fontWeight: 600 }}>{s.complex_name}</td>
                      <td style={{ padding: "8px 10px", color: T.muted }}>{s.borough}</td>
                      <td style={{ padding: "8px 10px", color: T.dim, fontFamily: "monospace", fontSize: 10 }}>{s.lines_served}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{
                            width: Math.round(s.transit_vq * 0.7), height: 6,
                            background: T.critical, borderRadius: 3, maxWidth: 50
                          }} />
                          <span style={{ color: T.critical, fontWeight: 700 }}>{fmt1(s.transit_vq)}</span>
                        </div>
                      </td>
                      <td style={{ padding: "8px 10px", color: T.flood }}>{fmt1(s.flood_risk_score)}</td>
                      <td style={{ padding: "8px 10px", color: T.heat }}>{fmt1(s.heat_risk_score)}</td>
                      <td style={{ padding: "8px 10px", color: T.social }}>{fmt1(s.social_vuln_score)}</td>
                      <td style={{ padding: "8px 10px", color: T.critical, fontWeight: 600 }}>{fmt$(s.investment_per_rider)}</td>
                      <td style={{ padding: "8px 10px", color: T.muted }}>{fmtN(s.avg_daily_ridership)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — RISK MAP
// ══════════════════════════════════════════════════════════════════════════════
// const Page2 = ({ stations, setActive, setSearchStation }) => {

//   const [colorCol, setColorCol] = useState("transit_vq");
//   const [sliderVal, setSliderVal] = useState(0);

//   const COLOR_OPTIONS = [
//     { key: "transit_vq", label: "Transit VQ", min: 20, max: 77, fmt: v => fmt1(v) },
//     { key: "heat_risk_score", label: "Heat Risk", min: 9, max: 74, fmt: v => fmt1(v) },
//     { key: "flood_risk_score", label: "Flood Risk", min: 10, max: 79, fmt: v => fmt1(v) },
//     { key: "avg_daily_ridership", label: "Daily Ridership", min: 0, max: 124400, fmt: v => fmtN(v) },
//     { key: "social_vuln_score", label: "Social Vuln", min: 8, max: 88, fmt: v => fmt1(v) },
//   ];

//   const opt = COLOR_OPTIONS.find(o => o.key === colorCol);

//   const getColor = useCallback((val) => {
//     const pct = Math.max(0, Math.min(1, (val - opt.min) / (opt.max - opt.min)));
//     // Blue (low) → Purple → Red (high)
//     const r = Math.round(30 + pct * 210);
//     const g = Math.round(100 - pct * 90);
//     const b = Math.round(200 - pct * 160);
//     return `rgb(${r},${g},${b})`;
//   }, [opt]);

//   const gradientStops = Array.from({ length: 5 }, (_, i) => {
//     const pct = i / 4;
//     const val = opt.min + pct * (opt.max - opt.min);
//     return { color: getColor(val), val };
//   });

//   const highlighted = sliderVal > opt.min
//     ? new Set(stations.filter(s => s[colorCol] >= sliderVal).map(s => s.complex_id))
//     : null;

//   const handleClick = (s) => {
//     setSearchStation(s);
//     setActive(4);
//   };

//   return (
//     <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
//       {/* Controls */}
//       <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
//         <span style={{
//           fontSize: 11, color: T.muted, fontWeight: 700,
//           textTransform: "uppercase", letterSpacing: ".04em"
//         }}>Color by:</span>
//         {COLOR_OPTIONS.map(o => (
//           <button key={o.key} onClick={() => { setColorCol(o.key); setSliderVal(o.min); }} style={{
//             padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
//             cursor: "pointer",
//             border: `1px solid ${colorCol === o.key ? T.gold : T.border}`,
//             background: colorCol === o.key ? T.gold + "22" : "transparent",
//             color: colorCol === o.key ? T.gold : T.muted,
//           }}>{o.label}</button>
//         ))}
//         <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 10 }}>
//           <span style={{ fontSize: 11, color: T.muted, whiteSpace: "nowrap" }}>Highlight ≥</span>
//           <input type="range"
//             min={opt.min} max={opt.max}
//             step={Math.round((opt.max - opt.min) / 100)}
//             value={sliderVal || opt.min}
//             onChange={e => setSliderVal(parseFloat(e.target.value))}
//             style={{ width: 140, accentColor: T.gold }} />
//           <span style={{ fontSize: 12, color: T.gold, minWidth: 70, fontWeight: 700 }}>
//             {sliderVal > opt.min ? opt.fmt(sliderVal) : "Off"}
//           </span>
//           {sliderVal > opt.min && (
//             <button onClick={() => setSliderVal(opt.min)} style={{
//               background: "none", border: `1px solid ${T.border}`, borderRadius: 6,
//               color: T.muted, fontSize: 10, padding: "2px 8px", cursor: "pointer",
//             }}>Reset</button>
//           )}
//         </div>
//         <span style={{ marginLeft: "auto", fontSize: 11, color: T.muted }}>
//           {highlighted ? `${highlighted.size} stations highlighted · ` : ""}
//           Click any station to open in search
//         </span>
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
//         {/* MAP */}
//         <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}`, height: 520 }}>
//           <MapContainer
//             center={[40.72, -73.94]}
//             zoom={11}
//             style={{ height: "100%", width: "100%", background: "#060D1A" }}
//             zoomControl={true}
//           >
//             {/* CartoDB Dark Matter base — shows streets and borough boundaries */}
//             <TileLayer
//               url="https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png"
//               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
//               subdomains="abcd"
//               maxZoom={19}
//             />

//             {/* Station dots */}
//             {stations.map(s => {
//               const val = s[colorCol];
//               const col = getColor(val);
//               const isHighlighted = highlighted ? highlighted.has(s.complex_id) : true;
//               const radius = isHighlighted
//                 ? 4 + (s.transit_vq / 100) * 5
//                 : 2.5;
//               const opacity = isHighlighted ? 0.92 : 0.2;

//               return (
//                 <CircleMarker
//                   key={s.complex_id}
//                   center={[s.latitude, s.longitude]}
//                   radius={radius}
//                   pathOptions={{
//                     fillColor: isHighlighted ? col : "#4A6080",
//                     fillOpacity: opacity,
//                     color: isHighlighted && s.priority_class === "Critical Gap" ? "#fff" : "transparent",
//                     weight: isHighlighted && s.priority_class === "Critical Gap" ? 0.8 : 0,
//                   }}
//                   eventHandlers={{ click: () => handleClick(s) }}
//                 >
//                   <Popup>
//                     <div style={{
//                       background: "#0A1628", color: "#E8F0FE",
//                       borderRadius: 8, padding: "8px 12px",
//                       fontFamily: "'Segoe UI', Arial, sans-serif",
//                       minWidth: 180,
//                     }}>
//                       <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.complex_name}</div>
//                       <div style={{ fontSize: 11, color: "#7F9EC0", marginBottom: 6 }}>
//                         {s.borough} · Lines: {s.lines_served}
//                       </div>
//                       <div style={{
//                         display: "inline-block", padding: "2px 8px", borderRadius: 12,
//                         background: PC_BG[s.priority_class], color: PC_COLOR[s.priority_class],
//                         fontSize: 10, fontWeight: 700, marginBottom: 8,
//                         border: `1px solid ${PC_COLOR[s.priority_class]}44`,
//                       }}>{s.priority_class}</div>
//                       <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
//                         {[
//                           ["Transit VQ", fmt1(s.transit_vq), PC_COLOR[s.priority_class]],
//                           ["Flood Risk", fmt1(s.flood_risk_score), "#3498DB"],
//                           ["Heat Risk", fmt1(s.heat_risk_score), "#E74C3C"],
//                           ["Invest/Rider", fmt$(s.investment_per_rider), "#7F9EC0"],
//                           ["Daily Riders", fmtN(s.avg_daily_ridership), "#7F9EC0"],
//                           ["Platform Temp", `${s.platform_temp_f}°F`, "#E74C3C"],
//                         ].map(([l, v, c]) => (
//                           <tr key={l}>
//                             <td style={{ color: "#4A6080", paddingBottom: 3 }}>{l}</td>
//                             <td style={{ color: c, fontWeight: 600, textAlign: "right" }}>{v}</td>
//                           </tr>
//                         ))}
//                       </table>
//                       <div style={{
//                         marginTop: 10, textAlign: "center", fontSize: 10,
//                         color: "#3498DB", cursor: "pointer",
//                         background: "#0F2040", padding: "5px", borderRadius: 6,
//                       }}>
//                         Click marker to open in Station Search →
//                       </div>
//                     </div>
//                   </Popup>
//                 </CircleMarker>
//               );
//             })}
//           </MapContainer>
//         </div>

//         {/* Sidebar */}
//         <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//           {/* Gradient legend */}
//           <div style={{ border: "1px solid #333", padding: 12, borderRadius: 12 }}>
//             <div style={{ fontWeight: 700, marginBottom: 8 }}>{opt.label} — Color Scale</div>
//             <div style={{
//               height: 12, borderRadius: 6,
//               background: `linear-gradient(to right, ${gradientStops.map(s => s.color).join(",")})`,
//               marginBottom: 6,
//             }} />
//             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted }}>
//               <span>Low: {opt.fmt(opt.min)}</span>
//               <span>High: {opt.fmt(opt.max)}</span>
//             </div>
//             <div style={{ fontSize: 10, color: T.dim, marginTop: 8 }}>
//               Dot size = Transit VQ score · White ring = Critical Gap
//             </div>
//           </div>

//           <Card>
//             <CardTitle>Borough Summary</CardTitle>
//             {["Brooklyn", "Bronx", "Manhattan", "Queens", "Staten Island"].map(b => {
//               const all = stations.filter(s => s.borough === b);
//               const cgb = all.filter(s => s.priority_class === "Critical Gap");
//               const pct = Math.round(cgb.length / all.length * 100);
//               return (
//                 <div key={b} style={{ marginBottom: 10 }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
//                     <span style={{ color: pct > 20 ? T.critical : T.effective, fontWeight: 600 }}>{b}</span>
//                     <span style={{ color: T.muted }}>{cgb.length} CG / {all.length}</span>
//                   </div>
//                   <div style={{ height: 5, background: T.bg3, borderRadius: 3, overflow: "hidden" }}>
//                     <div style={{
//                       width: `${pct}%`, height: "100%",
//                       background: pct > 20 ? T.critical : T.effective, borderRadius: 3
//                     }} />
//                   </div>
//                 </div>
//               );
//             })}
//           </Card>

//           <Card>
//             <CardTitle>System Stats</CardTitle>
//             {[
//               ["Total Stations", "445", T.text],
//               ["Critical Gap", "89", T.critical],
//               ["Effective Target", "133", T.effective],
//               ["Potential Excess", "89", T.excess],
//               ["Lower Priority", "134", T.lower],
//               ["Median VQ", "54.0", T.gold],
//               ["Median $/Rider", "$1,711", T.muted],
//             ].map(([l, v, c]) => (
//               <div key={l} style={{
//                 display: "flex", justifyContent: "space-between",
//                 padding: "5px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12
//               }}>
//                 <span style={{ color: T.muted }}>{l}</span>
//                 <span style={{ color: c, fontWeight: 600 }}>{v}</span>
//               </div>
//             ))}
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

const RiskMapGL = ({
  stations,
  colorCol,
  getColor,
  highlighted,
  handleClick,
}) => {
  const [popupStation, setPopupStation] = useState(null);

  return (
    <Map
      initialViewState={{
        longitude: -73.94,
        latitude: 40.72,
        zoom: 10.8,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      attributionControl={true}
      reuseMaps
    >
      <NavigationControl position="top-right" />

      {stations.map((s) => {
        const val = s[colorCol];
        const col = getColor(val);
        const isHighlighted = highlighted ? highlighted.has(s.complex_id) : true;

        const size = isHighlighted
          ? 8 + (s.transit_vq / 100) * 12
          : 5;

        const opacity = isHighlighted ? 0.92 : 0.22;

        return (
          <Marker
            key={s.complex_id}
            longitude={s.longitude}
            latitude={s.latitude}
            anchor="center"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setPopupStation(s);
              }}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: "50%",
                background: isHighlighted ? col : "#4A6080",
                opacity,
                cursor: "pointer",
                border: isHighlighted && s.priority_class === "Critical Gap"
                  ? "1.5px solid #ffffff"
                  : "0px solid transparent",
                boxShadow: isHighlighted
                  ? `0 0 0 1px rgba(0,0,0,0.25)`
                  : "none",
                transition: "all 0.15s ease",
              }}
              title={s.complex_name}
            />
          </Marker>
        );
      })}

      {popupStation && (
        <Popup
          longitude={popupStation.longitude}
          latitude={popupStation.latitude}
          anchor="top"
          closeButton={true}
          closeOnClick={false}
          onClose={() => setPopupStation(null)}
          offset={10}
        >
          <div style={{ minWidth: 210, color: "#0A1628" }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              {popupStation.complex_name}
            </div>
            <div style={{ fontSize: 11, color: "#52657A", marginBottom: 6 }}>
              {popupStation.borough} · Lines: {popupStation.lines_served}
            </div>

            <div
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 12,
                background: PC_BG[popupStation.priority_class],
                color: PC_COLOR[popupStation.priority_class],
                fontSize: 10,
                fontWeight: 700,
                marginBottom: 8,
                border: `1px solid ${PC_COLOR[popupStation.priority_class]}44`,
              }}
            >
              {popupStation.priority_class}
            </div>

            <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Transit VQ", fmt1(popupStation.transit_vq), PC_COLOR[popupStation.priority_class]],
                  ["Flood Risk", fmt1(popupStation.flood_risk_score), "#3498DB"],
                  ["Heat Risk", fmt1(popupStation.heat_risk_score), "#E74C3C"],
                  ["Invest/Rider", fmt$(popupStation.investment_per_rider), "#52657A"],
                  ["Daily Riders", fmtN(popupStation.avg_daily_ridership), "#52657A"],
                  ["Platform Temp", `${popupStation.platform_temp_f}°F`, "#E74C3C"],
                ].map(([label, value, color]) => (
                  <tr key={label}>
                    <td style={{ color: "#6D7F93", paddingBottom: 3 }}>{label}</td>
                    <td style={{ color, fontWeight: 600, textAlign: "right", paddingBottom: 3 }}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => {
                handleClick(popupStation);
                setPopupStation(null);
              }}
              style={{
                marginTop: 10,
                width: "100%",
                border: "none",
                borderRadius: 6,
                padding: "8px 10px",
                background: "#0F2040",
                color: "#E8F0FE",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Open in Station Search →
            </button>
          </div>
        </Popup>
      )}
    </Map>
  );
};

const Page2 = ({ stations, setActive, setSearchStation }) => {
  const [colorCol, setColorCol] = useState("transit_vq");
  const [sliderVal, setSliderVal] = useState(0);

  const COLOR_OPTIONS = [
    { key: "transit_vq", label: "Transit VQ", min: 20, max: 77, fmt: v => fmt1(v) },
    { key: "heat_risk_score", label: "Heat Risk", min: 9, max: 74, fmt: v => fmt1(v) },
    { key: "flood_risk_score", label: "Flood Risk", min: 10, max: 79, fmt: v => fmt1(v) },
    { key: "avg_daily_ridership", label: "Daily Ridership", min: 0, max: 124400, fmt: v => fmtN(v) },
    { key: "social_vuln_score", label: "Social Vuln", min: 8, max: 88, fmt: v => fmt1(v) },
  ];

  const opt = COLOR_OPTIONS.find(o => o.key === colorCol);

  const getColor = useCallback((val) => {
    const pct = Math.max(0, Math.min(1, (val - opt.min) / (opt.max - opt.min)));
    const r = Math.round(30 + pct * 210);
    const g = Math.round(100 - pct * 90);
    const b = Math.round(200 - pct * 160);
    return `rgb(${r},${g},${b})`;
  }, [opt]);

  const gradientStops = Array.from({ length: 5 }, (_, i) => {
    const pct = i / 4;
    const val = opt.min + pct * (opt.max - opt.min);
    return { color: getColor(val), val };
  });

  const highlighted = sliderVal > opt.min
    ? new Set(stations.filter(s => s[colorCol] >= sliderVal).map(s => s.complex_id))
    : null;

  const handleClick = (s) => {
    setSearchStation(s);
    setActive(4);
  };

  return (
    <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{
          fontSize: 11, color: T.muted, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: ".04em"
        }}>
          Color by:
        </span>

        {COLOR_OPTIONS.map(o => (
          <button
            key={o.key}
            onClick={() => {
              setColorCol(o.key);
              setSliderVal(o.min);
            }}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              border: `1px solid ${colorCol === o.key ? T.gold : T.border}`,
              background: colorCol === o.key ? T.gold + "22" : "transparent",
              color: colorCol === o.key ? T.gold : T.muted,
            }}
          >
            {o.label}
          </button>
        ))}

        <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: T.muted, whiteSpace: "nowrap" }}>Highlight ≥</span>
          <input
            type="range"
            min={opt.min}
            max={opt.max}
            step={Math.max(1, Math.round((opt.max - opt.min) / 100))}
            value={sliderVal || opt.min}
            onChange={e => setSliderVal(parseFloat(e.target.value))}
            style={{ width: 140, accentColor: T.gold }}
          />
          <span style={{ fontSize: 12, color: T.gold, minWidth: 70, fontWeight: 700 }}>
            {sliderVal > opt.min ? opt.fmt(sliderVal) : "Off"}
          </span>
          {sliderVal > opt.min && (
            <button
              onClick={() => setSliderVal(opt.min)}
              style={{
                background: "none",
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                color: T.muted,
                fontSize: 10,
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          )}
        </div>

        <span style={{ marginLeft: "auto", fontSize: 11, color: T.muted }}>
          {highlighted ? `${highlighted.size} stations highlighted · ` : ""}
          Click any station to open details
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${T.border}`,
            height: 520,
            background: "#060D1A",
          }}
        >
          <RiskMapGL
            stations={stations}
            colorCol={colorCol}
            getColor={getColor}
            highlighted={highlighted}
            handleClick={handleClick}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ border: "1px solid #333", padding: 12, borderRadius: 12, background: T.bg2 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: T.text }}>
              {opt.label} — Color Scale
            </div>
            <div
              style={{
                height: 12,
                borderRadius: 6,
                background: `linear-gradient(to right, ${gradientStops.map(s => s.color).join(",")})`,
                marginBottom: 6,
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted }}>
              <span>Low: {opt.fmt(opt.min)}</span>
              <span>High: {opt.fmt(opt.max)}</span>
            </div>
            <div style={{ fontSize: 10, color: T.dim, marginTop: 8 }}>
              Dot size = Transit VQ score · White ring = Critical Gap
            </div>
          </div>

          <Card>
            <CardTitle>Borough Summary</CardTitle>
            {["Brooklyn", "Bronx", "Manhattan", "Queens", "Staten Island"].map(b => {
              const all = stations.filter(s => s.borough === b);
              const cgb = all.filter(s => s.priority_class === "Critical Gap");
              const pct = all.length ? Math.round((cgb.length / all.length) * 100) : 0;

              return (
                <div key={b} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: pct > 20 ? T.critical : T.effective, fontWeight: 600 }}>
                      {b}
                    </span>
                    <span style={{ color: T.muted }}>
                      {cgb.length} CG / {all.length}
                    </span>
                  </div>
                  <div style={{ height: 5, background: T.bg3, borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: pct > 20 ? T.critical : T.effective,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>

          <Card>
            <CardTitle>System Stats</CardTitle>
            {[
              ["Total Stations", "445", T.text],
              ["Critical Gap", "89", T.critical],
              ["Effective Target", "133", T.effective],
              ["Potential Excess", "89", T.excess],
              ["Lower Priority", "134", T.lower],
              ["Median VQ", "54.0", T.gold],
              ["Median $/Rider", "$1,711", T.muted],
            ].map(([l, v, c]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: `1px solid ${T.border}`,
                  fontSize: 12,
                }}
              >
                <span style={{ color: T.muted }}>{l}</span>
                <span style={{ color: c, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 3 — INVESTMENT GAP
// ══════════════════════════════════════════════════════════════════════════════
const Page3 = ({ stations }) => {
  const scatterData = stations
    .filter(s => s.investment_per_rider > 0 && s.investment_per_rider < 500000)
    .map(s => ({
      x: parseFloat(fmt1(s.transit_vq)),
      y: parseFloat(fmt1(Math.log10(s.investment_per_rider))),
      raw_y: s.investment_per_rider,
      name: s.complex_name, borough: s.borough, pc: s.priority_class,
    }));

  const byClass = ["Critical Gap", "Effective Target", "Lower Priority", "Potential Excess"].map(pc => ({
    name: pc,
    avg: Math.round(stations.filter(s => s.priority_class === pc)
      .reduce((a, s, _, arr) => a + s.investment_per_rider / arr.length, 0)),
  }));

  return (
    <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 16 }}>
        {/* Main scatter */}
        <Card>
          <CardTitle>Transit VQ vs Capital Investment per Rider (Log Scale)</CardTitle>
          <div style={{ fontSize: 11, color: T.dim, marginBottom: 10, fontStyle: "italic" }}>
            Each dot = one station · Hover for station detail · Log scale Y-axis
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="x" type="number" domain={[18, 80]}
                tick={{ fill: T.muted, fontSize: 10 }}
                label={{ value: "Transit VQ Score →", position: "insideBottom", fill: T.dim, fontSize: 10, dy: 20 }} />
              <YAxis dataKey="y" type="number"
                tick={{ fill: T.muted, fontSize: 10 }}
                tickFormatter={v => `$${Math.round(Math.pow(10, v) / 1000)}K`}
                label={{ value: "$/Rider (log)", angle: -90, position: "insideLeft", fill: T.dim, fontSize: 10 }} />
              <TT content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ padding: "10px 14px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8 }}>
                    <div style={{ color: T.text, fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
                    <div style={{ color: T.muted, fontSize: 11 }}>{d.borough}</div>
                    <div style={{ color: PC_COLOR[d.pc], fontSize: 11, margin: "4px 0" }}>{d.pc}</div>
                    <div style={{ color: T.muted, fontSize: 11 }}>VQ: {d.x} · $/Rider: {fmt$(d.raw_y)}</div>
                  </div>
                );
              }} />
              {Object.keys(PC_COLOR).map(pc => (
                <Scatter key={pc} name={pc}
                  data={scatterData.filter(d => d.pc === pc)}
                  fill={PC_COLOR[pc]} opacity={0.75}
                  shape={props => <circle cx={props.cx} cy={props.cy} r={4} fill={PC_COLOR[pc]} fillOpacity={0.75} />} />
              ))}
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span style={{ color: T.muted, fontSize: 10 }}>{v}</span>} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <CardTitle>Average Investment per Rider by Priority Class</CardTitle>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={byClass} layout="vertical" margin={{ left: 0, right: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: T.dim, fontSize: 9 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fill: T.muted, fontSize: 9 }} width={95} />
                <TT formatter={v => [fmt$(v), "Avg Invest/Rider"]} />
                <Bar dataKey="avg" radius={[0, 4, 4, 0]}
                  label={{ position: "right", fill: T.muted, fontSize: 9, formatter: v => fmt$(v) }}>
                  {byClass.map(d => <Cell key={d.name} fill={PC_COLOR[d.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardTitle>Investment Equity — The Core Paradox</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["Critical Gap", "Avg Riders/Day", "11,768", T.critical],
                ["Effective Target", "Avg Riders/Day", "3,085", T.effective],
                ["Critical Gap", "Avg $/Rider", "$1,086", T.critical],
                ["Effective Target", "Avg $/Rider", "$5,654", T.effective],
              ].map(([cls, label, val, col]) => (
                <div key={cls + label} style={{
                  background: PC_BG[cls], border: `1px solid ${col}33`,
                  borderRadius: 8, padding: "10px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: col }}>{val}</div>
                  <div style={{ fontSize: 9, color: T.dim }}>{cls}</div>
                  <div style={{ fontSize: 9, color: T.muted }}>{label}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>Effect Size — Cohen's d = −1.21 (Large)</CardTitle>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
              The investment gap is not just statistically significant — it is a{" "}
              <strong style={{ color: T.critical }}>large practical effect</strong>. By convention,
              d&gt;0.8 is large. At 1.21 it is very large, meaning the two distributions
              barely overlap at all.
            </div>
            <div style={{ marginTop: 10, background: T.bg3, borderRadius: 8, padding: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: T.critical }}>Critical Gap avg: $1,086/rider</span>
                <span style={{ color: T.effective }}>Effective: $5,654/rider</span>
              </div>
              <div style={{ height: 8, background: T.bg, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                <div style={{ width: "16%", background: T.critical, borderRadius: "4px 0 0 4px" }} />
                <div style={{ width: "84%", background: T.effective, borderRadius: "0 4px 4px 0", opacity: 0.4 }} />
              </div>
              <div style={{ fontSize: 9, color: T.dim, marginTop: 4, textAlign: "center" }}>Proportional bar — 5.2× difference</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Investment Gap by Borough — grouped bar */}
        <Card>
          <CardTitle>Average Investment per Rider by Borough — Critical Gap Highlighted</CardTitle>
          <div style={{ fontSize: 11, color: T.dim, marginBottom: 8, fontStyle: "italic" }}>
            Bronx and Brooklyn receive least investment despite highest risk concentration
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={["Brooklyn", "Bronx", "Manhattan", "Queens", "Staten Island"].map(b => {
                const bs = stations.filter(s => s.borough === b);
                const cg = bs.filter(s => s.priority_class === "Critical Gap");
                const et = bs.filter(s => s.priority_class === "Effective Target");
                const avg = v => v.length ? Math.round(v.reduce((a, s) => a + s.investment_per_rider, 0) / v.length) : 0;
                return { borough: b.replace(" Island", ""), all: avg(bs), cg: avg(cg), et: avg(et) };
              })}
              margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="borough" tick={{ fill: T.muted, fontSize: 10 }} />
              <YAxis tick={{ fill: T.dim, fontSize: 9 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <TT contentStyle={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8 }}
                formatter={v => [fmt$(v), ""]} labelStyle={{ color: T.text }} />
              <Legend iconType="circle" iconSize={7}
                formatter={v => <span style={{ color: T.muted, fontSize: 9 }}>{v}</span>} />
              <Bar dataKey="all" name="All Stations avg" fill={T.muted} fillOpacity={0.5} radius={[3, 3, 0, 0]} />
              <Bar dataKey="cg" name="Critical Gap avg" fill={T.critical} radius={[3, 3, 0, 0]} />
              <Bar dataKey="et" name="Effective Target avg" fill={T.effective} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Statistical proof */}
        <Card>
          <CardTitle>Statistical Proof — Claim 3</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { test: "Kruskal-Wallis", result: "H=339.3, p<0.0001", detail: "Investment differs significantly across all 4 priority classes.", color: T.flood },
              { test: "Dunn CG vs ET", result: "p<0.0001", detail: "Critical Gap receives significantly less than Effective Target. Median: $1,151 vs $3,606/rider.", color: T.critical },
              { test: "Dunn CG vs PE", result: "p<0.0001", detail: "Critical Gap receives significantly less than Potential Excess. Median: $1,151 vs $4,496/rider.", color: T.critical },
              { test: "Dunn ET vs PE", result: "p=0.24 — NOT sig", detail: "Effective and Potential Excess get same investment — system only penalizes Critical Gap, not rewards correct ones.", color: T.excess },
              { test: "Cohen's d", result: "d = −1.21", detail: "Large effect size — CG and ET investment distributions barely overlap.", color: T.effective },
            ].map(s => (
              <div key={s.test} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                padding: "10px 12px", background: T.bg3,
                borderLeft: `3px solid ${s.color}`, borderRadius: "0 6px 6px 0",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>{s.test}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.result}</span>
                  </div>
                  <div style={{ fontSize: 10, color: T.dim, lineHeight: 1.5 }}>{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 4 — STATION SEARCH
// ══════════════════════════════════════════════════════════════════════════════
const Page4 = ({ stations, preSelected, clearPreSelected }) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showDrop, setShowDrop] = useState(false);

  useEffect(() => {
    if (preSelected) {
      setSelected(preSelected);
      setQuery(preSelected.complex_name);
      clearPreSelected();
    }
  }, [preSelected, clearPreSelected]);

  const matches = useMemo(() =>
    query.length > 1
      ? stations.filter(s => s.complex_name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
      : [], [query, stations]);

  const AVGS = { flood: 55.3, heat: 50.1, social: 53.2, vq: 52.9, ridership: 7807 };

  const vqRank = selected ? stations.filter(s => s.transit_vq > selected.transit_vq).length + 1 : null;
  const invRank = selected ? stations.filter(s => s.investment_per_rider < selected.investment_per_rider).length + 1 : null;

  // Radar chart data
  const radarData = selected ? [
    { metric: "Flood Risk", val: parseFloat(fmt1(selected.flood_risk_score)), avg: AVGS.flood, max: 100 },
    { metric: "Heat Risk", val: parseFloat(fmt1(selected.heat_risk_score)), avg: AVGS.heat, max: 100 },
    { metric: "Social Vuln", val: parseFloat(fmt1(selected.social_vuln_score)), avg: AVGS.social, max: 100 },
    { metric: "Transit VQ", val: parseFloat(fmt1(selected.transit_vq)), avg: AVGS.vq, max: 100 },
    { metric: "Ridership\n(scaled)", val: Math.round(selected.avg_daily_ridership / 1244), avg: Math.round(AVGS.ridership / 1244), max: 100 },
  ] : [];

  return (
    <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <input value={query}
          onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
          onFocus={() => setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 200)}
          placeholder="🔍  Search any of 445 NYC subway stations... (e.g. Coney Island, Atlantic Av, 149 St)"
          style={{
            width: "100%", padding: "14px 20px", fontSize: 15,
            background: T.bg2, border: `2px solid ${T.border}`, borderRadius: 10,
            color: T.text, outline: "none", boxSizing: "border-box",
            transition: "border .15s",
          }} />
        {showDrop && matches.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
            background: T.bg2, border: `1px solid ${T.border}`,
            borderRadius: "0 0 10px 10px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}>
            {matches.map(s => (
              <div key={s.complex_id}
                onMouseDown={() => { setSelected(s); setQuery(s.complex_name); setShowDrop(false); }}
                style={{
                  padding: "10px 16px", cursor: "pointer", borderBottom: `1px solid ${T.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.bg3}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span>
                  <span style={{ color: T.text, fontWeight: 600 }}>{s.complex_name}</span>
                  <span style={{ color: T.muted, fontSize: 11, marginLeft: 8 }}>{s.borough} · {s.lines_served}</span>
                </span>
                <Badge cls={s.priority_class} />
              </div>
            ))}
          </div>
        )}
      </div>

      {!selected && (
        <div style={{ textAlign: "center", padding: "60px 0", color: T.dim }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.muted, marginBottom: 6 }}>Search for any station</div>
          <div style={{ fontSize: 13 }}>Try "Coney Island", "Atlantic Av", "149 St", "Times Sq", "Beverley Rd"</div>
        </div>
      )}

      {selected && (
        <>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
            padding: "14px 20px", background: T.bg2,
            border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${PC_COLOR[selected.priority_class]}`, borderRadius: 10,
          }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{selected.complex_name}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                {selected.borough} · Lines: <span style={{ fontFamily: "monospace" }}>{selected.lines_served}</span> ·
                Platform: <span style={{ color: T.heat }}>{selected.platform_temp_f}°F</span> ·
                ADA: {selected.ada === 2 ? "Full" : selected.ada === 1 ? "Partial" : "None"}
              </div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <Badge cls={selected.priority_class} />
              <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
                VQ Rank #{vqRank} of 445 · Invest Rank #{invRank} lowest
              </div>
            </div>
          </div>

          {/* 6 KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              ["Transit VQ", fmt1(selected.transit_vq), PC_COLOR[selected.priority_class]],
              ["Flood Risk", fmt1(selected.flood_risk_score), T.flood],
              ["Heat Risk", fmt1(selected.heat_risk_score), T.heat],
              ["Social Vuln", fmt1(selected.social_vuln_score), T.social],
              ["Invest/Rider", fmt$(selected.investment_per_rider), selected.investment_per_rider < 1711 ? T.critical : T.effective],
              ["Daily Riders", fmtN(selected.avg_daily_ridership), T.text],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c, lineHeight: 1, marginBottom: 4 }}>{v}</div>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Radar chart */}
            <Card>
              <CardTitle>Risk Profile — Radar Chart vs System Average</CardTitle>
              <div style={{ fontSize: 10, color: T.dim, marginBottom: 8, fontStyle: "italic" }}>
                Ridership scaled to 0–100 for comparison (÷1,244). White line = this station, dashed = system average.
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke={T.border} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: T.muted, fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: T.dim, fontSize: 8 }} tickCount={4} />
                  <Radar name="This Station" dataKey="val" stroke={PC_COLOR[selected.priority_class]}
                    fill={PC_COLOR[selected.priority_class]} fillOpacity={0.25} strokeWidth={2} />
                  <Radar name="System Average" dataKey="avg" stroke={T.muted}
                    fill={T.muted} fillOpacity={0.08} strokeWidth={1} strokeDasharray="4 4" />
                  <Legend iconType="circle" iconSize={8}
                    formatter={v => <span style={{ color: T.muted, fontSize: 10 }}>{v}</span>} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            {/* Insight */}
            <Card>
              <CardTitle>Station Analysis & Recommendation</CardTitle>
              <div style={{
                background: PC_BG[selected.priority_class],
                border: `1px solid ${PC_COLOR[selected.priority_class]}44`,
                borderRadius: 8, padding: "14px", marginBottom: 12,
                fontSize: 12, color: T.muted, lineHeight: 1.9,
              }}>
                {selected.priority_class === "Critical Gap" ? <>
                  <strong style={{ color: T.critical }}>⚠ Critical Gap Station</strong><br />
                  Ranks #{vqRank} of 445 on climate vulnerability but receives only{" "}
                  <strong style={{ color: T.text }}>{fmt$(selected.investment_per_rider)}/rider</strong> —
                  {" "}{Math.round(5654 / Math.max(selected.investment_per_rider, 1))}× less than the average
                  Effective Target station. Serves{" "}
                  <strong style={{ color: T.text }}>{fmtN(selected.avg_daily_ridership)}</strong> daily riders.
                  By 2050, projected VQ rises to{" "}
                  <strong style={{ color: T.critical }}>{fmt1(selected.transit_vq_2050)}</strong>.
                </> : selected.priority_class === "Effective Target" ? <>
                  <strong style={{ color: T.effective }}>✓ Effective Target</strong><br />
                  Above-median risk with above-median investment. The system is working correctly for this station.
                  2050 projected VQ: <strong style={{ color: T.effective }}>{fmt1(selected.transit_vq_2050)}</strong>.
                </> : selected.priority_class === "Potential Excess" ? <>
                  <strong style={{ color: T.excess }}>⚡ Potential Excess</strong><br />
                  Below-median risk but receives {fmt$(selected.investment_per_rider)}/rider.
                  Resources may be better redirected to Critical Gap stations.
                </> : <>
                  <strong style={{ color: T.lower }}>Lower Priority</strong><br />
                  Below-median risk and investment. Current allocation appears appropriate.
                  Monitor for risk escalation by 2050.
                </>}
              </div>
              <div style={{
                background: "#0A1F3A", border: `1px solid ${T.flood}44`,
                borderRadius: 8, padding: "12px 14px", fontSize: 12,
                color: T.muted, lineHeight: 1.8, marginBottom: 12,
              }}>
                <strong style={{ color: T.flood }}>💡 Recommendation: </strong>
                {selected.priority_class === "Critical Gap"
                  ? `Apply R1 — minimum $1,711/rider investment floor. Current total shortfall: ${fmt$((1711 - selected.investment_per_rider) * selected.avg_daily_ridership)}.`
                  : selected.priority_class === "Potential Excess"
                    ? "Apply R6 — require climate equity review for all capital projects >$50M at this station."
                    : "Continue monitoring. Re-run Transit VQ annually with updated capital data."}
              </div>
              {/* Borough comparison */}
              <div style={{ fontSize: 11, color: T.dim, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>
                Borough Comparison — {selected.borough}
              </div>
              {(() => {
                const bStations = stations.filter(s => s.borough === selected.borough);
                const bAvgVQ = bStations.reduce((a, s) => a + s.transit_vq, 0) / bStations.length;
                const bAvgInv = bStations.reduce((a, s) => a + s.investment_per_rider, 0) / bStations.length;
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      ["This Station VQ", fmt1(selected.transit_vq), PC_COLOR[selected.priority_class]],
                      ["Borough Avg VQ", fmt1(bAvgVQ), T.muted],
                      ["This Station $/Rider", fmt$(selected.investment_per_rider), PC_COLOR[selected.priority_class]],
                      ["Borough Avg $/Rider", fmt$(bAvgInv), T.muted],
                    ].map(([l, v, c]) => (
                      <div key={l} style={{ background: T.bg3, borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
                        <div style={{ fontSize: 10, color: T.dim }}>{l}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 5 — 2050 PROJECTIONS
// ══════════════════════════════════════════════════════════════════════════════
const Page5 = ({ stations }) => {
  const med_vq_2050 = 59.5, med_inv = 1711;

  const classify2050 = s => {
    const hr = s.transit_vq_2050 > med_vq_2050;
    const hi = s.investment_per_rider > med_inv;
    if (hr && !hi) return "Critical Gap";
    if (hr && hi) return "Effective Target";
    if (!hr && hi) return "Potential Excess";
    return "Lower Priority";
  };

  const withClass2050 = stations.map(s => ({ ...s, pc2050: classify2050(s) }));

  const boroughData = ["Brooklyn", "Bronx", "Manhattan", "Queens", "Staten Island"].map(b => ({
    borough: b.replace(" Island", ""),
    now: stations.filter(s => s.borough === b && s.priority_class === "Critical Gap").length,
    proj: withClass2050.filter(s => s.borough === b && s.pc2050 === "Critical Gap").length,
  }));

  const scatterData = stations.map(s => ({
    x: parseFloat(fmt1(s.transit_vq)),
    y: parseFloat(fmt1(s.transit_vq_2050)),
    name: s.complex_name, pc: s.priority_class,
  }));

  const topFundingGap = [...stations]
    .filter(s => s.priority_class === "Critical Gap" && s.funding_gap_2050_usd > 0)
    .sort((a, b) => b.funding_gap_2050_usd - a.funding_gap_2050_usd)
    .slice(0, 8)
    .map(s => ({ name: s.complex_name.substring(0, 18), gap: Math.round(s.funding_gap_2050_usd / 1e6 * 10) / 10 }));

  return (
    <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Scenario cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          ["2026 — Today", "89", "Critical Gap Stations", "Avg VQ: 52.9 · 20% of system", T.muted, T.border, "#111820"],
          ["2050 — No Action", "91", "Critical Gap Stations", "Avg VQ: 59.5 · +6.6 pts · +2 new stations", T.critical, T.critical, "#1A0808"],
          ["2050 — With R1 & R2", "~70", "Estimated Critical Gap", "$1,711/rider floor + VQ in capital plan", T.effective, T.effective, "#081A08"],
        ].map(([label, num, desc, sub, col, border, bg]) => (
          <div key={label} style={{ background: bg, border: `2px solid ${border}44`, borderRadius: 12, padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 52, fontWeight: 800, color: col, lineHeight: 1, marginBottom: 6 }}>{num}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>{desc}</div>
            <div style={{ fontSize: 11, color: T.dim }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Now vs 2050 scatter */}
        <Card>
          <CardTitle>Current VQ vs 2050 Projected VQ</CardTitle>
          <div style={{ fontSize: 11, color: T.dim, marginBottom: 8, fontStyle: "italic" }}>
            Every station moves above the diagonal — all get riskier by 2050
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="x" type="number" domain={[18, 80]} tick={{ fill: T.muted, fontSize: 10 }}
                label={{ value: "2026 VQ →", position: "insideBottom", fill: T.dim, fontSize: 10, dy: 20 }} />
              <YAxis dataKey="y" type="number" domain={[20, 90]} tick={{ fill: T.muted, fontSize: 10 }}
                label={{ value: "2050 VQ ↑", angle: -90, position: "insideLeft", fill: T.dim, fontSize: 10 }} />
              <ReferenceLine segment={[{ x: 18, y: 18 }, { x: 80, y: 80 }]}
                stroke={T.border} strokeDasharray="4 4"
                label={{ value: "No change line", fill: T.dim, fontSize: 9 }} />
              <TT content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ padding: "8px 12px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8 }}>
                    <div style={{ color: T.text, fontWeight: 600 }}>{d.name}</div>
                    <div style={{ color: T.muted, fontSize: 11 }}>Now: {d.x} → 2050: {d.y}</div>
                    <div style={{ color: PC_COLOR[d.pc], fontSize: 11 }}>{d.pc}</div>
                  </div>
                );
              }} />
              {Object.keys(PC_COLOR).map(pc => (
                <Scatter key={pc} name={pc} data={scatterData.filter(d => d.pc === pc)}
                  fill={PC_COLOR[pc]} opacity={0.7}
                  shape={props => <circle cx={props.cx} cy={props.cy} r={3.5} fill={PC_COLOR[pc]} fillOpacity={0.7} />} />
              ))}
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span style={{ color: T.muted, fontSize: 10 }}>{v}</span>} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* Borough bar */}
        <Card>
          <CardTitle>Critical Gap by Borough — Now vs 2050</CardTitle>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={boroughData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="borough" tick={{ fill: T.muted, fontSize: 10 }} />
              <YAxis tick={{ fill: T.muted, fontSize: 10 }} />
              <TT contentStyle={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8 }}
                labelStyle={{ color: T.text }} />
              <Legend formatter={v => <span style={{ color: T.muted, fontSize: 10 }}>{v}</span>} />
              <Bar name="2026 (Now)" dataKey="now" fill={`${T.critical}88`} radius={[4, 4, 0, 0]} />
              <Bar name="2050 (Projected)" dataKey="proj" fill={T.critical} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Funding gap */}
        <Card>
          <CardTitle>2050 Funding Shortfall — Critical Gap Stations ($M)</CardTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topFundingGap} layout="vertical" margin={{ left: 0, right: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: T.muted, fontSize: 9 }} tickFormatter={v => `$${v}M`} />
              <YAxis type="category" dataKey="name" tick={{ fill: T.muted, fontSize: 9 }} width={110} />
              <TT formatter={v => [`$${v}M`, "Funding Gap"]} />
              <Bar dataKey="gap" fill={T.critical} radius={[0, 4, 4, 0]}
                label={{ position: "right", fill: T.muted, fontSize: 9, formatter: v => `$${v}M` }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardTitle>6 MTA Recommendations</CardTitle>
          {[
            ["R1", "Critical", T.critical, "Minimum $1,711/rider investment floor for all 89 Critical Gap stations"],
            ["R2", "Critical", T.critical, "Embed Transit VQ scoring into the 2030–2044 Capital Plan prioritization"],
            ["R3", "Important", T.excess, "Publish unified station-level capital allocation dataset"],
            ["R4", "Important", T.excess, "Expand platform temp monitoring to all 445 stations (now 317)"],
            ["R5", "Structural", T.flood, "Publish MTA delay incident category labels for heat analysis"],
            ["R6", "Structural", T.flood, "Require climate equity review for capital projects >$50M"],
          ].map(([id, pri, col, text]) => (
            <div key={id} style={{
              display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8,
              padding: "8px 10px", background: T.bg3, borderRadius: 6, borderLeft: `3px solid ${col}`,
            }}>
              <span style={{ fontWeight: 700, color: col, fontSize: 11, minWidth: 22 }}>{id}</span>
              <span style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, flex: 1 }}>{text}</span>
              <span style={{ fontSize: 9, color: col, fontWeight: 700, whiteSpace: "nowrap" }}>{pri}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [searchStation, setSearchStation] = useState(null);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/dashboard_payload.json`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => console.error("Load error:", e));
  }, []);

  if (!data) return (
    <div style={{
      background: T.bg, minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", color: T.text, fontSize: 16
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⬡</div>
        <div>Loading Transit VQ Dashboard...</div>
      </div>
    </div>
  );

  const { stations } = data;

  const handleSetActive = (i) => setPage(i);

  const pages = [
    <Page0 key="p0" setActive={handleSetActive} />,
    <Page1 key="p1" stations={stations} />,
    <Page2 key="p2" stations={stations} setActive={handleSetActive} setSearchStation={setSearchStation} />,
    <Page3 key="p3" stations={stations} />,
    <Page4 key="p4" stations={stations} preSelected={searchStation} clearPreSelected={() => setSearchStation(null)} />,
    <Page5 key="p5" stations={stations} />,
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <Nav active={page} setActive={setPage} />
      {pages[page]}
    </div>
  );
}
