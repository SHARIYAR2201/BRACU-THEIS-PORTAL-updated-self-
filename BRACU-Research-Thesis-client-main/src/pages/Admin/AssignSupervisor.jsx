import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  XCircle,
  FileText,
  Tag,
  Link as LinkIcon,
  Users,
  Calendar as CalendarIcon,
} from "lucide-react";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const statusBadge = (status = "Pending") => {
  const common = "px-2 py-1 rounded-full text-xs font-medium";
  if (status === "Approved") return `${common} bg-green-100 text-green-800`;
  if (status === "Rejected") return `${common} bg-red-100 text-red-800`;
  return `${common} bg-yellow-100 text-yellow-800`;
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const AssignSupervisor = () => {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All"); // All | Pending | Approved | Rejected
  const [proposals, setProposals] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState("");

  // Modal state for semester-wise assignment
  const [semModalOpen, setSemModalOpen] = useState(false);
  const [semModalProposal, setSemModalProposal] = useState(null);
  const [upcomingSemesters, setUpcomingSemesters] = useState([]);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  // For capacity preview in modal
  const [allGroups, setAllGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const fetchProposals = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${API_BASE}/proposals?status=Pending`;
      if (tab === "Approved" || tab === "Rejected") {
        url = `${API_BASE}/proposals?status=${tab}`;
      } else if (tab === "All") {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          fetch(`${API_BASE}/proposals?status=Pending`),
          fetch(`${API_BASE}/proposals?status=Approved`),
          fetch(`${API_BASE}/proposals?status=Rejected`),
        ]);
        const [pending, approved, rejected] = await Promise.all([
          pendingRes.ok ? pendingRes.json() : [],
          approvedRes.ok ? approvedRes.json() : [],
          rejectedRes.ok ? rejectedRes.json() : [],
        ]);
        setProposals(
          [...pending, ...approved, ...rejected].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        setLoading(false);
        return;
      }

      const res = await fetch(url);
      const data = res.ok ? await res.json() : [];
      setProposals(
        (data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (e) {
      console.error(e);
      setError("Failed to load proposals");
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // small counts for the tabs
  const [counts, setCounts] = useState({
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  });
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/proposals?status=Pending`),
      fetch(`${API_BASE}/proposals?status=Approved`),
      fetch(`${API_BASE}/proposals?status=Rejected`),
    ])
      .then(async ([a, b, c]) => {
        const [ap, bp, cp] = await Promise.all([
          a.ok ? a.json() : [],
          b.ok ? b.json() : [],
          c.ok ? c.json() : [],
        ]);
        setCounts({
          Pending: ap.length,
          Approved: bp.length,
          Rejected: cp.length,
        });
      })
      .catch(() => {});
  }, []);

  // ----- Semester-wise assignment helpers -----

  const openSemesterModal = async (proposal) => {
    setSemModalProposal(proposal);
    setSelectedSemesterId(null);
    setSemModalOpen(true);

    // Fetch upcoming semesters (server already excludes "current")
    setSemestersLoading(true);
    try {
      const r = await fetch(`${API_BASE}/semesters/upcoming`);
      const arr = r.ok ? await r.json() : [];
      setUpcomingSemesters(Array.isArray(arr) ? arr : []);
    } catch {
      setUpcomingSemesters([]);
    } finally {
      setSemestersLoading(false);
    }

    // Fetch all groups once for capacity preview
    setGroupsLoading(true);
    try {
      const g = await fetch(`${API_BASE}/groups`);
      const gj = g.ok ? await g.json() : [];
      setAllGroups(Array.isArray(gj) ? gj : []);
    } catch {
      setAllGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const closeSemesterModal = () => {
    setSemModalOpen(false);
    setSemModalProposal(null);
    setSelectedSemesterId(null);
  };

  // Compute how many groups are already assigned to this supervisor for each semester
  const capacityBySemester = useMemo(() => {
    if (!semModalProposal || !allGroups.length) return {};
    const supId = String(semModalProposal.supervisor);
    const map = {};
    for (const g of allGroups) {
      if (String(g.assignedSupervisor) !== supId) continue;
      const sid = g.assignedSemester ? String(g.assignedSemester) : null;
      if (!sid) continue;
      map[sid] = (map[sid] || 0) + 1;
    }
    return map; // { semesterId: count }
  }, [semModalProposal, allGroups]);

  const MAX_PER_SEM = 8;

  const assignSupervisor = async (proposalId, semesterId) => {
    if (!proposalId) return;
    if (!semesterId) {
      alert("Please select a semester");
      return;
    }

    if (
      !confirm(
        "Assign this proposal’s supervisor to the selected semester for this group? This will remove all other proposals from that group."
      )
    ) {
      return;
    }

    try {
      setAssigningId(proposalId);
      const res = await fetch(`${API_BASE}/admin/assign-supervisor`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, semesterId }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(j.message || "Failed to assign supervisor");
      }

      // refresh lists
      await fetchProposals();
      alert(j.message || "Supervisor assigned and notifications sent.");
      closeSemesterModal();
    } catch (e) {
      alert(e.message || "Failed to assign supervisor");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <section className="min-h-screen bg-white dark:bg-slate-900 p-6 transition-colors">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Manage Proposals & Assign Supervisors
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            View proposals by status. Assign the proposed supervisor to a{" "}
            <span className="font-semibold">specific upcoming semester</span>{" "}
            with one click.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["All", "Pending", "Approved", "Rejected"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg border text-sm ${
                tab === t
                  ? "bg-[#7b1e3c] text-white border-[#7b1e3c]"
                  : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-700 dark:text-gray-300"
              }`}
            >
              {t}
              {t !== "All" && (
                <span className="ml-2 text-xs opacity-80">
                  {t === "Pending"
                    ? counts.Pending
                    : t === "Approved"
                    ? counts.Approved
                    : counts.Rejected}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {loading ? (
            <div className="p-6 text-slate-600 dark:text-gray-300">
              Loading…
            </div>
          ) : error ? (
            <div className="p-6 text-rose-600 dark:text-rose-300">{error}</div>
          ) : proposals.length === 0 ? (
            <div className="p-6 text-slate-600 dark:text-gray-300">
              No proposals found.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-slate-700">
              {proposals.map((p) => {
                return (
                  <li key={p._id} className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Left: main info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-[#7b1e3c]" />
                          <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                            {p.title}
                          </h3>
                        </div>

                        <div className="text-xs text-slate-500 dark:text-gray-400 mb-2">
                          Group:{" "}
                          <span className="font-medium">
                            {p.groupName || "Unknown Group"}
                          </span>{" "}
                          •
                          <span className="ml-2">
                            Submitted{" "}
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Domain tags */}
                        {Array.isArray(p.domain) && p.domain.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {p.domain.map((d) => (
                              <span
                                key={`${p._id}-${d}`}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-[#7b1e3c]/10 text-[#7b1e3c]"
                              >
                                <Tag className="w-3 h-3" />
                                {d}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-sm text-slate-700 dark:text-gray-300 mb-2">
                          {p.abstract}
                        </p>

                        <div className="flex items-center gap-3 text-xs">
                          <span className={statusBadge(p.status)}>
                            {p.status}
                          </span>
                          {p.driveLink && (
                            <a
                              href={p.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#7b1e3c] hover:underline"
                            >
                              <LinkIcon className="w-3 h-3" />
                              Drive link
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Right: meta + actions */}
                      <div className="w-full md:w-72 shrink-0">
                        <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900">
                          <div className="text-xs text-slate-500 dark:text-gray-400 mb-1">
                            Proposed Supervisor
                          </div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {p.supervisorName ||
                              p.supervisorEmail ||
                              p.supervisor}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                            {p.supervisorEmail}
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-slate-500 dark:text-gray-400 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Group: {p.groupName || "Unknown"}
                        </div>

                        {/* Admin action */}
                        <div className="mt-4 flex gap-2">
                          {p.status === "Pending" ? (
                            <button
                              disabled={assigningId === p._id}
                              onClick={() => openSemesterModal(p)}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                              title="Assign this proposed supervisor to a semester for the group"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {assigningId === p._id
                                ? "Assigning…"
                                : "Assign (Pick Semester)"}
                            </button>
                          ) : p.status === "Approved" ? (
                            <span className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-800">
                              <CheckCircle className="w-4 h-4" />
                              Already Assigned
                            </span>
                          ) : (
                            <span className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-100 text-red-800">
                              <XCircle className="w-4 h-4" />
                              Rejected (via Supervisor)
                            </span>
                          )}
                        </div>

                        {p.status === "Pending" && (
                          <div className="mt-2">
                            <button
                              onClick={async () => {
                                if (!confirm("Mark this proposal as Rejected?"))
                                  return;
                                try {
                                  const res = await fetch(
                                    `${API_BASE}/proposals/${p._id}/decision`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        supervisorId: p.supervisor,
                                        decision: "reject",
                                      }),
                                    }
                                  );
                                  if (!res.ok) {
                                    const j = await res
                                      .json()
                                      .catch(() => ({}));
                                    throw new Error(
                                      j.message || "Failed to reject"
                                    );
                                  }
                                  fetchProposals();
                                } catch (err) {
                                  alert(err.message);
                                }
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject (via Sup Endpoint)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Semester selection modal */}
      {semModalOpen && semModalProposal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Assign to Upcoming Semester
              </h3>
              <button
                onClick={closeSemesterModal}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Proposal:{" "}
                <span className="font-medium">{semModalProposal.title}</span>
              </div>

              {semestersLoading || groupsLoading ? (
                <div className="py-6 text-slate-600 dark:text-slate-300">
                  Loading semesters…
                </div>
              ) : upcomingSemesters.length === 0 ? (
                <div className="py-6 text-slate-600 dark:text-slate-300">
                  No upcoming semesters available.
                </div>
              ) : (
                <ul className="space-y-2">
                  {upcomingSemesters.map((s) => {
                    const sid = String(s._id || s.id);
                    const taken = capacityBySemester[sid] || 0;
                    const left = Math.max(0, MAX_PER_SEM - taken);
                    const full = left <= 0;

                    return (
                      <li
                        key={sid}
                        className={`p-3 rounded-lg border ${
                          selectedSemesterId === sid
                            ? "border-[#7b1e3c] bg-[#7b1e3c]/5"
                            : "border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="semester"
                            value={sid}
                            disabled={full}
                            checked={selectedSemesterId === sid}
                            onChange={() => setSelectedSemesterId(sid)}
                            className="mt-1"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 dark:text-white capitalize">
                                {s.season} {s.year}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  full
                                    ? "bg-red-100 text-red-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {full
                                  ? "Full (0 left)"
                                  : `${left} of ${MAX_PER_SEM} slots left`}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-1">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              {formatDate(s.startDate)} —{" "}
                              {formatDate(s.endDate)}
                            </div>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={closeSemesterModal}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  assignSupervisor(semModalProposal._id, selectedSemesterId)
                }
                disabled={
                  assigningId === semModalProposal._id ||
                  !selectedSemesterId ||
                  (capacityBySemester[selectedSemesterId] || 0) >= MAX_PER_SEM
                }
                className="flex-1 px-4 py-2 rounded-lg bg-[#7b1e3c] text-white hover:bg-[#691832] disabled:opacity-60"
              >
                {assigningId === semModalProposal._id
                  ? "Assigning…"
                  : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AssignSupervisor;
