import {
  FaTachometerAlt,
  FaBoxes,
  FaBook,
  FaUser,
  FaCog,
  FaChartLine,
  FaFileInvoice,
} from "react-icons/fa";

const navItems = [
  { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
  { name: "Inventory", icon: <FaBoxes />, path: "/inventory" },
  { name: "Ledger/Udhaar", icon: <FaBook />, path: "/ledger" },
  { name: "Account", icon: <FaUser />, path: "/account" },
  { name: "Settings", icon: <FaCog />, path: "/settings" },
  { name: "Sales", icon: <FaChartLine />, path: "/sales" },
  { name: "Billing", icon: <FaFileInvoice />, path: "/billing" },
];

export default function Navbar() {
  return (
    <aside className="h-screen w-56 bg-darkblue text-white flex flex-col shadow-lg">
      <div className="p-6 text-2xl font-bold tracking-wide">ERP System</div>
      <nav className="flex-1 flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-teal transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-base">{item.name}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
