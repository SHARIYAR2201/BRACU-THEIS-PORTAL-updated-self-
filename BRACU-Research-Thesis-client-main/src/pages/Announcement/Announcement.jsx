import React, { useState, useEffect, useContext } from "react";
import { Plus, Eye, Edit2, Trash2, X } from "lucide-react";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const Announcement = () => {
  const { user } = useContext(AuthContext); // Assuming user.role exists
  const { dbUser: User, loading: userLoading } = useContext(UserContext);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchAnnouncements();
        closeModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/announcements/${selectedAnnouncement._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (res.ok) {
        fetchAnnouncements();
        closeModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;
    try {
      const res = await fetch(`${API_BASE}/announcements/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (edit = false, announcement = null) => {
    setIsEditing(edit);
    if (edit && announcement) {
      setSelectedAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        description: announcement.description,
      });
    } else {
      setFormData({ title: "", description: "" });
      setSelectedAnnouncement(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
    setFormData({ title: "", description: "" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Announcements
          </h1>
          {User?.role === "admin" && (
            <button
              onClick={() => openModal(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730]"
            >
              <Plus size={18} /> New Announcement
            </button>
          )}
        </div>

        {/* Announcements List */}
        {userLoading || loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div
                key={a._id}
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
              >
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {a.title}
                </h2>
                <p className="text-slate-600 dark:text-gray-400">
                  {a.description}
                </p>
                {user?.role === "admin" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openModal(true, a)}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-gray-500">No announcements yet</p>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold">
                {isEditing ? "Edit Announcement" : "New Announcement"}
              </h2>
              <button onClick={closeModal}>
                <X />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Title"
                className="w-full p-2 border rounded"
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            <div className="flex justify-end p-4 border-t dark:border-slate-700 gap-2">
              <button onClick={closeModal} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={isEditing ? handleEdit : handleCreate}
                className="px-4 py-2 bg-[#7b1e3c] text-white rounded"
              >
                {isEditing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;
