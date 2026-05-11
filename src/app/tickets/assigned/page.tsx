"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";

type Ticket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  createdBy: { name: string; email: string };
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-[#EEF0FF] text-[#3D2DB5]",
  IN_PROGRESS: "bg-[#FFF8E6] text-[#B07D00]",
  RESOLVED: "bg-[#EAFAF1] text-[#1A7A4A]",
  CLOSED: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const priorityStyles: Record<string, string> = {
  URGENT: "bg-[#FDECEA] text-[#B03020]",
  HIGH: "bg-[#FFF0EC] text-[#C04010]",
  MEDIUM: "bg-[#FFF8E6] text-[#B07D00]",
  LOW: "bg-gray-100 text-gray-500",
};

export default function AssignedTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((data) => {
        setTickets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Assigned Tickets</h1>
            <p className="text-sm text-gray-500 mt-0.5">Tickets assigned to you for resolution</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="flex-1 text-xs font-medium text-gray-400 uppercase tracking-wide">Title</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide w-28 mr-3">Submitted By</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide w-24">Status</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide w-20 ml-3">Priority</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide w-16 ml-3">Date</span>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-400">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm text-gray-400">No tickets assigned to you yet.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="flex items-center px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0"
              >
                <span className="flex-1 text-sm text-gray-800 font-medium pr-4">{ticket.title}</span>
                <span className="text-xs text-gray-500 w-28 mr-3 truncate">
                  {ticket.createdBy?.name ?? ticket.createdBy?.email}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-24 text-center ${statusStyles[ticket.status]}`}>
                  {statusLabels[ticket.status]}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-20 text-center ml-3 ${priorityStyles[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className="text-xs text-gray-400 w-16 ml-3">
                  {new Date(ticket.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                </span>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}