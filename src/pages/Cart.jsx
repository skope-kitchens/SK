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


const handleCheckout = async () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("skope_user"));

    if (!user || !user.address) {
      alert("Delivery address not found. Please complete your profile.");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/payment/create-order`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Razorpay needs paise
          items: cartItems,
          deliveryAddress: user.address
        })
      }
    );

    const order = await res.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Your Store Name",
      description: "Order Payment",
      order_id: order.id,

      handler: async function (response) {
        alert("Payment successful 🎉");

        // ✅ verify payment + save order
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/payment/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            })
          }
        );

        // TODO: clear cart
      },

      theme: { color: "#000000" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert("Payment failed");
  }
};


  return (
    <Layout>
      <div className="fixed inset-0 bg-gray-100 -z-10" />

      <div className="min-h-[100vh] m-10 flex items-center justify-center">
        <main className="bg-cover bg-center bg-[url('/assets/Main-bg.png')] w-9/12 max-w-7xl rounded-2xl px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-lg">

          {/* Cart Items */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Items in Cart</h2>

            {cartItems.length === 0 && (
              <p className="text-gray-500">Your cart is empty</p>
            )}

            <div className="space-y-4 ">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 flex items-center gap-5 "
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
          <div className="bg-white rounded-3xl p-10 h-fit">
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

            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white rounded-full py-4"
            >
              Checkout
            </button>

          </div>
        </main>
      </div>
    </Layout>
  );
}
