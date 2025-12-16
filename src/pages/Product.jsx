import React, { useState } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

export default function Product() {
  const [quantity, setQuantity] = useState(1);

  const product = {
    id: 1,
    name: "Premium Cheese",
    price: 24.99,
    image:
      "https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg",
    details: [
      "Made from the fresh cream",
      "Finely processed with natural milk/ cream",
      "Pure and tastes best over with toasts and sandwiches",
      "Storage - Keep refrigerated at 0°C to +4°C",
    ],
    vendor: {
      name: "Fresh Farms Co.",
      rating: 4.8,
    },
  };

  const relatedProducts = [
    { id: 2, name: "Butter", price: 12.99 },
    { id: 3, name: "Yogurt", price: 8.99 },
    { id: 4, name: "Milk", price: 5.99 },
    { id: 5, name: "Cream", price: 9.99 },
  ];

  return (
    <Layout>
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Image */}
        <div className="bg-gray-200 rounded-3xl h-[500px] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <h1 className="text-4xl font-bold mb-8">{product.name}</h1>

          {/* Vendor */}
          <div className="bg-gray-300 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-2">
              Vendor&apos;s Offers
            </h3>
            <p className="font-medium">{product.vendor.name}</p>
            <p className="text-gray-600">★ {product.vendor.rating}</p>
          </div>

          {/* Product Info */}
          <div className="mb-8">
            <h4 className="text-sm uppercase font-semibold text-gray-700 mb-4">
              Product details
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              {product.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>

          {/* Price & Quantity */}
          <div className="flex items-center gap-5 mb-8">
            <span className="text-3xl font-bold">
              ${product.price}
            </span>

            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                className="w-10 h-10 text-lg hover:bg-gray-100"
                onClick={() =>
                  setQuantity(Math.max(1, quantity - 1))
                }
              >
                −
              </button>

              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(parseInt(e.target.value) || 1)
                }
                className="w-12 text-center outline-none"
              />

              <button
                className="w-10 h-10 text-lg hover:bg-gray-100"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <Link to ="/cart">
          <button className="w-full bg-black text-white rounded-full py-4 text-lg font-semibold hover:bg-gray-800 transition">
            Add to cart +
          </button>
          </Link>
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-3xl font-bold mb-8">
          Related Products
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {relatedProducts.map((prod) => (
            <div
              key={prod.id}
              className="text-center border rounded-xl p-4"
            >
              <div className="bg-gray-200 rounded-lg h-48 mb-4" />

              <h4 className="font-semibold mb-1">{prod.name}</h4>
              <p className="font-semibold mb-4">
                ${prod.price}
              </p>

              <Link to="/cart">
              <button className="w-full bg-black text-white rounded-full py-2 text-sm font-semibold hover:bg-gray-800 transition">
                Add to cart +
              </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
    </Layout>
  );
}
