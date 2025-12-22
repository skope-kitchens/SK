import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState("Your Brand");

  const status = "Approved";

  // -----------------------------
  // Load brand name
  // -----------------------------
  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("skope_user"));
      if (user?.brandName) {
        setBrandName(user.brandName);
      }
    } catch {}
  }, []);

  // -----------------------------
  // Load dashboard data (SINGLE EFFECT)
  // -----------------------------
  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, stockRes] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/low-stock"),
        ]);

        setStats(statsRes.data);
        setLowStockItems(stockRes.data || []);
      } catch (err) {
        console.error("Dashboard API error:", err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // -----------------------------
  // Logout
  // -----------------------------
  const handleLogout = () => {
    sessionStorage.removeItem("skope_auth_token");
    sessionStorage.removeItem("skope_user");
    delete api.defaults.headers.common["Authorization"];
    navigate("/");
  };

  // -----------------------------
  // Render guards
  // -----------------------------
  if (loading) {
    return <p className="p-8">Loading...</p>;
  }

  // ❌ Not eligible → block user
  if (stats && stats.eligibilityPassed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md text-center">
          <h2 className="text-xl font-semibold text-slate-800">
            Brand not eligible
          </h2>

          <p className="mt-3 text-slate-500">
            Your eligibility score is{" "}
            <span className="font-semibold">
              {stats.eligibilityScore}
            </span>
            . Unfortunately, this does not meet our onboarding threshold.
          </p>

          <button
            onClick={handleLogout}
            className="mt-6 rounded-lg bg-slate-900 px-6 py-2 text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------
  // Eligible → show dashboard ALWAYS
  // -----------------------------
  const totalOrders = stats?.totalOrders ?? 0;
  const activeOrders = stats?.activeOrders ?? 0;
  const revenue = stats?.revenue ?? 0;
  const aov = totalOrders > 0 ? revenue / totalOrders : 0;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* BRAND HEADER */}
        <header className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Brand Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                {brandName}
              </h1>

              <p className="mt-3 text-base text-slate-500">
                Welcome back! Here is the latest status of your onboarding review.
              </p>

              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">
                  {status}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>

              <a
                href="/docs/NDA.pdf"
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                NDA
              </a>
            </div>
          </div>
        </header>

        {/* DASHBOARD */}
        <div className="bg-[#1a1a1a] text-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <Stat title="Total Orders" value={totalOrders} />
            <Stat title="Active Orders" value={activeOrders} />
            <Stat title="Revenue" value={`₹${revenue}`} />
            <Stat title="Average Order Value (AOV)" value={`₹${aov.toFixed(2)}`} />
          </div>

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

      </div>
    </div>
  );
};

// -----------------------------
// Stat Card
// -----------------------------
const Stat = ({ title, value }) => {
  return (
    <div className="bg-[#242424] border border-gray-700 rounded-xl p-6">
      <p className="text-gray-400 text-xs uppercase mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default Dashboard;
