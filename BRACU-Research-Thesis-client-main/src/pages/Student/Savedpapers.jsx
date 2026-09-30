import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";

const Savedpapers = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dbUser: User, loading: userLoading } = useContext(UserContext);
  const USER_ID = User?._id;

  // Fetch bookmarks from backend
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://bracu-research-server-eta.vercel.app/users/${USER_ID}/bookmarks`
        );
        if (!res.ok) throw new Error("Failed to fetch bookmarks");
        const data = await res.json();
        setBookmarks(data || []);
      } catch (err) {
        console.error(err);
        alert("Could not load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      if (USER_ID) {
        fetchBookmarks();
      } else {
        setLoading(false);
      }
    }
  }, [USER_ID, userLoading]);

  // Remove bookmark from backend and local state
  const removeBookmark = async (paperId) => {
    if (!window.confirm("Are you sure you want to remove this bookmark?"))
      return;

    try {
      const res = await fetch(
        `https://bracu-research-server-eta.vercel.app/users/${USER_ID}/bookmarks/${encodeURIComponent(
          paperId
        )}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.message || "Failed to remove bookmark");
      }

      // Remove from local state
      setBookmarks((prev) => prev.filter((paper) => paper.paperId !== paperId));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (userLoading || loading) {
    return <p className="p-6 text-gray-700">Loading your saved papers...</p>;
  }

  if (bookmarks.length === 0) {
    return <p className="p-6 text-gray-600">You have no saved papers yet.</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">My Saved Papers</h2>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.map((paper) => (
          <div
            key={paper.paperId}
            className="bg-white border border-gray-200 rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 h-80"
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                {paper.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                Authors:{" "}
                {(paper.authors && paper.authors.join(", ")) || "Unknown"}
              </p>
              <p className="text-gray-700 text-sm line-clamp-5">
                {paper.summary}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <a
                href={paper.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-6 py-3 border border-[#7b1e3c] text-[#7b1e3c] dark:text-[#d08ea3] rounded-lg hover:bg-[#7b1e3c] hover:text-white dark:hover:text-white transition font-medium"
              >
                View Paper
              </a>
              <button
                onClick={() => removeBookmark(paper.paperId)}
                className="flex-1 text-center px-6 py-3 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730] transition font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Savedpapers;
