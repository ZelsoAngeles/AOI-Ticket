"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/components/Toast";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>("");
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const cookies = document.cookie.split("; ").reduce((acc, c) => {
      const [k, v] = c.split("=");
      acc[k] = v;
      return acc;
    }, {} as Record<string, string>);

    setRole(cookies["user_role"] ?? "");
    setName(decodeURIComponent(cookies["user_name"] ?? ""));
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully.");
      router.push("/login");
      router.refresh();
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  }

  const allLinks = [
    { href: "/dashboard", label: "Dashboard", roles: ["EMPLOYEE", "IT_STAFF", "IT_MANAGER"] },
    { href: "/tickets", label: "All Tickets", roles: ["IT_MANAGER"] },
    { href: "/tickets/my", label: "My Tickets", roles: ["EMPLOYEE"] },
    { href: "/tickets/assigned", label: "Assigned Tickets", roles: ["IT_STAFF"] },
  ];

  const visibleLinks = allLinks.filter((l) => l.roles.includes(role));

  const roleBadgeStyles: Record<string, string> = {
    EMPLOYEE: "bg-gray-100 text-gray-500",
    IT_STAFF: "bg-blue-50 text-primary",
    IT_MANAGER: "bg-red-50 text-red-600",
  };

  const roleLabels: Record<string, string> = {
    EMPLOYEE: "Employee",
    IT_STAFF: "IT Staff",
    IT_MANAGER: "IT Manager",
  };

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
          <span className="text-xs text-brand tracking-widest uppercase font-medium">
            Ticketing System
          </span>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                pathname === link.href
                  ? "bg-blue-50 text-primary font-medium"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {name && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{name}</span>
            {role && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeStyles[role]}`}>
                {roleLabels[role] ?? role}
              </span>
            )}
          </div>
        )}

        <div className="w-px h-4 bg-gray-200" />

        {role === "EMPLOYEE" && (
          <Link
            href="/tickets/new"
            className="bg-primary hover:bg-[#2E22A0] text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            + New Ticket
          </Link>
        )}

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