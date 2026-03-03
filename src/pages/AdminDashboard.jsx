import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import BrandList from "./BrandList";
import BrandDrawer from "./BrandDrawer";
import api from "../utils/api";

const AdminDashboard = () => {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRecipesModal, setShowRecipesModal] = useState(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const adminRole = typeof window !== "undefined"
    ? localStorage.getItem("adminRole")
    : null;

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  const isWalletManager = adminRole === "WALLET_MANAGER";
  const isOrderManager = adminRole === "ORDER_MANAGER";
  const isRecipeManager = adminRole === "RECIPE_MANAGER";
  const isIngredientManager = adminRole === "INGREDIENT_MANAGER";

  const hasMenuOptions = isRecipeManager || isIngredientManager;
  const canManageBrand = isWalletManager || isOrderManager;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8 relative">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <div className="flex items-center gap-3 relative">
            {/* Role-based menu icon */}
            {hasMenuOptions && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition flex items-center justify-center text-lg"
                  aria-haspopup="menu"
                  aria-expanded={showMenu}
                >
                  ≡
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    {isRecipeManager && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            navigate("/add-recipe");
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Add Recipe
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setShowRecipesModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Update Recipe
                        </button>
                      </>
                    )}
                    {isIngredientManager && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowIngredientsModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Update Ingredients
                      </button>
                    )}
                    {isIngredientManager && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowInventoryModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Inventory
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Brand list visible to all admin roles; drawer only for wallet/order managers */}
        <BrandList
          key={refreshKey}
          onSelectBrand={canManageBrand ? setSelectedBrand : undefined}
          canManage={canManageBrand}
        />

        {canManageBrand && selectedBrand && (
          <BrandDrawer
            brand={selectedBrand}
            adminRole={adminRole}
            onClose={() => {
              setSelectedBrand(null);
              setRefreshKey((k) => k + 1);
            }}
          />
        )}

        {/* Recipe update modal only for recipe managers */}
        {isRecipeManager && showRecipesModal && (
          <RecipesModal onClose={() => setShowRecipesModal(false)} />
        )}

        {/* Ingredient update modal only for ingredient managers */}
        {isIngredientManager && showIngredientsModal && (
          <IngredientsModal onClose={() => setShowIngredientsModal(false)} />
        )}

        {/* Inventory modal only for ingredient managers */}
        {isIngredientManager && showInventoryModal && (
          <InventoryModal onClose={() => setShowInventoryModal(false)} />
        )}
      </div>
    </Layout>
  );
};

/* ---------- INVENTORY MODAL ---------- */
function InventoryModal({ onClose }) {
  const [branchCode, setBranchCode] = useState("AMSJ");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInventory = async (code) => {
    if (!code) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/inventory/items", {
        params: { branchCode: code },
      });
      setItems(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch inventory items"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(branchCode);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Inventory</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 border-b flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Code
            </label>
            <input
              type="text"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. AMSJ"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchInventory(branchCode)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Unit</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Avg Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-4 text-center text-gray-500"
                      >
                        Loading inventory...
                      </td>
                    </tr>
                  )}
                  {!loading && items.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-4 text-center text-gray-500"
                      >
                        No items found.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    items.map((item) => (
                      <tr key={item.skuCode} className="border-t">
                        <td className="px-3 py-2">{item.skuCode}</td>
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2">{item.categoryName}</td>
                        <td className="px-3 py-2">{item.measuringUnit}</td>
                        <td className="px-3 py-2 text-right">
                          {Number(item.itemQty || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-3 py-2 text-right">
                          ₹{Number(item.averageCost || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- INGREDIENTS BULK UPDATE MODAL ---------- */
function IngredientsModal({ onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/admin/ingredients");
        const list = res.data?.ingredients || [];
        setRows(
          list.map((ing) => ({
            ...ing,
            percent: "",
            newPrice: ing.currentPrice,
          }))
        );
      } catch (err) {
        console.error("Failed to load ingredients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const handlePercentChange = (index, value) => {
    setRows((prev) => {
      const next = [...prev];
      const row = next[index];
      if (!row) return prev;
      const pct = Number(value) || 0;
      const base = Number(row.currentPrice) || 0;
      const newPrice = base + (base * pct) / 100;
      next[index] = {
        ...row,
        percent: value,
        newPrice: Number(newPrice.toFixed(2)),
      };
      return next;
    });
  };

  const handleNewPriceChange = (index, value) => {
    setRows((prev) => {
      const next = [...prev];
      const row = next[index];
      if (!row) return prev;
      const price = Number(value);
      next[index] = {
        ...row,
        newPrice: Number.isFinite(price) ? price : row.newPrice,
        percent: "",
      };
      return next;
    });
  };

  const handleSave = async () => {
    const updates = rows
      .filter(
        (r) =>
          typeof r.newPrice === "number" &&
          r.newPrice >= 0 &&
          r.newPrice !== r.currentPrice
      )
      .map((r) => ({
        refId: r.refId,
        uom: r.uom,
        newPrice: r.newPrice,
      }));

    if (updates.length === 0) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      await api.post("/api/admin/ingredients/bulk-update", { updates });
      onClose();
    } catch (err) {
      console.error("Failed to update ingredients", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[95vw] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Update Ingredients</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading ingredients...</p>
          ) : rows.length === 0 ? (
            <p className="text-gray-500 text-sm">No ingredients found.</p>
          ) : (
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Ingredient</th>
                  <th className="p-2 text-center">UOM</th>
                  <th className="p-2 text-right">Current Price</th>
                  <th className="p-2 text-center w-32">% Increase</th>
                  <th className="p-2 text-right w-32">New Price</th>
                  <th className="p-2 text-center w-28">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-2">
                      <div className="font-medium">{row.refId}</div>
                    </td>
                    <td className="p-2 text-center">{row.uom || "-"}</td>
                    <td className="p-2 text-right">
                      ₹{Number(row.currentPrice || 0).toFixed(2)}
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 border rounded px-1 py-0.5 text-right"
                        value={row.percent}
                        onChange={(e) =>
                          handlePercentChange(index, e.target.value)
                        }
                        placeholder="%"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        className="w-24 border rounded px-1 py-0.5 text-right"
                        value={row.newPrice}
                        onChange={(e) =>
                          handleNewPriceChange(index, e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 text-center text-xs text-gray-500">
                      {row.pricesVary ? "Varies across recipes" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-black text-white disabled:opacity-50 hover:bg-gray-800"
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- RECIPES MODAL ---------- */
const TAB_MAIN = "main";
const TAB_SUB = "sub";

function RecipesModal({ onClose }) {
  const [tab, setTab] = useState(TAB_MAIN);
  const [mainList, setMainList] = useState([]);
  const [subList, setSubList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoadingList(true);
      try {
        const [mainRes, subRes] = await Promise.all([
          api.get("/api/admin/recipes"),
          api.get("/api/admin/subrecipes"),
        ]);
        setMainList(mainRes.data || []);
        setSubList(subRes.data || []);
      } catch (err) {
        console.error("Failed to load recipe lists", err);
      } finally {
        setLoadingList(false);
      }
    };
    fetch();
  }, []);

  const loadMainRecipe = async (recipeId) => {
    setSelectedRecipe(null);
    setItems([]);
    setLoadingRecipe(true);
    try {
      const res = await api.get(`/api/admin/recipes/${recipeId}`);
      const doc = res.data;
      setSelectedRecipe({ _id: doc._id, recipeName: doc.recipeName, brand: doc.brand, kind: TAB_MAIN });
      setItems(Array.isArray(doc.items) ? doc.items.map((i) => ({ ...i })) : []);
    } catch (err) {
      console.error("Failed to load main recipe", err);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const loadSubRecipe = async (id) => {
    setSelectedRecipe(null);
    setItems([]);
    setLoadingRecipe(true);
    try {
      const res = await api.get(`/api/admin/subrecipes/${id}`);
      const doc = res.data;
      setSelectedRecipe({ _id: doc._id, recipeName: doc.recipeName, brand: doc.brand, kind: TAB_SUB });
      setItems(Array.isArray(doc.items) ? doc.items.map((i) => ({ ...i })) : []);
    } catch (err) {
      console.error("Failed to load sub recipe", err);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        type: "INGREDIENT",
        category: "Food",
        refId: "",
        quantity: 0,
        uom: "GM",
        netPrice: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedRecipe) return;
    setSaving(true);
    try {
      const payload = { items };
      if (selectedRecipe.kind === TAB_MAIN) {
        await api.put(`/api/admin/recipes/${selectedRecipe._id}`, payload);
      } else {
        await api.put(`/api/admin/subrecipes/${selectedRecipe._id}`, payload);
      }
      setSelectedRecipe(null);
      setItems([]);
    } catch (err) {
      console.error("Failed to save recipe", err);
    } finally {
      setSaving(false);
    }
  };

  const list = tab === TAB_MAIN ? mainList : subList;
  const onSelect = tab === TAB_MAIN ? loadMainRecipe : loadSubRecipe;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[90vw] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Update Recipe</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => { setTab(TAB_MAIN); setSelectedRecipe(null); setItems([]); }}
            className={`px-6 py-3 font-medium ${tab === TAB_MAIN ? "border-b-2 border-black text-black" : "text-gray-500"}`}
          >
            Main Recipes
          </button>
          <button
            onClick={() => { setTab(TAB_SUB); setSelectedRecipe(null); setItems([]); }}
            className={`px-6 py-3 font-medium ${tab === TAB_SUB ? "border-b-2 border-black text-black" : "text-gray-500"}`}
          >
            Sub Recipes
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex min-h-0">
          <div className="w-72 border-r overflow-y-auto p-4">
            {loadingList ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : list.length === 0 ? (
              <p className="text-gray-500 text-sm">No recipes</p>
            ) : (
              <ul className="space-y-1">
                {list.map((r) => (
                  <li key={r._id}>
                    <button
                      onClick={() => onSelect(r._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedRecipe?._id === r._id ? "bg-black text-white" : "hover:bg-gray-100"}`}
                    >
                      {r.recipeName}
                      {r.brand && <span className="opacity-80 ml-1">({r.brand})</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loadingRecipe ? (
              <p className="text-gray-500">Loading recipe...</p>
            ) : selectedRecipe ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {selectedRecipe.recipeName}
                    {selectedRecipe.brand && <span className="text-gray-500 font-normal ml-2">({selectedRecipe.brand})</span>}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={addItem}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm"
                    >
                      Add ingredient
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-black text-white px-4 py-1.5 rounded text-sm disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
                <UpdateRecipeItemsTable
                  items={items}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  isSubRecipe={selectedRecipe.kind === TAB_SUB}
                />
              </>
            ) : (
              <p className="text-gray-500">Select a recipe to edit.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- EDITABLE ITEMS TABLE FOR UPDATE RECIPE ---------- */
function UpdateRecipeItemsTable({ items, onUpdate, onRemove, isSubRecipe }) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {!isSubRecipe && <th className="p-2 text-left w-28">Type</th>}
            <th className="p-2 text-left">Item</th>
            <th className="p-2 w-24">Qty</th>
            <th className="p-2 w-20">UOM</th>
            <th className="p-2 w-28">Price (₹)</th>
            <th className="p-2 w-16"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-t">
              {!isSubRecipe && (
                <td className="p-2">
                  <select
                    value={item.type || "INGREDIENT"}
                    onChange={(e) => onUpdate(index, "type", e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="INGREDIENT">INGREDIENT</option>
                    <option value="SUBRECIPE">SUBRECIPE</option>
                  </select>
                </td>
              )}
              <td className="p-2">
                <input
                  type="text"
                  value={item.refId ?? ""}
                  onChange={(e) => onUpdate(index, "refId", e.target.value)}
                  placeholder="Name"
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={item.quantity ?? ""}
                  onChange={(e) => onUpdate(index, "quantity", parseFloat(e.target.value) || 0)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </td>
              <td className="p-2">
                <select
                  value={item.uom || "GM"}
                  onChange={(e) => onUpdate(index, "uom", e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="PC">PC</option>
                  <option value="GM">GM</option>
                  <option value="KG">KG</option>
                </select>
              </td>
              <td className="p-2">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.netPrice ?? ""}
                  onChange={(e) => onUpdate(index, "netPrice", parseFloat(e.target.value) || 0)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </td>
              <td className="p-2">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
