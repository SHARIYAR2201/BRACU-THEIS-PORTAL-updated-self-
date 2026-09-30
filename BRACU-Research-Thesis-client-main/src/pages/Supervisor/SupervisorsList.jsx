import React, { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Mail, 
  ExternalLink, 
  Copy, 
  Check, 
  UserX,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 18;

const SupervisorsList = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDesignation, setSelectedDesignation] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedEmail, setCopiedEmail] = useState(null);

  // Load local JSON data
  useEffect(() => {
    import("../../assets/supervisors.json")
      .then((module) => {
        setSupervisors(module.default);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load supervisors:", err);
        toast.error("Failed to load supervisor profiles.");
        setLoading(false);
      });
  }, []);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedDesignation]);

  // Extract unique designations for the dropdown
  const uniqueDesignations = useMemo(() => {
    const list = new Set(supervisors.map((s) => s.designation).filter(Boolean));
    return ["All", ...Array.from(list).sort()];
  }, [supervisors]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = supervisors.length;
    const accepting = supervisors.filter((s) => s.status === "Accepting").length;
    const notAccepting = supervisors.filter((s) => s.status === "Not Accepting").length;
    return { total, accepting, notAccepting };
  }, [supervisors]);

  // Handle email copy
  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email)
      .then(() => {
        setCopiedEmail(email);
        toast.success("Email copied to clipboard!");
        setTimeout(() => setCopiedEmail(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy email:", err);
        toast.error("Failed to copy email.");
      });
  };

  // Filter supervisors
  const filteredSupervisors = useMemo(() => {
    return supervisors.filter((sup) => {
      const matchesSearch =
        sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.designation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || sup.status === selectedStatus;

      const matchesDesignation =
        selectedDesignation === "All" || sup.designation === selectedDesignation;

      return matchesSearch && matchesStatus && matchesDesignation;
    });
  }, [supervisors, searchQuery, selectedStatus, selectedDesignation]);

  // Pagination logic
  const paginatedSupervisors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSupervisors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSupervisors, currentPage]);

  const totalPages = Math.ceil(filteredSupervisors.length / ITEMS_PER_PAGE);

  // Helper for rendering initials avatar
  const getInitials = (name) => {
    // Strip initials in bracket like [ARIF]
    const cleanName = name.replace(/\[.*?\]/g, "").trim();
    const parts = cleanName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0] ? parts[0][0].toUpperCase() : "S";
  };

  // Helper to highlight search matches
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-100 dark:bg-yellow-950/60 text-[#7B1E3C] dark:text-yellow-200 font-semibold rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7B1E3C] border-t-transparent mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          Loading faculty directories...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Premium Stats/Title Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#7B1E3C] to-[#501326] text-white py-12 md:py-16 px-6 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)] pointer-events-none"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-3 backdrop-blur-sm">
                <GraduationCap size={14} /> Official Directory
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif tracking-tight leading-tight">
                BRACU CSE Thesis Supervisors
              </h1>
              <p className="mt-3 text-white/80 max-w-2xl font-sans text-sm md:text-base leading-relaxed">
                Connect with advisors matching your thesis goals. Browse research profiles, 
                current supervising availability, and contact information.
              </p>
            </div>

            {/* Micro Stats Panel */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md min-w-[280px] md:min-w-[340px]">
              <div className="text-center">
                <span className="block text-xl md:text-2xl font-bold text-white">{stats.total}</span>
                <span className="text-[10px] md:text-xs text-white/70 uppercase font-semibold">Total Faculty</span>
              </div>
              <div className="text-center border-x border-white/10 px-2">
                <span className="block text-xl md:text-2xl font-bold text-emerald-300">{stats.accepting}</span>
                <span className="text-[10px] md:text-xs text-white/70 uppercase font-semibold">Accepting</span>
              </div>
              <div className="text-center">
                <span className="block text-xl md:text-2xl font-bold text-rose-300">{stats.notAccepting}</span>
                <span className="text-[10px] md:text-xs text-white/70 uppercase font-semibold">Maxed Out</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar / Filters Area */}
      <div className="sticky top-[72px] z-30 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Box */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search by name, initial (e.g. ARIF), or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#7B1E3C] focus:ring-1 focus:ring-[#7B1E3C] outline-none transition duration-200 text-sm shadow-sm text-slate-800 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-750 dark:text-slate-300 rounded-full px-1.5 py-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
              <div className="flex flex-col w-full sm:w-48">
                <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-550 mb-1 ml-1">Designation</span>
                <select
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-[#7B1E3C] outline-none shadow-sm cursor-pointer text-slate-800 dark:text-white"
                >
                  {uniqueDesignations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col w-full sm:w-44">
                <span className="text-[10px] uppercase font-bold text-slate-455 dark:text-slate-555 mb-1 ml-1">Supervising Status</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-[#7B1E3C] outline-none shadow-sm cursor-pointer text-slate-800 dark:text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Accepting">Accepting</option>
                  <option value="Not Accepting">Not Accepting</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-7xl px-6 py-8">
        
        {/* Active Filters Display */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-800 dark:text-white">{filteredSupervisors.length}</strong> of{" "}
            <strong className="text-slate-800 dark:text-white">{supervisors.length}</strong> supervisors
          </p>
          {(searchQuery || selectedStatus !== "All" || selectedDesignation !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("All");
                setSelectedDesignation("All");
              }}
              className="text-xs text-[#7B1E3C] dark:text-[#d08ea3] hover:underline font-semibold"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredSupervisors.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <UserX size={48} className="mx-auto text-slate-300 dark:text-slate-650 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No supervisors found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto text-sm">
              We couldn't find any results matching "{searchQuery}". Try broadening your search or resetting filters.
            </p>
          </div>
        ) : (
          /* Card Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSupervisors.map((sup, idx) => {
              const isAccepting = sup.status === "Accepting";

              return (
                <div
                  key={sup.email || idx}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-750 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Card Background Accent for Accepting */}
                  {isAccepting && (
                    <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-450 to-teal-500"></div>
                  )}

                  {/* Badge & Image */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    {/* Faculty Photo */}
                    <div className="relative">
                      {sup.imageUrl ? (
                        <img
                          src={sup.imageUrl}
                          alt={sup.name}
                          onError={(e) => {
                            // Fallback if image load fails
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "flex";
                            }
                          }}
                          className={`w-20 h-20 rounded-full object-cover border-2 shadow-sm ${
                            isAccepting ? "border-emerald-500" : "border-slate-200 dark:border-slate-700"
                          }`}
                        />
                      ) : null}
                      {/* Initials Fallback Container */}
                      <div
                        style={{ display: sup.imageUrl ? "none" : "flex" }}
                        className={`w-20 h-20 rounded-full text-white text-xl font-bold flex items-center justify-center shadow-inner ${
                          isAccepting 
                            ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
                            : "bg-gradient-to-br from-[#7B1E3C] to-[#501326]"
                        }`}
                      >
                        {getInitials(sup.name)}
                      </div>

                      {/* Floating Status Indicator on avatar */}
                      <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4">
                        {isAccepting ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-slate-400 border-2 border-white dark:border-slate-800"></span>
                        )}
                      </span>
                    </div>

                    {/* Right-Side Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      {sup.badge === "U" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30 uppercase tracking-wider">
                          UG Only
                        </span>
                      )}
                      
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isAccepting
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
                        }`}
                      >
                        {sup.status}
                      </span>
                    </div>
                  </div>

                  {/* Name & Designation Details */}
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#7B1E3C] dark:group-hover:text-[#d08ea3] transition duration-200">
                      {highlightText(sup.name, searchQuery)}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">
                      {sup.designation}
                    </p>
                  </div>

                  {/* Info list */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 border-t border-slate-100 dark:border-slate-700 pt-3.5 mb-5">
                    {/* Email display and copy */}
                    <div className="flex items-center justify-between group/email">
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <Mail size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate select-all text-slate-700 dark:text-slate-300">
                          {highlightText(sup.email, searchQuery)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyEmail(sup.email)}
                        className="p-1 rounded hover:bg-slate-150 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition shrink-0"
                        title="Copy email to clipboard"
                      >
                        {copiedEmail === sup.email ? (
                          <Check size={13} className="text-emerald-500 animate-scale" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    {sup.profileUrl && (
                      <a
                        href={sup.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-250 transition-all"
                      >
                        <ExternalLink size={13} /> Profile
                      </a>
                    )}
                    <a
                      href={`mailto:${sup.email}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#7B1E3C] hover:bg-[#9E2A4A] dark:bg-[#7B1E3C] dark:hover:bg-[#9E2A4A] text-xs font-bold text-white shadow-sm transition-all"
                    >
                      <Mail size={13} /> Email
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition text-slate-800 dark:text-slate-200"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, current, and surrounding pages
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, idx, arr) => {
                const isCurrent = page === currentPage;
                const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;

                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="text-slate-400 dark:text-slate-500 px-1">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 text-xs font-bold rounded-lg border transition ${
                        isCurrent
                          ? "bg-[#7B1E3C] border-[#7B1E3C] text-white shadow-sm"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition text-slate-800 dark:text-slate-200"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SupervisorsList;
