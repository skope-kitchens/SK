import { useEffect, useState } from "react";
import api from "../utils/api";
import { OrderRecipeBreakdown } from "./OrderDish";

import WalletPanel from "./WalletPanel";
import ServiceChecklist from "./ServiceChecklist";

const BrandDrawer = ({ brand, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [dueAmount, setDueAmount] = useState("");
  const [dueReason, setDueReason] = useState("");
  const [showRecipesOrderId, setShowRecipesOrderId] = useState(null);


  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    if (!brand?._id) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await api.get(`/api/admin/orders/${brand._id}`);
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
    
    // Refresh orders every 5 seconds to get updates
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [brand]);

  /* ================= UPDATE ORDER STATUS ================= */
  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/api/admin/orders/${orderId}`, { status });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status } : o
        )
      );
    } catch (err) {
      alert("Failed to update order");
    }
  };

  /* ================= DELETE ORDER ================= */
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    try {
      await api.delete(`/api/admin/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (showRecipesOrderId === orderId) setShowRecipesOrderId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete order");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative bg-white w-full max-w-xl h-full shadow-xl overflow-y-auto p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {brand.brandName}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* ================= WALLET ================= */}
        <WalletPanel
          brandId={brand._id}
          balance={brand.wallet?.balance ?? 0}
        />

        <div className="mt-4 border rounded-lg p-4">
  <h4 className="font-semibold mb-2">Add Due Amount</h4>

  <input
    type="number"
    placeholder="Amount"
    className="w-full border rounded px-3 py-2 mb-2"
    value={dueAmount}
    onChange={(e) => setDueAmount(e.target.value)}
  />

  <input
    type="text"
    placeholder="Reason (optional)"
    className="w-full border rounded px-3 py-2 mb-2"
    value={dueReason}
    onChange={(e) => setDueReason(e.target.value)}
  />

  <button
    onClick={async () => {
      await api.post("/api/wallet/admin/wallet/due", {
        userId: brand._id,
        amount: dueAmount,
        reason: dueReason
      });

      alert("Due added successfully");
      setDueAmount("");
      setDueReason("");
    }}
    className="bg-red-600 text-white px-4 py-2 rounded"
  >
    Add Due
  </button>
</div>

        {/* ================= SERVICES ================= */}
        <div className="mt-8">
          <ServiceChecklist
            brandId={brand._id}
            editable
          />
        </div>

        {/* ================= ORDERS ================= */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">
            Orders
          </h3>

          {loadingOrders ? (
            <p className="text-gray-500 text-sm">
              Loading orders…
            </p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No orders placed yet
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-4"
                >
                  {/* ORDER HEADER */}
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold">
                        ₹{order.amount}
                      </span>
                      {order.isReceived && (
                        <span className="ml-2 text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          ✓ Received
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.status === "PLACED"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "PREPARING"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* ITEMS */}
                  <ul className="text-sm text-gray-600 mb-3">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.qty} × {item.dish}
                      </li>
                    ))}
                  </ul>

                  {/* RECEIVED INFO */}
                  {order.isReceived && order.receivedAt && (
                    <p className="text-xs text-blue-600 mb-2">
                      Received: {new Date(order.receivedAt).toLocaleString()}
                    </p>
                  )}

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <button
                      type="button"
                      onClick={() => setShowRecipesOrderId(order._id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View recipes
                    </button>

                    {order.status === "PLACED" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            "PREPARING"
                          )
                        }
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Mark Preparing
                      </button>
                    )}

                    {order.status === "PREPARING" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            "COMPLETED"
                          )
                        }
                        className="text-sm text-green-600 hover:underline"
                      >
                        Mark Completed
                      </button>
                    )}

                    {order.status === "COMPLETED" && !order.isReceived && (
                      <p className="text-xs text-gray-500 italic">
                        Waiting for client to mark as received
                      </p>
                    )}

                    {order.status === "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => deleteOrder(order._id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECIPES MODAL (same as client Calculate / order breakdown) */}
      {showRecipesOrderId && (() => {
        const order = orders.find((o) => o._id === showRecipesOrderId);
        if (!order) return null;
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Recipe breakdown — Order #{order._id.slice(-6).toUpperCase()}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRecipesOrderId(null)}
                  className="text-gray-500 hover:text-black text-xl"
                >
                  ✕
                </button>
              </div>
              <ul className="space-y-6">
                {order.items.map((item, idx) => {
                  const rows = item.breakdown || [];
                  const foodCost = rows
                    .filter((b) => b.category === "Food")
                    .reduce((s, b) => s + (Number(b.cost) || 0), 0);
                  const packagingCost = rows
                    .filter((b) => b.category === "Packaging")
                    .reduce((s, b) => s + (Number(b.cost) || 0), 0);
                  const total = foodCost + packagingCost;
                  const data = rows.length
                    ? { breakdown: rows, foodCost, packagingCost, total }
                    : null;
                  return (
                    <li key={idx} className="border rounded-lg p-4">
                      <p className="font-medium text-gray-800 mb-2">
                        {item.qty} × {item.dish}
                      </p>
                      {data ? (
                        <OrderRecipeBreakdown
                          data={data}
                          loading={false}
                          multiplier={1}
                        />
                      ) : (
                        <p className="text-xs text-gray-500">
                          No breakdown data stored for this order.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default BrandDrawer;
