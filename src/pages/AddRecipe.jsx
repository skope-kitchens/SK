import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import RecipeItem from "../components/RecipeItem.jsx";

const EMPTY_NODE = () => ({
  type: "INGREDIENT", // INGREDIENT | SUBRECIPE
  category: "Food",
  refId: null,
  yield: "",           
  itemBrand: "",      
  specification: "", 
  quantity: "",
  uom: "PC",
  netPrice: "",
});



export default function AddRecipe() {
  const [recipeType, setRecipeType] = useState("MAIN"); 
  const [branchCode, setBranchCode] = useState("");
  const [brand, setBrand] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [items, setItems] = useState([EMPTY_NODE()]);
  const [subRecipes, setSubRecipes] = useState([]);
  const navigate = useNavigate();

  // Frontend guard: only RECIPE_MANAGER admins should access this page
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
        // Load all subrecipes from collection (no brand filtering)
        const res = await api.get("/api/subrecipes");
        setSubRecipes(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load subrecipes", e);
        setSubRecipes([]);
      }
    };

    loadSubRecipes();
  }, []);




  const saveRecipe = async () => {
  const payload = {
    brand,
    recipeName,
    items,
  };

  if (recipeType === "MAIN") {
    await api.post("/api/mainrecipes", payload);
  } else {
    await api.post("/api/subrecipes", payload);
  }

  alert("Recipe saved");
};


  return (
    <div className="min-h-screen min-w-screen px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER CARD */}
        <div className="rounded-2xl bg-[url('/assets/Main-bg.png')] bg-no-repeat bg-cover p-6 shadow">
          <h1 className="text-2xl font-semibold mb-6">Add Recipe</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Brand</label>
              <input
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Branch Code</label>
                <input
                    value={branchCode}
                    onChange={e => setBranchCode(e.target.value.toUpperCase())}
                    placeholder="e.g. AMSJ"
                    className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Recipe Name
              </label>
              <input
                value={recipeName}
                onChange={e => setRecipeName(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Recipe Type
              </label>

              <select
                value={recipeType}
                onChange={(e) => {
                  setRecipeType(e.target.value);
                  setItems([EMPTY_NODE()]); // reset items when switching
                }}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="MAIN">Main Recipe</option>
                <option value="SUB">Sub Recipe</option>
              </select>
            </div>

          </div>
        </div>

        {/* INGREDIENTS CARD */}
        <div className="bg-[url('/assets/Main-bg.png')] bg-no-repeat bg-cover rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Ingredients</h2>

          {/* TABLE HEADER */}
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


          {/* ITEMS */}
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

        {/* SAVE BUTTON */}
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
