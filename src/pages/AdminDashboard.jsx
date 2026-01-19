import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import BrandList from "./BrandList";
import BrandDrawer from "./BrandDrawer";

const AdminDashboard = () => {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <button
            onClick={handleLogout}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>

        <BrandList onSelectBrand={setSelectedBrand} />

        {selectedBrand && (
          <BrandDrawer
            brand={selectedBrand}
            onClose={() => setSelectedBrand(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
