// 🔹 ONLY paste this whole file as Dashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const BRANCH_OPTIONS = ["BEN", "MAR", "JNG", "KOR", "HO"];

export default function Dashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ⭐ credits state
  const [credits, setCredits] = useState(null);

  const storedUser =
    JSON.parse(sessionStorage.getItem("skope_user")) ||
    JSON.parse(localStorage.getItem("skope_user"));

  const brandName = storedUser?.brandName || "Your Brand";

  const [selectedBranches, setSelectedBranches] = useState([]);
  const [date, setDate] = useState("");

  /* ---------------- FETCH REMAINING CREDITS ---------------- */
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await api.get("/api/auth/credits"); // 👈 change if your route differs
        setCredits(res.data?.credits ?? 0);
      } catch (err) {
        console.error("Failed to load credits", err);
        setCredits(null);
      }
    };

    fetchCredits();
  }, []);

  /* ---------------- BRANCH SELECTION ---------------- */
  const handleBranchChange = (branch) => {
    setSelectedBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch]
    );
  };

  /* ---------------- FETCH ANALYTICS ---------------- */
  const fetchAnalytics = async () => {
    if (selectedBranches.length === 0 || !/^\d{4}\/\d{2}$/.test(date)) {
      alert("Please select branches and date as YYYY/MM");
      return;
    }

    const period = date.replace("/", "-");
    setLoading(true);

    try {
      const res = await api.get("/api/analytics/sales/summary", {
        params: {
          brandName,
          branches: selectedBranches,
          period,
        },
      });

      setAnalytics(res.data);

      try {
        const stockRes = await api.get("/api/dashboard/low-stock");
        setLowStockItems(stockRes.data || []);
      } catch {
        setLowStockItems([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load analytics");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  /* ---------------- DERIVED METRICS ---------------- */

  const totalOrders = analytics?.noOfSales ?? 0;
  const revenue = analytics?.revenue ?? 0;
  const netRevenue = analytics?.netAmount ?? 0;
  const taxTotal = analytics?.taxTotal ?? 0;
  const discountTotal = analytics?.discountTotal ?? 0;
  const unsettled = analytics?.balanceAmount ?? 0;
  const charges = analytics?.chargeTotal ?? 0;

  const footfall = analytics?.noOfPeople ?? totalOrders;

  const aov = analytics?.avgSaleAmount ?? 0;

  const revenuePerOrder = aov;

  const revenuePerCustomer =
    analytics?.avgSaleAmountPerPerson ?? 0;

  const totalItemQty =
    analytics?.items?.reduce(
      (sum, i) => sum + (i.itemTotalQty || 0),
      0
    ) || 0;

  const totalItemNet =
    analytics?.items?.reduce(
      (sum, i) => sum + (i.itemTotalNetAmount || 0),
      0
    ) || 0;

  const itemsPerOrder =
    totalOrders ? (totalItemQty / totalOrders).toFixed(2) : "—";

  const avgItemSellingPrice =
    totalItemQty ? (totalItemNet / totalItemQty).toFixed(2) : "—";

  const customersPerOrder =
    totalOrders ? (footfall / totalOrders).toFixed(2) : "—";

  const ncoOrders =
    analytics?.directChargeTotal === 0 ? totalOrders : 0;

  const ncoRevenue =
    analytics?.directChargeTotal === 0 ? netRevenue : 0;

  const formatCurrency = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ---------------- HEADER ---------------- */}
        <header className="rounded-2xl bg-[url('/assets/Main-bg.png')] bg-no-repeat bg-cover p-8 shadow ring-1 ring-slate-200">
          <div className="flex justify-between items-center">

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Brand Dashboard
              </p>
              <h1 className="mt-1 text-3xl font-semibold">{brandName}</h1>
            </div>

            <div className="flex items-center gap-4">

              {/* ⭐ REMAINING CREDITS BADGE */}
              <div className="bg-white text-black px-4 py-2 rounded-xl shadow">
                <span className="font-semibold">Credits:</span>{" "}
                {credits === null ? "—" : credits}
              </div>

              {/* LOGOUT BUTTON */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>

          {/* ---------------- FILTERS ---------------- */}
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {/* Branches */}
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
                    {b}
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Period (YYYY/MM) *
              </label>
              <input
                type="text"
                placeholder="2025/01"
                value={date}
                maxLength={7}
                onChange={(e) =>
                  setDate(e.target.value.replace(/[^0-9/]/g, ""))
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Apply */}
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

        {/* ---------------- LOADING ---------------- */}
        {loading && (
          <p className="text-center text-gray-500">Loading…</p>
        )}

        {/* ---------------- EMPTY ---------------- */}
        {!analytics && !loading && (
          <p className="text-center text-gray-500">
            Select filters to view analytics
          </p>
        )}

        {/* ---------------- DASHBOARD DATA ---------------- */}
        {analytics && !analytics.noData && !loading && (
          <div className="bg-[#111] text-white rounded-2xl p-8 space-y-8">

            <h2 className="text-3xl font-bold mb-3">Analytics</h2>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

              <Stat title="Total Orders" value={totalOrders} />
              <Stat title="Total Revenue" value={formatCurrency(revenue)} />
              <Stat title="Net Revenue" value={formatCurrency(netRevenue)} />
              <Stat title="Total Taxes" value={formatCurrency(taxTotal)} />
              <Stat title="Total Discounts" value={formatCurrency(discountTotal)} />
              <Stat title="Avg Order Value" value={formatCurrency(aov)} />
              <Stat title="Revenue / Order" value={formatCurrency(revenuePerOrder)} />
              <Stat title="Items / Order" value={itemsPerOrder} />
              <Stat title="Avg Item Selling Price" value={formatCurrency(avgItemSellingPrice)} />
            </div>

            {/* LOW STOCK */}
            <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
              <h3 className="font-semibold mb-3">Low Stock Alerts</h3>

              {lowStockItems.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No items are low on stock 🎉
                </p>
              )}

              {lowStockItems.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-gray-700 py-2"
                >
                  <span>{item.name}</span>
                  <span className="text-yellow-400 font-semibold">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
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
