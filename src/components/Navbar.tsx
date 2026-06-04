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
    <aside className="fixed bottom-0 md:bottom-auto md:left-0 md:top-0 md:h-screen w-full md:w-56 bg-darkblue text-white flex flex-row md:flex-col shadow-lg z-50">
      <div className="hidden md:block p-6 text-2xl font-bold tracking-wide">ERP System</div>
      <nav className="flex-1 flex flex-row md:flex-col gap-1 md:gap-2 px-2 py-2 md:py-0 overflow-x-auto justify-around md:justify-start items-center md:items-stretch">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-lg hover:bg-teal transition-colors flex-shrink-0"
          >
            <span className="text-2xl md:text-xl">{item.icon}</span>
            <span className="text-xs md:text-base hidden md:inline">{item.name}</span>
          </Link>
        ))}
        <Link
          href="/gst-calculator"
          className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 md:mx-2 rounded-xl bg-gradient-to-r from-teal to-mint text-navy font-semibold shadow-lg hover:scale-[1.02] transition-transform flex-shrink-0"
        >
          <FaCalculator className="text-2xl md:text-xl" />
          <span className="text-xs md:text-base hidden md:block">GST</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
          className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 md:m-4 md:mb-30 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white flex-shrink-0"
        >
          <FaSignOutAlt className="text-2xl md:text-xl" />
          <span className="text-xs md:text-base hidden md:inline">Logout</span>
        </button>
      </nav>
    </aside>
  );
}
