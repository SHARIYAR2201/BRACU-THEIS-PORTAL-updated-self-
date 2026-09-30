import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useContext(AuthContext);
  const { dbUser: User, loading: userLoading } = useContext(UserContext);
  const [errors, setErrors] = useState({ name: "", phone: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    phone: "",
    cgpa: "",
    creditsCompleted: "",
    researchInterest: "",
    photoUrl: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", phone: "" };

    if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      valid = false;
    }

    if (formData.phone && !/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10-15 digits";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://bracu-research-server-eta.vercel.app/profile/${User._id}`
        );
        if (!res.ok) {
          throw new Error(
            res.status === 404 ? "Profile not found" : "Failed to load profile"
          );
        }

        const data = await res.json();
        setStudent(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          studentId: data.studentId || "",
          department: data.department || "",
          phone: data.phone || "",
          cgpa: data.cgpa || "",
          creditsCompleted: data.creditsCompleted || "",
          researchInterest: data.researchInterest || "",
          photoUrl: data.photoUrl || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      if (User?._id) {
        fetchProfile();
      } else {
        setLoading(false);
      }
    }
  }, [User?._id, userLoading]);

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUpdating(true);
    try {
      if (!User?._id) throw new Error("User not found");

      const res = await fetch(
        `https://bracu-research-server-eta.vercel.app/profile/update/${User._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully!");
        setStudent(data);
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-8">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* LEFT: Update Profile */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Update <span className="text-[#7b1e3c]">Profile</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              "name",
              "email",
              "studentId",
              "department",
              "phone",
              "cgpa",
              "creditsCompleted",
              "photoUrl",
            ].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  {field === "cgpa"
                    ? "CGPA"
                    : field === "creditsCompleted"
                    ? "Credits Completed"
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={
                    field === "email"
                      ? "email"
                      : field === "cgpa" || field === "creditsCompleted"
                      ? "number"
                      : "text"
                  }
                  step={field === "cgpa" ? "0.01" : undefined}
                  min={field === "cgpa" ? "0" : undefined}
                  max={field === "cgpa" ? "4" : undefined}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:text-white ${
                    errors[field]
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  disabled={field === "email"}
                />
                {errors[field] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Research Interest
              </label>
              <textarea
                name="researchInterest"
                value={formData.researchInterest}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-600"
                disabled={updating}
              />
            </div>
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730] transition disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* RIGHT: Profile Overview */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 sm:p-8 flex flex-col justify-start">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Profile <span className="text-[#7b1e3c]">Overview</span>
          </h2>

          <div className="flex items-center gap-4 mb-4">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#7b1e3c]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  {student.name?.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {student.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {student.email}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Student ID
              </dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {student.studentId}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Department
              </dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {student.department}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Phone
              </dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {student.phone || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                CGPA
              </dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {student.cgpa}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Credits Completed
              </dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {student.creditsCompleted}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Research Interest
              </dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {student.researchInterest || "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Profile;
