import React, { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";
import {
  Calendar,
  Clock,
  BookOpen,
  X,
  Edit,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const Semester = () => {
  const { user } = useContext(AuthContext);
  const { dbUser: User, loading: userLoading } = useContext(UserContext);

  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [viewingSemester, setViewingSemester] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [formData, setFormData] = useState({
    season: "",
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch semesters
  useEffect(() => {
    const fetchSemesters = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/admin/semesters`);
        const result = response.ok ? await response.json() : [];
        setSemesters(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Semester fetch error:", err);
        setSemesters([]);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      if (User?._id) {
        fetchSemesters();
      } else {
        setLoading(false);
      }
    }
  }, [User?._id, userLoading]);

  // Get the next expected semester based on existing semesters
  const getNextSemester = () => {
    if (semesters.length === 0) {
      return { season: "spring", year: new Date().getFullYear() };
    }

    const sortedSemesters = [...semesters].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const seasonOrder = { spring: 1, summer: 2, fall: 3 };
      return seasonOrder[b.season] - seasonOrder[a.season];
    });

    const latest = sortedSemesters[0];
    const seasonOrder = ["spring", "summer", "fall"];
    const currentIndex = seasonOrder.indexOf(latest.season);

    if (currentIndex === 2) {
      // fall -> next spring
      return { season: "spring", year: latest.year + 1 };
    } else {
      return { season: seasonOrder[currentIndex + 1], year: latest.year };
    }
  };

  // Validate semester constraints
  const validateSemester = (season, year, startDate, endDate) => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Basic field validation
    if (!season) errors.season = "Season is required";
    if (!year) errors.year = "Year is required";
    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";

    // If basic validation fails, return early
    if (Object.keys(errors).length > 0) return errors;

    // Cannot create semesters in the past (unless editing)
    if (!editingSemester && start < today) {
      errors.startDate = "Cannot create semesters with past start dates";
    }

    // End date must be after start date
    if (end <= start) {
      errors.endDate = "End date must be after start date";
    }

    // Check duration (3-4 months)
    if (start && end && end > start) {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = diffDays / 30.44; // Average month length

      if (diffMonths < 2.5) {
        errors.duration = "Semester duration must be at least 3 months";
      } else if (diffMonths > 4.5) {
        errors.duration = "Semester duration cannot exceed 4 months";
      }
    }

    // Check if semester already exists
    const exists = semesters.some(
      (s) =>
        s.season === season &&
        s.year === parseInt(year) &&
        (!editingSemester || s._id !== editingSemester._id)
    );
    if (exists) {
      errors.semester = `${
        season.charAt(0).toUpperCase() + season.slice(1)
      } ${year} already exists`;
    }

    // Check sequential order (if not editing and creating new)
    if (!editingSemester && semesters.length > 0) {
      const expected = getNextSemester();
      if (season !== expected.season || parseInt(year) !== expected.year) {
        errors.sequence = `Next semester should be ${
          expected.season.charAt(0).toUpperCase() + expected.season.slice(1)
        } ${expected.year}`;
      }
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? parseInt(value) : value,
    }));

    // Clear errors when user makes changes
    if (
      formErrors[name] ||
      formErrors.duration ||
      formErrors.semester ||
      formErrors.sequence
    ) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      delete newErrors.duration;
      delete newErrors.semester;
      delete newErrors.sequence;
      setFormErrors(newErrors);
    }
  };

  const resetForm = () => {
    const next = getNextSemester();
    setFormData({
      season: next.season,
      year: next.year,
      startDate: "",
      endDate: "",
    });
    setEditingSemester(null);
    setFormErrors({});
  };

  const handleCreateNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (semester) => {
    setFormData({
      season: semester.season,
      year: semester.year,
      startDate: semester.startDate,
      endDate: semester.endDate,
    });
    setEditingSemester(semester);
    setFormErrors({});
    setShowModal(true);
  };

  const handleView = (semester) => {
    setViewingSemester(semester);
    setShowViewModal(true);
  };

  const handleSubmit = async () => {
    // Validate all fields
    const errors = validateSemester(
      formData.season,
      formData.year,
      formData.startDate,
      formData.endDate
    );
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const url = editingSemester
        ? `${API_BASE}/admin/semesters/${editingSemester._id}`
        : `${API_BASE}/admin/semesters`;

      const method = editingSemester ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        if (editingSemester) {
          // Update existing semester
          setSemesters((prev) =>
            prev.map((s) =>
              s._id === editingSemester._id ? result.semester : s
            )
          );
          setSuccessMessage("Semester updated successfully!");
        } else {
          // Add new semester
          setSemesters((prev) => [result.semester, ...prev]);
          setSuccessMessage("Semester created successfully!");
        }

        setShowModal(false);
        resetForm();
      } else {
        // Handle specific server errors
        if (result.message) {
          if (result.message.includes("already exists")) {
            setFormErrors({ semester: result.message });
          } else if (
            result.message.includes("sequential") ||
            result.message.includes("should be")
          ) {
            setFormErrors({ sequence: result.message });
          } else if (result.message.includes("duration")) {
            setFormErrors({ duration: result.message });
          } else if (result.message.includes("past")) {
            setFormErrors({ startDate: result.message });
          } else {
            setFormErrors({ general: result.message });
          }
        } else {
          setFormErrors({ general: "Failed to save semester" });
        }
      }
    } catch (err) {
      console.error("Error saving semester:", err);
      setFormErrors({ general: "Failed to save semester. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (semesterId) => {
    if (
      !confirm(
        "Are you sure you want to delete this semester? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleteLoading(semesterId);
    try {
      const response = await fetch(
        `${API_BASE}/admin/semesters/${semesterId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSemesters((prev) => prev.filter((s) => s._id !== semesterId));
        setSuccessMessage("Semester deleted successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete semester");
      }
    } catch (err) {
      console.error("Error deleting semester:", err);
      alert("Failed to delete semester");
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSemesterDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(diffDays / 7);
    const months = Math.round((diffDays / 30.44) * 10) / 10; // Round to 1 decimal
    return `${weeks} weeks (${months} months)`;
  };

  const getSemesterStatus = (semester) => {
    const today = new Date();
    const start = new Date(semester.startDate);
    const end = new Date(semester.endDate);

    if (today < start)
      return {
        status: "Upcoming",
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
      };
    if (today >= start && today <= end)
      return {
        status: "Active",
        color: "text-green-600 bg-green-100 dark:bg-green-900/30",
      };
    return {
      status: "Completed",
      color: "text-slate-500 bg-slate-100 dark:bg-slate-700",
    };
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setFormErrors({});
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingSemester(null);
  };

  // Sort semesters by year and season (most recent first)
  const sortedSemesters = [...semesters].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const seasonOrder = { spring: 1, summer: 2, fall: 3 };
    return seasonOrder[b.season] - seasonOrder[a.season];
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const canCreateNext = () => {
    if (semesters.length === 0) return true;
    const next = getNextSemester();
    const today = new Date();
    const nextYear = next.year;
    return nextYear >= today.getFullYear();
  };

  return (
    <section className="min-h-screen bg-white dark:bg-slate-900 p-6 transition-colors">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Semester Management
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            Create and manage academic semesters (Spring, Summer, Fall)
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 dark:text-green-200">
              {successMessage}
            </span>
          </div>
        )}

        {/* Stats and Create Button */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-6 text-sm">
            <div className="text-slate-600 dark:text-slate-400">
              Total:{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {semesters.length}
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Active:{" "}
              <span className="font-semibold text-green-600">
                {
                  semesters.filter(
                    (s) => getSemesterStatus(s).status === "Active"
                  ).length
                }
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Upcoming:{" "}
              <span className="font-semibold text-blue-600">
                {
                  semesters.filter(
                    (s) => getSemesterStatus(s).status === "Upcoming"
                  ).length
                }
              </span>
            </div>
          </div>

          <button
            onClick={handleCreateNew}
            disabled={!canCreateNext()}
            className="px-6 py-3 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#691832] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            title={
              !canCreateNext()
                ? "Cannot create semesters for past years"
                : "Create next semester"
            }
          >
            <Plus className="w-5 h-5" />
            Create Semester
            {semesters.length > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                Next:{" "}
                {getNextSemester().season.charAt(0).toUpperCase() +
                  getNextSemester().season.slice(1)}{" "}
                {getNextSemester().year}
              </span>
            )}
          </button>
        </div>

        {/* Semesters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userLoading || loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7b1e3c]"></div>
              <div className="text-slate-500 mt-2">Loading semesters...</div>
            </div>
          ) : semesters.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <div className="text-slate-500 mb-2">
                No semesters created yet
              </div>
              <div className="text-sm text-slate-400 mb-4">
                Create your first semester to get started
              </div>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#691832] transition-colors"
              >
                Create First Semester
              </button>
            </div>
          ) : (
            sortedSemesters.map((semester) => {
              const status = getSemesterStatus(semester);
              return (
                <div
                  key={semester._id}
                  className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all hover:scale-105"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white capitalize">
                        {semester.season} {semester.year}
                      </h3>
                      <div
                        className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${status.color}`}
                      >
                        {status.status}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleView(semester)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(semester)}
                        className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition-colors"
                        title="Edit Semester"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(semester._id)}
                        disabled={deleteLoading === semester._id}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                        title="Delete Semester"
                      >
                        {deleteLoading === semester._id ? (
                          <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-[#7b1e3c]" />
                      <span>Start: {formatDate(semester.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-[#7b1e3c]" />
                      <span>End: {formatDate(semester.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4 text-[#7b1e3c]" />
                      <span>
                        Duration:{" "}
                        {getSemesterDuration(
                          semester.startDate,
                          semester.endDate
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create/Edit Semester Modal */}
        {showModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingSemester ? "Edit Semester" : "Create New Semester"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Show next expected semester info */}
              {!editingSemester && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Next Expected:</strong>{" "}
                    {getNextSemester().season.charAt(0).toUpperCase() +
                      getNextSemester().season.slice(1)}{" "}
                    {getNextSemester().year}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Season *
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b1e3c] dark:bg-slate-700 dark:text-white capitalize"
                    required
                  >
                    <option value="">Select season</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                  </select>
                  {formErrors.season && (
                    <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.season}
                    </div>
                  )}
                  {formErrors.semester && (
                    <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.semester}
                    </div>
                  )}
                  {formErrors.sequence && (
                    <div className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.sequence}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Year *
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b1e3c] dark:bg-slate-700 dark:text-white"
                    required
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {formErrors.year && (
                    <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.year}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={
                      !editingSemester
                        ? new Date().toISOString().split("T")[0]
                        : undefined
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b1e3c] dark:bg-slate-700 dark:text-white"
                    required
                  />
                  {formErrors.startDate && (
                    <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.startDate}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || undefined}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b1e3c] dark:bg-slate-700 dark:text-white"
                    required
                  />
                  {formErrors.endDate && (
                    <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.endDate}
                    </div>
                  )}
                  {formErrors.duration && (
                    <div className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.duration}
                    </div>
                  )}
                </div>

                {/* Duration Preview */}
                {formData.startDate &&
                  formData.endDate &&
                  new Date(formData.endDate) > new Date(formData.startDate) && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Duration Preview:</strong>{" "}
                        {getSemesterDuration(
                          formData.startDate,
                          formData.endDate
                        )}
                      </div>
                    </div>
                  )}

                {/* General Error */}
                {formErrors.general && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-sm text-red-800 dark:text-red-200 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.general}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(formErrors).length > 0}
                    className="flex-1 px-4 py-2 bg-[#7b1e3c] text-white rounded-md hover:bg-[#691832] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                    )}
                    {editingSemester ? "Update Semester" : "Create Semester"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Semester Modal */}
        {showViewModal && viewingSemester && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Semester Details
                </h3>
                <button
                  onClick={closeViewModal}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <div className="text-slate-900 dark:text-white capitalize text-lg font-semibold">
                    {viewingSemester.season} {viewingSemester.year}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <div
                    className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                      getSemesterStatus(viewingSemester).color
                    }`}
                  >
                    {getSemesterStatus(viewingSemester).status}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <div className="text-slate-900 dark:text-white">
                    {formatDate(viewingSemester.startDate)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <div className="text-slate-900 dark:text-white">
                    {formatDate(viewingSemester.endDate)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Duration
                  </label>
                  <div className="text-slate-900 dark:text-white">
                    {getSemesterDuration(
                      viewingSemester.startDate,
                      viewingSemester.endDate
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Created:{" "}
                    {viewingSemester.createdAt
                      ? formatDate(viewingSemester.createdAt)
                      : "N/A"}
                  </div>
                  {viewingSemester.updatedAt && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Last updated: {formatDate(viewingSemester.updatedAt)}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeViewModal}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      closeViewModal();
                      handleEdit(viewingSemester);
                    }}
                    className="flex-1 px-4 py-2 bg-[#7b1e3c] text-white rounded-md hover:bg-[#691832] transition-colors"
                  >
                    Edit Semester
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Semester;
