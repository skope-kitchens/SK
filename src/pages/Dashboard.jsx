import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Layout from "../components/Layout";

const BRANCH_OPTIONS = ["BEN", "MAR", "JNG", "KOR", "HO"];

const BRANCH_LABELS = {
  BEN: "JP Nagar",
  MAR: "Marathahalli",
  JNG: "Jayanagar",
  KOR: "Koramangala",
  HO: "Head Office",
};

export default function Dashboard() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const [clientAnalytics, setClientAnalytics] = useState(null);
  const [clientLoading, setClientLoading] = useState(false);

  const [credits, setCredits] = useState(null);

  const [selectedBranches, setSelectedBranches] = useState([]);
  const [day, setDay] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ---------------- TOKEN ---------------- */
  function getTokenSafely() {
    try {
      return (
        sessionStorage.getItem("skope_auth_token") ||
        localStorage.getItem("skope_auth_token") ||
        localStorage.getItem("token")
      );
    } catch {
      return null;
    }
  }

  /* ---------------- CREDITS ---------------- */
  useEffect(() => {
    const fetchCredits = async () => {
      const token = getTokenSafely();
      if (!token) return;

      try {
        const res = await api.get("/api/auth/credits", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCredits(res.data?.credits ?? 0);
      } catch {
        setCredits(null);
      }
    };

    fetchCredits();
  }, []);

  /* ---------------- USER ---------------- */
  let storedUser = null;
  try {
    storedUser =
      JSON.parse(sessionStorage.getItem("skope_user")) ||
      JSON.parse(localStorage.getItem("skope_user"));
  } catch {}

  const brandName = storedUser?.brandName || "Your Brand";

  /* ---------------- BRANCH HANDLER ---------------- */
  const handleBranchChange = (branch) => {
    setSelectedBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch]
    );
  };

  /* ---------------- DAILY ANALYTICS ---------------- */
  const fetchAnalytics = async () => {
    if (selectedBranches.length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      alert("Select branches and date (YYYY-MM-DD)");
      return;
    }

    setLoading(true);

    try {
      const res = await api.get("/api/analytics/sales/summary", {
        params: { branches: selectedBranches, day },
      });
      setAnalytics(res.data);
    } catch {
      alert("Failed to load analytics");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CLIENT RANGE ANALYTICS ---------------- */
  const fetchClientAnalytics = async () => {
  if (!fromDate || !toDate || selectedBranches.length === 0) {
    alert("Select branches, FROM date and TO date");
    return;
  }

  setClientLoading(true);

  try {
    const start = new Date(fromDate);
    const end = new Date(toDate);

    let cursor = new Date(start);

    const aggregate = {
      noOfSales: 0,
      revenue: 0,
      netAmount: 0,
      taxTotal: 0,
      discountTotal: 0,
      items: [],
    };

    const itemMap = {};

    while (cursor <= end) {
      const dayStr = cursor.toISOString().slice(0, 10);

      try {
        const res = await api.get("/api/analytics/sales/summary", {
          params: {
            branches: selectedBranches,
            day: dayStr,
          },
        });

        const data = res.data;

        if (!data || data.noData) {
          cursor.setDate(cursor.getDate() + 1);
          continue;
        }

        aggregate.noOfSales += Number(data.noOfSales || 0);
        aggregate.revenue += Number(data.revenue || 0);
        aggregate.netAmount += Number(data.netAmount || 0);
        aggregate.taxTotal += Number(data.taxTotal || 0);
        aggregate.discountTotal += Number(data.discountTotal || 0);

        (data.items || []).forEach((i) => {
          const key = i.name || i.itemName || "Unknown";

          if (!itemMap[key]) {
            itemMap[key] = {
              name: key,
              quantity: 0,
              netAmount: 0,
            };
          }

          itemMap[key].quantity += Number(i.quantity || 0);
          itemMap[key].netAmount += Number(i.netAmount || 0);
        });
      } catch {
        // silently skip failed days
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    aggregate.items = Object.values(itemMap);

    // derived avg sale
    aggregate.avgSaleAmount = aggregate.noOfSales
      ? aggregate.revenue / aggregate.noOfSales
      : 0;

    setClientAnalytics(aggregate);
  } catch (err) {
    console.error(err);
    alert("Failed to aggregate analytics");
    setClientAnalytics(null);
  } finally {
    setClientLoading(false);
  }
};


  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  /* ---------------- DERIVED KPIs (SAME AS EARLIER) ---------------- */
  const totalOrders = analytics?.noOfSales ?? 0;
  const revenue = analytics?.revenue ?? 0;
  const netRevenue = analytics?.netAmount ?? 0;
  const taxTotal = analytics?.taxTotal ?? 0;
  const discountTotal = analytics?.discountTotal ?? 0;
  const aov = analytics?.avgSaleAmount ?? 0;
  const revenuePerOrder = aov;

  const totalItemQty =
    analytics?.items?.reduce((s, i) => s + Number(i.quantity || 0), 0) || 0;

  const totalItemNet =
    analytics?.items?.reduce((s, i) => s + Number(i.netAmount || 0), 0) || 0;

  const itemsPerOrder =
    totalOrders ? (totalItemQty / totalOrders).toFixed(2) : "—";

  const avgItemSellingPrice =
    totalItemQty ? (totalItemNet / totalItemQty).toFixed(2) : "—";

  const formatCurrency = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-10">

          {/* ---------------- HEADER ---------------- */}
          <header className="rounded-2xl bg-[url('/assets/Main-bg.png')] bg-cover p-8 shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Brand Dashboard
                </p>
                <h1 className="text-3xl font-semibold">{brandName}</h1>
              </div>

              <div className="flex gap-4">
                <div className="bg-white px-4 py-2 rounded-xl shadow">
                  Credits: {credits ?? "—"}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Branches
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BRANCH_OPTIONS.map((b) => (
                    <label key={b} className="flex gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedBranches.includes(b)}
                        onChange={() => handleBranchChange(b)}
                      />
                      {BRANCH_LABELS[b]}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Day (YYYY-MM-DD)
                </label>
                <input
                  value={day}
                  onChange={(e) =>
                    setDay(e.target.value.replace(/[^0-9-]/g, ""))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchAnalytics}
                  className="w-full bg-black text-white py-2 rounded-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </header>

          {/* ---------------- DAILY ANALYTICS (UNCHANGED) ---------------- */}
          {loading && <p className="text-center">Loading…</p>}

          {analytics && !loading && (
            <div className="bg-[#111] text-white rounded-2xl p-8 space-y-10">
              <h2 className="text-3xl font-bold">Per Day Analytics</h2>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Stat title="Total Orders" value={totalOrders} />
                <Stat title="Total Revenue" value={formatCurrency(revenue)} />
                <Stat title="Net Revenue" value={formatCurrency(netRevenue)} />
                <Stat title="Total Taxes" value={formatCurrency(taxTotal)} />
                <Stat
                  title="Total Discounts"
                  value={formatCurrency(discountTotal)}
                />
                <Stat title="Avg Order Value" value={formatCurrency(aov)} />
                <Stat
                  title="Revenue / Order"
                  value={formatCurrency(revenuePerOrder)}
                />
                <Stat title="Items / Order" value={itemsPerOrder} />
                <Stat
                  title="Avg Item Selling Price"
                  value={formatCurrency(avgItemSellingPrice)}
                />
              </div>
            </div>
          )}

          {/* ---------------- CLIENT ANALYTICS ---------------- */}
          <section className="bg-white rounded-2xl p-8 shadow space-y-6">
            

            <div className="grid md:grid-cols-3 gap-6">
              
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
              <button
                onClick={fetchClientAnalytics}
                className="bg-black text-white rounded-lg"
              >
                Fetch
              </button>
            </div>

            {clientLoading && (
              <p className="text-center">Loading client analytics…</p>
            )}

            {clientAnalytics && (
              <AnalyticsBlock data={clientAnalytics} />
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}

/* ---------------- CLIENT ANALYTICS BLOCK ---------------- */
function AnalyticsBlock({ data }) {
  const format = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const totalOrders = data?.noOfSales ?? 0;
  const revenue = data?.revenue ?? 0;
  const netRevenue = data?.netAmount ?? 0;
  const taxTotal = data?.taxTotal ?? 0;
  const discountTotal = data?.discountTotal ?? 0;
  const aov = data?.avgSaleAmount ?? 0;

  const revenuePerOrder = aov;

  const totalItemQty =
    data?.items?.reduce((s, i) => s + Number(i.quantity || 0), 0) || 0;

  const totalItemNet =
    data?.items?.reduce((s, i) => s + Number(i.netAmount || 0), 0) || 0;

  const itemsPerOrder =
    totalOrders ? (totalItemQty / totalOrders).toFixed(2) : "—";

  const avgItemSellingPrice =
    totalItemQty ? (totalItemNet / totalItemQty).toFixed(2) : "—";

  return (
    <div className="bg-[#111] text-white rounded-2xl p-8">
      <h2 className="text-3xl font-bold">Analytics (Date Range)</h2>
      <br />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        <Stat title="Total Orders" value={totalOrders} />
        <Stat title="Total Revenue" value={format(revenue)} />
        <Stat title="Net Revenue" value={format(netRevenue)} />
        <Stat title="Total Taxes" value={format(taxTotal)} />
        <Stat title="Total Discounts" value={format(discountTotal)} />
        <Stat title="Avg Order Value" value={format(aov)} />
        <Stat
          title="Revenue / Order"
          value={format(revenuePerOrder)}
        />
        <Stat title="Items / Order" value={itemsPerOrder} />
        <Stat
          title="Avg Item Selling Price"
          value={format(avgItemSellingPrice)}
        />
      </div>
    </div>
  );
}

/* ---------------- KPI TILE ---------------- */
function Stat({ title, value }) {
  return (
    <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
      <p className="text-gray-400 text-xs uppercase mb-2">{title}</p>
      <p className="text-3xl font-bold">{value ?? "—"}</p>
    </div>
  );
}
