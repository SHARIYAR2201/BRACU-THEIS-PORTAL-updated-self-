import React, { useState, useEffect, useContext, useMemo } from "react";
import { NavLink, useParams } from "react-router";
import { AuthContext } from "../../contexts/Auth/AuthContext";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const FindGroup = () => {
  const { user } = useContext(AuthContext); // Firebase user (login gate only)
  const { id: routeUserId } = useParams(); // Mongo user _id in URL, e.g. /find-group/:id

  // Mongo user doc for the currently logged-in person
  const [dbUser, setDbUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // All groups
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Per-card request state (student -> group)
  const [requesting, setRequesting] = useState({}); // { [groupId]: boolean }

  // --- Invite flow state (admin -> student) ---
  const [searchId, setSearchId] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // --- Admin: incoming join requests for my group ---
  const [adminRequests, setAdminRequests] = useState([]); // [{ studentId, name, email, studentIdStr, requestedAt }]
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [acting, setActing] = useState({}); // { [studentId]: boolean } while accepting/rejecting

  // Load Mongo user by :id
  useEffect(() => {
    let ignore = false;
    const loadUser = async () => {
      setLoadingUser(true);
      try {
        if (!routeUserId) {
          setDbUser(null);
          return;
        }
        const res = await fetch(`${API_BASE}/users/${routeUserId}`);
        if (!res.ok) {
          setDbUser(null);
          return;
        }
        const data = await res.json();
        if (!ignore) setDbUser(data);
      } catch (e) {
        console.error("Failed to load user:", e);
        if (!ignore) setDbUser(null);
      } finally {
        if (!ignore) setLoadingUser(false);
      }
    };
    loadUser();
    return () => {
      ignore = true;
    };
  }, [routeUserId]);

  // Load all groups
  useEffect(() => {
    let ignore = false;
    const loadGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await fetch(`${API_BASE}/groups`);
        const data = res.ok ? await res.json() : [];
        if (!ignore) setGroups(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load groups:", e);
        if (!ignore) setGroups([]);
      } finally {
        if (!ignore) setLoadingGroups(false);
      }
    };
    loadGroups();
    return () => {
      ignore = true;
    };
  }, []);

  // Derived ids / flags
  const myId = useMemo(
    () => (dbUser?._id ? String(dbUser._id) : null),
    [dbUser?._id]
  );

  // Find the group (if any) where I am the admin (creator)
  const myAdminGroup = useMemo(
    () => (myId ? groups.find((g) => String(g.admin) === myId) : null),
    [groups, myId]
  );

  // Is the current user already in ANY group (as admin or member)?
  const iAmInAnyGroup = useMemo(() => {
    if (!myId) return false;
    return groups.some(
      (g) =>
        String(g.admin) === myId ||
        (Array.isArray(g.members) && g.members.some((m) => String(m) === myId))
    );
  }, [groups, myId]);

  // Per-group derived state
  const joinableState = (g) => {
    const adminId = String(g.admin);
    const isAdmin = myId && adminId === myId;

    const membersArr = Array.isArray(g.members) ? g.members : [];
    const isMember = myId && membersArr.some((m) => String(m) === myId);

    const full = membersArr.length >= (g.maxMembers || 5);

    return { isAdmin, isMember, full };
  };

  // -------- Student -> Group: Send join request (no instant join) --------
  const sendJoinRequestToGroup = async (groupId) => {
    if (!myId) return;
    setRequesting((p) => ({ ...p, [groupId]: true }));
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/request-join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: myId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to send join request");
      }
      alert("Join request sent to the group admin!");
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to send join request");
    } finally {
      setRequesting((p) => ({ ...p, [groupId]: false }));
    }
  };

  // --- Helpers for invite flow (admin -> student) ---
  const checkMembershipLocal = (studentMongoId) => {
    const sid = String(studentMongoId);
    return groups.some(
      (g) =>
        String(g.admin) === sid ||
        (Array.isArray(g.members) && g.members.some((m) => String(m) === sid))
    );
  };

  const checkMembershipAPI = async (studentMongoId) => {
    // Prefer backend, but fallback to local if endpoint doesn’t exist
    try {
      const res = await fetch(
        `${API_BASE}/groups/check-membership/${studentMongoId}`
      );
      if (res.ok) {
        const j = await res.json();
        return Boolean(j?.inGroup);
      }
    } catch {
      // ignore
    }
    return checkMembershipLocal(studentMongoId);
  };

  // Search student by studentId and ensure they’re not already in a group
  const searchStudent = async () => {
    setSearchError("");
    setSearchedUser(null);
    if (!searchId.trim()) {
      setSearchError("Please enter a student ID.");
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `${API_BASE}/users/by-studentId/${encodeURIComponent(searchId.trim())}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Student not found.");
      }
      if (data?.role !== "student") {
        throw new Error("The ID you entered is not a student account.");
      }

      // Check if this student already belongs to any group
      const inGroup = await checkMembershipAPI(data._id);
      if (inGroup) {
        setSearchError("This student already belongs to a group.");
        return;
      }

      setSearchedUser(data);
    } catch (e) {
      setSearchError(e.message || "Failed to search student.");
    } finally {
      setSearching(false);
    }
  };

  // Send invite to the searched user (only for the admin’s own group)
  const sendJoinInvite = async () => {
    if (!searchedUser?._id || !myAdminGroup?._id) return;
    try {
      const res = await fetch(`${API_BASE}/groups/${myAdminGroup._id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: String(searchedUser._id) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to send join request");
      }
      alert("Join request (invite) sent successfully!");
      setSearchedUser(null);
      setSearchId("");
    } catch (e) {
      alert(e.message || "Failed to send join request");
    }
  };

  // -------- Admin: fetch incoming join requests for my group --------
  useEffect(() => {
    const loadRequests = async () => {
      if (!myAdminGroup?._id) {
        setAdminRequests([]);
        return;
      }
      setLoadingRequests(true);
      try {
        const res = await fetch(
          `${API_BASE}/groups/${myAdminGroup._id}/requests`
        );
        const data = res.ok ? await res.json() : [];
        setAdminRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load join requests:", e);
        setAdminRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };
    loadRequests();
  }, [myAdminGroup?._id]);

  // Accept / Reject pending request (FIX: send `decision` to backend)
  const actOnRequest = async (studentId, decision) => {
    if (!myAdminGroup?._id || !studentId) return;
    if (!["accept", "reject"].includes(String(decision))) return;

    setActing((p) => ({ ...p, [studentId]: true }));
    try {
      const res = await fetch(
        `${API_BASE}/groups/${myAdminGroup._id}/requests/${studentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update request");
      }

      if (decision === "accept") {
        alert("Request accepted. Student added to your group.");
        // Update local groups list with returned group if backend responds with it
        if (data.group) {
          setGroups((prev) =>
            prev.map((g) =>
              String(g._id) === String(myAdminGroup._id) ? data.group : g
            )
          );
        }
      } else {
        alert("Request rejected.");
      }

      // Refresh requests after the action
      const r = await fetch(`${API_BASE}/groups/${myAdminGroup._id}/requests`);
      setAdminRequests(r.ok ? await r.json() : []);
    } catch (e) {
      alert(e.message || "Failed to update request");
    } finally {
      setActing((p) => ({ ...p, [studentId]: false }));
    }
  };

  return (
    <section className="px-6 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
            Find Groups
          </h1>
          <p className="text-slate-600 dark:text-gray-300 mt-1">
            Browse existing research groups and join one that matches your
            interests.
          </p>
        </div>

        {/* Create group button */}
        <div>
          {routeUserId && !iAmInAnyGroup ? (
            <NavLink to={`/create-group/${routeUserId}`}>
              <button className="px-4 py-2 rounded-lg bg-[#7b1e3c] text-white hover:bg-[#651730] transition">
                Create Group
              </button>
            </NavLink>
          ) : (
            <button
              className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 dark:bg-slate-700 dark:text-gray-300 cursor-not-allowed"
              disabled
              title={
                !routeUserId
                  ? "User id missing in URL"
                  : "You already belong to a group"
              }
            >
              Create Group
            </button>
          )}
        </div>
      </div>

      {/* Admin-only: invite a student */}
      {dbUser?.role === "student" && myAdminGroup && (
        <div className="mt-6 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-2">
            Invite a Student to{" "}
            <span className="text-[#7b1e3c]">{myAdminGroup.name}</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Student ID (e.g., 22101234)"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#7b1e3c]"
            />
            <button
              onClick={searchStudent}
              disabled={searching || !searchId.trim()}
              className="px-4 py-2 rounded-lg bg-[#7b1e3c] text-white hover:bg-[#651730] transition disabled:opacity-50"
            >
              {searching ? "Searching…" : "Search"}
            </button>
          </div>

          {searchError && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
              {searchError}
            </p>
          )}

          {searchedUser && (
            <div className="mt-4 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {searchedUser.name || "Unnamed"}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-gray-300">
                    Student ID: {searchedUser.studentId || "N/A"}
                  </div>
                  {searchedUser.email && (
                    <div className="text-sm text-slate-600 dark:text-gray-300">
                      {searchedUser.email}
                    </div>
                  )}
                </div>
                <button
                  onClick={sendJoinInvite}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  Send Join Request
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin-only: incoming join requests (students -> your group) */}
      {dbUser?.role === "student" && myAdminGroup && (
        <div className="mt-6 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">
            Join Requests to{" "}
            <span className="text-[#7b1e3c]">{myAdminGroup.name}</span>
          </h2>

          {loadingRequests ? (
            <div className="text-slate-600 dark:text-gray-300">
              Loading requests…
            </div>
          ) : adminRequests.length === 0 ? (
            <div className="text-slate-600 dark:text-gray-300">
              No pending requests right now.
            </div>
          ) : (
            <ul className="space-y-3">
              {adminRequests.map((r) => {
                const sid = String(r.studentId);
                return (
                  <li
                    key={sid}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {r.name || "Unnamed Student"}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-gray-300">
                          Student ID: {r.studentIdStr || "N/A"}
                        </div>
                        {r.email && (
                          <div className="text-sm text-slate-600 dark:text-gray-300">
                            {r.email}
                          </div>
                        )}
                        <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                          Requested on{" "}
                          {r.requestedAt
                            ? new Date(r.requestedAt).toLocaleString()
                            : ""}
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          disabled={acting[sid]}
                          onClick={() => actOnRequest(sid, "accept")}
                          className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                          title="Accept and add to group"
                        >
                          {acting[sid] ? "Working…" : "Accept"}
                        </button>
                        <button
                          disabled={acting[sid]}
                          onClick={() => actOnRequest(sid, "reject")}
                          className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                          title="Reject this request"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Global banner if already in a group (info only; admins can still invite) */}
      {iAmInAnyGroup && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          You already belong to a group. You can’t join or create another group.
        </div>
      )}

      {/* List of groups */}
      <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm">
        {loadingUser || loadingGroups ? (
          <div className="p-6 text-slate-600 dark:text-gray-300">
            Loading groups…
          </div>
        ) : !user ? (
          <div className="p-6 text-amber-700 dark:text-amber-300">
            Please log in to view and request to join groups.
          </div>
        ) : groups.length === 0 ? (
          <div className="p-6 text-slate-600 dark:text-gray-300">
            No groups yet. Be the first to create one!
          </div>
        ) : (
          <ul className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => {
              const gid = String(g._id);
              const { isAdmin, isMember, full } = joinableState(g);

              // Disable “Send Join Request” if: user id not loaded, they’re admin/member, group full,
              // already requesting, or already in some group (can’t join another).
              const disabled =
                !myId ||
                isAdmin ||
                isMember ||
                full ||
                requesting[gid] ||
                iAmInAnyGroup;

              return (
                <li
                  key={gid}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-slate-900 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {g.name}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-200">
                      {Array.isArray(g.members) ? g.members.length : 0}/
                      {g.maxMembers || 5}
                    </span>
                  </div>

                  {/* Interests */}
                  {Array.isArray(g.researchInterests) &&
                    g.researchInterests.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {g.researchInterests.map((tag) => (
                          <span
                            key={`${gid}-${tag}`}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-[#7b1e3c]/10 text-[#7b1e3c]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Status badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {g.assignedSupervisor ? (
                      <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                        Supervisor Assigned
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                        No Supervisor
                      </span>
                    )}
                    {isAdmin && (
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                        You are the Admin
                      </span>
                    )}
                    {isMember && !isAdmin && (
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300">
                        You’re a Member
                      </span>
                    )}
                    {full && !isMember && !isAdmin && (
                      <span className="px-2 py-1 rounded bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300">
                        Group Full
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4">
                    <button
                      onClick={() => sendJoinRequestToGroup(gid)}
                      disabled={disabled}
                      className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg transition 
                        ${
                          disabled
                            ? "bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-gray-400 cursor-not-allowed"
                            : "bg-[#7b1e3c] text-white hover:bg-[#651730]"
                        }`}
                      title={
                        !myId
                          ? "User id not loaded"
                          : iAmInAnyGroup
                          ? "You already belong to a group"
                          : isAdmin
                          ? "You are the admin of this group"
                          : isMember
                          ? "You already joined this group"
                          : full
                          ? "Group is full"
                          : "Send join request to this group"
                      }
                    >
                      {requesting[gid] ? "Sending…" : "Send Join Request"}
                    </button>
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

export default FindGroup;
