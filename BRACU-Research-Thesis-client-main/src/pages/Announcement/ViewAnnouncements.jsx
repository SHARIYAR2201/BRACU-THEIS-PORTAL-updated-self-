import React, { useEffect, useState } from "react";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const ViewAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_BASE}/announcements`);
        if (!res.ok) throw new Error("Failed to fetch announcements");
        const data = await res.json();
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) return <p className="p-4">Loading announcements...</p>;

  if (announcements.length === 0)
    return <p className="p-4">No announcements available.</p>;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
          Announcements
        </h1>
        <div className="space-y-6">
          {announcements.map((a) => (
            <div
              key={a._id}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {a.title}
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                Posted on {new Date(a.createdAt).toLocaleDateString()}
              </p>
              <p className="text-slate-700 dark:text-gray-300 whitespace-pre-line">
                {a.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewAnnouncements;
