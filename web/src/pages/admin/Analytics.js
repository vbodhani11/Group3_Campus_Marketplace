import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell, } from "recharts";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admin-analytics.scss";
const C = {
    blue: "var(--chart-blue)",
    green: "var(--chart-green)",
    pink: "var(--chart-pink)",
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
const CATEGORY_COLORS = {
    Electronics: "#4f46e5",
    Books: "#22c55e",
    Furniture: "#f59e0b",
    Clothing: "#ef4444",
    Other: "#8b5cf6",
};
// helper: normalize category key & label
function normalizeCategory(cat) {
    const raw = (cat || "other").toLowerCase();
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    return { key: raw, label };
}
function buildAnalytics(listings, logins) {
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
    const getQty = (l) => l.quantity ?? 1;
    // ---------- KPI ----------
    const totalRevenue = soldListings.reduce((sum, l) => sum + (l.price || 0) * getQty(l), 0);
    const totalSales = soldListings.reduce((sum, l) => sum + getQty(l), 0);
    const totalViews = listings.reduce((sum, l) => sum + (l.views_count || 0), 0);
    // Monthly buckets
    const monthlyBuckets = MONTH_LABELS.map((m) => ({ m, revenue: 0, sales: 0 }));
    soldListings.forEach((l) => {
        const date = l.sold_at ? new Date(l.sold_at) : new Date(l.created_at);
        const idx = date.getMonth();
        monthlyBuckets[idx].revenue += (l.price || 0) * getQty(l);
        monthlyBuckets[idx].sales += getQty(l);
    });
    // Monthly views (by created_at month)
    const monthlyViews = new Array(12).fill(0);
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
    const pctChange = (curr, prev) => prev > 0 ? `${((100 * (curr - prev)) / prev).toFixed(1)}% from last month` : "0% from last month";
    // "new this week" – last 7 days
    const weekCutoff = new Date();
    weekCutoff.setDate(now.getDate() - 7);
    const newThisWeek = activeListings.filter((l) => new Date(l.created_at) >= weekCutoff).length;
    const kpi = {
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
    const topPerforming = [...soldListings]
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
    const distinctSellerIds = new Set();
    activeListings.forEach((l) => {
        if (l.seller_id)
            distinctSellerIds.add(l.seller_id);
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
    const health = {
        avgSalePrice,
        conversionRate,
        activeSellers: distinctSellerIds.size,
        avgTimeToSaleDays,
    };
    // ---------- Categories ----------
    const categoryMap = new Map();
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
    const categoryBreakdown = Array.from(categoryMap.values()).map((entry) => {
        const valuePct = totalListingsCount > 0 ? (100 * entry.listings) / totalListingsCount : 0;
        const color = CATEGORY_COLORS[entry.label] || CATEGORY_COLORS.Other;
        return {
            key: entry.label,
            value: Math.round(valuePct),
            sales: entry.sales,
            color,
        };
    });
    const salesByCategory = Array.from(categoryMap.values()).map((entry) => ({
        cat: entry.label,
        count: entry.sales,
    }));
    // ---------- Weekly Activity (ALL TIME BY WEEKDAY) ----------
    const weeklyMap = {
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
    const weeklyActivity = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => weeklyMap[d]);
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
            if (h < 6)
                timeBuckets.night.count += 1;
            else if (h < 12)
                timeBuckets.morning.count += 1;
            else if (h < 18)
                timeBuckets.afternoon.count += 1;
            else
                timeBuckets.evening.count += 1;
        });
    }
    else {
        // fallback: use listing created_at if no logins yet
        listings.forEach((l) => {
            const d = new Date(l.created_at);
            const h = d.getHours();
            if (h < 6)
                timeBuckets.night.count += 1;
            else if (h < 12)
                timeBuckets.morning.count += 1;
            else if (h < 18)
                timeBuckets.afternoon.count += 1;
            else
                timeBuckets.evening.count += 1;
        });
    }
    const mostActiveBucket = Object.values(timeBuckets).reduce((best, curr) => curr.count > best.count ? curr : best);
    // Avg daily listings over last 30 days
    const monthCutoff = new Date();
    monthCutoff.setDate(now.getDate() - 30);
    const listingsLast30 = listings.filter((l) => new Date(l.created_at) >= monthCutoff).length;
    const avgDailyListings = listingsLast30 / 30;
    const activityStats = {
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
function Currency({ value }) {
    return (_jsx(_Fragment, { children: value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }) }));
}
const titleMap = { listings: "New Listings", sales: "Sales", views: "Views" };
export default function Analytics() {
    const [tab, setTab] = useState("overview");
    const [listings, setListings] = useState([]);
    const [logins, setLogins] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const [{ data: listingsData, error: listingsError }, { data: loginData, error: loginError },] = await Promise.all([
                supabase
                    .from("listings")
                    .select("id,title,price,status,category,quantity,created_at,sold_at,views_count,seller_id"),
                supabase.from("user_logins").select("id,user_id,logged_in_at"),
            ]);
            if (listingsError) {
                console.error("Error loading listings analytics data", listingsError);
            }
            else {
                setListings((listingsData || []));
            }
            if (loginError) {
                console.error("Error loading login analytics data", loginError);
            }
            else {
                setLogins((loginData || []));
            }
        };
        fetchData();
    }, []);
    const { kpi, monthly, topPerforming, health, categoryBreakdown, salesByCategory, weeklyActivity, activityStats, } = useMemo(() => buildAnalytics(listings, logins), [listings, logins]);
    const totals = useMemo(() => ({
        totalRevenue: kpi.revenue,
        totalSales: kpi.sales,
        totalViews: kpi.views,
    }), [kpi]);
    return (_jsxs("div", { className: "admin-analytics", children: [_jsx("h1", { className: "page-title", children: "Analytics" }), _jsxs("section", { className: "kpi-grid", children: [_jsxs("div", { className: "kpi-card", children: [_jsxs("div", { className: "kpi-head", children: ["Total Revenue ", _jsx("span", { className: "ico ico-$" })] }), _jsx("div", { className: "kpi-num", children: _jsx(Currency, { value: totals.totalRevenue }) }), _jsx("div", { className: "kpi-sub kpi-sub--up", children: kpi.revenueDelta })] }), _jsxs("div", { className: "kpi-card", children: [_jsxs("div", { className: "kpi-head", children: ["Total Sales ", _jsx("span", { className: "ico ico-sales" })] }), _jsx("div", { className: "kpi-num", children: kpi.sales.toLocaleString() }), _jsx("div", { className: "kpi-sub kpi-sub--up", children: kpi.salesDelta })] }), _jsxs("div", { className: "kpi-card", children: [_jsxs("div", { className: "kpi-head", children: ["Active Listings ", _jsx("span", { className: "ico ico-box" })] }), _jsx("div", { className: "kpi-num", children: kpi.activeListings.toLocaleString() }), _jsxs("div", { className: "kpi-sub", children: [kpi.newThisWeek, " new this week"] })] }), _jsxs("div", { className: "kpi-card", children: [_jsxs("div", { className: "kpi-head", children: ["Total Views ", _jsx("span", { className: "ico ico-eye" })] }), _jsx("div", { className: "kpi-num", children: kpi.views.toLocaleString() }), _jsx("div", { className: "kpi-sub kpi-sub--up", children: kpi.viewsDelta })] })] }), _jsxs("div", { className: "tabs", children: [_jsx("button", { className: `tab ${tab === "overview" ? "is-active" : ""}`, onClick: () => setTab("overview"), children: "Overview" }), _jsx("button", { className: `tab ${tab === "categories" ? "is-active" : ""}`, onClick: () => setTab("categories"), children: "Categories" }), _jsx("button", { className: `tab ${tab === "activity" ? "is-active" : ""}`, onClick: () => setTab("activity"), children: "Activity" })] }), tab === "overview" && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "panel", children: [_jsxs("div", { className: "panel-head", children: [_jsx("div", { className: "panel-title", children: "Revenue & Sales Trend" }), _jsx("div", { className: "panel-sub", children: "Monthly overview of marketplace performance" })] }), _jsx("div", { className: "chart-wrap", children: _jsx(ResponsiveContainer, { width: "100%", height: 320, children: _jsxs(LineChart, { data: monthly, margin: { left: 8, right: 8, top: 10, bottom: 0 }, children: [_jsx(CartesianGrid, { vertical: false, stroke: "#e5e7eb", strokeDasharray: "3 6" }), _jsx(XAxis, { dataKey: "m", tick: { fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(YAxis, { yAxisId: "left", tick: { fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(YAxis, { yAxisId: "right", orientation: "right", hide: true }), _jsx(Tooltip, {}), _jsx(Legend, { verticalAlign: "bottom", height: 36, wrapperStyle: { fontSize: 12 } }), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "revenue", name: "Revenue ($)", stroke: C.green, dot: { r: 3, stroke: C.green, fill: "#fff", strokeWidth: 2 }, activeDot: { r: 4 }, strokeWidth: 3 }), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "sales", name: "Sales", stroke: C.blue, dot: { r: 3, stroke: C.blue, fill: "#fff", strokeWidth: 2 }, activeDot: { r: 4 }, strokeWidth: 3 })] }) }) })] }), _jsxs("section", { className: "grid-2", children: [_jsxs("div", { className: "panel", children: [_jsxs("div", { className: "panel-head", children: [_jsx("div", { className: "panel-title", children: "Top Performing Listings" }), _jsx("div", { className: "panel-sub", children: "Most viewed items this month" })] }), _jsx("ol", { className: "top-list", children: topPerforming.map((i) => (_jsxs("li", { className: "top-row", children: [_jsx("span", { className: "rank", children: i.rank }), _jsxs("div", { className: "info", children: [_jsx("div", { className: "name", children: i.name }), _jsxs("div", { className: "sub", children: [i.sales, " sales"] })] }), _jsxs("div", { className: "views", children: [_jsx("span", { className: "ico ico-eye sm" }), " ", i.views] })] }, i.rank))) })] }), _jsxs("div", { className: "panel", children: [_jsxs("div", { className: "panel-head", children: [_jsx("div", { className: "panel-title", children: "Marketplace Health" }), _jsx("div", { className: "panel-sub", children: "Key performance indicators" })] }), _jsxs("div", { className: "health", children: [_jsx(KPIBar, { label: "Average Sale Price", valueLabel: _jsx(Currency, { value: health.avgSalePrice }), pct: 100 }), _jsx(KPIBar, { label: "Conversion Rate", valueLabel: `${health.conversionRate.toFixed(1)}%`, pct: health.conversionRate, max: 10 }), _jsx(KPIBar, { label: "Active Sellers", valueLabel: health.activeSellers.toString(), pct: health.activeSellers, max: 250 }), _jsx(KPIBar, { label: "Avg. Time to Sale", valueLabel: `${health.avgTimeToSaleDays.toFixed(1)} days`, pct: health.avgTimeToSaleDays, max: 14, color: "orange" })] })] })] })] })), tab === "categories" && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "grid-2", children: [_jsxs("div", { className: "panel", children: [_jsxs("div", { className: "panel-head", children: [_jsx("div", { className: "panel-title", children: "Category Distribution" }), _jsx("div", { className: "panel-sub", children: "Breakdown of listings by category" })] }), _jsx("div", { className: "chart-wrap", children: _jsx(ResponsiveContainer, { width: "100%", height: 320, children: _jsxs(PieChart, { children: [_jsx(Tooltip, {}), _jsx(Pie, { data: categoryBreakdown, dataKey: "value", nameKey: "key", outerRadius: 120, label: true, children: categoryBreakdown.map((e, i) => (_jsx(Cell, { fill: e.color }, i))) })] }) }) })] }), _jsxs("div", { className: "panel", children: [_jsxs("div", { className: "panel-head", children: [_jsx("div", { className: "panel-title", children: "Sales by Category" }), _jsx("div", { className: "panel-sub", children: "Number of items sold per category" })] }), _jsx("div", { className: "chart-wrap", children: _jsx(ResponsiveContainer, { width: "100%", height: 320, children: _jsxs(BarChart, { data: salesByCategory, margin: { left: 8, right: 8 }, children: [_jsx(CartesianGrid, { vertical: false, stroke: "#e5e7eb", strokeDasharray: "3 6" }), _jsx(XAxis, { dataKey: "cat", tick: { fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "count", radius: [6, 6, 0, 0] })] }) }) })] })] }), _jsxs("section", { className: "panel", children: [_jsxs("div", { className: "panel-head", children: [_jsx("div", { className: "panel-title", children: "Category Performance" }), _jsx("div", { className: "panel-sub", children: "Detailed breakdown of each category" })] }), _jsx("ul", { className: "cat-list", children: categoryBreakdown.map((c) => (_jsxs("li", { className: "cat-row", children: [_jsx("span", { className: "dot", style: { background: c.color } }), _jsxs("div", { className: "cat-info", children: [_jsx("div", { className: "name", children: c.key }), _jsxs("div", { className: "sub", children: [c.sales, " total sales"] })] }), _jsxs("div", { className: "pct", children: [c.value, "%"] })] }, c.key))) })] })] })), tab === "activity" && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "panel", children: [_jsxs("div", { className: "panel-head", children: [_jsx("div", { className: "panel-title", children: "Daily Activity Overview" }), _jsx("div", { className: "panel-sub", children: "Listings, views, and sales by day of week" })] }), _jsx("div", { className: "chart-wrap", children: _jsx(ResponsiveContainer, { width: "100%", height: 340, children: _jsxs(BarChart, { data: weeklyActivity, barGap: 8, margin: { left: 8, right: 8, top: 10 }, children: [_jsx(CartesianGrid, { vertical: false, stroke: "#e5e7eb", strokeDasharray: "3 6" }), _jsx(XAxis, { dataKey: "day", axisLine: false, tickLine: false }), _jsx(YAxis, { axisLine: false, tickLine: false }), _jsx(Tooltip, { formatter: (v, n) => [v, titleMap[n]] }), _jsx(Legend, { verticalAlign: "bottom", height: 32, wrapperStyle: { fontSize: 12 } }), _jsx(Bar, { dataKey: "listings", name: "New Listings", radius: [6, 6, 0, 0], fill: C.blue }), _jsx(Bar, { dataKey: "sales", name: "Sales", radius: [6, 6, 0, 0], fill: C.green }), _jsx(Bar, { dataKey: "views", name: "Views", radius: [6, 6, 0, 0], fill: C.pink })] }) }) })] }), _jsxs("section", { className: "grid-3", children: [_jsx(StatCard, { title: "Peak Activity Day", big: activityStats.peakDay, sub: `${activityStats.peakDayViews.toLocaleString()} total views` }), _jsx(StatCard, { title: "Most Active Time", big: activityStats.mostActiveLabel, sub: activityStats.mostActiveSub }), _jsx(StatCard, { title: "Avg. Daily Listings", big: activityStats.avgDailyListings.toFixed(1), sub: "New items per day (last 30 days)" })] })] }))] }));
}
function KPIBar({ label, valueLabel, pct, max = 100, color = "brand", }) {
    const ratio = Math.max(0, Math.min(1, pct / max));
    return (_jsxs("div", { className: "kpi-bar", children: [_jsxs("div", { className: "row", children: [_jsx("span", { className: "lbl", children: label }), _jsx("span", { className: "val", children: valueLabel })] }), _jsx("div", { className: `bar ${color}`, children: _jsx("div", { className: "fill", style: { width: `${ratio * 100}%` } }) })] }));
}
function StatCard({ title, big, sub }) {
    return (_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "title", children: title }), _jsx("div", { className: "big", children: big }), _jsx("div", { className: "sub", children: sub })] }));
}
