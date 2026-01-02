import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'
import { authUtils } from '../utils/auth'
import api from '../utils/api';

const SignUp = () => {
  const navigate = useNavigate()

  // toggle: client | vendor
  const [mode, setMode] = useState("client")

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name =
        mode === "client" ? "Full name is required" : "Supplier name is required"
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName =
        mode === "client" ? "Company name is required" : "Store name is required"
    }

    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter valid email"

    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters"

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      const { data } = await api.post("/api/auth/signup", {
        userType: mode,
        name: formData.name,
        brandName: formData.companyName,
        email: formData.email,
        password: formData.password,
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        ...(mode === "vendor" && {
          fssai: formData.fssai,
          pan: formData.pan
        })
      })

      authUtils.setAuth(data.token, data.user)

      setStatus({
        type: "success",
        message: "Account created successfully! Redirecting…"
      })

      setTimeout(() => navigate("/login"), 600)

    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Signup failed"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl ">

          {/* HEADING */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Skope Kitchens</h1>
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === "client" ? "Create Client Account" : "Create Vendor Account"}
            </h2>
          </div>

          {/* TOGGLE */}
          <div className="flex justify-center bg-gray-100 rounded-full p-1 mb-6 ">
            <button
              onClick={() => setMode("client")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                mode === "client" ? "bg-black text-white" : "text-gray-700"
              }`}
            >
              Client Signup
            </button>

            <button
              onClick={() => setMode("vendor")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                mode === "vendor" ? "bg-black text-white" : "text-gray-700"
              }`}
            >
              Vendor Signup
            </button>
          </div>

          {/* FORM CARD WITH SLIDE ANIMATION */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -80, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-cover bg-[url('/assets/Main-bg.png')] bg-center bg-no-repeat card p-6 rounded-2xl w-full shadow-lg"
            >

              {/* STATUS ALERT */}
              {status.message && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm mb-4 ${
                    status.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 ">

  {/* TWO COLUMN GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* ---------- LEFT: CLIENT / VENDOR DETAILS ---------- */}
                  <div>
                    <div className="text-lg font-semibold text-gray-900 mb-4">
                      {mode === "client" ? "Client Details" : "Vendor Details"}
                    </div>

                    {/* NAME */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {mode === "client" ? "Full Name" : "Supplier Name"}
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter name"
                      />
                      {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                    </div>

                    {/* COMPANY / STORE */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {mode === "client" ? "Company Name" : "Store Name"}
                      </label>
                      <input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter name"
                      />
                      {errors.companyName && (
                        <p className="text-red-600 text-sm">{errors.companyName}</p>
                      )}
                    </div>

                    {/* EMAIL */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter email"
                      />
                      {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                    </div>

                    {/* PASSWORDS */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter password"
                      />
                      {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Re-enter password"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* ---------- RIGHT: ADDRESS SECTION ---------- */}
                  {/* ---------- RIGHT: ADDRESS SECTION ---------- */}
              <div>
                <div className="text-lg font-semibold text-gray-900 mb-4">
                  Business Address
                </div>

                {/* Address Line 1 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Address Line 1
                  </label>
                  <input
                    name="addressLine1"
                    placeholder="House no., street, building"
                    className="input-field"
                    value={formData.addressLine1}
                    onChange={handleChange}
                  />
                </div>

                {/* Address Line 2 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Address Line 2 (optional)
                  </label>
                  <input
                    name="addressLine2"
                    placeholder="Landmark / Area"
                    className="input-field"
                    value={formData.addressLine2}
                    onChange={handleChange}
                  />
                </div>

                {/* City + State */}
                <div className="grid grid-cols-2 gap-4 mb-3">

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      City
                    </label>
                    <input
                      name="city"
                      placeholder="City"
                      className="input-field"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      State
                    </label>
                    <input
                      name="state"
                      placeholder="State"
                      className="input-field"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>

                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Pincode
                  </label>
                  <input
                    name="pincode"
                    placeholder="Enter 6-digit pincode"
                    className="input-field mb-3"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </div>
                {mode === "vendor" && (
                  <div className="grid grid-cols-2 gap-4 mb-3">

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        FSSAI Number
                      </label>
                      <input
                        name="fssai"
                        placeholder="FSSAI Number"
                        className="input-field"
                        value={formData.fssai}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        PAN Number
                      </label>
                      <input
                        name="pan"
                        placeholder="PAN Number"
                        className="input-field"
                        value={formData.pan}
                        onChange={handleChange}
                      />
                    </div>

                  </div>
                )}

              </div>

                </div>

                {/* ---------- SUBMIT BUTTON ---------- */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full inline-flex items-center justify-center btn-primary text-white bg-black hover:bg-black disabled:opacity-50 rounded-lg py-3"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>


              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-black underline">
                  Login
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}

export default SignUp
