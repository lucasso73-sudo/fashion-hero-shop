"use client";

import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const SELLER_NAME = "Butik Monika";
const CATEGORY = "Sukienki";
const PERIOD = "ostatnie 90 dni";
const SELLER_ORDERS = 340;
const SELLER_RETURNS = 127;
const SELLER_RETURN_RATE = 37;
const CATEGORY_AVG = 28;
const CATEGORY_RETURNS_COUNT = 47200;

const products = [
  {
    id: 1,
    name: "Sukienka Midi Czarna",
    sku: "BM-0041",
    myRate: 41,
    categoryAvg: 28,
    topReason: "Rozmiar — za mały",
    reasonPct: 52,
    orders: 68,
  },
  {
    id: 2,
    name: "Sukienka Maxi Kwiatowa",
    sku: "BM-0055",
    myRate: 44,
    categoryAvg: 28,
    topReason: "Materiał inny niż oczekiwany",
    reasonPct: 61,
    orders: 45,
  },
  {
    id: 3,
    name: "Bluzka Oversize Kremowa",
    sku: "BM-0073",
    myRate: 35,
    categoryAvg: 28,
    topReason: "Jakość wykonania",
    reasonPct: 44,
    orders: 57,
  },
  {
    id: 4,
    name: "Sukienka Kopertowa Bordowa",
    sku: "BM-0029",
    myRate: 21,
    categoryAvg: 28,
    topReason: "Zmiana decyzji",
    reasonPct: 38,
    orders: 82,
  },
  {
    id: 5,
    name: "Bluzka Jedwabna Ecru",
    sku: "BM-0088",
    myRate: 19,
    categoryAvg: 28,
    topReason: "Rozmiar — za duży",
    reasonPct: 41,
    orders: 49,
  },
  {
    id: 6,
    name: "Sukienka Mini Kratka",
    sku: "BM-0062",
    myRate: 24,
    categoryAvg: 28,
    topReason: "Zmiana decyzji",
    reasonPct: 55,
    orders: 39,
  },
];

const marketReasons = [
  { reason: "Rozmiar — za mały", pct: 34, color: "#ff2d2d" },
  { reason: "Materiał inny niż oczekiwany", pct: 22, color: "#ff6b35" },
  { reason: "Rozmiar — za duży", pct: 18, color: "#ff9500" },
  { reason: "Jakość wykonania", pct: 14, color: "#ffcc02" },
  { reason: "Zmiana decyzji", pct: 8, color: "#888" },
  { reason: "Inne", pct: 4, color: "#555" },
];

// ─── COUNTER ANIMATION ───────────────────────────────────────────────────────

function useCounter(target: number, duration = 1200, active = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, duration, active]);
  return value;
}

// ─── ANIMATED NUMBER ─────────────────────────────────────────────────────────

function AnimatedNum({
  value,
  suffix = "",
  className = "",
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);
  const v = useCounter(value, 1200, mounted);
  return (
    <span className={className}>
      {v}
      {suffix}
    </span>
  );
}

// ─── DIFF BADGE ──────────────────────────────────────────────────────────────

function DiffBadge({ diff }: { diff: number }) {
  const isAbove = diff > 0;
  return (
    <span
      style={{
        color: isAbove ? "#ff2d2d" : "#00ff87",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      {isAbove ? "+" : ""}
      {diff}pp
    </span>
  );
}

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { reason: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #333",
        padding: "8px 14px",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "#fff",
      }}
    >
      <p style={{ color: "#888", marginBottom: 2 }}>{payload[0].payload.reason}</p>
      <p style={{ color: "#fff", fontWeight: 700 }}>{payload[0].value}%</p>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

export default function SellerIntelligencePage() {
  const [view, setView] = useState<"mine" | "market">("mine");
  const tableRef = useRef<HTMLDivElement>(null);

  const totalRate = useCounter(SELLER_RETURN_RATE, 1400, true);
  const avgRate = useCounter(CATEGORY_AVG, 1400, true);
  const totalOrders = useCounter(SELLER_ORDERS, 1200, true);
  const totalReturns = useCounter(SELLER_RETURNS, 1200, true);

  return (
    <div
      style={{
        background: "#0f0f0f",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        :root {
          --font-display: 'Playfair Display', serif;
          --font-mono: 'JetBrains Mono', monospace;
        }
        .font-display { font-family: var(--font-display); }
        .font-mono-data { font-family: var(--font-mono); }
        .row-hover:hover { background: #181818; }
      `}</style>

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid #1f1f1f",
          padding: "28px 32px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          {/* Left: brand + headline */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#555",
                }}
              >
                FashionHero
              </span>
              <span style={{ color: "#2a2a2a", fontSize: 13 }}>/</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "#444",
                  letterSpacing: "0.06em",
                }}
              >
                SELLER INTELLIGENCE
              </span>
            </div>

            <h1
              className="font-display"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(20px, 4vw, 30px)",
                fontWeight: 700,
                lineHeight: 1.2,
                margin: 0,
                color: "#fff",
                maxWidth: 560,
              }}
            >
              Widzisz powody zwrotów{" "}
              <span style={{ color: "#ff2d2d" }}>2.4&nbsp;mln kupujących.</span>
              <br />
              <span style={{ color: "#555", fontWeight: 400, fontSize: "0.75em" }}>
                Forte tego nie ma.
              </span>
            </h1>

            <div
              style={{
                marginTop: 10,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "#444",
                letterSpacing: "0.04em",
              }}
            >
              {SELLER_NAME} &nbsp;·&nbsp; {CATEGORY} &nbsp;·&nbsp; {PERIOD}
            </div>
          </div>

          {/* Right: switcher */}
          <div
            style={{
              display: "flex",
              border: "1px solid #2a2a2a",
              borderRadius: 2,
              overflow: "hidden",
              alignSelf: "flex-start",
              flexShrink: 0,
            }}
          >
            {(["mine", "market"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "8px 18px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: view === v ? "#ff2d2d" : "transparent",
                  color: view === v ? "#fff" : "#555",
                }}
              >
                {v === "mine" ? "Mój sklep" : "Rynek"}
              </button>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div
          style={{
            maxWidth: 1100,
            margin: "20px auto 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 1,
            borderTop: "1px solid #1f1f1f",
            paddingTop: 20,
          }}
        >
          {[
            { label: "ZAMÓWIENIA", value: totalOrders, suffix: "" },
            { label: "ZWROTY", value: totalReturns, suffix: "" },
            { label: "RETURN RATE", value: totalRate, suffix: "%" },
            { label: "ŚREDNIA KATEGORII", value: avgRate, suffix: "%" },
          ].map(({ label, value, suffix }) => (
            <div key={label} style={{ paddingRight: 24 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "#444",
                  letterSpacing: "0.1em",
                  marginBottom: 4,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: label === "RETURN RATE" ? "#ff2d2d" : "#fff",
                  lineHeight: 1,
                }}
              >
                {value}
                {suffix}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 60px" }}>

        {/* ── VIEW: Mój sklep ──────────────────────────────────── */}
        {view === "mine" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                padding: "28px 0 14px",
                borderBottom: "1px solid #1f1f1f",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 600,
                  margin: 0,
                  color: "#fff",
                }}
              >
                Twoje produkty vs. rynek
              </h2>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "#333",
                  letterSpacing: "0.08em",
                }}
              >
                POSORTOWANE: RETURN RATE ↓
              </span>
            </div>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 80px 80px 80px 1fr 70px",
                gap: 0,
                padding: "10px 0",
                borderBottom: "1px solid #1a1a1a",
              }}
            >
              {["PRODUKT", "MÓJ RATE", "KATEGORIA", "RÓŻNICA", "GŁÓWNY POWÓD", "%"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "#333",
                    letterSpacing: "0.12em",
                    textAlign: h === "RÓŻNICA" || h === "MÓJ RATE" || h === "KATEGORIA" || h === "%" ? "right" : "left",
                    display: "block",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Table rows */}
            <div ref={tableRef}>
              {[...products]
                .sort((a, b) => b.myRate - a.myRate)
                .map((p, i) => {
                  const diff = p.myRate - p.categoryAvg;
                  const isAbove = diff > 0;
                  return (
                    <div
                      key={p.id}
                      className="row-hover"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 80px 80px 80px 1fr 70px",
                        gap: 0,
                        padding: "14px 0",
                        borderBottom: "1px solid #141414",
                        alignItems: "center",
                        transition: "background 0.12s",
                      }}
                    >
                      {/* Product name */}
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#ddd",
                            lineHeight: 1.2,
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: "#333",
                            marginTop: 2,
                            letterSpacing: "0.06em",
                          }}
                        >
                          {p.sku} &nbsp;·&nbsp; {p.orders} zam.
                        </div>
                      </div>

                      {/* My rate */}
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 16,
                            fontWeight: 700,
                            color: isAbove ? "#ff2d2d" : "#00ff87",
                          }}
                        >
                          <AnimatedNum value={p.myRate} suffix="%" key={`r${i}`} />
                        </span>
                      </div>

                      {/* Category avg */}
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 14,
                            color: "#555",
                            fontWeight: 500,
                          }}
                        >
                          {p.categoryAvg}%
                        </span>
                      </div>

                      {/* Diff */}
                      <div style={{ textAlign: "right" }}>
                        <DiffBadge diff={diff} />
                      </div>

                      {/* Top reason */}
                      <div style={{ paddingLeft: 16 }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: isAbove ? "#ff6b35" : "#555",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {p.topReason}
                        </span>
                      </div>

                      {/* Reason pct */}
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 13,
                            color: "#444",
                            fontWeight: 700,
                          }}
                        >
                          {p.reasonPct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 16,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "#333",
                letterSpacing: "0.06em",
              }}
            >
              <span><span style={{ color: "#ff2d2d" }}>■</span> &nbsp;POWYŻEJ ŚREDNIEJ</span>
              <span><span style={{ color: "#00ff87" }}>■</span> &nbsp;PONIŻEJ ŚREDNIEJ</span>
            </div>
          </>
        )}

        {/* ── VIEW: Rynek ──────────────────────────────────────── */}
        {view === "market" && (
          <>
            <div
              style={{
                padding: "28px 0 14px",
                borderBottom: "1px solid #1f1f1f",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 600,
                  margin: 0,
                  color: "#fff",
                }}
              >
                Co mówią kupujące w tej kategorii
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "#444",
                  marginTop: 6,
                  letterSpacing: "0.04em",
                }}
              >
                Agregat powodów zwrotów &mdash; {CATEGORY} &mdash; FashionHero marketplace
              </p>
            </div>

            {/* Bar chart */}
            <div style={{ marginTop: 32 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={marketReasons}
                  layout="vertical"
                  margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
                  barCategoryGap={12}
                >
                  <XAxis
                    type="number"
                    domain={[0, 40]}
                    tick={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 10,
                      fill: "#333",
                    }}
                    axisLine={{ stroke: "#1f1f1f" }}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="reason"
                    width={200}
                    tick={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 11,
                      fill: "#666",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#151515" }} />
                  <Bar dataKey="pct" radius={0} maxBarSize={22}>
                    {marketReasons.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Value labels */}
            <div style={{ marginTop: 8 }}>
              {marketReasons.map((r) => (
                <div
                  key={r.reason}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: "1px solid #111",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "#555",
                    }}
                  >
                    <span style={{ color: r.color, marginRight: 8 }}>■</span>
                    {r.reason}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    <AnimatedNum value={r.pct} suffix="%" key={`mr-${r.reason}`} />
                  </span>
                </div>
              ))}
            </div>

            {/* Source note */}
            <div
              style={{
                marginTop: 24,
                padding: "14px 16px",
                border: "1px solid #1a1a1a",
                borderLeft: "2px solid #ff2d2d",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "#444",
                  letterSpacing: "0.04em",
                }}
              >
                Na podstawie{" "}
                <span style={{ color: "#fff", fontWeight: 700 }}>
                  {CATEGORY_RETURNS_COUNT.toLocaleString("pl-PL")}
                </span>{" "}
                zwrotów w kategorii{" "}
                <span style={{ color: "#fff" }}>{CATEGORY}</span> — {PERIOD}
              </span>
            </div>

            {/* Market context cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 1,
                marginTop: 32,
                borderTop: "1px solid #1a1a1a",
                paddingTop: 24,
              }}
            >
              {[
                {
                  label: "GŁÓWNA PRZYCZYNA",
                  value: "Rozmiar — za mały",
                  note: "34% wszystkich zwrotów",
                  accent: "#ff2d2d",
                },
                {
                  label: "NAJSZYBCIEJ ROŚNIE",
                  value: "Jakość wykonania",
                  note: "+6pp vs. poprzedni kwartał",
                  accent: "#ff9500",
                },
                {
                  label: "TWÓJ GŁÓWNY PROBLEM",
                  value: "Rozmiar — za mały",
                  note: "52% Twoich zwrotów",
                  accent: "#ff2d2d",
                },
              ].map(({ label, value, note, accent }) => (
                <div
                  key={label}
                  style={{
                    padding: "18px 0 18px 16px",
                    borderLeft: `2px solid ${accent}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "#333",
                      letterSpacing: "0.12em",
                      marginBottom: 6,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#ddd",
                      lineHeight: 1.3,
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "#444",
                      marginTop: 4,
                    }}
                  >
                    {note}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid #1a1a1a",
          padding: "16px 32px",
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#2a2a2a",
            letterSpacing: "0.06em",
          }}
        >
          FASHIONHERO SELLER INTELLIGENCE &nbsp;·&nbsp; DANE DEMONSTRACYJNE
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#2a2a2a",
          }}
        >
          © 2026 FashionHero
        </span>
      </div>
    </div>
  );
}
