import { useEffect, useState } from "react";
import api from "../utils/api";

const BrandList = ({ onSelectBrand }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/admin/brands")
      .then((res) => setBrands(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading brands...</p>;

  return (
    <div className="bg-white rounded-xl shadow divide-y">
      {brands.map((brand) => (
        <div
          key={brand._id}
          onClick={() => {
            onSelectBrand(brand);
            setBrands(prev =>
                prev.map(b =>
                b._id === brand._id
                    ? { ...b, hasNewOrder: false }
                    : b
                )
            );
            }}

          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        >
          {/* LEFT: NAME + DOT + WALLET */}
          <div>
            <div className="flex items-center gap-2">
            <span className="font-medium">
                {brand.brandName}
            </span>

            {brand.hasNewOrder && (
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-200" />
            )}
            </div>


            <p className="text-sm text-gray-500">
              Wallet: ₹{brand.wallet?.balance ?? 0}
            </p>
          </div>

          {/* RIGHT */}
          <span className="text-sm text-blue-600">
            Manage →
          </span>
        </div>
      ))}
    </div>
  );
};

export default BrandList;
