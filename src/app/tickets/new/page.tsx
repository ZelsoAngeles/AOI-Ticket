"use client";

import Navbar from "@/components/Navbar";
import { toast } from "@/components/Toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("IT Support");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      toast.error("Title and description are required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority, category }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error ?? "Something went wrong.";
        setError(errMsg);
        toast.error(errMsg);
        setLoading(false);
        return;
      }

      toast.success("Ticket submitted successfully!");
      router.push("/tickets");
    } catch {
      const errMsg = "Network error. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <main className="max-w-2xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900">Create New Ticket</h1>
          <p className="text-sm text-gray-500 mt-0.5">Submit a new support request</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">
                Title <span className="text-[rgb(214,61,92)]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[rgb(61,45,181)] bg-gray-50 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[rgb(61,45,181)] bg-gray-50 text-gray-900"
                >
                  <option>IT Support</option>
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Network</option>
                  <option>Account Access</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[rgb(61,45,181)] bg-gray-50 text-gray-900"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">
                Description <span className="text-[rgb(214,59,90)]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation of the issue — include steps to reproduce, error messages, etc."
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[rgb(61,45,181)] bg-gray-50 text-gray-900 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[rgb(61,45,181)] hover:bg-[#2E22A0] text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-50 transition-colors"
              >
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>
              <button
                onClick={() => router.back()}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}