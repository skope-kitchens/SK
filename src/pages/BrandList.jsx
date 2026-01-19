import { useEffect, useState } from "react";
import api from "../utils/api";

const BrandList = ({ onSelectBrand }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/brands")
      .then(res => setBrands(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading brands...</p>;

  return (
    <div className="bg-white rounded-xl shadow divide-y">
      {brands.map(brand => (
        <div
          key={brand._id}
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => onSelectBrand(brand)}
        >
          <div>
            <p className="font-medium">{brand.brandName}</p>
            <p className="text-sm text-gray-500">
              Wallet: ₹{brand.wallet?.balance ?? 0}
            </p>
          </div>

          <span className="text-sm text-blue-600">Manage →</span>
        </div>
      ))}
    </div>
  );
};

export default BrandList;
