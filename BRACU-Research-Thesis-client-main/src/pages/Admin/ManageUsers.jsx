import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/Auth/AuthContext";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const normalizeId = (rawId) => {
  // handle different shapes of _id that may come from your API
  if (!rawId) return null;
  if (typeof rawId === "string") return rawId;
  if (rawId.$oid) return rawId.$oid;
  if (rawId.toString) return rawId.toString();
  return String(rawId);
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({ name: "", photoUrl: "" });
  const [loading, setLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const { deleteCurrentUser } = useContext(AuthContext);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (pageNum = page) => {
    try {
      const res = await fetch(`${API_BASE}/users?page=${pageNum}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      const userList = Array.isArray(data.users) ? data.users : [];
      // normalize id into `id` field for easier handling
      const normalized = userList.map((u) => ({
        ...u,
        id: normalizeId(u._id),
      }));
      setUsers(normalized);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setPage(data.pagination.page || 1);
      }
    } catch (err) {
      console.error("fetchUsers:", err);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    const email = localStorage.getItem("userEmail");
    if (email) setCurrentUserEmail(email);
  }, []);

  const handleDeleteUser = async (id, role, email) => {
    if (role === "admin") {
      alert("Admins cannot be deleted from this page.");
      return;
    }
    if (email === currentUserEmail) {
      alert("You cannot delete yourself.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchUsers();
    } catch (err) {
      console.error("handleDeleteUser:", err);
      alert("Failed to delete user. Check console for details.");
    }
  };

  const handleEditClick = (user) => {
    setEditUserId(user.id);
    setEditData({ name: user.name || "", photoUrl: user.photoUrl || "" });
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditData({ name: "", photoUrl: "" });
  };

  const handleSaveEdit = async (id) => {
    // basic validation
    if (typeof editData.name !== "string" || editData.name.trim() === "") {
      alert("Name cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        name: editData.name.trim(),
        photoUrl: editData.photoUrl ? editData.photoUrl.trim() : "",
      };

      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Update failed");
      }

      // success
      setEditUserId(null);
      await fetchUsers();
    } catch (err) {
      console.error("handleSaveEdit:", err);
      alert("Failed to update user. Check console/network for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 min-h-screen p-6 transition-colors">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#7b1e3c] mb-6">Manage Users</h1>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-slate-700">
              <tr>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Role</th>
                <th className="py-2 px-4 text-left">Photo Url</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => u.role !== "admin")
                .map((u) => (
                  <tr key={u.id} className="border-t dark:border-slate-600">
                    <td className="py-2 px-4">
                      {editUserId === u.id ? (
                        <input
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="border rounded p-1 w-56"
                        />
                      ) : (
                        u.name || "-"
                      )}
                    </td>

                    <td className="py-2 px-4">{u.email}</td>
                    <td className="py-2 px-4 capitalize">{u.role}</td>
                    <td className="py-2 px-4 max-w-xs truncate">
                      {editUserId === u.id ? (
                        <input
                          value={editData.photoUrl}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              photoUrl: e.target.value,
                            })
                          }
                          className="border rounded p-1 w-64"
                          placeholder="https://..."
                        />
                      ) : (
                        u.photoUrl || "-"
                      )}
                    </td>

                    <td className="py-2 px-4 space-x-2">
                      {editUserId === u.id ? (
                        <>
                          <button
                            disabled={loading}
                            onClick={() => handleSaveEdit(u.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                          >
                            {loading ? "Saving..." : "Save"}
                          </button>
                          <button
                            disabled={loading}
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(u)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteUser(u.id, u.role, u.email)
                            }
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}

              {users.filter((u) => u.role !== "admin").length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 font-sans">
            <button
              disabled={page <= 1}
              onClick={() => {
                const prevPage = page - 1;
                setPage(prevPage);
                fetchUsers(prevPage);
              }}
              className="px-4 py-2 bg-[#7b1e3c] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#651730] transition font-medium"
            >
              Previous
            </button>
            <span className="text-slate-700 dark:text-gray-300 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchUsers(nextPage);
              }}
              className="px-4 py-2 bg-[#7b1e3c] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#651730] transition font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageUsers;
