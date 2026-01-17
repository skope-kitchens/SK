import { useState } from "react";
import api from "../utils/api";

export default function OrderDish() {
  const [dish, setDish] = useState("");
  const [qty, setQty] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const money = (v) => (v === undefined || v === null ? "0.00" : Number(v).toFixed(2));
  const percent = (v) => (v === undefined || v === null ? "0.00" : Number(v).toFixed(2));

  const calculate = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/api/costing/${dish}`);
      const data = res.data;

      setResult({
        ...data,
        qtyTotal: (data.totalCost * qty).toFixed(2),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to calculate");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Order Dish</h1>

      <input
        className="border p-3 w-full"
        placeholder="Enter Dish Name (exact Excel BOM NAME)"
        value={dish}
        onChange={(e) => setDish(e.target.value)}
      />

      <input
        type="number"
        min="1"
        className="border p-3 w-full"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
      />

      <button
        onClick={calculate}
        disabled={!dish || loading}
        className="w-full bg-black text-white py-3 rounded disabled:opacity-50"
      >
        {loading ? "Calculating..." : "Calculate"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {result && (
  <div className="bg-white p-6 rounded shadow space-y-4">
    <h2 className="text-xl font-semibold">{result.dish}</h2>

    <div className="grid grid-cols-2 gap-3 text-sm">
      <p><b>Food Cost (1)</b></p>
      <p>₹ {money(result.foodCost)}</p>

      <p><b>Food Cost + 5% Wastage</b></p>
      <p>₹ {money(result.foodCostWithWastage)}</p>

      <p><b>Packaging Cost</b></p>
      <p>₹ {money(result.packagingCost)}</p>

      <p><b>Total Cost (1)</b></p>
      <p>₹ {money(result.totalCost)}</p>

      <p><b>Selling Price</b></p>
      <p>₹ {money(result.sellingPrice)}</p>

      <p><b>Food Cost %</b></p>
      <p>{percent(result.foodCostPercent)}%</p>

      <p><b>Packaging Pushed to Customer</b></p>
      <p>₹ {money(result.packagingPushed)}</p>

      <p><b>Final Food Cost</b></p>
      <p>₹ {money(result.finalFoodCost)}</p>

      <p><b>Final Food Cost %</b></p>
      <p>{percent(result.finalFoodCostPercent)}%</p>
    </div>

    <hr />

    <p className="text-lg font-bold">
      Total for {qty} = ₹ {money(result.qtyTotal)}
    </p>
  </div>
)}

    </div>
  );
}
