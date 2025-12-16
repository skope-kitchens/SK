import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EligibilityForm from './pages/EligibilityForm'
import Analyzing from './pages/Analyzing'
import Result from './pages/Result'
import ContactUs from './pages/ContactUs'
import Dashboard from './pages/Dashboard'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Map from './pages/Map'
import Category from './pages/Category'


function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/eligibility-form" element={<EligibilityForm />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/result" element={<Result />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/map" element={<Map />} />
        <Route path="/category" element={<Category />} />
      </Routes>
    </Router>
  )
}

export default App


