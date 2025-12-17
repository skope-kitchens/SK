import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { authUtils } from '../utils/auth'
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setStatus({ type: '', message: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const { data } = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      })

      authUtils.setAuth(data.token, data.user)
      setStatus({
        type: 'success',
        message: 'Login successful! Redirecting...'
      })
      setTimeout(() => navigate('/'), 600)
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to login. Please check your credentials.'
      setStatus({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="h-[90vh] flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Skope Kitchens</h1>
            <h2 className="text-2xl font-semibold text-gray-900">Partner's Login</h2>
          </div>

          <div className="card bg-[url('/assets/Main-bg.png')] bg-cover bg-center bg-no-repeat">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status.message && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    status.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email or Vendor ID
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Enter your email or vendor ID"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm text-black hover:text-white"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full inline-flex items-center justify-center btn-primary bg-black text-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                {loading ? (
                  // NO animation during loading
                  <span>Please Wait...</span>
                ) : (
                  // SLIDE-UP TEXT EFFECT
                  <span className="relative block overflow-hidden">
                    {/* First line (slides UP) */}
                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                      <span className="block">Login</span>
                    </span>

                    {/* Second line (comes FROM BOTTOM) */}
                    <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                      Login
                    </span>
                  </span>
                )}
              </button>

            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-black hover:text-white font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Login

