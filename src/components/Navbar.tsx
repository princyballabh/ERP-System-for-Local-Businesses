"use client";
import {
  FaTachometerAlt,
  FaBoxes,
  FaBook,
  FaCalculator,
  FaChartLine,
  FaFileInvoice,
  FaSignOutAlt,
} from "react-icons/fa";
import { signOut } from "next-auth/react";
import Link from "next/link";

const navItems = [
  { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
  { name: "Inventory", icon: <FaBoxes />, path: "/inventory" },
  { name: "Ledger/Udhaar", icon: <FaBook />, path: "/ledger" },
  { name: "Sales", icon: <FaChartLine />, path: "/sales" },
  { name: "Billing", icon: <FaFileInvoice />, path: "/billing" },
];

export default function Navbar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-darkblue text-white flex flex-col shadow-lg">
      <div className="p-6 text-2xl font-bold tracking-wide">ERP System</div>
      <nav className="flex-1 flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-teal transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-base">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="px-2 pb-3">
        <Link
          href="/gst-calculator"
          className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl bg-gradient-to-r from-teal to-mint text-navy font-semibold shadow-lg hover:scale-[1.02] transition-transform"
        >
          <FaCalculator className="text-xl" />
          <span className="text-base">GST Calculator</span>
        </Link>
      </div>
      {/* Logout button at the bottom */}
      <button
        onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
        className="flex items-center gap-3 px-4 py-3 m-4 mb-30 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white"
      >
        <FaSignOutAlt className="text-xl" />
        <span className="text-base">Logout</span>
      </button>
    </aside>
  );
}
