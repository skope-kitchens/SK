import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import BrandList from "./BrandList";
import BrandDrawer from "./BrandDrawer";
import api from "../utils/api";

const AdminDashboard = () => {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // 👈 IMPORTANT
  const [showRecipesModal, setShowRecipesModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/add-recipe")}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Add Recipe
            </button>
            <button
              onClick={() => setShowRecipesModal(true)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Recipes
            </button>
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 👇 key forces BrandList to refetch */}
        <BrandList
          key={refreshKey}
          onSelectBrand={setSelectedBrand}
        />

        {selectedBrand && (
          <BrandDrawer
            brand={selectedBrand}
            onClose={() => {
              setSelectedBrand(null);
              setRefreshKey((k) => k + 1); // 🔁 REFRESH BRANDS
            }}
          />
        )}

        {showRecipesModal && (
          <RecipesModal onClose={() => setShowRecipesModal(false)} />
        )}
      </div>
    </Layout>
  );
};

/* ---------- RECIPES MODAL ---------- */
function RecipesModal({ onClose }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/admin/recipes");
        setRecipes(res.data || []);
      } catch (err) {
        console.error("Failed to load recipes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const fetchBreakdown = async (recipeId) => {
    if (expandedId === recipeId) {
      setExpandedId(null);
      setBreakdown(null);
      return;
    }
    setExpandedId(recipeId);
    setBreakdown(null);
    try {
      setLoadingBreakdown(true);
      const res = await api.get(`/api/admin/recipes/${recipeId}/breakdown`);
      setBreakdown(res.data);
    } catch (err) {
      console.error("Failed to load breakdown", err);
      setExpandedId(null);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">All Recipes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading recipes...</p>
          ) : recipes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recipes found</p>
          ) : (
            <div className="space-y-2">
              {recipes.map((r) => (
                <div
                  key={r._id}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => fetchBreakdown(r._id)}
                    className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                  >
                    <div>
                      <span className="font-semibold">{r.recipeName}</span>
                      <span className="ml-2 text-sm text-gray-500">({r.brand})</span>
                    </div>
                    <span className="text-gray-400">
                      {expandedId === r._id ? "▼" : "▶"}
                    </span>
                  </button>

                  {expandedId === r._id && (
                    <RecipeBreakdownTable
                      breakdown={breakdown}
                      loading={loadingBreakdown}
                      recipeName={r.recipeName}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- RECIPE BREAKDOWN TABLE (expandable like client) ---------- */
function RecipeBreakdownTable({ breakdown, loading, recipeName }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="border-t bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Loading breakdown...</p>
      </div>
    );
  }
  if (!breakdown || breakdown.recipeName !== recipeName) {
    return null;
  }

  const rows = breakdown.breakdown || [];

  return (
    <div className="border-t bg-gray-50 p-4">
      <div className="bg-white rounded-lg overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-center">Type</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isSub = row.type === "SUBRECIPE";
              let parentIndex = null;
              if (row.level > 0) {
                for (let j = index - 1; j >= 0; j--) {
                  if (rows[j].type === "SUBRECIPE") {
                    parentIndex = j;
                    break;
                  }
                }
                if (parentIndex !== null && !expanded[parentIndex]) {
                  return null;
                }
              }

              return (
                <tr key={index} className="border-t">
                  <td className="p-2">
                    <div
                      className={`flex items-center gap-2 ${
                        row.level > 0 ? "pl-6 text-gray-600" : ""
                      }`}
                    >
                      {isSub && (
                        <button
                          onClick={() => toggleExpand(index)}
                          className="text-xs font-bold w-4"
                        >
                          {expanded[index] ? "▼" : "▶"}
                        </button>
                      )}
                      {row.item}
                    </div>
                  </td>
                  <td className="p-2 text-center">{row.type}</td>
                  <td className="p-2 text-center">
                    {row.qty} {row.uom}
                  </td>
                  <td className="p-2 text-right">₹{row.cost}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
