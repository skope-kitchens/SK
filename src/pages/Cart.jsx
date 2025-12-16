import React, { useState } from "react";
import Layout from "../components/Layout";

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Product 1", price: 24.99, quantity: 1 },
    { id: 2, name: "Product 2", price: 18.99, quantity: 1 },
    { id: 3, name: "Product 3", price: 12.99, quantity: 1 },
  ]);

  // Increase / Decrease quantity
  const updateQuantity = (id, delta) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
            }
          : item
      )
    );
  };

  // Remove item
  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  return (
    <Layout>
      {/* Grey background behind navbar */}
      <div className="fixed inset-0 bg-gray-100 -z-10" />

      {/* Centered content */}
      <div className="h-[89vh] flex items-center justify-center">
        <main className="bg-white w-9/12 max-w-7xl rounded-2xl px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-lg">
          
          {/* Cart Items */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Items in Cart</h2>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-300 rounded-2xl p-6 flex items-center gap-5"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex items-center bg-black rounded-full px-3 py-1">
                    <button
                      className="text-white w-6"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      −
                    </button>

                    <span className="w-6 text-center text-white text-sm">
                      {item.quantity}
                    </span>

                    <button
                      className="text-white w-6"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    className="text-2xl text-gray-600 hover:text-black"
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-300 rounded-3xl p-10 h-fit">
            <h3 className="text-2xl font-bold text-center mb-8">
              Payment Details
            </h3>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span className="font-semibold">
                  ${tax.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-gray-500 my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full bg-black text-white rounded-full py-4 font-semibold hover:bg-gray-800 transition">
              Checkout
            </button>
          </div>
        </main>
      </div>
    </Layout>
  );
}
