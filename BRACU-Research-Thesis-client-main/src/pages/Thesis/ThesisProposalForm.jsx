import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";

const ThesisProposalForm = () => {
  const { dbUser: User, loading: userLoading } = useContext(UserContext);

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    domain: "",
    supervisor: "",
    driveLink: "",
  });

  const [supervisors, setSupervisors] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch group of which user is admin
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(
          `https://bracu-research-server-eta.vercel.app/groups/by-admin/${User?._id}`
        );
        if (res.status === 404) {
          setErrorMsg("Only group creators can submit proposals.");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch group");
        const data = await res.json();
        setGroup(data);

        // 🚫 If already has supervisor, block
        if (data?.assignedSupervisor) {
          setErrorMsg(
            "Your group already has a supervisor assigned. You cannot submit more proposals."
          );
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Could not load group data");
      }
    };

    if (!userLoading && User?._id) {
      fetchGroup();
    }
  }, [User, userLoading]);

  // Fetch supervisors
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const res = await fetch(
          "https://bracu-research-server-eta.vercel.app/supervisors"
        );
        if (!res.ok) throw new Error("Failed to fetch supervisors");
        const data = await res.json();
        setSupervisors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSupervisors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!group?._id) {
      alert("You must be a group creator to submit a proposal.");
      return;
    }
    if (group?.assignedSupervisor) {
      alert(
        "Your group already has an assigned supervisor. No more proposals allowed."
      );
      return;
    }

    if (
      !formData.title ||
      !formData.abstract ||
      !formData.supervisor ||
      !formData.driveLink
    ) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const res = await fetch(
        "https://bracu-research-server-eta.vercel.app/proposals",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            domain: group?.researchInterests || [],
            studentId: User?._id,
            groupId: group._id,
            adminapproved: false,
            supervisorapproved: false,
            groupName: group.name,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to submit proposal");

      alert("Thesis Proposal Submitted Successfully!");
      setFormData({
        title: "",
        abstract: "",
        domain: "",
        supervisor: "",
        driveLink: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error submitting proposal");
    }
  };

  return (
    <section className="min-h-screen bg-white dark:bg-slate-900 transition-colors px-6 py-12 flex justify-center">
      <div className="max-w-3xl w-full bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white text-center">
          Submit Thesis Proposal
        </h2>

        {/* Group Name */}
        {group && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group Name
            </label>
            <input
              type="text"
              name="domain"
              value={group?.name}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm 
                        bg-gray-100 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
            />
          </div>
        )}

        {/* Show error message instead of form */}
        {userLoading ? (
          <p className="text-center text-slate-500 mt-6">Loading profile...</p>
        ) : errorMsg ? (
          <p className="text-center text-red-500 mt-6">{errorMsg}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Title */}
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600"
                required
              />
            </div>

            {/* Abstract */}
            <div>
              <label className="block mb-1 font-medium">Abstract</label>
              <textarea
                name="abstract"
                value={formData.abstract}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600"
                required
              />
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Domain
              </label>
              <input
                type="text"
                name="domain"
                value={group?.researchInterests?.join(", ") || ""}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                          focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm 
                          bg-gray-100 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
              />
            </div>

            {/* Supervisor */}
            <div>
              <label className="block mb-1 font-medium">Supervisor</label>
              {loading ? (
                <p>Loading supervisors...</p>
              ) : (
                <select
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600"
                  required
                >
                  <option value="">Select supervisor</option>
                  {supervisors.map((sup) => (
                    <option key={sup._id} value={sup._id}>
                      {sup.name || sup.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Drive Link */}
            <div>
              <label className="block mb-1 font-medium">
                Google Drive Link
              </label>
              <input
                type="url"
                name="driveLink"
                value={formData.driveLink}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#7b1e3c] hover:bg-[#651730] text-white font-semibold py-3 rounded-lg transition"
            >
              Submit Proposal
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ThesisProposalForm;
