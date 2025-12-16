import React, { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Category() {
  const { categoryName } = useParams(); // 👈 from URL
  const API = import.meta.env.VITE_API_BASE_URL;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryName);

  useEffect(() => {
    axios.get(`${API}/api/products`)
      .then(res => {
        setProducts(res.data);

        const uniqueCategories = [
          ...new Set(res.data.map(p => p["Category"]))
        ];
        setCategories(uniqueCategories);
      })
      .catch(console.error);
  }, []);

  // Update when URL changes
  useEffect(() => {
    setSelectedCategory(categoryName);
  }, [categoryName]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p["Category"] === selectedCategory);
  }, [products, selectedCategory]);

  const uniqueFilteredProducts = useMemo(() => {
    const seen = new Set();
    return filteredProducts.filter(p => {
      const name = p["Supplier Item Name"] || p.name || p["supplierItemName"];
      if (!name) return true;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [filteredProducts]);

  return (
    <Layout>
      <main className="max-w-7xl min-h-screen mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-center mb-10">
          {selectedCategory}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          
          {/* Sidebar */}
          <aside className="hidden lg:block bg-white rounded-xl p-6 shadow h-fit">
            <div className="space-y-2">
              {categories.map(cat => (
                <Link key={cat} to={`/category/${cat}`}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {cat}
                  </button>
                </Link>
              ))}
            </div>
          </aside>

          {/* Products */}
          <section>
            {uniqueFilteredProducts.length === 0 ? (
              <p className="text-center py-20 text-gray-500">
                No products found
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {uniqueFilteredProducts.map(product => (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg transition"
                  >
                    <div className="h-48 rounded-lg overflow-hidden mb-4 bg-gray-100">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product["Supplier Item Name"]}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <h3 className="font-semibold">
                      {product["Supplier Item Name"]}
                    </h3>
                    <Link
    to={`/product/${encodeURIComponent(product["Supplier Item Name"])}`}
    className="block bg-black text-white w-full py-2 rounded hover:bg-gray-800 transition text-center"
  >
    View product →
  </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </Layout>
  );
}
