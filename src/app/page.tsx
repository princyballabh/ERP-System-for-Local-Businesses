export default function Dashboard() {
  return (
    <div className=" grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6 col-span-1">
        <div className="text-xl font-semibold text-primary">Total Sales</div>
        <div className="text-3xl font-bold mt-2">₹12,500</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 col-span-1">
        <div className="text-xl font-semibold text-primary">Inventory</div>
        <div className="text-3xl font-bold mt-2">350 Items</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 col-span-1">
        <div className="text-xl font-semibold text-primary">
          Outstanding Udhaar
        </div>
        <div className="text-3xl font-bold mt-2">₹5,000</div>
      </div>
    </div>
  );
}
