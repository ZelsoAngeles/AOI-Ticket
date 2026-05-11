"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Ticket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  createdBy: { name: string | null; email?: string };
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-[#EEF0FF] text-[#3D2DB5]",
  IN_PROGRESS: "bg-[#FFF8E6] text-[#B07D00]",
  RESOLVED: "bg-[#EAFAF1] text-[#1A7A4A]",
  CLOSED: "bg-gray-100 text-gray-500",
};

const priorityStyles: Record<string, string> = {
  URGENT: "bg-[#FDECEA] text-[#B03020]",
  HIGH: "bg-[#FFF0EC] text-[#C04010]",
  MEDIUM: "bg-[#FFF8E6] text-[#B07D00]",
  LOW: "bg-gray-100 text-gray-500",
};

export default function AssignedTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTickets = useMemo(() => {
    let result = [...tickets];

    // Search
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.id.toLowerCase().includes(term) ||
          t.createdBy?.name?.toLowerCase().includes(term)
      );
    }

    // Status Filter
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "priority") {
        const order = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return sortOrder === "desc"
          ? (order[b.priority as keyof typeof order] || 0) - (order[a.priority as keyof typeof order] || 0)
          : (order[a.priority as keyof typeof order] || 0) - (order[b.priority as keyof typeof order] || 0);
      }
      if (sortBy === "status") {
        return sortOrder === "desc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });

    return result;
  }, [tickets, search, statusFilter, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Assigned Tickets</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredAndSortedTickets.length} tickets assigned to you
            </p>
          </div>
          <button
            onClick={fetchTickets}
            className="bg-[#3D2DB5] hover:bg-[#2E22A0] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search assigned tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[280px] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#3D2DB5]"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button
            onClick={() => { setSearch(""); setStatusFilter(""); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5"
          >
            Clear
          </button>
        </div>

        {/* Tickets List */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span className="flex-1">Title</span>
            <span className="w-36">Submitted By</span>
            
            <span 
              className="w-28 cursor-pointer hover:text-gray-600" 
              onClick={() => { sortBy === "status" ? setSortOrder(sortOrder === "desc" ? "asc" : "desc") : (setSortBy("status"), setSortOrder("desc")); }}
            >
              Status {sortBy === "status" && (sortOrder === "desc" ? "↓" : "↑")}
            </span>
            
            <span 
              className="w-24 cursor-pointer hover:text-gray-600 ml-2" 
              onClick={() => { sortBy === "priority" ? setSortOrder(sortOrder === "desc" ? "asc" : "desc") : (setSortBy("priority"), setSortOrder("desc")); }}
            >
              Priority {sortBy === "priority" && (sortOrder === "desc" ? "↓" : "↑")}
            </span>
            
            <span 
              className="w-20 cursor-pointer hover:text-gray-600" 
              onClick={() => { sortBy === "date" ? setSortOrder(sortOrder === "desc" ? "asc" : "desc") : (setSortBy("date"), setSortOrder("desc")); }}
            >
              Date {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading assigned tickets...</div>
          ) : filteredAndSortedTickets.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📋</p>
              <p className="text-xl font-medium text-gray-600">No assigned tickets yet</p>
              <p className="text-gray-500 mt-2">Tickets assigned to you will appear here</p>
            </div>
          ) : (
            filteredAndSortedTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => router.push(`/tickets/${ticket.id}`)}
                className="flex items-center px-4 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all last:border-0"
              >
                <span className="flex-1 text-sm font-medium text-gray-800 pr-4 line-clamp-1">
                  {ticket.title}
                </span>
                <span className="w-36 text-sm text-gray-500 truncate">
                  {ticket.createdBy?.name || "—"}
                </span>
                <span className={`text-xs font-medium px-3 py-1 rounded-full w-28 text-center ${statusStyles[ticket.status]}`}>
                  {ticket.status}
                </span>
                <span className={`text-xs font-medium px-3 py-1 rounded-full w-24 text-center ml-2 ${priorityStyles[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className="text-xs text-gray-400 w-20">
                  {new Date(ticket.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}