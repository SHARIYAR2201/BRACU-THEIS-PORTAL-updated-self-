import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const Searchpaper = () => {
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState([]);
  const [randomPapers, setRandomPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [bookmarkedPapers, setBookmarkedPapers] = useState([]); // only for students

  // Recommend modal state
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState("");
  const [recommendingGroupId, setRecommendingGroupId] = useState(null);
  // Track which groups a given paper has been recommended to: { [paperId]: string[] }
  const [recommendedForPaper, setRecommendedForPaper] = useState({});

  const { dbUser: User } = useContext(UserContext);
  const USER_ID = User?._id;
  const role = User?.role;
  const isStudent = role === "student";
  const isSupervisor = role === "supervisor";

  // Fetch 5 random papers on mount and bookmarks for students
  useEffect(() => {
    const fetchRandomPapers = async () => {
      try {
        const res = await fetch(`${API_BASE}/random-papers`);
        const data = await res.json();
        setRandomPapers(data || []);
      } catch (err) {
        console.error("Error fetching random papers:", err);
      }
    };

    const fetchBookmarkedPapers = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${USER_ID}/bookmarks`);
        const data = await res.json();
        setBookmarkedPapers((data || []).map((paper) => paper.paperId));
      } catch (err) {
        console.error("Error fetching bookmarked papers:", err);
      }
    };

    fetchRandomPapers();
    if (USER_ID && isStudent) fetchBookmarkedPapers();
  }, [USER_ID, isStudent]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/search-papers?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setPapers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch papers");
    }
    setLoading(false);
  };

  const bookmarkPaper = useCallback(async (paper) => {
    if (!isStudent) return;
    try {
      setSavingId(paper.id);
      const payload = {
        paperId: paper.id,
        title: paper.title,
        authors: paper.authors || [],
        summary: paper.summary || "",
        link: paper.link,
      };

      const res = await fetch(`${API_BASE}/users/${USER_ID}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || "Failed to save bookmark");
      }

      setBookmarkedPapers((prev) => [...prev, paper.id]);
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingId(null);
    }
  }, [USER_ID, isStudent]);

  // Open modal and load groups assigned to this supervisor
  const recommendPaper = useCallback(async (paper) => {
    if (!isSupervisor) return;
    setSelectedPaper(paper);
    setGroups([]);
    setGroupsError("");
    setShowRecommendModal(true);

    if (!USER_ID) {
      setGroupsError("Supervisor not found.");
      return;
    }

    try {
      setGroupsLoading(true);
      const res = await fetch(`${API_BASE}/groups`);
      const data = res.ok ? await res.json() : [];
      const mine = Array.isArray(data)
        ? data.filter((g) => String(g.assignedSupervisor) === String(USER_ID))
        : [];
      setGroups(mine);
    } catch (e) {
      console.error("Error loading groups:", e);
      setGroupsError("Failed to load groups.");
    } finally {
      setGroupsLoading(false);
    }
  }, [USER_ID, isSupervisor]);

  // POST recommend to backend
  const recommendToGroup = async (groupId) => {
    if (!isSupervisor || !USER_ID || !selectedPaper) return;
    try {
      setRecommendingGroupId(String(groupId));
      const payload = {
        supervisorId: USER_ID,
        paper: {
          paperId: selectedPaper.id,
          title: selectedPaper.title,
          authors: selectedPaper.authors || [],
          summary: selectedPaper.summary || "",
          link: selectedPaper.link,
        },
      };
      const res = await fetch(`${API_BASE}/groups/${groupId}/recommend-paper`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || "Failed to recommend");
      }

      setRecommendedForPaper((prev) => {
        const pid = selectedPaper.id;
        const prevArr = prev[pid] || [];
        if (prevArr.includes(String(groupId))) return prev;
        return { ...prev, [pid]: [...prevArr, String(groupId)] };
      });
    } catch (e) {
      alert(e.message);
    } finally {
      setRecommendingGroupId(null);
    }
  };

  const closeRecommendModal = () => {
    setShowRecommendModal(false);
    setSelectedPaper(null);
    setGroups([]);
    setGroupsError("");
  };

  return (
    <div className="p-6 mx-[9%]">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
        Search Academic Papers
      </h2>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Enter keyword or topic"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 flex-grow mr-2 rounded focus:outline-none focus:ring-2 focus:ring-[#7b1e3c]"
        />
        <button
          onClick={handleSearch}
          className="bg-[#7b1e3c] hover:bg-[#691832] text-white px-4 py-2 rounded transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Search Results */}
      {papers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
            Search Results
          </h3>
          {papers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              isStudent={isStudent}
              isSupervisor={isSupervisor}
              isBookmarked={isStudent ? bookmarkedPapers.includes(paper.id) : false}
              savingId={savingId}
              bookmarkPaper={bookmarkPaper}
              recommendPaper={recommendPaper}
            />
          ))}
        </div>
      )}

      {/* Suggested Papers (Random 5) */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
          Suggested Papers
        </h3>
        {randomPapers.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-gray-400">
            No suggestions available.
          </p>
        ) : (
          randomPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              isStudent={isStudent}
              isSupervisor={isSupervisor}
              isBookmarked={isStudent ? bookmarkedPapers.includes(paper.id) : false}
              savingId={savingId}
              bookmarkPaper={bookmarkPaper}
              recommendPaper={recommendPaper}
            />
          ))
        )}
      </div>

      {/* Recommend modal (supervisors only) */}
      {isSupervisor && showRecommendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeRecommendModal}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Recommend Paper
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                  {selectedPaper?.title}
                </p>
              </div>
              <button
                onClick={closeRecommendModal}
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <h4 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">
                Your Groups
              </h4>

              {groupsLoading && (
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Loading groups…
                </p>
              )}
              {groupsError && (
                <p className="text-sm text-red-600">{groupsError}</p>
              )}

              {!groupsLoading && !groupsError && groups.length === 0 && (
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  No groups assigned yet.
                </p>
              )}

              {!groupsLoading && groups.length > 0 && (
                <ul className="divide-y rounded border border-slate-200 dark:border-slate-700">
                  {groups.map((g) => {
                    const already = (
                      recommendedForPaper[selectedPaper?.id] || []
                    ).includes(String(g._id));
                    const isSaving = recommendingGroupId === String(g._id);

                    return (
                      <li
                        key={g._id}
                        className="p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {g.name}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
                            Members: {(g.members || []).length} • Interests:{" "}
                            {(g.researchInterests || []).join(", ") || "—"}
                          </div>
                        </div>
                        <button
                          className={`px-3 py-1.5 text-sm rounded transition-colors ${
                            already
                              ? "bg-slate-300 text-slate-600 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400"
                              : "bg-[#7b1e3c] hover:bg-[#691832] text-white"
                          }`}
                          disabled={already || isSaving}
                          onClick={() => recommendToGroup(g._id)}
                        >
                          {already
                            ? "Recommended"
                            : isSaving
                            ? "Saving..."
                            : "Choose"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={closeRecommendModal}
                className="px-4 py-2 rounded border border-[#7b1e3c] text-[#7b1e3c] hover:bg-[#7b1e3c] hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaperCard = React.memo(({ paper, isStudent, isSupervisor, isBookmarked, savingId, bookmarkPaper, recommendPaper }) => {
  return (
    <div className="border border-gray-200 dark:border-slate-700 p-4 mb-2 rounded bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {paper.title}
      </h3>
      <p className="text-sm text-slate-700 dark:text-gray-300">
        Authors: {(paper.authors && paper.authors.join(", ")) || "Unknown"}
      </p>
      <p className="text-sm mt-2 text-slate-800 dark:text-gray-200">
        {paper.summary}
      </p>
      <div className="flex items-center gap-4 mt-2">
        <a
          href={paper.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#7b1e3c] hover:underline"
        >
          View Paper
        </a>

        {isStudent && (
          <button
            onClick={() => bookmarkPaper(paper)}
            disabled={savingId === paper.id || isBookmarked}
            className="bg-[#7b1e3c] hover:bg-[#691832] text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBookmarked
              ? "Bookmarked"
              : savingId === paper.id
              ? "Saving..."
              : "Bookmark"}
          </button>
        )}

        {isSupervisor && (
          <button
            onClick={() => recommendPaper(paper)}
            className="bg-[#7b1e3c] hover:bg-[#691832] text-white px-3 py-1 rounded transition-colors"
          >
            Recommend Paper
          </button>
        )}
      </div>
    </div>
  );
});

PaperCard.displayName = "PaperCard";

export default Searchpaper;
