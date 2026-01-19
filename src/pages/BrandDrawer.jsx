import WalletPanel from "./WalletPanel";
import ServiceChecklist from "./ServiceChecklist";

const BrandDrawer = ({ brand, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative bg-white w-full max-w-xl h-full shadow-xl overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{brand.brandName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Wallet Deduction */}
        <WalletPanel
          brandId={brand._id}
          balance={brand.wallet?.balance ?? 0}
        />

        {/* Services Checklist */}
        <ServiceChecklist
          brandId={brand._id}
          editable
        />
      </div>
    </div>
  );
};

export default BrandDrawer;
