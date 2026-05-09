"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tickets", label: "All Tickets" },
    { href: "/tickets/my", label: "My Tickets" },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="44" ry="30" fill="none" stroke="#3D2DB5" strokeWidth="6"/>
            <line x1="50" y1="18" x2="25" y2="72" stroke="#3D2DB5" strokeWidth="6" strokeLinecap="round"/>
            <line x1="50" y1="18" x2="75" y2="72" stroke="#3D2DB5" strokeWidth="6" strokeLinecap="round"/>
            <path d="M 20 62 Q 50 80 80 55" fill="none" stroke="#D63B5A" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="76" cy="38" r="5" fill="#D63B5A"/>
          </svg>
          <div className="w-px h-6 bg-gray-200" />
          <span className="text-xs text-[#D63B5A] tracking-widest uppercase font-medium">
            Ticketing System
          </span>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                pathname === link.href
                  ? "bg-[#EEF0FF] text-[#3D2DB5] font-medium"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/tickets/new"
          className="bg-[#3D2DB5] hover:bg-[#2E22A0] text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          + New Ticket
        </Link>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}