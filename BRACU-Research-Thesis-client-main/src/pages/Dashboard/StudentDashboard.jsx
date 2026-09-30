/* eslint-disable no-unused-vars */
import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import {
  FileText,
  UserCheck,
  Clock,
  BookOpen,
  Download,
  Calendar,
  Search,
  Video,
} from "lucide-react";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";
import { Link, useNavigate } from "react-router";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  // Use UserContext instead of scanning all users from loader
  const { dbUser: currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingModalLoading, setMeetingModalLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [assignedSupervisor, setAssignedSupervisor] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [savedPapersCount, setSavedPapersCount] = useState(0);
  const [meetings, setMeetings] = useState([]);

  // NEW: join requests
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [actingInviteId, setActingInviteId] = useState(null);

  const studentId = currentUser?._id ? String(currentUser._id) : null;

  const fetchInvites = useCallback(async () => {
    if (!studentId) {
      setJoinRequests([]);
      setLoadingInvites(false);
      return;
    }
    setLoadingInvites(true);
    try {
      // Prefer a dedicated endpoint if present
      const res = await fetch(`${API_BASE}/users/${studentId}/join-requests`);
      if (res.ok) {
        const list = await res.json();
        setJoinRequests(Array.isArray(list) ? list : []);
      } else {
        // Fallback to whatever is on the loader user doc
        const fallback = currentUser?.joinRequests || [];
        setJoinRequests(Array.isArray(fallback) ? fallback : []);
      }
    } catch (e) {
      console.error("Failed to fetch join requests:", e);
      const fallback = currentUser?.joinRequests || [];
      setJoinRequests(Array.isArray(fallback) ? fallback : []);
    } finally {
      setLoadingInvites(false);
    }
  }, [studentId, currentUser?.joinRequests]);

  const fetchAll = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1) Get the student's group
      const gRes = await fetch(`${API_BASE}/groups/by-member/${studentId}`);
      const myGroup = gRes.ok ? await gRes.json() : null;

      // ✅ If already in a group, wipe all invitations for this student
      if (myGroup?._id) {
        try {
          await fetch(`${API_BASE}/users/${studentId}/join-requests/clear`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
          });
          // If you keep invitations in local state, also clear them here:
          // setJoinRequests?.([]);
        } catch (e) {
          console.error("Failed to clear join requests:", e);
        }
      }

      // 2) Get all proposals for this group
      let myProposals = [];
      if (myGroup?._id) {
        const pRes = await fetch(
          `${API_BASE}/proposals?groupId=${myGroup._id}`
        );
        myProposals = pRes.ok ? await pRes.json() : [];
      }

      // 3) Assigned supervisor info
      let supervisorData = null;
      if (myGroup?.assignedSupervisor) {
        const sRes = await fetch(
          `${API_BASE}/users/${myGroup.assignedSupervisor}`
        );
        supervisorData = sRes.ok ? await sRes.json() : null;
      }

      // 4) Deadlines
      const dRes = await fetch(`${API_BASE}/deadlines`);
      const dJson = dRes.ok ? await dRes.json() : [];

      // 5) Feedbacks
      const fRes = await fetch(`${API_BASE}/feedbacks?studentId=${studentId}`);
      const fJson = fRes.ok ? await fRes.json() : [];

      // 6) Saved papers count
      const sRes = await fetch(
        `${API_BASE}/saved-papers/count?studentId=${studentId}`
      );
      const sJson = sRes.ok ? await sRes.json() : { count: 0 };

      // 7) Meetings for this student
      const mRes = await fetch(`${API_BASE}/meetings?studentId=${studentId}`);
      const mJson = mRes.ok ? await mRes.json() : [];

      setProposals(Array.isArray(myProposals) ? myProposals : []);
      setAssignedSupervisor(supervisorData);
      setDeadlines(Array.isArray(dJson) ? dJson : []);
      setFeedbacks(Array.isArray(fJson) ? fJson : []);
      setSavedPapersCount(Number(sJson?.count || 0));
      setMeetings(Array.isArray(mJson) ? mJson : []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const getSupervisorName = () => {
    if (!assignedSupervisor) return "Not assigned";
    return (
      assignedSupervisor.name ||
      assignedSupervisor.displayName ||
      assignedSupervisor.email ||
      String(assignedSupervisor)
    );
  };

  const gotoRecommendedPapers = () => navigate("/recommended");
  const gotoSearchPapers = () => navigate("/search");
  const gotoSavedPapers = () => navigate("/saved-papers");
  const gotoDownloadFinal = () => navigate("/thesis-list");

  const findGroupHref = currentUser?._id
    ? `/find-group/${currentUser._id}`
    : "#";

  // Accept invite (no fallback)
  const acceptInvite = async (reqObj) => {
    if (!reqObj?._id || !studentId) return;
    setActingInviteId(String(reqObj._id));
    try {
      const res = await fetch(
        `${API_BASE}/groups/invite/${reqObj._id}/accept`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            groupId: reqObj.groupId,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to accept invite");
      }

      // Backend should add the student to the group and clear invites
      setJoinRequests([]);
      await fetchAll();
      alert("Joined group successfully.");
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to accept invite");
    } finally {
      setActingInviteId(null);
    }
  };

  const rejectInvite = async (reqObj) => {
    if (!reqObj?._id || !studentId) return;
    setActingInviteId(String(reqObj._id));
    try {
      // Preferred: dedicated reject endpoint that also notifies admin
      const res = await fetch(
        `${API_BASE}/groups/invite/${reqObj._id}/reject`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            groupId: reqObj.groupId,
          }),
        }
      );

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Failed to reject invite");
      }

      // Remove only this invite locally
      setJoinRequests((prev) =>
        prev.filter((r) => String(r._id) !== String(reqObj._id))
      );
      alert("Invitation rejected.");
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to reject invite");
    } finally {
      setActingInviteId(null);
    }
  };

  return (
    <section className="min-h-screen bg-white dark:bg-slate-900 transition-colors p-6">
      <div className="container mx-auto">
        {/* Greeting + quick stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Welcome, {user?.name || user?.displayName || "Student"}
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mt-1">
              Here's your thesis dashboard — quick links, statuses, deadlines
              and feedback.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full md:w-auto">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow flex items-center gap-3 w-full sm:w-auto sm:min-w-[150px]">
              <FileText className="w-6 h-6 text-[#7b1e3c]" />
              <div>
                <div className="text-sm text-slate-600 dark:text-gray-400">
                  Proposals
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {proposals.length}
                </div>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow flex items-center gap-3 w-full sm:w-auto sm:min-w-[150px]">
              <UserCheck className="w-6 h-6 text-[#7b1e3c]" />
              <div>
                <div className="text-sm text-slate-600 dark:text-gray-400">
                  Supervisor
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {getSupervisorName()}
                </div>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow flex items-center gap-3 w-full sm:w-auto sm:min-w-[150px]">
              <BookOpen className="w-6 h-6 text-[#7b1e3c]" />
              <div>
                <div className="text-sm text-slate-600 dark:text-gray-400">
                  Saved Papers
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {savedPapersCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={gotoRecommendedPapers}
            className="px-4 py-2 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730] transition"
          >
            View Recommended Papers
          </button>
          <button
            onClick={gotoSearchPapers}
            className="px-4 py-2 border border-[#7b1e3c] text-[#7b1e3c] rounded-lg hover:bg-[#7b1e3c] hover:text-white transition"
          >
            <Search className="inline w-4 h-4 mr-2" /> Search Papers
          </button>
          <button
            onClick={gotoSavedPapers}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-gray-200 dark:border-slate-700"
          >
            Bookmarked Papers
          </button>
          <button
            onClick={gotoDownloadFinal}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <Download className="inline w-4 h-4 mr-2" /> Download Final Thesis
          </button>

          <Link
            to={findGroupHref}
            className={`px-4 py-2 rounded-lg border ${
              currentUser?._id
                ? "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                : "border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (!currentUser?._id) e.preventDefault();
            }}
          >
            Find Groupmates
          </Link>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Proposals + Feedback */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Your Proposals
              </h2>

              {loading ? (
                <div className="text-slate-500">Loading proposals...</div>
              ) : proposals.length === 0 ? (
                <div className="text-slate-500">
                  No proposals found. Submit your first proposal.
                </div>
              ) : (
                <div className="space-y-3">
                  {proposals.map((p) => (
                    <div
                      key={p._id || p.id}
                      className="p-3 rounded-lg border border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {p.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-gray-400 truncate max-w-xl">
                            {p.abstract}
                          </p>
                          <div className="text-xs mt-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                p.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : p.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {p.status || "Pending"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-slate-600 dark:text-gray-400">
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString()
                              : ""}
                          </div>
                          <Link
                            to="/view-proposals"
                            className="text-xs text-[#7b1e3c] hover:underline mt-2 inline-block"
                          >
                            View details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feedback */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Recent Supervisor Feedback
              </h2>
              {feedbacks.length === 0 ? (
                <div className="text-slate-500">No feedback yet.</div>
              ) : (
                <ul className="space-y-3">
                  {feedbacks.slice(0, 5).map((fb) => (
                    <li
                      key={fb._id || fb.id}
                      className="p-3 rounded border border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    >
                      <div className="text-sm text-slate-700 dark:text-gray-300">
                        {fb.comment}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {fb.fromName || "Supervisor"} —{" "}
                        {new Date(fb.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right: Deadlines & Links & Invitations */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Upcoming Deadlines
                </h3>
                <Clock className="w-5 h-5 text-[#7b1e3c]" />
              </div>

              {deadlines.length === 0 ? (
                <div className="text-slate-500">No deadlines configured.</div>
              ) : (
                <ul className="space-y-3">
                  {deadlines.slice(0, 6).map((d) => (
                    <li key={d._id || d.id} className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#7b1e3c] mt-1" />
                      <div>
                        <div className="text-sm text-slate-900 dark:text-white">
                          {d.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">
                          {d.dueDate
                            ? new Date(d.dueDate).toLocaleDateString()
                            : d.date}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Upcoming Meetings
                </h3>
                <Clock className="w-5 h-5 text-[#7b1e3c]" />
              </div>

              {loading ? (
                <div className="text-slate-500">Loading meetings...</div>
              ) : meetings.length === 0 ? (
                <div className="text-slate-500">No upcoming meetings.</div>
              ) : (
                <div className="space-y-3">
                  {meetings
                    .filter((meeting) => {
                      const meetingDateTime = new Date(
                        `${meeting.date}T${meeting.time}`
                      );
                      return (
                        meetingDateTime >= new Date() &&
                        meeting.status === "scheduled"
                      );
                    })
                    .map((meeting) => (
                      <div
                        key={meeting._id}
                        className="p-3 rounded border border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {meeting.title}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                          {meeting.supervisorName} •{" "}
                          {new Date(
                            `${meeting.date}T${meeting.time}`
                          ).toLocaleString()}
                        </div>
                        {meeting.meetingLink && (
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#7b1e3c] hover:underline text-sm flex items-center gap-1 mt-2"
                          >
                            <Video className="w-4 h-4" />
                            Join Meeting
                          </a>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* NEW: Group Invitations */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Group Invitations
              </h3>

              {loadingInvites ? (
                <div className="text-slate-500">Loading invitations…</div>
              ) : joinRequests.length === 0 ? (
                <div className="text-slate-500">No invitations yet.</div>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {joinRequests
                    .slice() // copy to avoid mutating
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((req) => (
                      <li
                        key={req._id}
                        className="p-3 rounded border border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        <div className="font-medium text-slate-900 dark:text-white">
                          {req.groupName || "Unnamed Group"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">
                          Invited by {req.invitedByName || "Group Admin"} •{" "}
                          {req.date ? new Date(req.date).toLocaleString() : ""}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            disabled={actingInviteId === String(req._id)}
                            onClick={() => acceptInvite(req)}
                            className="flex-1 px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                            title="Join this group"
                          >
                            {actingInviteId === String(req._id)
                              ? "Working…"
                              : "Accept"}
                          </button>
                          <button
                            disabled={actingInviteId === String(req._id)}
                            onClick={() => rejectInvite(req)}
                            className="flex-1 px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                            title="Reject this invitation"
                          >
                            {actingInviteId === String(req._id)
                              ? "Working…"
                              : "Reject"}
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}

              {joinRequests.length > 0 && (
                <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
                  Accepting an invite will add you to that group and remove all
                  other invitations. The group admin will be notified.
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Quick Links
              </h3>
              <div className="flex flex-col gap-2">
                <Link to="/supervisors">
                  <button className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                    View Supervisors
                  </button>
                </Link>

                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 w-full"
                >
                  <Calendar className="w-4 h-4" />
                  Meeting Schedules
                </button>
                <button
                  onClick={gotoSearchPapers}
                  className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Search Papers
                </button>
                <button
                  onClick={gotoSavedPapers}
                  className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Saved Papers
                </button>
                <Link
                  to={findGroupHref}
                  className={`text-left px-3 py-2 rounded ${
                    currentUser?._id
                      ? "hover:bg-slate-50 dark:hover:bg-slate-700"
                      : "text-slate-400 cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (!currentUser?._id) e.preventDefault();
                  }}
                >
                  Find Groupmates
                </Link>
                <Link
                  to="/profile"
                  className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Manage Profile
                </Link>
                <Link
                  to="/faqs"
                  className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  FAQs
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
      {/* Meeting Modal */}
      {showMeetingModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Meeting Schedules
              </h2>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto max-h-96">
              {meetingModalLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Loading meetings...
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No meetings scheduled
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.map((meeting) => {
                    const meetingDateTime = new Date(
                      `${meeting.date}T${meeting.time}`
                    );
                    const isUpcoming = meetingDateTime >= new Date();
                    const isPast = meetingDateTime < new Date();

                    return (
                      <div
                        key={meeting._id}
                        className={`p-4 rounded-lg border ${
                          isPast
                            ? "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700"
                            : "border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {meeting.title}
                            </h3>
                            <div className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                              <div>
                                Date: {meetingDateTime.toLocaleDateString()}
                              </div>
                              <div>
                                Time: {meetingDateTime.toLocaleTimeString()}
                              </div>
                              <div>Supervisor: {meeting.supervisorName}</div>
                              <div>Group: {meeting.groupName}</div>
                            </div>

                            <div className="mt-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  meeting.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : meeting.status === "cancelled"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    : isPast
                                    ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                }`}
                              >
                                {meeting.status === "completed"
                                  ? "Completed"
                                  : meeting.status === "cancelled"
                                  ? "Cancelled"
                                  : isPast
                                  ? "Past"
                                  : "Upcoming"}
                              </span>
                            </div>
                          </div>

                          {meeting.meetingLink &&
                            isUpcoming &&
                            meeting.status === "scheduled" && (
                              <a
                                href={meeting.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 px-3 py-2 bg-[#7b1e3c] text-white rounded hover:bg-[#651730] text-sm flex items-center gap-1"
                              >
                                <Video className="w-4 h-4" />
                                Join
                              </a>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentDashboard;
