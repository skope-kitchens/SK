import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authUtils } from '../utils/auth'


const Dashboard = () => {

    const [stats] = useState({
    totalOrders: 156,
    activeOrders: 4,
    lowStockItems: 3,
    pendingDeliveries: 2,
    revenueMonth: 12450,
    totalCustomers: 48,
  });

  const [lowStockItems] = useState([
    { name: "Chicken Breast", quantity: 8, unit: "kg", status: "low" },
    { name: "Cooking Oil", quantity: 0, unit: "L", status: "critical" },
    { name: "Basmati Rice", quantity: 12, unit: "kg", status: "low" },
  ]);

  const aiMessages = [
    "Why is Chicken Breast running low?",
    "When is the next delivery arriving?",
    "How are today’s 156 orders performing?",
  ];

  
  const navigate = useNavigate()
  const [brandName, setBrandName] = useState('Your Brand')
  const status = 'Approved'
  const summaryPoints = [
    'All compliance documents verified successfully.',
    'Supply chain checks completed with no pending actions.',
    'Financial assessment indicates low risk and stable margins.',
    'Next onboarding milestones scheduled for Q1 fulfillment.',
  ]

useEffect(() => {
  if (typeof window !== "undefined") {
    try {
      const storedBrand = localStorage.getItem("selectedBrandName");
      if (storedBrand) setBrandName(storedBrand);
    } catch (err) {
      console.warn("Storage not available");
    }
  }
}, []);


  const handleLogout = () => {
    authUtils.clearAuth()
    try {
      localStorage.removeItem('selectedBrandName')
    } catch (err) {
      console.error('Unable to clear brand cache', err)
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
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

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"
            >
              Logout
            </button>
            <button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"><a href="/docs/NDA.pdf">NDA</a></button>
          </div>
        </header>

        <div className="min-h-screen bg-[#1a1a1a] text-white p-8">
      {/* Header */}
      <div className="flex justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Welcome back! Here's your kitchen overview.
          </p>
        </div>
        <button className="border border-gray-700 rounded-lg p-2 hover:border-gray-500">
          🔔
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <Stat title="Total Stock Available" value={stats.totalOrders} />
        <Stat title="AOV" value={stats.activeOrders} />
        <Stat title="KPT" value={stats.lowStockItems} />
        <Stat title="Total Sales" value={stats.pendingDeliveries} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <Stat
          title="Low Stock"
          value={`₹${stats.revenueMonth.toLocaleString()}`}
        />
        <Stat title="Stock Movement" value={stats.totalCustomers} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        

        {/* Low Stock Alert */}
        <div className="bg-[#242424] border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold mb-6">Low Stock Alert</h3>

          <div className="space-y-4">
            {lowStockItems.map((item, i) => (
              <div
                key={i}
                className="flex justify-between border-b border-gray-700 pb-3"
              >
                <span>{item.name}</span>
                <span
                  className={
                    item.status === "critical"
                      ? "text-red-500 font-semibold"
                      : "text-yellow-400 font-semibold"
                  }
                >
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      </div>
    </div>
  )
}

const Stat = ({ title, value }) => {
  return (
    <div className="bg-[#242424] border border-gray-700 rounded-xl p-6 hover:bg-[#2a2a2a] transition">
      <p className="text-gray-400 text-xs uppercase mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};
export default Dashboard
