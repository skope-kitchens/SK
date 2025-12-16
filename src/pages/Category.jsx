import React, { useState } from "react";
import Layout from "../components/Layout";

export default function Category() {
  const categories = [
    { id: 1, name: "Vegetables" },
    { id: 2, name: "Dairy" },
    { id: 3, name: "Meat" },
    { id: 4, name: "Spices" },
  ];

  const productsData = [
    {
      id: 1,
      name: "Tomatoes",
      price: 40,
      category_id: 1,
      image: "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg",
    },
    {
      id: 2,
      name: "Onions",
      price: 35,
      category_id: 1,
      image: "https://images.pexels.com/photos/533342/pexels-photo-533342.jpeg",
    },
    {
      id: 3,
      name: "Milk",
      price: 55,
      category_id: 2,
      image: "https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg",
    },
    {
      id: 4,
      name: "Cheese",
      price: 320,
      category_id: 2,
      image: "https://images.pexels.com/photos/4109997/pexels-photo-4109997.jpeg",
    },
    {
      id: 5,
      name: "Chicken",
      price: 280,
      category_id: 3,
      image: "https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg",
    },
    {
      id: 6,
      name: "Turmeric",
      price: 90,
      category_id: 4,
      image: "https://images.pexels.com/photos/4198025/pexels-photo-4198025.jpeg",
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [cart, setCart] = useState([]);

  const displayProducts = productsData.filter(
    (p) => p.category_id === selectedCategory
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  return (
    
    <div className=" bg-gray-100">
        <Layout>
      <main className="max-w-7xl min-h-screen mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-center mb-10">
          Available Raw Material
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block bg-white rounded-xl p-6 shadow h-fit">
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Products */}
          <section>
            {displayProducts.length === 0 ? (
              <p className="text-center py-20 text-gray-500">
                No products found
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl p-6 text-center shadow transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="h-48 rounded-lg overflow-hidden mb-4 bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="font-semibold">{product.name}</h3>

                    <p className="text-blue-600 font-bold text-lg mt-1">
                      ₹{product.price}
                    </p>

                    <button
                      onClick={() => addToCart(product)}
                      className="mt-4 w-full bg-black text-white rounded-full py-2 font-semibold hover:bg-gray-800 transition active:scale-95"
                    >
                      Add to cart →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      </Layout>
    </div>
    
  );
}
