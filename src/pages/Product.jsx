import React, { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";


export default function Product() {
  const { addToCart } = useCart();
  const { itemName } = useParams();
  const API = import.meta.env.VITE_API_BASE_URL;

  const [offers, setOffers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/products`)
      .then(res => {
        setAllProducts(res.data);

        const filtered = res.data.filter(
          p => p["Supplier Item Name"] === decodeURIComponent(itemName)
        );

        setOffers(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [itemName]);

  // ✅ ALWAYS called (no conditional hooks)
  const uniqueOffers = useMemo(() => {
    const seen = new Set();
    return offers.filter(o => {
      const supplier = o["Supplier Name"];
      if (!supplier) return true;
      if (seen.has(supplier)) return false;
      seen.add(supplier);
      return true;
    });
  }, [offers]);

  const category = offers[0]?.["Category"];
  const productName = offers[0]?.["Supplier Item Name"];

  // ✅ Recommended products (same category, different item name)
  const recommendedProducts = useMemo(() => {
    if (!category) return [];

    const seen = new Set();
    return allProducts.filter(p => {
      const name = p["Supplier Item Name"];
      if (
        p["Category"] === category &&
        name !== productName &&
        !seen.has(name)
      ) {
        seen.add(name);
        return true;
      }
      return false;
    }).slice(0, 4);
  }, [allProducts, category, productName]);

  // ✅ Loading handled AFTER hooks
  if (loading) {
    return (
      <Layout>
        <p className="text-center py-20">Loading product…</p>
      </Layout>
    );
  }

  if (offers.length === 0) {
    return (
      <Layout>
        <p className="text-center py-20">Product not found</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Product Header */}
        <h1 className="text-4xl font-bold mb-2">
          {productName}
        </h1>
        <p className="text-gray-500 mb-10">
          Category: {category}
        </p>

        {/* Vendor Offers */}
        <div className="grid grid-cols-1 md:grid-cols-2  gap-8 mb-20">
          {uniqueOffers.map(offer => (
            <div
              key={offer._id}
              className="border rounded-xl p-6 shadow-sm bg-cover bg-center bg-[url('/assets/Main-bg.png')]"
            >
              <h3 className="font-semibold text-lg mb-2">
                {offer["Supplier Name"]}
              </h3>

              <p className="text-sm text-gray-500 mb-2">
                SKU: {offer["Supplier SKU"]}
              </p>

              <p className="text-2xl font-bold mb-4">
                ₹{offer["Supplier Unit Cost"]}
                <span className="text-sm text-gray-500">
                  {" "} / {offer["Supplier Unit"]}
                </span>
              </p>

              <div className="text-sm text-gray-600 space-y-1">
                <p>Available Qty: {offer["Supplier Qty"]}</p>
                <p>Tax: {offer["Tax %"]}</p>
                <p>Net Unit Price: ₹{offer["Net Amount per Unit"]}</p>
              </div>

              <button
                onClick={() => {
                  const priceSource =
                    offer["Net Amount per Unit"] ??
                    offer["Supplier Unit Cost"] ??
                    0;

                  const cleanPrice = parseFloat(
                    String(priceSource).replace(/[^0-9.]/g, "")
                  );

                  addToCart({
                    id: offer._id,
                    name: offer["Supplier Item Name"],
                    price: cleanPrice || 0,   // 🔒 never NaN
                    supplier: offer["Supplier Name"],
                    unit: offer["Supplier Unit"]
                  });
                }}
                className="mt-4 w-full bg-black text-white rounded-full py-2 hover:bg-gray-800"
              >
                Add to cart →
              </button>


            </div>
          ))}
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <>
            <h2 className="text-3xl font-bold mb-8">
              Recommended Products
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {recommendedProducts.map(prod => (
                <Link
                  key={prod._id}
                  to={`/product/${encodeURIComponent(
                    prod["Supplier Item Name"]
                  )}`}
                  className="border rounded-xl p-4 text-center hover:shadow-lg transition"
                >
                  <div className="bg-gray-200 h-40 rounded mb-3" ><img className="w-full h-full contain-cover" src={prod["image_url"]} alt="" /></div>
                  <p className="font-semibold">
                    {prod["Supplier Item Name"]}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Back */}
        <Link to={`/category/${category}`} className="text-blue-600">
          ← Back to category
        </Link>

      </div>
    </Layout>
  );
}
