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
const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const CREDIT_PER_HOUR = 60;

const calculateMeetingHours = (balance) => {
  if (!balance) return 0;
  return balance / CREDIT_PER_HOUR;
};

export default function Dashboard() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const [clientAnalytics, setClientAnalytics] = useState(null);
  const [clientLoading, setClientLoading] = useState(false);


  const [wallet, setWallet] = useState(null);
  const meetingHours = calculateMeetingHours(wallet?.balance);
  const [showWallet, setShowWallet] = useState(false);

  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);


  const [selectedBranches, setSelectedBranches] = useState([]);
  const [day, setDay] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);


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


  /* ---------------- WALLET ---------------- */
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/api/wallet");

        const walletData = {
          balance: res.data.balance ?? 0,
          dueAmount: res.data.dueAmount ?? 0,
          dueReason: res.data.dueReason ?? null,
          transactions: res.data.transactions ?? []
        };

        setWallet(walletData);
        setTransactions(walletData.transactions);
      } catch (err) {
        console.error("Failed to fetch wallet", err);
      }
    };

    fetchWallet();
  }, []);

  
  const startRecharge = async (amount) => {
  try {
    const { data } = await api.post("/api/wallet/create-order", { amount });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: "INR",
      order_id: data.id,
      name: "Skope Wallet",
      description: "Wallet Recharge",
      handler: async (response) => {
        await api.post("/api/wallet/verify", {
          ...response,
          amount
        });

        const res = await api.get("/api/wallet");

        const walletData = {
          balance: res.data.balance ?? 0,
          dueAmount: res.data.dueAmount ?? 0,
          dueReason: res.data.dueReason ?? null,
          transactions: res.data.transactions ?? []
        };

        setWallet(walletData);
        setTransactions(walletData.transactions);

        alert("Wallet updated successfully");

      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    alert("Payment failed");
    console.error(err);
  }
};

  const payDue = async () => {
    if (!wallet?.dueAmount || wallet.dueAmount <= 0) {
      alert("No due amount to pay");
      return;
    }

    try {
      const dueAmount = wallet.dueAmount;
      const { data } = await api.post("/api/wallet/create-order", { amount: dueAmount });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        order_id: data.id,
        name: "Skope Wallet",
        description: `Pay Due Amount: ₹${formatMoney(dueAmount)}`,
        handler: async (response) => {
          await api.post("/api/wallet/verify", {
            ...response,
            amount: dueAmount
          });

          const res = await api.get("/api/wallet");

          const walletData = {
            balance: res.data.balance ?? 0,
            dueAmount: res.data.dueAmount ?? 0,
            dueReason: res.data.dueReason ?? null,
            transactions: res.data.transactions ?? []
          };

          setWallet(walletData);
          setTransactions(walletData.transactions);

          if (walletData.dueAmount === 0) {
            alert("Due amount cleared successfully!");
          } else {
            alert("Payment successful! Due amount partially cleared.");
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment failed");
      console.error(err);
    }
  };

  /*----------------Services-----------------*/
    useEffect(() => {
      const fetchServices = async () => {
        try {
          setServicesLoading(true);
          const res = await api.get("/api/services/client");
          setServices(res.data.services || []);
        } catch (err) {
          console.error("Failed to load services", err);
        } finally {
          setServicesLoading(false);
        }
      };

      fetchServices();
    }, []);

  /*----------------Orders-----------------*/
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await api.get("/api/client/orders");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
    
    // Refresh orders every 10 seconds to check for completed orders
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAsReceived = async (orderId) => {
    try {
      await api.patch(`/api/client/orders/${orderId}/receive`);
      
      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, isReceived: true, receivedAt: new Date() }
            : o
        )
      );
      
      alert("Order marked as received!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark order as received");
    }
  };

  // Count completed but not received orders for notification badge
  const completedOrdersCount = orders.filter(
    (o) => o.status === "COMPLETED" && !o.isReceived
  ).length;



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
                <div className="bg-white px-4 py-2 rounded-xl shadow cursor-pointer">
                  <button
                    onClick={() => navigate("/order")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Order Dish
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowOrders(true)}
                    className="bg-white px-4 py-2 rounded-xl shadow cursor-pointer flex items-center gap-2"
                  >
                    Orders
                    {completedOrdersCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {completedOrdersCount}
                      </span>
                    )}
                  </button>
                </div>
                

                <div
                  onClick={() => setShowWallet(true)}
                  className="bg-white px-4 py-2 rounded-xl flex items-center shadow cursor-pointer"
                >
                  Wallet: ₹{formatMoney(wallet?.balance)}
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow cursor-default">
                  <p className="text-xs text-gray-500">Meeting Time Left</p>
                  <p className="font-semibold text-blue-600">
                    {meetingHours.toFixed(1)} hrs
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </div>
            {wallet?.dueAmount > 0 && (
              <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">
                      ⚠️ Pending Due: ₹{formatMoney(wallet.dueAmount)}
                    </p>
                    <p className="text-sm mt-1">
                      {wallet.dueReason || "Please clear the pending amount"}
                    </p>
                  </div>
                  <button
                    onClick={payDue}
                    className="ml-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap"
                  >
                    Pay Due
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- SERVICE CHECKLIST ---------------- */}
            <section className="bg-white mt-10 rounded-2xl p-8 shadow space-y-6">
              <h2 className="text-2xl font-semibold">
                Service Onboarding Status
              </h2>

              {servicesLoading && (
                <p className="text-gray-500">Loading services…</p>
              )}

              {!servicesLoading && services.length === 0 && (
                <p className="text-gray-500">
                  No services assigned yet.
                </p>
              )}

              <div className="space-y-3">
                {services.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border rounded-lg p-4"
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>

                      {service.completed && service.completedAt && (
                        <p className="text-xs text-gray-500">
                          Completed on{" "}
                          {new Date(service.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        service.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {service.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </section>



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
                  type="date"
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

          {showWallet && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl w-96 space-y-4">
              <h2 className="text-xl font-bold">Wallet</h2>
              <p className="text-lg">Balance: ₹{formatMoney(wallet?.balance)}</p>
              <button
                onClick={() => setShowTransactions(true)}
                className="w-full border py-2 rounded"
              >
                View Transactions
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => startRecharge(500)}
                  className="flex-1 bg-black text-white py-2 rounded"
                >
                  ₹500
                </button>
                <button
                  onClick={() => startRecharge(1000)}
                  className="flex-1 bg-black text-white py-2 rounded"
                >
                  ₹1000
                </button>
              </div>

              <div>
                <input
                  type="number"
                  min="10"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full border p-2 rounded mt-3"
                />
                <button
                  onClick={() => startRecharge(Number(customAmount))}
                  disabled={!customAmount || Number(customAmount) < 10}
                  className="w-full bg-green-600 text-white py-2 rounded mt-2 disabled:opacity-40"
                >
                  Add ₹{customAmount || 0}
                </button>
              </div>

              <button
                onClick={() => setShowWallet(false)}
                className="w-full border py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
        


        {showTransactions && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[500px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Wallet Transactions</h2>

              {transactions.length === 0 && (
                <p className="text-gray-500">No transactions yet</p>
              )}

              <div className="space-y-3">
                {transactions.map((tx, i) => (
                  <div
                    key={i}
                    className="flex justify-between border p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {tx.type === "credit" ? "➕ Credit" : "➖ Debit"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tx.reason || tx.source}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.date).toLocaleString()}
                      </p>
                    </div>

                    <div
                      className={`font-bold ${
                        tx.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ₹{tx.amount}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowTransactions(false)}
                className="w-full mt-4 border py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showOrders && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Orders</h2>
                <button
                  onClick={() => setShowOrders(false)}
                  className="text-gray-500 hover:text-black text-2xl"
                >
                  ✕
                </button>
              </div>

              {ordersLoading ? (
                <p className="text-gray-500 text-center py-8">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders placed yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className={`border rounded-lg p-4 ${
                        order.status === "COMPLETED" && !order.isReceived
                          ? "bg-green-50 border-green-300"
                          : ""
                      }`}
                    >
                      {/* ORDER HEADER */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Placed: {new Date(order.createdAt).toLocaleString()}
                          </p>
                          {order.status === "COMPLETED" && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              ✓ Completed{order.completedAt ? `: ${new Date(order.completedAt).toLocaleString()}` : ""}
                            </p>
                          )}
                          {order.isReceived && order.receivedAt && (
                            <p className="text-sm text-blue-600 font-medium mt-1">
                              ✓ Received: {new Date(order.receivedAt).toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              order.status === "PLACED"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "PREPARING"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                          <p className="font-bold text-lg mt-2">
                            ₹{formatMoney(order.amount)}
                          </p>
                        </div>
                      </div>

                      {/* ITEMS */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600">
                              {item.qty} × {item.dish} - ₹{formatMoney(item.total || item.price * item.qty)}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* COMPLETED NOTIFICATION */}
                      {order.status === "COMPLETED" && !order.isReceived && (
                        <div className="bg-green-100 border border-green-300 text-green-800 p-3 rounded-lg mb-3">
                          <p className="font-semibold">
                            🎉 Your order is ready! Please mark as received once you receive the materials.
                          </p>
                        </div>
                      )}

                      {/* RECEIVED BUTTON */}
                      {order.status === "COMPLETED" && !order.isReceived && (
                        <button
                          onClick={() => markAsReceived(order._id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors"
                        >
                          Mark as Received
                        </button>
                      )}

                      {order.isReceived && (
                        <div className="bg-blue-100 border border-blue-300 text-blue-800 p-2 rounded text-sm text-center">
                          ✓ Order received and confirmed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowOrders(false)}
                className="w-full mt-6 border py-2 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}


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
          <section className="bg-[url('./assets/Main-bg.png')] bg-cover bg-center bg-no-repeat rounded-2xl p-8 shadow space-y-6">
            

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
