import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";
import {
  FileText,
  ExternalLink,
  User,
  Calendar,
  Tag,
  MessageSquare,
} from "lucide-react";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const ViewProposals = () => {
  const { dbUser: currentUser } = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [supervisorMap, setSupervisorMap] = useState({});
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState("");

  // Fetch the student's group
  useEffect(() => {
    const fetchGroup = async () => {
      if (!currentUser?._id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/groups/by-member/${currentUser._id}`
        );
        if (res.status === 404) {
          setGroup(null);
          setProposals([]);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch group");
        const g = await res.json();
        setGroup(g);
      } catch (e) {
        console.error(e);
        setError("Could not load your group.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [currentUser?._id]);

  // Fetch supervisors mapping (id → name/email)
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const res = await fetch(`${API_BASE}/supervisors`);
        if (!res.ok) throw new Error("Failed to fetch supervisors");
        const list = await res.json();
        const map = {};
        list.forEach((s) => {
          map[String(s._id)] = s.name || s.email || "Supervisor";
        });
        setSupervisorMap(map);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSupervisors();
  }, []);

  // Fetch all proposals for this group
  useEffect(() => {
    const fetchProposalsForGroup = async () => {
      if (!group?._id) return;
      setLoading(true);
      setError("");

      try {
        const supIds = Array.isArray(group.proposalsSubmittedTo)
          ? group.proposalsSubmittedTo
          : [];

        if (supIds.length === 0) {
          setProposals([]);
          setLoading(false);
          return;
        }

        const requests = supIds.map((sid) =>
          fetch(`${API_BASE}/proposals?supervisorId=${sid}`)
        );
        const responses = await Promise.allSettled(requests);

        let allProposals = [];
        for (const r of responses) {
          if (r.status === "fulfilled" && r.value.ok) {
            const arr = await r.value.json();
            allProposals = allProposals.concat(arr);
          }
        }

        const myGroupId = String(group._id);
        const filtered = allProposals.filter(
          (p) => String(p.groupId) === myGroupId
        );

        // Remove duplicates
        const seen = new Set();
        const deduped = [];
        filtered.forEach((p) => {
          const id = String(p._id);
          if (!seen.has(id)) {
            seen.add(id);
            deduped.push(p);
          }
        });

        deduped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setProposals(deduped);
      } catch (e) {
        console.error(e);
        setError("Failed to load proposals.");
      } finally {
        setLoading(false);
      }
    };

    fetchProposalsForGroup();
  }, [group?._id, group?.proposalsSubmittedTo]);

  return (
    <section className="min-h-screen bg-white dark:bg-slate-900 transition-colors px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Your Group’s Proposals
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            View every proposal your group has submitted, along with status,
            feedback, and links.
          </p>
        </div>

        {loading ? (
          <div className="text-slate-600 dark:text-gray-400">Loading…</div>
        ) : !group ? (
          <div className="p-5 rounded-lg border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-gray-300">
            You’re not currently a member of any group.
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-500 dark:text-gray-400">
                    Group
                  </div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {group.name}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {proposals.length === 0 ? (
              <div className="p-5 rounded-lg border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-gray-300">
                No proposals submitted yet.
              </div>
            ) : (
              <ul className="space-y-4">
                {proposals.map((p) => {
                  const supName =
                    supervisorMap[String(p.supervisor)] || "Supervisor";
                  const created = p.createdAt ? new Date(p.createdAt) : null;
                  return (
                    <li
                      key={p._id}
                      className="p-5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-5 h-5 text-[#7b1e3c]" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                              {p.title}
                            </h3>
                          </div>

                          <p className="text-sm text-slate-700 dark:text-gray-300 mb-3">
                            {p.abstract}
                          </p>

                          {Array.isArray(p.domain) && p.domain.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Tag className="w-4 h-4 text-slate-500" />
                              {p.domain.map((d, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-200"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-gray-400 mb-2">
                            <span className="inline-flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {supName}
                            </span>
                            {created && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {created.toLocaleString()}
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
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

                          {/* Supervisor feedback */}
                          {Array.isArray(p.feedback) &&
                            p.feedback.length > 0 && (
                              <div className="mt-2 p-3 rounded-md bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600">
                                <div className="flex items-center gap-2 mb-1 font-medium">
                                  <MessageSquare className="w-4 h-4 text-[#7b1e3c]" />
                                  Supervisor Feedback
                                </div>
                                {p.feedback.map((f, idx) => (
                                  <div key={idx} className="mb-2">
                                    <p>{f.text}</p>
                                    {f.date && (
                                      <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                        Given on:{" "}
                                        {new Date(f.date).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {p.driveLink && (
                            <a
                              href={p.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-[#7b1e3c] hover:underline"
                            >
                              Drive <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        <div className="mt-8">
          <Link
            to="/student-dashboard"
            className="text-[#7b1e3c] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ViewProposals;
