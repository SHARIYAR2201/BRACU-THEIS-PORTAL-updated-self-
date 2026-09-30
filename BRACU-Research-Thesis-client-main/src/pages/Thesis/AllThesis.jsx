import { useLoaderData } from "react-router";
import { useState } from "react";

const AllThesis = () => {
  const theses = useLoaderData();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [filterSupervisor, setFilterSupervisor] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDomain, setFilterDomain] = useState("");

  // Filter theses
  const filteredTheses = theses
    .filter((t) => t.status.toLowerCase() !== "rejected") // exclude rejected
    .filter((t) => {
      const matchesSupervisor =
        !filterSupervisor ||
        t.supervisor?.name?.toLowerCase().includes(filterSupervisor.toLowerCase());
      const matchesGroup =
        !filterGroup || t.groupName?.toLowerCase().includes(filterGroup.toLowerCase());
      const matchesStatus =
        !filterStatus || t.status?.toLowerCase() === filterStatus.toLowerCase();
      const matchesDate =
        !filterDate ||
        new Date(t.createdAt).toISOString().split("T")[0] === filterDate;
      const matchesDomain =
        !filterDomain ||
        t.domain?.some((d) => d.toLowerCase().includes(filterDomain.toLowerCase()));

      return (
        matchesSupervisor &&
        matchesGroup &&
        matchesStatus &&
        matchesDate &&
        matchesDomain
      );
    });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Theses</h2>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block mb-1 font-medium">Supervisor</label>
          <input
            type="text"
            value={filterSupervisor}
            onChange={(e) => setFilterSupervisor(e.target.value)}
            className="border px-2 py-1 rounded"
            placeholder="Supervisor name"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Group</label>
          <input
            type="text"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="border px-2 py-1 rounded"
            placeholder="Group name"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Submitted Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Domain</label>
          <input
            type="text"
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="border px-2 py-1 rounded"
            placeholder="Domain"
          />
        </div>
        <button
          onClick={() => {
            setFilterSupervisor("");
            setFilterGroup("");
            setFilterStatus("");
            setFilterDate("");
            setFilterDomain("");
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-left">
              <th className="border-b dark:border-slate-600 px-4 py-3 font-semibold">Title</th>
              <th className="border-b dark:border-slate-600 px-4 py-3 font-semibold">Supervisor</th>
              <th className="border-b dark:border-slate-600 px-4 py-3 font-semibold">Group</th>
              <th className="border-b dark:border-slate-600 px-4 py-3 font-semibold">Status</th>
              <th className="border-b dark:border-slate-600 px-4 py-3 font-semibold">Domain</th>
              <th className="border-b dark:border-slate-600 px-4 py-3 font-semibold">Submitted Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-slate-700 dark:text-slate-300">
            {filteredTheses.map((thesis) => (
              <tr key={thesis._id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition">
                <td className="px-4 py-3 max-w-xs md:max-w-md break-words">{thesis.title}</td>
                <td className="px-4 py-3">{thesis.supervisor?.name || "N/A"}</td>
                <td
                  className="px-4 py-3 text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-medium"
                  onClick={() =>
                    setSelectedGroup({
                      name: thesis.groupName,
                      students: thesis.students,
                      domain: thesis.domain,
                    })
                  }
                >
                  {thesis.groupName || "N/A"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    thesis.status === "Approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : thesis.status === "Rejected"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {thesis.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {thesis.domain?.length ? (
                      thesis.domain.map((d) => (
                        <button
                          key={d}
                          onClick={() => setFilterDomain(d)}
                          className="px-2.5 py-1 text-xs bg-[#7b1e3c]/10 text-[#7b1e3c] dark:bg-[#7b1e3c]/20 dark:text-[#d08ea3] rounded-md hover:bg-[#7b1e3c] hover:text-white dark:hover:text-white transition font-medium"
                        >
                          {d}
                        </button>
                      ))
                    ) : (
                      "N/A"
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {new Date(thesis.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-2">
              {selectedGroup.name} – Members
            </h3>
            <p className="mb-2 text-gray-600">Domain:</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedGroup.domain?.length ? (
                selectedGroup.domain.map((d) => (
                  <button
                    key={d}
                    className="px-4 py-2 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730] transition disabled:opacity-60"
                  >
                    {d}
                  </button>
                ))
              ) : (
                "N/A"
              )}
            </div>
            <ul className="space-y-2">
              {selectedGroup.students.map((s) => (
                <li key={s._id} className="border p-2 rounded">
                  {s.name || "Unnamed Student"} <br />
                  {s.email && (
                    <span className="text-sm text-gray-500">{s.email}</span>
                  )}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedGroup(null)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllThesis;
