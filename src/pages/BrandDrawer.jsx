import { useEffect, useState } from "react";
import api from "../utils/api";

import WalletPanel from "./WalletPanel";
import ServiceChecklist from "./ServiceChecklist";

const BrandDrawer = ({ brand, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    if (!brand?._id) return;

    setLoadingOrders(true);

    api
      .get(`/api/admin/orders/${brand._id}`)
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch orders", err);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
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
                    <span className="font-semibold">
                      ₹{order.amount}
                    </span>

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

                  {/* ACTIONS */}
                  <div className="flex gap-3">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandDrawer;
