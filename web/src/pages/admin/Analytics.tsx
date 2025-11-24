import React, { useEffect, useMemo, useState } from "react";
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
import { supabase } from "../../lib/supabaseClient";
import "../../style/admin-analytics.scss";

const C = {
  blue: "var(--chart-blue)",
  green: "var(--chart-green)",
  pink: "var(--chart-pink)",
};

type TabKey = "overview" | "categories" | "activity";

type ListingRow = {
  id: string;
  title: string | null;
  price: number | null;
  status: string | null;
  category: string | null;
  quantity: number | null;
  created_at: string;
  sold_at: string | null;
  views_count: number | null;
  seller_id: string | null;
};

type LoginRow = {
  id: string;
  user_id: string | null;
  logged_in_at: string;
};

type KPI = {
  revenue: number;
  sales: number;
  activeListings: number;
  views: number;
  revenueDelta: string;
  salesDelta: string;
  viewsDelta: string;
  newThisWeek: number;
};

type MonthlyPoint = { m: string; revenue: number; sales: number };
type TopListing = { rank: number; name: string; sales: number; views: number };
type HealthMetrics = {
  avgSalePrice: number;
  conversionRate: number; // %
  activeSellers: number;
  avgTimeToSaleDays: number;
};
type CategoryRow = { key: string; value: number; sales: number; color: string };
type SalesByCategoryRow = { cat: string; count: number };
type WeeklyActivityRow = { day: string; listings: number; sales: number; views: number };
type ActivityStats = {
  peakDay: string;
  peakDayViews: number;
  mostActiveLabel: string;
  mostActiveSub: string;
  avgDailyListings: number;
};

type AnalyticsData = {
  kpi: KPI;
  monthly: MonthlyPoint[];
  topPerforming: TopListing[];
  health: HealthMetrics;
  categoryBreakdown: CategoryRow[];
  salesByCategory: SalesByCategoryRow[];
  weeklyActivity: WeeklyActivityRow[];
  activityStats: ActivityStats;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "#4f46e5",
  Books: "#22c55e",
  Furniture: "#f59e0b",
  Clothing: "#ef4444",
  Other: "#8b5cf6",
};

// helper: normalize category key & label
function normalizeCategory(cat: string | null): { key: string; label: string } {
  const raw = (cat || "other").toLowerCase();
  const label = raw.charAt(0).toUpperCase() + raw.slice(1);
  return { key: raw, label };
}

function buildAnalytics(listings: ListingRow[], logins: LoginRow[]): AnalyticsData {
  if (!listings || listings.length === 0) {
    return {
      kpi: {
        revenue: 0,
        sales: 0,
        activeListings: 0,
        views: 0,
        revenueDelta: "0% from last month",
        salesDelta: "0% from last month",
        viewsDelta: "0% from last month",
        newThisWeek: 0,
      },
      monthly: MONTH_LABELS.map((m) => ({ m, revenue: 0, sales: 0 })),
      topPerforming: [],
      health: {
        avgSalePrice: 0,
        conversionRate: 0,
        activeSellers: 0,
        avgTimeToSaleDays: 0,
      },
      categoryBreakdown: [],
      salesByCategory: [],
      weeklyActivity: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
        day: d,
        listings: 0,
        sales: 0,
        views: 0,
      })),
      activityStats: {
        peakDay: "-",
        peakDayViews: 0,
        mostActiveLabel: "-",
        mostActiveSub: "Not enough data",
        avgDailyListings: 0,
      },
    };
  }

  const now = new Date();
  const thisMonthIdx = now.getMonth();
  const lastMonthIdx = (thisMonthIdx + 11) % 12;

  const soldListings = listings.filter((l) => (l.status || "").toLowerCase() === "sold");
  const activeListings = listings.filter((l) => (l.status || "").toLowerCase() === "active");

  const getQty = (l: ListingRow) => l.quantity ?? 1;

  // ---------- KPI ----------
  const totalRevenue = soldListings.reduce((sum, l) => sum + (l.price || 0) * getQty(l), 0);
  const totalSales = soldListings.reduce((sum, l) => sum + getQty(l), 0);
  const totalViews = listings.reduce((sum, l) => sum + (l.views_count || 0), 0);

  // Monthly buckets
  const monthlyBuckets: MonthlyPoint[] = MONTH_LABELS.map((m) => ({ m, revenue: 0, sales: 0 }));
  soldListings.forEach((l) => {
    const date = l.sold_at ? new Date(l.sold_at) : new Date(l.created_at);
    const idx = date.getMonth();
    monthlyBuckets[idx].revenue += (l.price || 0) * getQty(l);
    monthlyBuckets[idx].sales += getQty(l);
  });

  // Monthly views (by created_at month)
  const monthlyViews = new Array(12).fill(0) as number[];
  listings.forEach((l) => {
    const date = new Date(l.created_at);
    const idx = date.getMonth();
    monthlyViews[idx] += l.views_count || 0;
  });

  const revThis = monthlyBuckets[thisMonthIdx].revenue;
  const revPrev = monthlyBuckets[lastMonthIdx].revenue;
  const salesThis = monthlyBuckets[thisMonthIdx].sales;
  const salesPrev = monthlyBuckets[lastMonthIdx].sales;
  const viewsThis = monthlyViews[thisMonthIdx];
  const viewsPrev = monthlyViews[lastMonthIdx];

  const pctChange = (curr: number, prev: number) =>
    prev > 0 ? `${((100 * (curr - prev)) / prev).toFixed(1)}% from last month` : "0% from last month";

  // "new this week" – last 7 days
  const weekCutoff = new Date();
  weekCutoff.setDate(now.getDate() - 7);
  const newThisWeek = activeListings.filter((l) => new Date(l.created_at) >= weekCutoff).length;

  const kpi: KPI = {
    revenue: totalRevenue,
    sales: totalSales,
    activeListings: activeListings.length,
    views: totalViews,
    revenueDelta: pctChange(revThis, revPrev),
    salesDelta: pctChange(salesThis, salesPrev),
    viewsDelta: pctChange(viewsThis, viewsPrev),
    newThisWeek,
  };

  // ---------- Top Listings ----------
  const topPerforming: TopListing[] = [...soldListings]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5)
    .map((l, idx) => ({
      rank: idx + 1,
      name: l.title || "Untitled Listing",
      sales: getQty(l),
      views: l.views_count || 0,
    }));

  // ---------- Marketplace Health ----------
  const avgSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;
  const conversionRate = totalViews > 0 ? (100 * totalSales) / totalViews : 0;

  const distinctSellerIds = new Set<string>();
  activeListings.forEach((l) => {
    if (l.seller_id) distinctSellerIds.add(l.seller_id);
  });

  // Average time from created_at to sold_at (days)
  let totalDaysToSale = 0;
  let countTimeToSale = 0;
  soldListings.forEach((l) => {
    if (l.sold_at) {
      const created = new Date(l.created_at).getTime();
      const sold = new Date(l.sold_at).getTime();
      if (!Number.isNaN(created) && !Number.isNaN(sold) && sold > created) {
        const diffDays = (sold - created) / (1000 * 60 * 60 * 24);
        totalDaysToSale += diffDays;
        countTimeToSale += 1;
      }
    }
  });
  const avgTimeToSaleDays = countTimeToSale > 0 ? totalDaysToSale / countTimeToSale : 0;

  const health: HealthMetrics = {
    avgSalePrice,
    conversionRate,
    activeSellers: distinctSellerIds.size,
    avgTimeToSaleDays,
  };

  // ---------- Categories ----------
  const categoryMap = new Map<string, { label: string; listings: number; sales: number }>();

  listings.forEach((l) => {
    const { key, label } = normalizeCategory(l.category);
    const entry = categoryMap.get(key) || { label, listings: 0, sales: 0 };
    entry.listings += 1;
    if ((l.status || "").toLowerCase() === "sold") {
      entry.sales += getQty(l);
    }
    categoryMap.set(key, entry);
  });

  const totalListingsCount = listings.length;

  const categoryBreakdown: CategoryRow[] = Array.from(categoryMap.values()).map((entry) => {
    const valuePct = totalListingsCount > 0 ? (100 * entry.listings) / totalListingsCount : 0;
    const color = CATEGORY_COLORS[entry.label] || CATEGORY_COLORS.Other;
    return {
      key: entry.label,
      value: Math.round(valuePct),
      sales: entry.sales,
      color,
    };
  });

  const salesByCategory: SalesByCategoryRow[] = Array.from(categoryMap.values()).map((entry) => ({
    cat: entry.label,
    count: entry.sales,
  }));

  // ---------- Weekly Activity (ALL TIME BY WEEKDAY) ----------
  const weeklyMap: Record<string, WeeklyActivityRow> = {
    Mon: { day: "Mon", listings: 0, sales: 0, views: 0 },
    Tue: { day: "Tue", listings: 0, sales: 0, views: 0 },
    Wed: { day: "Wed", listings: 0, sales: 0, views: 0 },
    Thu: { day: "Thu", listings: 0, sales: 0, views: 0 },
    Fri: { day: "Fri", listings: 0, sales: 0, views: 0 },
    Sat: { day: "Sat", listings: 0, sales: 0, views: 0 },
    Sun: { day: "Sun", listings: 0, sales: 0, views: 0 },
  };

  // new listings + views by day of week (all time)
  listings.forEach((l) => {
    const created = new Date(l.created_at);
    const dayLabel = DOW_LABELS[created.getDay()];
    weeklyMap[dayLabel].listings += 1;
    weeklyMap[dayLabel].views += l.views_count || 0;
  });

  // sales by day of week (prefer sold_at if present)
  soldListings.forEach((l) => {
    const d = l.sold_at ? new Date(l.sold_at) : new Date(l.created_at);
    const dayLabel = DOW_LABELS[d.getDay()];
    weeklyMap[dayLabel].sales += getQty(l);
  });

  const weeklyActivity: WeeklyActivityRow[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (d) => weeklyMap[d]
  );

  // Peak day by views
  let peakDay = "—";
  let peakDayViews = 0;
  weeklyActivity.forEach((row) => {
    if (row.views > peakDayViews) {
      peakDayViews = row.views;
      peakDay = row.day;
    }
  });

  // ---------- Most Active Time (LOGIN-BASED) ----------
  const timeBuckets = {
    night: { label: "12–6 AM", sub: "Late night activity", count: 0 },
    morning: { label: "6–12 AM", sub: "Morning activity", count: 0 },
    afternoon: { label: "12–6 PM", sub: "Afternoon peak", count: 0 },
    evening: { label: "6–12 PM", sub: "Evening peak", count: 0 },
  };

  if (logins && logins.length > 0) {
    // use login timestamps
    logins.forEach((ev) => {
      const d = new Date(ev.logged_in_at);
      const h = d.getHours();
      if (h < 6) timeBuckets.night.count += 1;
      else if (h < 12) timeBuckets.morning.count += 1;
      else if (h < 18) timeBuckets.afternoon.count += 1;
      else timeBuckets.evening.count += 1;
    });
  } else {
    // fallback: use listing created_at if no logins yet
    listings.forEach((l) => {
      const d = new Date(l.created_at);
      const h = d.getHours();
      if (h < 6) timeBuckets.night.count += 1;
      else if (h < 12) timeBuckets.morning.count += 1;
      else if (h < 18) timeBuckets.afternoon.count += 1;
      else timeBuckets.evening.count += 1;
    });
  }

  const mostActiveBucket = Object.values(timeBuckets).reduce((best, curr) =>
    curr.count > best.count ? curr : best
  );

  // Avg daily listings over last 30 days
  const monthCutoff = new Date();
  monthCutoff.setDate(now.getDate() - 30);
  const listingsLast30 = listings.filter((l) => new Date(l.created_at) >= monthCutoff).length;
  const avgDailyListings = listingsLast30 / 30;

  const activityStats: ActivityStats = {
    peakDay,
    peakDayViews,
    mostActiveLabel: mostActiveBucket.label,
    mostActiveSub: mostActiveBucket.sub,
    avgDailyListings,
  };

  return {
    kpi,
    monthly: monthlyBuckets,
    topPerforming,
    health,
    categoryBreakdown,
    salesByCategory,
    weeklyActivity,
    activityStats,
  };
}

function Currency({ value }: { value: number }) {
  return (
    <>
      {value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })}
    </>
  );
}

const titleMap = { listings: "New Listings", sales: "Sales", views: "Views" };

export default function Analytics() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [logins, setLogins] = useState<LoginRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [
        { data: listingsData, error: listingsError },
        { data: loginData, error: loginError },
      ] = await Promise.all([
        supabase
          .from("listings")
          .select(
            "id,title,price,status,category,quantity,created_at,sold_at,views_count,seller_id"
          ),
        supabase.from("user_logins").select("id,user_id,logged_in_at"),
      ]);

      if (listingsError) {
        console.error("Error loading listings analytics data", listingsError);
      } else {
        setListings((listingsData || []) as ListingRow[]);
      }

      if (loginError) {
        console.error("Error loading login analytics data", loginError);
      } else {
        setLogins((loginData || []) as LoginRow[]);
      }
    };

    fetchData();
  }, []);

  const {
    kpi,
    monthly,
    topPerforming,
    health,
    categoryBreakdown,
    salesByCategory,
    weeklyActivity,
    activityStats,
  } = useMemo(() => buildAnalytics(listings, logins), [listings, logins]);

  const totals = useMemo(
    () => ({
      totalRevenue: kpi.revenue,
      totalSales: kpi.sales,
      totalViews: kpi.views,
    }),
    [kpi]
  );

  return (
    <div className="admin-analytics">
      <h1 className="page-title">Analytics</h1>

      {/* KPI CARDS */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-head">
            Total Revenue <span className="ico ico-$" />
          </div>
          <div className="kpi-num">
            <Currency value={totals.totalRevenue} />
          </div>
          <div className="kpi-sub kpi-sub--up">{kpi.revenueDelta}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">
            Total Sales <span className="ico ico-sales" />
          </div>
          <div className="kpi-num">{kpi.sales.toLocaleString()}</div>
          <div className="kpi-sub kpi-sub--up">{kpi.salesDelta}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">
            Active Listings <span className="ico ico-box" />
          </div>
          <div className="kpi-num">{kpi.activeListings.toLocaleString()}</div>
          <div className="kpi-sub">{kpi.newThisWeek} new this week</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">
            Total Views <span className="ico ico-eye" />
          </div>
          <div className="kpi-num">{kpi.views.toLocaleString()}</div>
          <div className="kpi-sub kpi-sub--up">{kpi.viewsDelta}</div>
        </div>
      </section>

      {/* TABS */}
      <div className="tabs">
        <button
          className={`tab ${tab === "overview" ? "is-active" : ""}`}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${tab === "categories" ? "is-active" : ""}`}
          onClick={() => setTab("categories")}
        >
          Categories
        </button>
        <button
          className={`tab ${tab === "activity" ? "is-active" : ""}`}
          onClick={() => setTab("activity")}
        >
          Activity
        </button>
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
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue ($)"
                    stroke={C.green}
                    dot={{ r: 3, stroke: C.green, fill: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 4 }}
                    strokeWidth={3}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke={C.blue}
                    dot={{ r: 3, stroke: C.blue, fill: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 4 }}
                    strokeWidth={3}
                  />
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
                    <div className="views">
                      <span className="ico ico-eye sm" /> {i.views}
                    </div>
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
                <KPIBar
                  label="Average Sale Price"
                  valueLabel={<Currency value={health.avgSalePrice} />}
                  pct={100}
                />
                <KPIBar
                  label="Conversion Rate"
                  valueLabel={`${health.conversionRate.toFixed(1)}%`}
                  pct={health.conversionRate}
                  max={10}
                />
                <KPIBar
                  label="Active Sellers"
                  valueLabel={health.activeSellers.toString()}
                  pct={health.activeSellers}
                  max={250}
                />
                <KPIBar
                  label="Avg. Time to Sale"
                  valueLabel={`${health.avgTimeToSaleDays.toFixed(1)} days`}
                  pct={health.avgTimeToSaleDays}
                  max={14}
                  color="orange"
                />
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
                  <Bar dataKey="listings" name="New Listings" radius={[6, 6, 0, 0]} fill={C.blue} />
                  <Bar dataKey="sales" name="Sales" radius={[6, 6, 0, 0]} fill={C.green} />
                  <Bar dataKey="views" name="Views" radius={[6, 6, 0, 0]} fill={C.pink} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid-3">
            <StatCard
              title="Peak Activity Day"
              big={activityStats.peakDay}
              sub={`${activityStats.peakDayViews.toLocaleString()} total views`}
            />
            <StatCard
              title="Most Active Time"
              big={activityStats.mostActiveLabel}
              sub={activityStats.mostActiveSub}
            />
            <StatCard
              title="Avg. Daily Listings"
              big={activityStats.avgDailyListings.toFixed(1)}
              sub="New items per day (last 30 days)"
            />
          </section>
        </>
      )}
    </div>
  );
}

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
