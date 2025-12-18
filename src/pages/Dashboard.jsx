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

  /* Load brand name safely */
  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("skope_user"));
      if (user?.brandName) {
        setBrandName(user.brandName);
      }
    } catch {}
  }, []);

useEffect(() => {
  async function loadDashboard() {
    try {
      const [statsRes, stockRes] = await Promise.all([
        api.get("/api/dashboard/stats"),
        api.get("/api/dashboard/low-stock").catch(() => [])
,
      ])

      setStats(statsRes.data)
      setLowStockItems(stockRes.data)
    } catch (err) {
      if (err.response?.status === 404) {
        // ✅ Brand not onboarded yet
        setStats(null)
      } else {
        console.error("Dashboard API error:", err)
      }
    } finally {
      setLoading(false)
    }
  }

  loadDashboard()
}, [])
  /* Logout handler */
  const handleLogout = () => {
  // 1️⃣ Clear auth storage
  sessionStorage.removeItem("skope_auth_token");
  sessionStorage.removeItem("skope_user");

  // 2️⃣ Remove axios auth header (CRITICAL)
  delete api.defaults.headers.common["Authorization"];

  // 3️⃣ Reset local state
  setStats(null);
  setLowStockItems([]);
  setBrandName("Your Brand");

  // 4️⃣ Navigate to login / home
  navigate("/");
};

  /* Dashboard API calls */
  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, stockRes] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/low-stock").catch(() => []),
        ]);

        setStats(statsRes.data);
        setLowStockItems(stockRes.data);
      } catch (err) {
        console.error("Dashboard API error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <p className="text-white p-8">Loading...</p>;
  if (!stats)
  return (
    <div className="p-8 text-slate-700">
      <h2 className="text-xl font-semibold">Brand not onboarded yet</h2>
      <p className="mt-2 text-slate-500">
        Your brand is approved but operational data is not available yet.
      </p>
    </div>
  )


  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ✅ BRAND HEADER */}
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
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"
              >
                Logout
              </button>

              <a
                href="/docs/NDA.pdf"
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"
              >
                NDA
              </a>
            </div>
          </div>
        </header>

        {/* ✅ DARK DASHBOARD SECTION */}
        <div className="bg-[#1a1a1a] text-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <Stat title="Total Orders" value={stats.totalOrders} />
            <Stat title="Active Orders" value={stats.activeOrders} />
            <Stat title="Revenue" value={`₹${stats.revenue}`} />
            <Stat title="Customers" value={stats.customers} />
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

/* ✅ STAT CARD */
const Stat = ({ title, value }) => {
  return (
    <div className="bg-[#242424] border border-gray-700 rounded-xl p-6">
      <p className="text-gray-400 text-xs uppercase mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default Dashboard;
