"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  user: { name: string; email: string; role: string };
};

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { name: string; email: string };
  comments: Comment[];
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-[#EEF0FF] text-[#3D2DB5]",
  IN_PROGRESS: "bg-[#FFF8E6] text-[#B07D00]",
  RESOLVED: "bg-[#EAFAF1] text-[#1A7A4A]",
  CLOSED: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<string, string> = {
  OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", CLOSED: "Closed",
};

const priorityStyles: Record<string, string> = {
  URGENT: "bg-[#FDECEA] text-[#B03020]",
  HIGH: "bg-[#FFF0EC] text-[#C04010]",
  MEDIUM: "bg-[#FFF8E6] text-[#B07D00]",
  LOW: "bg-gray-100 text-gray-500",
};

export default function TicketDetailPage() {
  const params = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/tickets/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setTicket(data);
        setStatus(data.status);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function handleComment() {
    if (!comment.trim()) return;
    setSubmitting(true);

    const res = await fetch(`/api/tickets/${params.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: comment }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setTicket((prev) => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev);
      setComment("");
    }
    setSubmitting(false);
  }

  async function handleUpdateStatus() {
    setUpdating(true);
    const res = await fetch(`/api/tickets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      const updated = await res.json();
      setTicket((prev) => prev ? { ...prev, status: updated.status } : prev);
    }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7]">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-400">Loading ticket...</p>
        </main>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#F5F5F7]">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-400">Ticket not found.</p>
          <Link href="/tickets" className="text-xs text-[#3D2DB5] hover:underline mt-2 block">← Back to tickets</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <Link href="/tickets" className="hover:text-[#3D2DB5]">All Tickets</Link>
          <span>/</span>
          <span className="text-gray-600">Ticket #{ticket.id.slice(-6)}</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-lg font-medium text-gray-900">{ticket.title}</h1>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${priorityStyles[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[ticket.status]}`}>
                  {statusLabels[ticket.status]}
                </span>
                <span className="text-xs text-gray-400">{ticket.category}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{ticket.description}</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-4">
                Comments ({ticket.comments.length})
              </h2>

              {ticket.comments.length === 0 ? (
                <p className="text-sm text-gray-400 mb-5">No comments yet.</p>
              ) : (
                <div className="space-y-4 mb-5">
                  {ticket.comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${c.user.role === "ADMIN" ? "bg-[#EEF0FF] text-[#3D2DB5]" : "bg-gray-100 text-gray-600"}`}>
                        {(c.user.name ?? c.user.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700">{c.user.name ?? c.user.email}</span>
                          {c.user.role === "ADMIN" && (
                            <span className="text-xs bg-[#EEF0FF] text-[#3D2DB5] px-1.5 py-0.5 rounded">Staff</span>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(c.createdAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D2DB5]/20 focus:border-[#3D2DB5] bg-gray-50 text-gray-900 resize-none mb-3"
                />
                <button
                  onClick={handleComment}
                  disabled={submitting || !comment.trim()}
                  className="bg-[#3D2DB5] hover:bg-[#2E22A0] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40 transition-colors"
                >
                  {submitting ? "Posting..." : "Post comment"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Details</h3>
              <div className="space-y-3">
                {[
                  { label: "Status", value: statusLabels[ticket.status] },
                  { label: "Priority", value: ticket.priority },
                  { label: "Category", value: ticket.category },
                  { label: "Created by", value: ticket.createdBy?.name ?? ticket.createdBy?.email },
                  { label: "Created", value: new Date(ticket.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) },
                  { label: "Updated", value: new Date(ticket.updatedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                    <div className="text-sm text-gray-700">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Update Status</h3>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D2DB5]/20 focus:border-[#3D2DB5] bg-gray-50 text-gray-900 mb-2"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              <button
                onClick={handleUpdateStatus}
                disabled={updating || status === ticket.status}
                className="w-full bg-[#3D2DB5] hover:bg-[#2E22A0] text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-40"
              >
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}