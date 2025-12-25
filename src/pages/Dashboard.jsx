import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const BRANCH_OPTIONS = ["BEN", "MAR", "JNG", "KOR", "HO"];

const Dashboard = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const brandName =
    JSON.parse(sessionStorage.getItem("skope_user"))?.brandName ||
    "Your Brand";

  // 🔹 Filters
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [date, setDate] = useState(""); // YYYY/MM

  // -----------------------------
  // Branch checkbox handler
  // -----------------------------
  const handleBranchChange = (branch) => {
    setSelectedBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch]
    );
  };

  // -----------------------------
  // Fetch analytics
  // -----------------------------
  const fetchAnalytics = async () => {
    if (
      selectedBranches.length === 0 ||
      !/^\d{4}\/\d{2}$/.test(date)
    ) {
      alert(
        "Please select at least one branch and enter date in YYYY/MM format"
      );
      return;
    }

    const period = date.replace("/", "-");
    setLoading(true);

    try {
      const analyticsRes = await api.get(
        "/api/analytics/sales/summary",
        {
          params: {
            brandName,
            branches: selectedBranches,
            period,
          },
        }
      );

      setAnalytics(analyticsRes.data);

      // Low stock (non-blocking)
      try {
        const stockRes = await api.get("/api/dashboard/low-stock");
        setLowStockItems(stockRes.data || []);
      } catch {
        setLowStockItems([]);
      }
    } catch (err) {
      console.error("Analytics fetch failed", err);
      alert("Failed to load analytics");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
    console.log("DASHBOARD REQUEST", {
  brandName,
  selectedBranches,
  period,
});

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
  // Derived metrics (ALL RESTORED)
  // -----------------------------
  const totalOrders = analytics?.noOfSales ?? 0;
  const revenue = analytics?.revenue ?? 0;
  const netRevenue = analytics?.netAmount ?? 0;
  const taxTotal = analytics?.taxTotal ?? 0;
  const discountTotal = analytics?.discountTotal ?? 0;

  const unsettled =
    analytics?.balanceAmount != null
      ? Number(analytics.balanceAmount)
      : null;

  const charges =
    analytics?.chargeTotal != null
      ? Number(analytics.chargeTotal)
      : null;

  const footfall =
    analytics?.noOfPeople > 0
      ? analytics.noOfPeople
      : totalOrders;

  const aov = analytics?.avgSaleAmount ?? 0;
  const revenuePerCustomer =
    analytics?.avgSaleAmountPerPerson ?? 0;

  const totalItemQty =
    analytics?.items?.reduce(
      (s, i) => s + (i.itemTotalQty || 0),
      0
    ) || 0;

  const totalItemNet =
    analytics?.items?.reduce(
      (s, i) => s + (i.itemTotalNetAmount || 0),
      0
    ) || 0;

  const itemsPerOrder =
    totalOrders > 0
      ? (totalItemQty / totalOrders).toFixed(2)
      : "—";

  const avgItemSellingPrice =
    totalItemQty > 0
      ? (totalItemNet / totalItemQty).toFixed(2)
      : "—";

  const customersPerOrder =
    totalOrders > 0
      ? (footfall / totalOrders).toFixed(2)
      : "—";

  const ncoOrders =
    analytics?.directChargeTotal === 0
      ? analytics?.noOfSales ?? 0
      : 0;

  const ncoRevenue =
    analytics?.directChargeTotal === 0
      ? analytics?.netAmount ?? 0
      : 0;

  const formatCurrency = (val) => {
    const num = Number(val);
    return Number.isFinite(num)
      ? `₹${num.toLocaleString("en-IN")}`
      : "—";
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <header className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Brand Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                {brandName}
              </h1>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full border px-4 py-1.5 text-xs"
            >
              Logout
            </button>
          </div>

          {/* FILTERS */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Branch checkboxes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Branches *
              </label>
              <div className="space-y-2">
                {BRANCH_OPTIONS.map((branch) => (
                  <label
                    key={branch}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(branch)}
                      onChange={() => handleBranchChange(branch)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{branch}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Period (YYYY/MM) *
              </label>
              <input
                type="text"
                placeholder="YYYY/MM"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value.replace(/[^0-9/]/g, ""))
                }
                maxLength={7}
                className="w-full rounded-lg border px-4 py-2 text-sm"
              />
            </div>

            {/* Apply */}
            <div className="flex items-start mt-7">
              <button
                onClick={fetchAnalytics}
                className="w-full rounded-lg bg-slate-900 text-white px-4 py-2"
              >
                Apply
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD */}
        {loading && (
          <p className="text-center text-slate-500">
            Loading analytics…
          </p>
        )}

        {analytics && !loading && (
          <div className="bg-[#1a1a1a] text-white rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6">Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              <Stat title="Total Orders" value={totalOrders} />
              <Stat title="Total Revenue" value={formatCurrency(revenue)} />
              <Stat title="Net Revenue" value={formatCurrency(netRevenue)} />
              <Stat title="Total Taxes" value={formatCurrency(taxTotal)} />
              <Stat title="Total Discount" value={formatCurrency(discountTotal)} />
              <Stat title="Unsettled Amount" value={formatCurrency(unsettled)} />
              <Stat title="Charges Collected" value={formatCurrency(charges)} />
              <Stat title="Avg Order Value" value={formatCurrency(aov)} />
              <Stat title="Revenue / Order" value={formatCurrency(aov)} />
              <Stat title="Customer Footfall" value={footfall} />
              <Stat title="Revenue / Customer" value={formatCurrency(revenuePerCustomer)} />
              <Stat title="Items / Order" value={itemsPerOrder} />
              <Stat title="Avg Item Selling Price" value={formatCurrency(avgItemSellingPrice)} />
              <Stat title="Customers / Order" value={customersPerOrder} />
              <Stat title="Non-Chargeable Orders" value={ncoOrders} />
              <Stat title="Revenue from NCO" value={formatCurrency(ncoRevenue)} />
            </div>

            {/* LOW STOCK */}
            <div className="bg-[#242424] border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Low Stock Alert</h3>

              {lowStockItems.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No low stock items 🎉
                </p>
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

        {!analytics && !loading && (
          <p className="text-center text-slate-500">
            Select branches and date to view analytics
          </p>
        )}
      </div>
    </div>
  );
};

const Stat = ({ title, value }) => (
  <div className="bg-[#242424] border border-gray-700 rounded-xl p-6">
    <p className="text-gray-400 text-xs uppercase mb-2">
      {title}
    </p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default Dashboard;
