"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  createdBy: { name: string | null };
  assignedTo?: { name: string | null } | null;
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

export default function AllTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
  });

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

  const filteredTickets = tickets.filter((ticket) => {
    return (
      (!filters.status || ticket.status === filters.status) &&
      (!filters.priority || ticket.priority === filters.priority)
    );
  });

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-gray-900">All Tickets</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Complete view of all tickets • IT Manager Access
            </p>
          </div>
          <button
            onClick={fetchTickets}
            className="bg-[#3D2DB5] hover:bg-[#2E22A0] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <button
            onClick={() => setFilters({ status: "", priority: "" })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </button>
        </div>

        {/* Tickets Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span className="flex-1">Title</span>
            <span className="w-36">Submitted By</span>
            <span className="w-36">Assigned To</span>
            <span className="w-28">Status</span>
            <span className="w-24">Priority</span>
            <span className="w-20">Date</span>
            <span className="w-16"></span>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-400">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No tickets found.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => router.push(`/tickets/${ticket.id}`)}
                className="flex items-center px-4 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
              >
                <span className="flex-1 text-sm font-medium text-gray-800 pr-4">
                  {ticket.title}
                </span>
                <span className="w-36 text-sm text-gray-500">
                  {ticket.createdBy?.name || "—"}
                </span>
                <span className="w-36 text-sm text-gray-500">
                  {ticket.assignedTo?.name || (
                    <span className="italic text-gray-300">Unassigned</span>
                  )}
                </span>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full w-28 text-center ${statusStyles[ticket.status]}`}
                >
                  {ticket.status}
                </span>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full w-24 text-center ml-2 ${priorityStyles[ticket.priority]}`}
                >
                  {ticket.priority}
                </span>
                <span className="text-xs text-gray-400 w-20">
                  {new Date(ticket.createdAt).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="w-16 text-[#3D2DB5] text-sm font-medium">View →</span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}