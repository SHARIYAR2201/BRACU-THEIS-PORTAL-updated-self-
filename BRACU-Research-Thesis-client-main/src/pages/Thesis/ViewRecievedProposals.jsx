import React, { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";
import {
  FileText,
  Check,
  X,
  Link as LinkIcon,
  Send,
  Calendar,
} from "lucide-react";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const ViewRecievedProposals = () => {
  const { user } = useContext(AuthContext);
  const { dbUser, loading: userLoading } = useContext(UserContext);
  const supervisorId = dbUser?._id ? String(dbUser._id) : null;

  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [acting, setActing] = useState({});
  const [error, setError] = useState("");
  const [feedbackDraft, setFeedbackDraft] = useState({});

  // Semester selection modal state
  const [semesters, setSemesters] = useState([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveForProposalId, setApproveForProposalId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const upcomingSemesters = useMemo(() => {
    // Safety filter client-side too: hide startDate <= today
    return (semesters || []).filter((s) => s.startDate > todayStr);
  }, [semesters, todayStr]);

  const fetchProposals = async () => {
    if (!supervisorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/proposals?supervisorId=${supervisorId}`
      );
      if (!res.ok) throw new Error("Failed to fetch proposals");
      const d = await res.json();
      setProposals(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to fetch proposals");
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingSemesters = async () => {
    try {
      const res = await fetch(`${API_BASE}/semesters/upcoming`);
      if (!res.ok) throw new Error("Failed to load semesters");
      const list = await res.json();
      setSemesters(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Load semesters error:", e);
      setSemesters([]);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [supervisorId]);

  useEffect(() => {
    // Preload upcoming semesters so the modal opens instantly
    fetchUpcomingSemesters();
  }, []);

  const openApproveModal = (proposalId) => {
    setApproveForProposalId(proposalId);
    setSelectedSemesterId("");
    setShowApproveModal(true);
  };

  const closeApproveModal = () => {
    setShowApproveModal(false);
    setApproveForProposalId(null);
    setSelectedSemesterId("");
  };

  const decide = async (proposalId, decision, semesterId) => {
    if (!supervisorId) return;
    setActing((p) => ({ ...p, [proposalId]: true }));
    try {
      const res = await fetch(`${API_BASE}/proposals/${proposalId}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supervisorId, decision, semesterId }),
      });
      const data = await res.json();

      if (!res.ok) {
        // surface cap / validation messages cleanly
        const msg =
          data?.message ||
          (res.status === 409
            ? "You’ve reached the maximum of 8 groups for this semester."
            : "Failed to update proposal");
        throw new Error(msg);
      }

      setProposals((prev) =>
        prev.map((p) =>
          String(p._id) === String(proposalId) ? data.proposal : p
        )
      );

      if (decision === "approve") {
        alert("Proposal approved and starting semester assigned.");
      } else {
        alert("Proposal rejected successfully.");
      }
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to update proposal");
    } finally {
      setActing((p) => ({ ...p, [proposalId]: false }));
    }
  };

  const sendFeedback = async (proposalId) => {
    if (!supervisorId) return;
    const text = feedbackDraft[proposalId];
    if (!text || !text.trim()) {
      alert("Feedback cannot be empty");
      return;
    }
    setActing((p) => ({ ...p, [proposalId]: true }));
    try {
      const res = await fetch(`${API_BASE}/proposals/${proposalId}/feedback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supervisorId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to send feedback");

      setProposals((prev) =>
        prev.map((p) =>
          String(p._id) === String(proposalId) ? data.proposal : p
        )
      );
      setFeedbackDraft((d) => ({ ...d, [proposalId]: "" }));
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to send feedback");
    } finally {
      setActing((p) => ({ ...p, [proposalId]: false }));
    }
  };

  const formatSemLabel = (s) =>
    `${s.season?.charAt(0).toUpperCase()}${s.season?.slice(1)} ${
      s.year
    } — starts ${s.startDate}`;

  return (
    <section className="min-h-screen bg-white dark:bg-slate-900 transition-colors p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <FileText className="w-7 h-7 text-[#7b1e3c]" />
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
            Proposals Submitted to You
          </h1>
        </div>

        {userLoading || loading ? (
          <div className="text-slate-600 dark:text-gray-300">
            Loading proposals…
          </div>
        ) : !supervisorId ? (
          <div className="text-amber-700 dark:text-amber-300">
            Couldn’t resolve your supervisor account.
          </div>
        ) : error ? (
          <div className="text-rose-700 dark:text-rose-300">{error}</div>
        ) : proposals.length === 0 ? (
          <div className="text-slate-600 dark:text-gray-300">
            No proposals submitted yet.
          </div>
        ) : (
          <ul className="space-y-4">
            {proposals.map((p) => {
              const pid = String(p._id);
              const pending = p.status === "Pending";
              return (
                <li
                  key={pid}
                  className="rounded-xl border border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {p.title}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-gray-400">
                        {p.groupName || "Unknown Group"} —{" "}
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : ""}
                      </div>
                      <p className="mt-3 text-sm text-slate-700 dark:text-gray-300">
                        {p.abstract}
                      </p>

                      {/* Supervisor feedback section */}
                      <div className="mt-3">
                        <textarea
                          value={feedbackDraft[pid] || ""}
                          onChange={(e) =>
                            setFeedbackDraft((f) => ({
                              ...f,
                              [pid]: e.target.value,
                            }))
                          }
                          placeholder="Write feedback..."
                          className="w-full mt-2 p-2 border rounded-md text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                        <button
                          onClick={() => sendFeedback(pid)}
                          disabled={acting[pid]}
                          className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#7b1e3c] text-white disabled:opacity-60"
                        >
                          <Send className="w-4 h-4" /> Send Feedback
                        </button>
                      </div>

                      {/* Show feedback history */}
                      {Array.isArray(p.feedback) && p.feedback.length > 0 && (
                        <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-gray-400">
                          {p.feedback.map((f, idx) => (
                            <li
                              key={idx}
                              className="border-l-2 pl-2 border-blue-500"
                            >
                              {f.text}{" "}
                              <span className="text-xs text-gray-400">
                                ({new Date(f.date).toLocaleString()})
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            p.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : p.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.driveLink && (
                          <a
                            href={p.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#7b1e3c] hover:underline"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            Drive Link
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col gap-2">
                      {/* Approve opens semester picker modal */}
                      <button
                        onClick={() => openApproveModal(pid)}
                        disabled={!pending || acting[pid]}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                          !pending || acting[pid]
                            ? "bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-gray-400 cursor-not-allowed"
                            : "bg-white text-[#7b1e3c] border border-[#7b1e3c] hover:bg-[#fdf2f4]"
                        }`}
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>

                      <button
                        onClick={() => decide(pid, "reject")}
                        disabled={!pending || acting[pid]}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                          !pending || acting[pid]
                            ? "bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-gray-400 cursor-not-allowed"
                            : "bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730]"
                        }`}
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Approve -> Select Starting Semester Modal */}
        {showApproveModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#7b1e3c]" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Choose Starting Semester
                </h3>
              </div>

              <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">
                Only upcoming semesters are shown. Current/past semesters are
                hidden.
              </p>

              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
              >
                <option value="">Select semester</option>
                {upcomingSemesters.map((s) => (
                  <option key={s._id} value={s._id}>
                    {formatSemLabel(s)}
                  </option>
                ))}
              </select>

              {upcomingSemesters.length === 0 && (
                <div className="mt-2 text-sm text-amber-600 dark:text-amber-300">
                  No upcoming semesters available.
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeApproveModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!selectedSemesterId) {
                      alert("Please choose a semester.");
                      return;
                    }
                    const pid = approveForProposalId;
                    closeApproveModal();
                    await decide(pid, "approve", selectedSemesterId);
                  }}
                  disabled={!selectedSemesterId}
                  className="flex-1 px-4 py-2 bg-[#7b1e3c] text-white rounded-md hover:bg-[#691832] transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ViewRecievedProposals;
