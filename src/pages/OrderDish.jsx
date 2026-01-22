import React, { useState, useEffect } from "react";
import { fetchFoodCost } from "../utils/costingapi.js";
import Layout from "../components/Layout";
import api from "../utils/api.js";

export default function OrderDish() {
  const [dish, setDish] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wastagePercent, setWastagePercent] = useState(5);
  const [dishes, setDishes] = useState([]);
const [showSummary, setShowSummary] = useState(false);
const [summaryRows, setSummaryRows] = useState([]);
const [summaryLoading, setSummaryLoading] = useState(false);



  useEffect(() => {
  const fetchDishes = async () => {
    try {
      const res = await api.get("/api/food-cost/dishList");
      setDishes(res.data.dishes || []);
    } catch (err) {
      console.error("Failed to load dishes", err);
    }
  };

  fetchDishes();
}, []);


  const calculate = async () => {
    try {
      setLoading(true);
      const result = await fetchFoodCost(dish, wastagePercent);
      setData(result);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* ---------------- HEADER ---------------- */}
          <div className="bg-[url(./assets/Main-bg.png)] bg-cover bg-center bg-no-repeat rounded-2xl p-6 shadow">
            <h1 className="text-2xl font-semibold mb-6">
              Food Cost Calculator
            </h1>

            <div className="flex flex-wrap gap-6 items-end">
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-1">
                    Dish Name
                </label>

                <select
                    value={dish}
                    onChange={(e) => setDish(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-80 bg-white"
                >
                    <option value="">Select a dish</option>

                    {dishes.map((d, i) => (
                    <option key={i} value={d}>
                        {d}
                    </option>
                    ))}
                </select>
                </div>


              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-1">
                  Wastage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={wastagePercent}
                  onChange={(e) =>
                    setWastagePercent(Number(e.target.value))
                  }
                  className="border rounded-lg px-4 py-2 w-32"
                />
              </div>

              <button
                onClick={calculate}
                disabled={loading || !dish}
                className="bg-black text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Calculating…" : "Calculate"}
              </button>

                <button
                onClick={async () => {
                    try {
                    setSummaryLoading(true);
                    setShowSummary(true);

                    const res = await api.get(
                        `/api/food-cost/summary?wastagePercent=${wastagePercent}`
                    );

                    setSummaryRows(res.data.summary || []);
                    } catch (err) {
                    alert("Failed to load summary");
                    } finally {
                    setSummaryLoading(false);
                    }
                }}
                className="border border-black px-6 py-2 rounded-lg bg-white hover:bg-gray-100"
                >
                Show Summary
                </button>



            </div>
          </div>

          {/* ---------------- RESULT ---------------- */}
          {data && (
            <div className="grid md:grid-cols-3 gap-6">

              {/* -------- BREAKDOWN TABLE -------- */}
              <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">
                  Cost Breakdown
                </h2>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Qty</th>
                        <th className="px-4 py-2 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.breakdown.map((row, i) => (
                        <tr
                          key={i}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">
                            {row.item}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {row.type}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {row.quantity}
                          </td>
                          <td className="px-4 py-2 text-right">
                            ₹{row.cost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* -------- COST SUMMARY -------- */}
              <div className="bg-[#111] text-white rounded-2xl p-6 space-y-5">
                <h2 className="text-xl font-semibold">
                  Cost Summary
                </h2>

                <CostRow
                  label="Food Cost"
                  value={data.totalFoodCost}
                />
                <CostRow
                  label="Packaging Cost"
                  value={data.totalPackagingCost}
                />
                <CostRow
                  label={`Wastage (${data.wastagePercent}%)`}
                  value={data.wastageCost}
                />

                <div className="border-t border-gray-700 pt-4 flex justify-between text-lg font-bold">
                  <span>Final Price</span>
                  <span>₹{data.totalCost}</span>
                </div>
              </div>
            </div>
          )}

          {showSummary && (
                <div className="bg-white rounded-2xl p-6 shadow w-[87vw]">
                    <h2 className="text-xl font-semibold mb-4">
                    All Dishes Cost Summary
                    </h2>

                    {summaryLoading ? (
                    <p className="text-gray-500">Loading summary…</p>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                            <th className="px-4 py-2 text-left">Dish Name</th>
                            <th className="px-4 py-2 text-right">Food Cost</th>
                            <th className="px-4 py-2 text-right">Packaging Cost</th>
                            <th className="px-4 py-2 text-right">Wastage Cost</th>
                            <th className="px-4 py-2 text-right">
                                Total Cost
                            </th>
                            </tr>
                        </thead>
                        <tbody>
                            {summaryRows.map((row, i) => (
                            <tr key={i} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{row.dishName}</td>
                                <td className="px-4 py-2 text-right">₹{row.foodCost}</td>
                                <td className="px-4 py-2 text-right">₹{row.packagingCost}</td>
                                <td className="px-4 py-2 text-right">₹{row.wastageCost}</td>
                                <td className="px-4 py-2 text-right font-semibold">
                                ₹{row.totalCost}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    )}
                </div>
                )}
        </div>
      </div>
    </Layout>
  );
}

/* ---------------- COST ROW ---------------- */
function CostRow({ label, value }) {
  return (
    <div className="flex justify-between text-base">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold">₹{value}</span>
    </div>
  );
}
