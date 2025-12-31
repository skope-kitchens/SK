// 🔹 ONLY paste this whole file as Dashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const BRANCH_OPTIONS = ["BEN", "MAR", "JNG", "KOR", "HO"];

const BRANCH_LABELS = {
  BEN: "JP Nagar",
  MAR: "Marathahalli",
  JNG: "Jayanagar",
  KOR: "Koramangala",
  HO: "Head Office",
};

// 👉 map UI branch → Rista branchCode
const RISTA_BRANCH_MAP = {
  BEN: "AMS",
  MAR: "MAR",
  JNG: "JNG",
  KOR: "KOR",
  HO: "HO",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(null);

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

  /* ---------------- FETCH REMAINING CREDITS ---------------- */
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

  /* ---------------- USER DETAILS ---------------- */
  let storedUser = null;
  try {
    storedUser =
      JSON.parse(sessionStorage.getItem("skope_user")) ||
      JSON.parse(localStorage.getItem("skope_user"));
  } catch {}

  const brandName = storedUser?.brandName || "Your Brand";

  const [selectedBranches, setSelectedBranches] = useState([]);
  const [day, setDay] = useState("");

  const handleBranchChange = (branch) => {
    setSelectedBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch]
    );
  };

  /* ---------------- FETCH STOCK ---------------- */
  const fetchStockReport = async () => {
    try {
      const firstBranch = selectedBranches[0];
      if (!firstBranch) return;

      const branchCode = RISTA_BRANCH_MAP[firstBranch];

      const res = await api.get("/api/stock/items", {
        params: {
          brandName,
          branchLabel: BRANCH_LABELS[firstBranch],
        },
      });

      let items =
        res.data?.data ||
        res.data?.items ||
        res.data?.results ||
        res.data ||
        [];

      if (!Array.isArray(items)) {
        items = items.data || items.items || [];
      }
      if (!Array.isArray(items)) items = [];

      const simplified = items.map((i) => {
        const qty = Number(i.itemQty ?? i.quantity ?? 0);

        let status;
        if (qty <= 0) status = "Out of Stock";
        else if (qty < 5) status = "Low Stock";
        else status = "In Stock";

        return {
          name: i.name || i.itemName || "Unnamed",
          quantity: qty,
          unit: i.measuringUnit || i.unit || "",
          status,
        };
      });

      const alerts = simplified.filter(
        (i) => i.status === "Low Stock" || i.status === "Out of Stock"
      );

      setLowStockItems(alerts);
    } catch {
      setLowStockItems([]);
    }
  };

  /* ---------------- FETCH ANALYTICS ---------------- */
  const fetchAnalytics = async () => {
    if (selectedBranches.length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      alert("Please select branches and date as YYYY-MM-DD");
      return;
    }

    setLoading(true);

    try {
      const res = await api.get("/api/analytics/sales/summary", {
        params: {
          branches: selectedBranches,
          day, // 👈 IMPORTANT — send YYYY-MM-DD
        },
      });

      setAnalytics(res.data);
      await fetchStockReport();
    } catch (err) {
      console.error(err);
      alert("Failed to load analytics");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {}
    navigate("/");
  };

  /* ---------------- DERIVED KPIs ---------------- */
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
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl bg-[url('/assets/Main-bg.png')] bg-cover p-8 shadow ring-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Brand Dashboard
              </p>
              <h1 className="mt-1 text-3xl font-semibold">{brandName}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white text-black px-4 py-2 rounded-xl shadow">
                <span className="font-semibold">Credits:</span>{" "}
                {credits === null ? "Login required" : credits}
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Branches *
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
              <label className="text-sm font-medium mb-2 block">
                Day (YYYY-MM-DD) *
              </label>

              <input
                type="text"
                placeholder="2025-01-31"
                value={day}
                maxLength={10}
                onChange={(e) =>
                  setDay(e.target.value.replace(/[^0-9-]/g, ""))
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchAnalytics}
                className="w-full bg-black text-white py-2 rounded-lg mb-2"
              >
                Apply
              </button>
            </div>
          </div>
        </header>

        {loading && <p className="text-center">Loading…</p>}

        {analytics && !loading && analytics.noData && (
          <div className="text-center bg-white p-10 rounded-2xl shadow border">
            <h2 className="text-2xl font-bold mb-2">No data found</h2>
            <p className="text-gray-600">Please check:</p>

            <ul className="mt-3 text-gray-700">
              <li>✔️ Correct date format YYYY-MM-DD</li>
              <li>✔️ Correct branch selected</li>
              <li>✔️ Sales exist on that day</li>
            </ul>
          </div>
        )}

        {analytics && !loading && !analytics.noData && (
          <div className="bg-[#111] text-white rounded-2xl p-8 space-y-12">
            <h2 className="text-3xl font-bold mb-3">Analytics</h2>

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
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
      <p className="text-gray-400 text-xs uppercase mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
