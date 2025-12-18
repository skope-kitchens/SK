import Layout from "../components/Layout";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cartItems, updateQuantity, removeItem } = useCart();

  const subtotal = cartItems.reduce(
  (sum, item) =>
    sum + (Number(item.price) || 0) * (item.quantity || 1),
  0
);

  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  return (
    <Layout>
      <div className="fixed inset-0 bg-gray-100 -z-10" />

      <div className="h-[89vh] flex items-center justify-center">
        <main className="bg-white w-9/12 max-w-7xl rounded-2xl px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-lg">

          {/* Cart Items */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Items in Cart</h2>

            {cartItems.length === 0 && (
              <p className="text-gray-500">Your cart is empty</p>
            )}

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-300 rounded-2xl p-6 flex items-center gap-5"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

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

          {/* Payment */}
          <div className="bg-gray-300 rounded-3xl p-10 h-fit">
            <h3 className="text-2xl font-bold text-center mb-8">
              Payment Details
            </h3>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
              </div>

              <div className="border-t my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full bg-black text-white rounded-full py-4">
              Checkout
            </button>
          </div>
        </main>
      </div>
    </Layout>
  );
}
