import React, { useState, useEffect, useMemo } from 'react'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Shop = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const API = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    axios.get(`${API}/api/products`)
    .then(res=>{
      setProducts(res.data)
      const uniqueCategories = [
          ...new Set(res.data.map(p => p["Category"]))
        ]
        setCategories(uniqueCategories)
      })
      .catch(console.error)
}, [])
  
  const uniqueProducts = useMemo(() => {
    const seen = new Set()
    return products.filter((p) => {
      const name = p["Supplier Item Name"] || p.name || p["supplierItemName"]
      if (!name) return true
      if (seen.has(name)) return false
      seen.add(name)
      return true
    })
  }, [products])

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-cover bg-center bg-[url('/assets/Main-bg.png')] px-8 py-12 mx-8 mt-8 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">KitchenPure</h1>
              <p className="text-gray-700 max-w-md">
                High-quality supplies delivered with precision and care. Built to help kitchens operate faster, smarter, and more efficiently.
              </p>
            </div>
            <Link to="/map">
            <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
              Become a Partner
            </button>
            </Link>
          </div>
        </section>

        {/* Categories Section */}
        <section className="px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Categories We Offer</h2>
          <div className="grid grid-cols-5 grid-rows-2 gap-8 mb-8">
            {categories.map((category,index) => (
            <Link to={`/category/${category}`}>
              <div key={index} className="bg-gray-200 h-80 rounded-lg flex items-end pb-4 pl-4 cursor-pointer hover:shadow-lg transition">
                <span className="font-semibold text-gray-800">{category}</span>
              </div>
              </Link>
            ))}
          </div>
          
        </section>

        {/* Customer Reviews Section */}
        <section className="px-8 py-16 bg-white flex flex-col items-center">
          <h2 className="text-3xl font-bold text-center mb-12">Customer Reviews</h2>
          <div className="grid grid-cols-3 w-9/12 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-200 h-64  rounded-lg flex items-end pb-4 pl-4">
                <span className="font-semibold text-gray-800">Customer Review</span>
              </div>
            ))}
          </div>
        </section>

        {/* Available Raw Materials Section */}
        <section className="px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Available Raw Materials</h2>
          
          {/* row of products */}
          <div className="grid grid-cols-5  gap-8 mb-12">
            {uniqueProducts.map((product,index) => (
              <div key={product._id || index} className="text-center">
                <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
                <p className="font-semibold mb-1">{product["Supplier Item Name"]}</p>
                <Link to={`/product/${encodeURIComponent(product["Supplier Item Name"])}`}>
                <button className="bg-black text-white w-full py-2 rounded hover:bg-gray-800 transition">
                  Add to cart →
                </button>
                </Link>
              </div>
            ))}
          </div>

          
        </section>
      </div>
    </Layout>
  )
}

export default Shop