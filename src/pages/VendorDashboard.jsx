import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function VendorDashboard() {
  const navigate = useNavigate();

  let vendor = null;
  try {
    vendor =
      JSON.parse(localStorage.getItem("skope_user")) ||
      JSON.parse(sessionStorage.getItem("skope_user"));
  } catch {}

  const vendorName =
    vendor?.supplierName ||
    vendor?.storeName ||
    vendor?.name ||
    "Vendor";

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };
  const productupload = () => {
    navigate("/product-upload");
  }


  return (
    <Layout>
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-full flex justify-center space-y-8">

        <header className="rounded-2xl bg-[url('/assets/Main-bg.png')] w-10/12 bg-cover p-8 shadow ring-1">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Vendor Dashboard
              </p>

              <h1 className="mt-1 text-3xl font-semibold">
                {vendorName}
              </h1>
            </div>

            <div className="buttons w-4/12 flex justify-evenly">
                <button
                    onClick={productupload}
                    className="px-4 py-2 bg-black w-5/12 text-white rounded-lg"
                    >
                    Add Product
                </button>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-black w-5/12 text-white rounded-lg"
                    >
                    Logout
                </button>    
            </div>
          </div>

        </header>

      </div>
    </div>
    </Layout>
  );
}
