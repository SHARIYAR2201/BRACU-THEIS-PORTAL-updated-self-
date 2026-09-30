import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { FileText, Users, BookOpen, Search } from "lucide-react";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const seasonOrderIndex = (s) => ({ spring: 1, summer: 2, fall: 3 }[s] ?? 0);

const SupervisorDashboard = () => {
  const { user } = useContext(AuthContext);
  // Use UserContext — no more bulk users fetch
  const { dbUser: User } = useContext(UserContext);

  const [proposals, setProposals] = useState([]);
  const [assignedGroups, setAssignedGroups] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derived stats
  const pendingProposalsCount = useMemo(
    () => proposals.filter((p) => p.status === "Pending").length,
    [proposals]
  );
  const assignedGroupsCount = assignedGroups.length;
  const activeThesesCount = assignedGroups.length; // adjust if you track theses separately

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      if (!User?._id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const supervisorId = String(User._id);

      try {
        // Use dedicated endpoints — no more fetching ALL groups
        const [pres, gres, sres] = await Promise.all([
          fetch(`${API_BASE}/proposals?supervisorId=${supervisorId}`, { signal }),
          fetch(`${API_BASE}/groups/by-supervisor/${supervisorId}`, { signal }),
          fetch(`${API_BASE}/admin/semesters`, { signal }),
        ]);

        const pjson = pres.ok ? await pres.json() : [];
        setProposals(Array.isArray(pjson) ? pjson : []);

        // Groups already filtered by the backend
        const gjson = gres.ok ? await gres.json() : [];
        setAssignedGroups(Array.isArray(gjson) ? gjson : []);

        const sjson = sres.ok ? await sres.json() : [];
        const sems = Array.isArray(sjson) ? sjson : [];
        setSemesters(
          sems
            .map((s) => ({
              ...s,
              season: String(s.season || "").toLowerCase(),
            }))
            .sort((a, b) =>
              a.year !== b.year
                ? b.year - a.year
                : seasonOrderIndex(b.season) - seasonOrderIndex(a.season)
            )
        );
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("SupervisorDashboard fetch error:", err);
        setProposals([]);
        setAssignedGroups([]);
        setSemesters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [User?._id]);

  // Build grouping map: by semester id, and fallback by (season|year) snapshot
  const groupsBySemesterKey = useMemo(() => {
    const map = {};
    const add = (key, g) => {
      if (!key) return;
      const k = String(key);
      if (!map[k]) map[k] = [];
      map[k].push(g);
    };

    assignedGroups.forEach((g) => {
      const ss = g.startingSemester || null;

      // Prefer ObjectId path
      const idKey =
        (ss && typeof ss === "object" && ss._id) || // snapshot { _id, ... }
        (typeof ss === "string" || typeof ss === "number" ? ss : null); // just an id stored
      if (idKey) add(`id:${idKey}`, g);

      // Fallback match by season/year snapshot if present
      const season = ss?.season ? String(ss.season).toLowerCase() : null;
      const year = ss?.year ?? null;
      if (season && year) add(`pair:${season}|${year}`, g);
    });

    return map;
  }, [assignedGroups]);

  // Helper to get groups for a specific semester doc
  const getGroupsForSemester = (sem) => {
    const byId = groupsBySemesterKey[`id:${sem._id}`] || [];
    const byPair =
      groupsBySemesterKey[
        `pair:${String(sem.season).toLowerCase()}|${sem.year}`
      ] || [];
    // merge unique
    const seen = new Set();
    const merged = [];
    [...byId, ...byPair].forEach((g) => {
      const id = String(g._id);
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(g);
      }
    });
    return merged;
  };

  // Only show semesters that actually have groups for this supervisor
  const semestersWithGroups = useMemo(
    () => semesters.filter((s) => getGroupsForSemester(s).length > 0),
    [semesters, groupsBySemesterKey]
  );

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

  return (
    <section className="min-h-screen bg-white dark:bg-slate-900 p-6 transition-colors">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Welcome, {user?.name || user?.displayName || "Supervisor"}
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mt-1">
              Manage your students, recommend papers, schedule meetings and
              assign final grades.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full md:w-auto">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow flex items-center gap-3 w-full sm:w-auto sm:min-w-[150px]">
              <Users className="w-6 h-6 text-[#7b1e3c]" />
              <div>
                <div className="text-sm text-slate-600 dark:text-gray-400">
                  Assigned Groups
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {assignedGroupsCount}
                </div>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow flex items-center gap-3 w-full sm:w-auto sm:min-w-[150px]">
              <FileText className="w-6 h-6 text-[#7b1e3c]" />
              <div>
                <div className="text-sm text-slate-600 dark:text-gray-400">
                  Pending Proposals
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {pendingProposalsCount}
                </div>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow flex items-center gap-3 w-full sm:w-auto sm:min-w-[150px]">
              <BookOpen className="w-6 h-6 text-[#7b1e3c]" />
              <div>
                <div className="text-sm text-slate-600 dark:text-gray-400">
                  Active Theses
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {activeThesesCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button className="px-4 py-2 bg-[#7b1e3c] text-white rounded-lg">
            Create Announcement
          </button>
          <Link to="/search">
            <button className="px-4 py-2 border border-[#7b1e3c] text-[#7b1e3c] rounded-lg hover:bg-[#7b1e3c] hover:text-white transition">
              <Search className="inline w-4 h-4 mr-2" /> Search Papers
            </button>
          </Link>

          {/* View Accepted (Assigned) Groups */}
          {/* <Link to="/supervisor-groups">
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              View Accepted Groups
            </button>
          </Link> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Groups by Semester */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Groups by Semester
              </h2>

              {loading ? (
                <div className="text-slate-500">Loading groups…</div>
              ) : semestersWithGroups.length === 0 ? (
                <div className="text-slate-500">
                  No groups assigned to any semester yet.
                </div>
              ) : (
                <div className="space-y-5">
                  {semestersWithGroups.map((s) => {
                    const groups = getGroupsForSemester(s);
                    const title = `${String(s.season)
                      .charAt(0)
                      .toUpperCase()}${String(s.season).slice(1)} ${s.year}`;
                    return (
                      <div
                        key={s._id}
                        className="rounded-lg border border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-gray-400">
                            {formatDate(s.startDate)} — {formatDate(s.endDate)}
                          </div>
                        </div>

                        <ul className="space-y-3">
                          {groups.map((g) => (
                            <li
                              key={g._id}
                              className="p-3 rounded border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white">
                                    {g.name}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                    Members: {(g.members || []).length} •
                                    Interests:{" "}
                                    {(g.researchInterests || []).join(", ") ||
                                      "—"}
                                  </div>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-gray-400">
                                  Max Members: {g.maxMembers || 5}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Meetings placeholder */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Upcoming Meetings
              </h2>
              <div className="text-slate-500">No meetings scheduled.</div>
            </div>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            {/* Proposals submitted to you */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Proposals Submitted to You
                </h3>
                <FileText className="w-5 h-5 text-[#7b1e3c]" />
              </div>

              {loading ? (
                <div className="text-slate-500">Loading proposals...</div>
              ) : proposals.length === 0 ? (
                <div className="text-slate-500">
                  No proposals submitted yet.
                </div>
              ) : (
                <>
                  <ul className="space-y-3 max-h-80 overflow-y-auto">
                    {proposals.map((p) => (
                      <li
                        key={p._id || p.id}
                        className="p-3 rounded border border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {p.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-400 mb-1">
                          {p.groupName || "Unknown Group"} —{" "}
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : ""}
                        </div>
                        <div className="text-sm text-slate-700 dark:text-gray-300 mb-2">
                          {p.abstract}
                        </div>
                        <div className="flex gap-2 text-xs items-center">
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
                              className="text-[#7b1e3c] hover:underline"
                            >
                              Drive Link
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 text-center">
                    <Link
                      to="/view-recieved-proposals"
                      className="inline-block px-4 py-2 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#691832] transition-colors"
                    >
                      View All Proposals
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Theses placeholder */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Theses You Supervise
                </h3>
                <BookOpen className="w-5 h-5 text-[#7b1e3c]" />
              </div>
              <div className="text-slate-500">No supervised theses found.</div>
            </div>

            {/* Quick actions */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-2">
                <Link to="/supervisor-profile">
                  <button className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                    Manage Profile
                  </button>
                </Link>
                <button className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                  Search arXiv
                </button>
                <button className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                  View Recommendations
                </button>
                <Link to="/schedule-meetings">
                  <button className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                    Schedule Meeting
                  </button>
                </Link>
                <Link
                  to="/theses"
                  className="text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  All Theses
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default SupervisorDashboard;
