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
  assignedTo?: { name: string; email: string } | null;
  comments: Comment[];
};

type StaffUser = {
  id: string;
  name: string;
  email: string;
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

const roleBadgeStyles: Record<string, string> = {
  EMPLOYEE: "bg-gray-100 text-gray-500",
  IT_STAFF: "bg-[#EEF0FF] text-[#3D2DB5]",
  IT_MANAGER: "bg-[#FDECEA] text-[#B03020]",
};

const roleLabels: Record<string, string> = {
  EMPLOYEE: "Employee",
  IT_STAFF: "IT Staff",
  IT_MANAGER: "IT Manager",
};

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith(name + "="))
      ?.split("=")[1] ?? ""
  );
}

export default function TicketDetailPage() {
  const params = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [role, setRole] = useState<string>("");

  // For IT Manager assign
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const userRole = getCookie("user_role");
    setRole(userRole);

    fetch(`/api/tickets/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setTicket(data);
        setStatus(data.status);
        setSelectedStaff(data.assignedTo?.id ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch IT Staff list if IT Manager
    if (userRole === "IT_MANAGER") {
      fetch("/api/users/staff")
        .then((r) => r.json())
        .then((data) => setStaffList(Array.isArray(data) ? data : []));
    }
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

  async function handleAssign() {
    if (!selectedStaff) return;
    setAssigning(true);
    const res = await fetch(`/api/tickets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToId: selectedStaff }),
    });
    if (res.ok) {
      const assigned = staffList.find((s) => s.id === selectedStaff);
      setTicket((prev) =>
        prev ? { ...prev, assignedTo: assigned ?? null } : prev
      );
    }
    setAssigning(false);
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
          <Link href="/tickets" className="text-xs text-[#3D2DB5] hover:underline mt-2 block">
            ← Back to tickets
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <Link
            href={role === "IT_MANAGER" ? "/tickets" : role === "IT_STAFF" ? "/tickets/assigned" : "/tickets/my"}
            className="hover:text-[#3D2DB5]"
          >
            {role === "IT_MANAGER" ? "All Tickets" : role === "IT_STAFF" ? "Assigned Tickets" : "My Tickets"}
          </Link>
          <span>/</span>
          <span className="text-gray-600">Ticket #{ticket.id.slice(-6)}</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Left: Main content */}
          <div className="col-span-2 space-y-4">

            {/* Ticket info */}
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

            {/* Comments */}
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${roleBadgeStyles[c.user.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {(c.user.name ?? c.user.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {c.user.name ?? c.user.email}
                          </span>
                          {c.user.role !== "EMPLOYEE" && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleBadgeStyles[c.user.role]}`}>
                              {roleLabels[c.user.role] ?? c.user.role}
                            </span>
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

          {/* Right: Sidebar */}
          <div className="space-y-4">

            {/* Details */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Details</h3>
              <div className="space-y-3">
                {[
                  { label: "Status", value: statusLabels[ticket.status] },
                  { label: "Priority", value: ticket.priority },
                  { label: "Category", value: ticket.category },
                  { label: "Submitted by", value: ticket.createdBy?.name ?? ticket.createdBy?.email },
                  { label: "Assigned to", value: ticket.assignedTo?.name ?? "Unassigned" },
                  { label: "Created", value: new Date(ticket.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) },
                  { label: "Updated", value: new Date(ticket.updatedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                    <div className={`text-sm ${item.label === "Assigned to" && !ticket.assignedTo ? "text-gray-300 italic" : "text-gray-700"}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assign — IT Manager only */}
            {role === "IT_MANAGER" && (
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                  Assign to IT Staff
                </h3>
                {staffList.length === 0 ? (
                  <p className="text-xs text-gray-400">No IT Staff available.</p>
                ) : (
                  <>
                    <select
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D2DB5]/20 focus:border-[#3D2DB5] bg-gray-50 text-gray-900 mb-2"
                    >
                      <option value="">— Select staff —</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name ?? s.email}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      disabled={assigning || !selectedStaff}
                      className="w-full bg-[#3D2DB5] hover:bg-[#2E22A0] text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {assigning ? "Assigning..." : "Assign"}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Update Status — IT Staff and IT Manager only */}
            {(role === "IT_STAFF" || role === "IT_MANAGER") && (
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                  Update Status
                </h3>
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
            )}

          </div>
        </div>
      </main>
    </div>
  );
}