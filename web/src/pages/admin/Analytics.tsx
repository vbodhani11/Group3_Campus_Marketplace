import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../../style/admin-analytics.scss";

const C = {
  blue: "var(--chart-blue)",
  green: "var(--chart-green)",
  pink: "var(--chart-pink)",
};

type TabKey = "overview" | "categories" | "activity";

const kpi = {
  revenue: 45231,
  sales: 656,
  activeListings: 234,
  views: 12543,
  revenueDelta: "+20.1% from last month",
  salesDelta: "+15.3% from last month",
  viewsDelta: "+8.2% from last month",
  newThisWeek: 8,
};

const monthly = [
  { m: "Jan", revenue: 40, sales: 45 },
  { m: "Feb", revenue: 52, sales: 51 },
  { m: "Mar", revenue: 63, sales: 61 },
  { m: "Apr", revenue: 47, sales: 47 },
  { m: "May", revenue: 70, sales: 68 },
  { m: "Jun", revenue: 65, sales: 64 },
  { m: "Jul", revenue: 80, sales: 78 },
  { m: "Aug", revenue: 86, sales: 81 },
  { m: "Sep", revenue: 76, sales: 74 },
  { m: "Oct", revenue: 100, sales: 90 },
];

const topPerforming = [
  { rank: 1, name: "MacBook Pro", sales: 12, views: 456 },
  { rank: 2, name: "Textbooks", sales: 28, views: 389 },
  { rank: 3, name: "iPhone 13", sales: 15, views: 367 },
  { rank: 4, name: "Desk Lamp", sales: 22, views: 298 },
  { rank: 5, name: "Winter Jacket", sales: 18, views: 276 },
];

const health = {
  avgSalePrice: 69,
  conversionRate: 5.2,
  activeSellers: 187,
  avgTimeToSaleDays: 4.2,
};

const categoryBreakdown = [
  { key: "Electronics", value: 42, sales: 156, color: "#4f46e5" },
  { key: "Books", value: 28, sales: 98, color: "#22c55e" },
  { key: "Furniture", value: 15, sales: 52, color: "#f59e0b" },
  { key: "Clothing", value: 10, sales: 34, color: "#ef4444" },
  { key: "Other", value: 5, sales: 18, color: "#8b5cf6" },
];

const salesByCategory = [
  { cat: "Electronics", count: 160 },
  { cat: "Books", count: 95 },
  { cat: "Clothing", count: 35 },
  { cat: "Other", count: 18 },
];

const weeklyActivity = [
  { day: "Mon", listings: 10, sales: 6, views: 230 },
  { day: "Tue", listings: 15, sales: 9, views: 290 },
  { day: "Wed", listings: 20, sales: 11, views: 310 },
  { day: "Thu", listings: 14, sales: 9, views: 267 },
  { day: "Fri", listings: 24, sales: 13, views: 390 },
  { day: "Sat", listings: 30, sales: 15, views: 450 },
  { day: "Sun", listings: 22, sales: 12, views: 360 },
];

function Currency({ value }: { value: number }) {
  return <>{value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</>;
}

export default function Analytics() {
  const [tab, setTab] = useState<TabKey>("overview");

  const totals = useMemo(() => {
    const totalRevenue = kpi.revenue;
    const totalSales = kpi.sales;
    const totalViews = kpi.views;
    return { totalRevenue, totalSales, totalViews };
  }, []);

  return (
    <div className="admin-analytics">
      <h1 className="page-title">Analytics</h1>

      {/* KPI CARDS */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-head">Total Revenue <span className="ico ico-$" /></div>
          <div className="kpi-num"><Currency value={totals.totalRevenue} /></div>
          <div className="kpi-sub kpi-sub--up">{kpi.revenueDelta}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">Total Sales <span className="ico ico-sales" /></div>
          <div className="kpi-num">{kpi.sales.toLocaleString()}</div>
          <div className="kpi-sub kpi-sub--up">{kpi.salesDelta}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">Active Listings <span className="ico ico-box" /></div>
          <div className="kpi-num">{kpi.activeListings.toLocaleString()}</div>
          <div className="kpi-sub">{kpi.newThisWeek} new this week</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">Total Views <span className="ico ico-eye" /></div>
          <div className="kpi-num">{kpi.views.toLocaleString()}</div>
          <div className="kpi-sub kpi-sub--up">{kpi.viewsDelta}</div>
        </div>
      </section>

      {/* TABS */}
      <div className="tabs">
        <button className={`tab ${tab === "overview" ? "is-active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
        <button className={`tab ${tab === "categories" ? "is-active" : ""}`} onClick={() => setTab("categories")}>Categories</button>
        <button className={`tab ${tab === "activity" ? "is-active" : ""}`} onClick={() => setTab("activity")}>Activity</button>
      </div>

      {tab === "overview" && (
        <>
          {/* Revenue & Sales Trend */}
          <section className="panel">
            <div className="panel-head">
              <div className="panel-title">Revenue &amp; Sales Trend</div>
              <div className="panel-sub">Monthly overview of marketplace performance</div>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={monthly} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 6" />
                  <XAxis dataKey="m" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke={C.green} dot={{ r: 3, stroke: C.green, fill: "#fff", strokeWidth: 2 }} activeDot={{ r: 4 }} strokeWidth={3} />
                  <Line yAxisId="left" type="monotone" dataKey="sales" name="Sales" stroke={C.blue} dot={{ r: 3, stroke: C.blue, fill: "#fff", strokeWidth: 2 }} activeDot={{ r: 4 }} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid-2">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Top Performing Listings</div>
                <div className="panel-sub">Most viewed items this month</div>
              </div>
              <ol className="top-list">
                {topPerforming.map((i) => (
                  <li key={i.rank} className="top-row">
                    <span className="rank">{i.rank}</span>
                    <div className="info">
                      <div className="name">{i.name}</div>
                      <div className="sub">{i.sales} sales</div>
                    </div>
                    <div className="views"><span className="ico ico-eye sm" /> {i.views}</div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Marketplace Health</div>
                <div className="panel-sub">Key performance indicators</div>
              </div>
              <div className="health">
                <KPIBar label="Average Sale Price" valueLabel={<Currency value={health.avgSalePrice} />} pct={100} />
                <KPIBar label="Conversion Rate" valueLabel={`${health.conversionRate}%`} pct={health.conversionRate} max={10} />
                <KPIBar label="Active Sellers" valueLabel={health.activeSellers.toString()} pct={health.activeSellers} max={250} />
                <KPIBar label="Avg. Time to Sale" valueLabel={`${health.avgTimeToSaleDays} days`} pct={health.avgTimeToSaleDays} max={14} color="orange" />
              </div>
            </div>
          </section>
        </>
      )}

      {tab === "categories" && (
        <>
          <section className="grid-2">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Category Distribution</div>
                <div className="panel-sub">Breakdown of listings by category</div>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Tooltip />
                    <Pie data={categoryBreakdown} dataKey="value" nameKey="key" outerRadius={120} label>
                      {categoryBreakdown.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Sales by Category</div>
                <div className="panel-sub">Number of items sold per category</div>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={salesByCategory} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 6" />
                    <XAxis dataKey="cat" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div className="panel-title">Category Performance</div>
              <div className="panel-sub">Detailed breakdown of each category</div>
            </div>
            <ul className="cat-list">
              {categoryBreakdown.map((c) => (
                <li key={c.key} className="cat-row">
                  <span className="dot" style={{ background: c.color }} />
                  <div className="cat-info">
                    <div className="name">{c.key}</div>
                    <div className="sub">{c.sales} total sales</div>
                  </div>
                  <div className="pct">{c.value}%</div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {tab === "activity" && (
        <>
          <section className="panel">
            <div className="panel-head">
              <div className="panel-title">Daily Activity Overview</div>
              <div className="panel-sub">Listings, views, and sales by day of week</div>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={weeklyActivity} barGap={8} margin={{ left: 8, right: 8, top: 10 }}>
                  <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any, n: any) => [v, titleMap[n as keyof typeof titleMap]]} />
                  <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="listings" name="New Listings" radius={[6,6,0,0]} fill={C.blue} />
                  <Bar dataKey="sales" name="Sales" radius={[6,6,0,0]} fill={C.green} />
                  <Bar dataKey="views" name="Views" radius={[6,6,0,0]} fill={C.pink} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid-3">
            <StatCard title="Peak Activity Day" big="Saturday" sub="445 total views" />
            <StatCard title="Most Active Time" big="2–5 PM" sub="Peak browsing hours" />
            <StatCard title="Avg. Daily Listings" big="18" sub="New items per day" />
          </section>
        </>
      )}
    </div>
  );
}

const titleMap = { listings: "New Listings", sales: "Sales", views: "Views" };

function KPIBar({
  label,
  valueLabel,
  pct,
  max = 100,
  color = "brand",
}: {
  label: string;
  valueLabel: React.ReactNode;
  pct: number;
  max?: number;
  color?: "brand" | "orange";
}) {
  const ratio = Math.max(0, Math.min(1, pct / max));
  return (
    <div className="kpi-bar">
      <div className="row">
        <span className="lbl">{label}</span>
        <span className="val">{valueLabel}</span>
      </div>
      <div className={`bar ${color}`}>
        <div className="fill" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

function StatCard({ title, big, sub }: { title: string; big: string; sub: string }) {
  return (
    <div className="stat-card">
      <div className="title">{title}</div>
      <div className="big">{big}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}
