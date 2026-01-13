import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Layout from "../components/Layout"
import { authUtils } from "../utils/auth"
import api from "../utils/api"

const SignUp = () => {
  const navigate = useNavigate()

  // client | vendor | consumer (locked until selected)
  const [mode, setMode] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    fssai: "",
    pan: ""
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: "", message: "" })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" })
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"

    if (mode !== "consumer" && !formData.companyName.trim())
      newErrors.companyName =
        mode === "client" ? "Company name is required" : "Store name is required"

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
    if (!mode || !validate()) return
    setLoading(true)

    try {
      const payload = {
        userType: mode,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      }

      if (mode !== "consumer") payload.brandName = formData.companyName
      if (mode === "vendor") {
        payload.fssai = formData.fssai
        payload.pan = formData.pan
      }

      const { data } = await api.post("/api/auth/signup", payload)

      authUtils.setAuth(data.token, data.user)
      setStatus({ type: "success", message: "Account created successfully!" })
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
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-4xl w-full">

          {/* HEADING */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Skope Kitchens</h1>
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === "" && "Select User Type"}
              {mode === "client" && "Create Client Account"}
              {mode === "vendor" && "Create Vendor Account"}
              {mode === "consumer" && "Create Consumer Account"}
            </h2>
          </div>

          {/* USER TYPE SELECT */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Signup As</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Select User Type --</option>
              <option value="client">Client</option>
              <option value="vendor">Vendor</option>
              <option value="consumer">Consumer</option>
            </select>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -80, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-cover bg-[url('/assets/Main-bg.png')] bg-center bg-no-repeat card p-6 rounded-2xl w-full shadow-lg"
            >
              {status.message && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm mb-4 ${
                    status.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="relative space-y-5">

                {/* LOCK OVERLAY */}
                {!mode && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                    <p className="text-lg font-semibold">
                      Please select a user type above
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* LEFT */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="input-field mb-3" />

                    {mode !== "consumer" && (
                      <>
                        <label className="block text-sm font-medium mb-1">
                          {mode === "client" ? "Company Name" : "Store Name"}
                        </label>
                        <input name="companyName" value={formData.companyName} onChange={handleChange} className="input-field mb-3" />
                      </>
                    )}

                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input name="email" value={formData.email} onChange={handleChange} className="input-field mb-3" />

                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field mb-3" />

                    <label className="block text-sm font-medium mb-1">Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" />
                  </div>

                  {/* RIGHT */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Address Line 1</label>
                    <input name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="input-field mb-3" />

                    <label className="block text-sm font-medium mb-1">Address Line 2</label>
                    <input name="addressLine2" value={formData.addressLine2} onChange={handleChange} className="input-field mb-3" />

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input name="city" value={formData.city} onChange={handleChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <input name="state" value={formData.state} onChange={handleChange} className="input-field" />
                      </div>
                    </div>

                    <label className="block text-sm font-medium mb-1">Pincode</label>
                    <input name="pincode" value={formData.pincode} onChange={handleChange} className="input-field mb-3" />

                    {mode === "vendor" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">FSSAI</label>
                          <input name="fssai" value={formData.fssai} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">PAN</label>
                          <input name="pan" value={formData.pan} onChange={handleChange} className="input-field" />
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading || !mode}
                  className="w-full bg-black text-white py-3 rounded-lg disabled:opacity-40"
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
