import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";
import {
  Search as SearchIcon,
  ArrowUpDown,
  ArrowRight,
  ShieldCheck,
  UserCog,
  Users,
  FileText,
  Megaphone,
  Calendar as CalendarIcon,
  GraduationCap,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  User,
  Link2,
  Columns3,
} from "lucide-react";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

function useDebouncedValue(value, delay = 150) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// Build the feature index (titles, routes, tags, role access)
function buildFeatureIndex(ctx) {
  const dbUserId = ctx?.dbUser?._id ? String(ctx.dbUser._id) : null;

  const dynOrFallback = (fn, fallback) => {
    try {
      const p = fn();
      return p || fallback;
    } catch {
      return fallback;
    }
  };

  return [
    // ——— General (accessible to everyone; signed-out users see only these)
    {
      title: "Home",
      path: "/",
      icon: <Columns3 className="w-4 h-4" />,
      description: "Landing page with hero, workflow, and FAQs.",
      tags: ["home", "landing", "overview"],
      roles: ["student", "supervisor", "admin"],
      section: "General",
    },
    {
      title: "Thesis Process & Guidelines",
      path: "/thesis-process",
      icon: <FileText className="w-4 h-4" />,
      description:
        "Complete thesis journey, rules, penalties, and submission steps.",
      tags: ["thesis", "process", "guidelines", "policy", "steps"],
      roles: ["student", "supervisor", "admin"],
      section: "General",
    },
    {
      title: "All FAQs",
      path: "/all-faqs",
      icon: <ClipboardList className="w-4 h-4" />,
      description: "Browse frequently asked questions.",
      tags: ["faqs", "help", "support", "questions"],
      roles: ["student", "supervisor", "admin"],
      section: "General",
    },
    {
      title: "Supervisors List",
      path: "/supervisors",
      icon: <User className="w-4 h-4" />,
      description: "See all available supervisors.",
      tags: ["supervisors", "faculty", "advisor"],
      roles: ["student", "supervisor", "admin"],
      section: "General",
    },

    // ——— Student
    {
      title: "Student Dashboard",
      path: "/student-dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      description: "Your groups, proposals, meetings, and updates.",
      tags: ["student", "dashboard"],
      roles: ["student"],
      section: "Student",
    },
    {
      title: "Thesis Proposal Form",
      path: "/thesis-proposal",
      icon: <FileText className="w-4 h-4" />,
      description: "Submit a thesis proposal to a supervisor.",
      tags: ["proposal", "thesis", "form"],
      roles: ["student"],
      section: "Student",
    },
    {
      title: "View Proposals (Your Group)",
      path: "/view-proposals",
      icon: <BookOpen className="w-4 h-4" />,
      description: "Track your group’s submitted proposals and feedback.",
      tags: ["proposal", "status", "feedback"],
      roles: ["student"],
      section: "Student",
    },
    {
      title: "Profile",
      path: "/profile",
      icon: <User className="w-4 h-4" />,
      description: "Manage your student profile.",
      tags: ["student", "profile"],
      roles: ["student"],
      section: "Student",
    },
    {
      title: "Create Group",
      path: dynOrFallback(
        () => (dbUserId ? `/create-group/${dbUserId}` : null),
        null
      ),
      icon: <Users className="w-4 h-4" />,
      description: "Create a student group and add members.",
      tags: ["group", "create", "team"],
      roles: ["student"],
      section: "Student",
      requiresLogin: true,
    },
    {
      title: "Find Group",
      path: dynOrFallback(
        () => (dbUserId ? `/find-group/${dbUserId}` : null),
        null
      ),
      icon: <Users className="w-4 h-4" />,
      description: "Browse groups and accept invites.",
      tags: ["group", "join", "team"],
      roles: ["student"],
      section: "Student",
      requiresLogin: true,
    },
    {
      title: "All Thesis",
      path: "/all-thesis",
      icon: <GraduationCap className="w-4 h-4" />,
      description: "Explore theses with supervisors and members.",
      tags: ["thesis", "library", "work"],
      roles: ["student", "supervisor", "admin"],
      section: "Student",
    },
    {
      title: "View Announcements",
      path: "/view-announcement",
      icon: <Megaphone className="w-4 h-4" />,
      description: "University updates for students and supervisors.",
      tags: ["announcements", "news", "updates"],
      roles: ["student", "supervisor"],
      section: "Student",
    },

    // ——— Supervisor
    {
      title: "Supervisor Dashboard",
      path: "/supervisor-dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      description: "Your assigned groups, proposals, and meetings.",
      tags: ["supervisor", "dashboard"],
      roles: ["supervisor"],
      section: "Supervisor",
    },
    {
      title: "Proposals Submitted to You",
      path: "/view-recieved-proposals",
      icon: <FileText className="w-4 h-4" />,
      description: "Review, approve/reject, and leave feedback.",
      tags: ["proposal", "inbox", "review"],
      roles: ["supervisor"],
      section: "Supervisor",
    },
    // ❌ REMOVED:
    // {
    //   title: "Your Accepted Groups",
    //   path: "/supervisor-groups",
    //   icon: <Users className="w-4 h-4" />,
    //   description: "See groups assigned under your supervision by semester.",
    //   tags: ["groups", "assigned", "semester"],
    //   roles: ["supervisor"],
    //   section: "Supervisor",
    // },
    {
      title: "Schedule Meetings",
      path: "/schedule-meetings",
      icon: <CalendarIcon className="w-4 h-4" />,
      description: "Create and manage meetings with your groups.",
      tags: ["meetings", "calendar", "schedule"],
      roles: ["supervisor"],
      section: "Supervisor",
    },
    {
      title: "Search arXiv",
      path: "/search",
      icon: <Link2 className="w-4 h-4" />,
      description: "Find papers to recommend to your groups.",
      tags: ["arxiv", "papers", "search", "recommendations"],
      roles: ["supervisor", "student"],
      section: "Supervisor",
    },
    {
      title: "Saved Papers",
      path: "/saved-papers",
      icon: <BookOpen className="w-4 h-4" />,
      description: "Your saved arXiv papers.",
      tags: ["arxiv", "saved", "reading"],
      roles: ["supervisor", "student"],
      section: "Supervisor",
    },
    {
      title: "Recommended to Me",
      path: "/recommended",
      icon: <BookOpen className="w-4 h-4" />,
      description: "Papers recommended to your group.",
      tags: ["arxiv", "recommended", "reading"],
      roles: ["student"],
      section: "Student",
    },
    {
      title: "Supervisor Profile",
      path: "/supervisor-profile",
      icon: <UserCog className="w-4 h-4" />,
      description: "Manage your supervisor details.",
      tags: ["profile", "supervisor"],
      roles: ["supervisor"],
      section: "Supervisor",
    },

    // ——— Admin
    {
      title: "Admin Dashboard",
      path: "/admin-dashboard",
      icon: <ShieldCheck className="w-4 h-4" />,
      description: "Admin overview and controls.",
      tags: ["admin", "dashboard"],
      roles: ["admin"],
      section: "Admin",
    },
    {
      title: "Manage Users",
      path: "/manage-users",
      icon: <UserCog className="w-4 h-4" />,
      description: "View, edit, and delete users.",
      tags: ["users", "admin", "manage"],
      roles: ["admin"],
      section: "Admin",
    },
    {
      title: "Assign Supervisor (Admin)",
      path: "/assign-supervisor",
      icon: <UserCog className="w-4 h-4" />,
      description: "Admin tool to assign supervisors to groups.",
      tags: ["assign", "supervisor", "admin"],
      roles: ["admin"],
      section: "Admin",
    },
    {
      title: "Announcements (Admin)",
      path: "/announcements",
      icon: <Megaphone className="w-4 h-4" />,
      description: "Create and manage announcements.",
      tags: ["announcements", "news", "admin"],
      roles: ["admin"],
      section: "Admin",
    },
    {
      title: "Semester Management (Admin)",
      path: "/semester",
      icon: <CalendarIcon className="w-4 h-4" />,
      description: "Create and manage academic semesters.",
      tags: ["semester", "admin", "schedule"],
      roles: ["admin"],
      section: "Admin",
    },
  ].map((f) => ({
    ...f,
    disabled: f.path === null, // unresolved dynamic path ⇒ disabled
  }));
}

// Removed section from scoring so queries don't match "General/Student/..." labels
function scoreFeature(q, f) {
  if (!q) return 0;
  const hay = [f.title, f.description, ...(Array.isArray(f.tags) ? f.tags : [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const needle = q.toLowerCase().trim();
  if (!needle) return 0;

  let score = 0;
  const title = (f.title || "").toLowerCase();
  const idx = title.indexOf(needle);
  if (idx >= 0) score += 100 - idx; // early title match
  if (hay.includes(needle)) score += 40;
  needle.split(/\s+/).forEach((part) => {
    if (!part) return;
    if (title.includes(part)) score += 12;
    if (hay.includes(part)) score += 6;
  });
  return score;
}

const ResultRow = ({ item, onGo, active, query }) => {
  const highlight = (text) => {
    if (!query) return text;
    const q = query.trim();
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="bg-yellow-200 dark:bg-yellow-600/40 rounded px-0.5">
          {text.slice(i, i + q.length)}
        </mark>
        {text.slice(i + q.length)}
      </>
    );
  };

  return (
    <button
      onClick={onGo}
      disabled={item.disabled}
      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors flex items-start gap-3 ${
        active
          ? "border-[#7b1e3c] bg-[#7b1e3c]/5"
          : "border-gray-200 dark:border-slate-700"
      } ${
        item.disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-slate-50 dark:hover:bg-slate-800"
      }`}
      title={
        item.disabled ? "Sign in to resolve this link" : `Go to ${item.title}`
      }
    >
      <span className="mt-0.5">
        {item.icon ?? <ArrowRight className="w-4 h-4" />}
      </span>
      <span className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-white truncate">
            {highlight(item.title)}
          </span>
          {/* Section tag removed from UI */}
        </div>
        {item.description ? (
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
            {highlight(item.description)}
          </div>
        ) : null}
      </span>
      <ArrowRight className="w-4 h-4 ml-auto mt-0.5 text-slate-400" />
    </button>
  );
};

const Search = () => {
  const { dbUser } = useContext(UserContext);
  const navigate = useNavigate();

  const ctx = useMemo(() => ({ dbUser }), [dbUser]);
  const featureIndex = useMemo(() => buildFeatureIndex(ctx), [ctx]);

  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q, 150);

  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Role-based visibility
  const userRole = dbUser?.role || null;

  const visiblePool = useMemo(() => {
    if (!userRole) {
      // Not logged in: only General section
      return featureIndex.filter((f) => f.section === "General");
    }
    // Logged in: only features for that role
    return featureIndex.filter(
      (f) => Array.isArray(f.roles) && f.roles.includes(userRole)
    );
  }, [featureIndex, userRole]);

  const results = useMemo(() => {
    if (!dq.trim()) {
      // Surface a few starting points in the allowed pool
      return visiblePool
        .filter((f) => !f.disabled)
        .slice(0, 8)
        .map((f) => ({ item: f, score: 0 }));
    }

    const ranked = visiblePool
      .map((f) => ({ item: f, score: scoreFeature(dq, f) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    return ranked;
  }, [dq, visiblePool]);

  useEffect(() => {
    setActive(0);
  }, [dq, userRole]);

  const go = (path) => {
    if (!path) return;
    navigate(path);
  };

  const onKeyDown = (e) => {
    if (!results.length) return;
    const buttons = listRef.current?.querySelectorAll("button");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => {
        const next = Math.min(i + 1, results.length - 1);
        buttons?.[next]?.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => {
        const prev = Math.max(i - 1, 0);
        buttons?.[prev]?.scrollIntoView({ block: "nearest" });
        return prev;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active]?.item;
      if (item && !item.disabled) go(item.path);
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 transition-colors mt-4">
      {/* Width aligned with banner & other sections */}
      <div className="container mx-auto px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Quick Navigation
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ArrowUpDown className="w-4 h-4" />
            Use ↑↓ then Enter
          </div>
        </div>

        <div className="relative">
          <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Try “proposal”, “groups”, “semester”, “meetings”…"
            className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b1e3c]"
          />
        </div>

        <div
          ref={listRef}
          className="mt-4 space-y-2 max-h-[420px] overflow-auto rounded-lg"
        >
          {!results.length ? (
            <div className="p-6 border border-dashed rounded-lg text-slate-600 dark:text-slate-300 dark:border-slate-700">
              {dq.trim()
                ? "No matches. Try different keywords."
                : userRole
                ? "No shortcuts yet. Start typing to find features you can access."
                : "Sign in to search more features. For now, you can explore general pages."}
            </div>
          ) : (
            results.map((r, idx) => (
              <ResultRow
                key={r.item.title}
                item={r.item}
                active={idx === active}
                query={dq}
                onGo={() => !r.item.disabled && go(r.item.path)}
              />
            ))
          )}
        </div>

        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {userRole
            ? `Role: ${userRole}. Results are limited to your access.`
            : "Not signed in — showing general features only."}
        </div>
      </div>
    </section>
  );
};

export default Search;
