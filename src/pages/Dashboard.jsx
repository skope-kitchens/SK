import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [brandName, setBrandName] = useState(
    JSON.parse(sessionStorage.getItem("skope_user"))?.brandName || "Your Brand"
  );

  // 🔹 Filters
  const [branchCode, setBranchCode] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd

  // -----------------------------
  // Utils
  // -----------------------------
  const toPeriod = (dateStr) => {
    // "2025-12-23" → "2025-12"
    return dateStr ? dateStr.slice(0, 7) : "";
  };

  // -----------------------------
  // Fetch analytics
  // -----------------------------
  const fetchAnalytics = async () => {
    if (!branchCode || !date) {
      alert("Please select branch and date");
      return;
    }

    const period = toPeriod(date);

    setLoading(true);
    try {
      const [analyticsRes, stockRes] = await Promise.all([
        api.get("/api/analytics/sales/summary", {
          params: { branch: branchCode, period },
        }),
        api.get("/api/dashboard/low-stock"),
      ]);

      setAnalytics(analyticsRes.data);
      setLowStockItems(stockRes.data || []);
    } catch (err) {
      console.error("Analytics fetch failed:", err);
      alert("Failed to load analytics");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const handleLogout = () => {
    sessionStorage.clear();
    delete api.defaults.headers.common["Authorization"];
    navigate("/");
  };

  // -----------------------------
  // Derived metrics
  // -----------------------------
  const totalOrders = analytics?.noOfSales ?? 0;
  const revenue = analytics?.revenue ?? 0;
  const aov = analytics?.avgSaleAmount ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* HEADER */}
        <header className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="flex justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Brand Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                {brandName}
              </h1>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs"
            >
              Logout
            </button>
          </div>

          {/* 🔎 FILTERS */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Branch Code (e.g. BEN)"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            />

            <button
              onClick={fetchAnalytics}
              className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800"
            >
              Apply
            </button>
          </div>
        </header>

        {/* DASHBOARD */}
        {loading && (
          <p className="text-center text-slate-500">Loading analytics…</p>
        )}

        {analytics && !loading && (
          <div className="bg-[#1a1a1a] text-white rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6">Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              <Stat title="Total Orders" value={totalOrders} />
              <Stat title="Revenue" value={`₹${revenue}`} />
              <Stat title="Average Order Value (AOV)" value={`₹${aov.toFixed(2)}`} />
              <Stat title="Net Amount" value={`₹${analytics.netAmount ?? 0}`} />
            </div>

            {/* LOW STOCK */}
            <div className="bg-[#242424] border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Low Stock Alert</h3>

              {lowStockItems.length === 0 ? (
                <p className="text-gray-400 text-sm">No low stock items 🎉</p>
              ) : (
                lowStockItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-gray-700 py-2"
                  >
                    <span>{item.name}</span>
                    <span className="text-yellow-400 font-semibold">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!analytics && !loading && (
          <p className="text-center text-slate-500">
            Select branch and date to view analytics
          </p>
        )}
      </div>
    </div>
  );
};

// -----------------------------
// Stat Card
// -----------------------------
const Stat = ({ title, value }) => (
  <div className="bg-[#242424] border border-gray-700 rounded-xl p-6">
    <p className="text-gray-400 text-xs uppercase mb-2">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default Dashboard;
