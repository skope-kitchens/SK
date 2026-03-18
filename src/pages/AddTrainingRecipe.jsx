import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import RecipeItem from "../components/RecipeItem.jsx";

const EMPTY_NODE = () => ({
  type: "INGREDIENT",
  category: "Food",
  refId: null,
  yield: "",
  itemBrand: "",
  specification: "",
  quantity: "",
  uom: "PC",
  netPrice: "",
});

export default function AddTrainingRecipe() {
  const [recipeType, setRecipeType] = useState("MAIN");
  const [trainingCode, setTrainingCode] = useState("TR1");
  const [brand, setBrand] = useState("");
  const [brandOptions, setBrandOptions] = useState([]);
  const [recipeName, setRecipeName] = useState("");
  const [trialNameOptions, setTrialNameOptions] = useState([]);
  const [sopLink, setSopLink] = useState("");
  const [items, setItems] = useState([EMPTY_NODE()]);
  const [subRecipes, setSubRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const adminRole = localStorage.getItem("adminRole");
    if (userType === "admin" && adminRole !== "RECIPE_MANAGER") {
      navigate("/admin-dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    const loadSubRecipes = async () => {
      try {
        const res = await api.get("/api/subrecipes");
        setSubRecipes(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load subrecipes", e);
        setSubRecipes([]);
      }
    };
    loadSubRecipes();
  }, []);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await api.get("/api/admin/brand-names");
        const list = res.data?.data || [];
        setBrandOptions(list);
        if (!brand && list.length) setBrand(list[0]);
      } catch (e) {
        console.error("Failed to load brand names", e);
        setBrandOptions([]);
      }
    };
    loadBrands();
  }, []);

  useEffect(() => {
    const loadTrialNames = async () => {
      try {
        const res = await api.get("/api/recipe-hierarchy/trial-names");
        const list = res.data?.data || [];
        setTrialNameOptions(list);
        if (!recipeName && list.length) setRecipeName(list[0]);
      } catch (e) {
        console.error("Failed to load trial recipe names", e);
        setTrialNameOptions([]);
      }
    };
    loadTrialNames();
  }, []);

  const saveRecipe = async () => {
    const payload = {
      brand,
      trainingCode,
      recipeName,
      sopLink,
      items,
      recipeType,
    };

    await api.post("/api/training-recipes", payload);
    alert("Training recipe saved");
  };

  return (
    <div className="min-h-screen min-w-screen px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="rounded-2xl bg-[url('/assets/Main-bg.png')] bg-no-repeat bg-cover p-6 shadow">
          <h1 className="text-2xl font-semibold mb-6">Add Training Recipe</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {brandOptions.length === 0 ? (
                  <option value="">No brands</option>
                ) : (
                  brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))
                )}
              </select>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Training</label>
                <select
                  value={trainingCode}
                  onChange={(e) => setTrainingCode(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="TR1">TR1</option>
                  <option value="TR2">TR2</option>
                  <option value="TR3">TR3</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Recipe Name
              </label>
              <select
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {trialNameOptions.length === 0 ? (
                  <option value="">Create Trial recipes first</option>
                ) : (
                  trialNameOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Recipe Type
              </label>
              <select
                value={recipeType}
                onChange={(e) => {
                  setRecipeType(e.target.value);
                  setItems([EMPTY_NODE()]);
                }}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="MAIN">Main Recipe</option>
                <option value="SUB">Sub Recipe</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">
              SOP Link (Google Drive)
            </label>
            <input
              type="url"
              value={sopLink}
              onChange={(e) => setSopLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>

        <div className="bg-[url('/assets/Main-bg.png')] bg-no-repeat bg-cover rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Ingredients</h2>

          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 border-b pb-2">
            <div>Type</div>
            <div>Yield</div>
            <div>Cat</div>
            <div className="col-span-2">Item</div>
            <div className="col-span-2">Spec</div>
            <div>Brand</div>
            <div>Qty</div>
            <div>UOM</div>
            <div>Price</div>
            <div className="text-right">Total</div>
          </div>

          <div className="space-y-3 mt-3">
            {items.map((item, i) => (
              <RecipeItem
                key={i}
                node={item}
                subRecipes={subRecipes}
                onChange={(updated) => {
                  const arr = [...items];
                  arr[i] = updated;
                  setItems(arr);
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setItems([...items, EMPTY_NODE()])}
            className="mt-4 text-blue-600 text-sm hover:underline"
          >
            + Add Item
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={saveRecipe}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Save Recipe
          </button>
        </div>
      </div>
    </div>
  );
}

