import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";
import { Users, FileText, Tag } from "lucide-react";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const SupervisorGroups = () => {
  const { dbUser: supervisorUser } = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [groupsById, setGroupsById] = useState({}); // { [groupId]: groupDoc }
  const [acceptedProposals, setAcceptedProposals] = useState([]); // accepted for this supervisor
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccepted = async () => {
      if (!supervisorUser?._id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");

      try {
        // 1) proposals submitted to this supervisor
        const res = await fetch(
          `${API_BASE}/proposals?supervisorId=${supervisorUser._id}`
        );
        if (!res.ok) throw new Error("Failed to fetch proposals");

        const all = await res.json();

        // 2) only accepted
        const accepted = (all || []).filter(
          (p) => p?.status === "Approved" || p?.supervisorapproved === true
        );
        setAcceptedProposals(accepted);

        // 3) unique groupIds from accepted proposals
        const ids = Array.from(
          new Set(
            accepted
              .map((p) => p.groupId)
              .filter(Boolean)
              .map((id) => String(id))
          )
        );

        // 4) fetch each group's details
        const fetchedGroups = {};
        await Promise.all(
          ids.map(async (gid) => {
            try {
              const gRes = await fetch(`${API_BASE}/groups/${gid}`);
              if (gRes.ok) {
                const g = await gRes.json();
                fetchedGroups[gid] = g;
              }
            } catch (e) {
              console.error("Group fetch failed:", gid, e);
            }
          })
        );

        setGroupsById(fetchedGroups);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load accepted proposals");
      } finally {
        setLoading(false);
      }
    };

    fetchAccepted();
  }, [supervisorUser?._id]);

  // proposals grouped by groupId
  const proposalsByGroup = useMemo(() => {
    const map = {};
    for (const p of acceptedProposals) {
      const gid = String(p.groupId);
      if (!map[gid]) map[gid] = [];
      map[gid].push(p);
    }
    return map;
  }, [acceptedProposals]);

  // stable order: by group name
  const orderedGroupIds = useMemo(() => {
    return Object.keys(proposalsByGroup).sort((a, b) => {
      const ga = groupsById[a]?.name?.toLowerCase() ?? "";
      const gb = groupsById[b]?.name?.toLowerCase() ?? "";
      return ga.localeCompare(gb);
    });
  }, [proposalsByGroup, groupsById]);

  return (
    <section className="min-h-screen bg-white dark:bg-slate-900 p-6 transition-colors">
      <div className="container mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Groups You’ve Accepted
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            One row per group with its accepted proposal(s).
          </p>
        </header>

        {loading ? (
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
            <p className="text-slate-600 dark:text-gray-300">Loading…</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-rose-200 dark:border-rose-700 p-6 bg-rose-50 dark:bg-rose-900/20">
            <p className="text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        ) : orderedGroupIds.length === 0 ? (
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
            <p className="text-slate-600 dark:text-gray-300">
              You haven’t accepted any proposals yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {orderedGroupIds.map((gid) => {
              const group = groupsById[gid];
              const groupProps = proposalsByGroup[gid] || [];

              return (
                <li
                  key={gid}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-5"
                >
                  {/* Row top: prominent group summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {group?.name || "Unnamed Group"}
                      </h3>
                      <div className="mt-1 text-sm text-slate-600 dark:text-gray-400">
                        Assigned Supervisor:{" "}
                        <span className="font-medium">You</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300">
                        <Users className="w-4 h-4" />
                        {Array.isArray(group?.members)
                          ? group.members.length
                          : 0}
                        /{group?.maxMembers ?? 5}
                      </span>
                    </div>
                  </div>

                  {/* Research interests */}
                  {Array.isArray(group?.researchInterests) &&
                    group.researchInterests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.researchInterests.map((tag) => (
                          <span
                            key={`${gid}-${tag}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-[#7b1e3c]/10 text-[#7b1e3c]"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Divider */}
                  <div className="my-4 h-px bg-gray-200 dark:bg-slate-700" />

                  {/* Accepted proposal(s) for this group */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-[#7b1e3c]" />
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Accepted Proposal{groupProps.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <ul className="space-y-3">
                      {groupProps.map((p) => (
                        <li
                          key={p._id}
                          className="p-3 rounded border border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {p.title}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-gray-400">
                                {p.createdAt
                                  ? new Date(p.createdAt).toLocaleDateString()
                                  : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                                Approved
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
                          </div>

                          {p.abstract && (
                            <p className="mt-2 text-sm text-slate-700 dark:text-gray-300">
                              {p.abstract}
                            </p>
                          )}

                          {/* Optional: show domains if present */}
                          {Array.isArray(p.domain) && p.domain.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {p.domain.map((d) => (
                                <span
                                  key={`${p._id}-${d}`}
                                  className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-gray-200"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default SupervisorGroups;
