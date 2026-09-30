import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const Recommended = () => {
  const { dbUser: mongoUser, loading: userLoading } = useContext(UserContext);
  const USER_ID = mongoUser?._id;

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");

  const [recommendations, setRecommendations] = useState([]);

  // Fetch the user's group (as member first, then as admin)
  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      setError("");
      try {
        let res = await fetch(`${API_BASE}/groups/by-member/${USER_ID}`);
        if (res.ok) {
          const g = await res.json();
          setGroup(g || null);
        } else {
          res = await fetch(`${API_BASE}/groups/by-admin/${USER_ID}`);
          if (res.ok) {
            const g = await res.json();
            setGroup(g || null);
          } else {
            setGroup(null);
          }
        }
      } catch (e) {
        console.error("Recommended -> fetchGroup error:", e);
        setError("Failed to load group info.");
      } finally {
        setLoading(false);
      }
    };
    if (!userLoading) {
      if (USER_ID) {
        fetchGroup();
      } else {
        setLoading(false);
        setError("User not found.");
      }
    }
  }, [USER_ID, userLoading]);

  // Derive recommendations when group changes (no useMemo)
  useEffect(() => {
    const list = Array.isArray(group?.recommendedFeatures)
      ? group.recommendedFeatures
      : [];

    // De-dupe by paperId/link/title
    const seen = new Set();
    const deduped = list.filter((p) => {
      const id = p.paperId || p.link || p.title;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    setRecommendations(deduped);
  }, [group]);

  const showLoading = loading || userLoading;

  return (
    <section className="p-6 min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Recommended Papers
          </h1>
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
            Papers your supervisor has shared with your group
            {group?.name ? ` (${group.name})` : ""}.
          </p>
        </header>

        {showLoading && (
          <div className="text-slate-600 dark:text-gray-300">
            Loading recommendations…
          </div>
        )}

        {!showLoading && error && (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        )}

        {!showLoading && !error && !group && (
          <div className="text-slate-600 dark:text-gray-300">
            You’re not in a group yet, so there are no recommendations to show.
          </div>
        )}

        {!showLoading && !error && group && recommendations.length === 0 && (
          <div className="text-slate-600 dark:text-gray-300">
            No papers have been recommended to your group yet.
          </div>
        )}

        {!showLoading && !error && recommendations.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((paper) => (
              <li
                key={paper.paperId || paper.link || paper.title}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {paper.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                  Authors:{" "}
                  {Array.isArray(paper.authors) && paper.authors.length > 0
                    ? paper.authors.join(", ")
                    : "Unknown"}
                </p>
                {paper.summary && (
                  <p className="text-sm text-slate-700 dark:text-gray-300 mt-2">
                    {paper.summary}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7b1e3c] hover:underline"
                  >
                    View Paper
                  </a>
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    Recommended on{" "}
                    {paper.recommendedAt
                      ? new Date(paper.recommendedAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default Recommended;
