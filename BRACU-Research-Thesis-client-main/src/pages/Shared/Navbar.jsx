/* eslint-disable no-unused-vars */
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { NavLink } from "react-router";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { UserContext } from "../../contexts/UserContext";
import { Bell, Menu, X, ChevronDown } from "lucide-react";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

const linkBase = "block px-2 xl:px-4 py-2 rounded-lg transition hover:text-[#7b1e3c] text-sm xl:text-base whitespace-nowrap";
const linkActive = "text-[#7b1e3c] bg-[#7b1e3c]/10 dark:bg-[#7b1e3c]/20";

const Navbar = () => {
  const { user, logOut, loading } = useContext(AuthContext);
  // Use UserContext for the current user — no loader needed
  const { dbUser: UserFromLoader } = useContext(UserContext);

  const [notifData, setNotifData] = useState(null); // { notifications, isSeen }
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [markingSeen, setMarkingSeen] = useState(false);

  // Fetch only the last 20 notifications (lightweight endpoint)
  const fetchNotifications = useCallback(async () => {
    if (!UserFromLoader?._id) return;
    try {
      const r = await fetch(`${API_BASE}/users/${UserFromLoader._id}/notifications`);
      if (r.ok) setNotifData(await r.json());
    } catch {
      // silent
    }
  }, [UserFromLoader?._id]);

  // Initial load + poll every 60 s (down from 10 s), pause when tab hidden
  useEffect(() => {
    if (!UserFromLoader?._id) return;
    let cancelled = false;

    const tick = async () => {
      if (cancelled || document.hidden) return;
      await fetchNotifications();
    };

    tick();
    const id = setInterval(tick, 60_000);

    const onVisChange = () => {
      if (!document.hidden && !cancelled) tick();
    };
    document.addEventListener("visibilitychange", onVisChange);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [UserFromLoader?._id, fetchNotifications]);

  const toggleNotifications = async () => {
    const next = !showNotifications;
    setShowNotifications(next);

    if (next) await fetchNotifications();

    if (
      next &&
      UserFromLoader?._id &&
      notifData?.isSeen === false &&
      !markingSeen
    ) {
      try {
        setMarkingSeen(true);
        await fetch(`${API_BASE}/users/${UserFromLoader._id}/notifications/seen`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });
        setNotifData((prev) => prev ? { ...prev, isSeen: true } : prev);
        // eslint-disable-next-line no-empty
      } catch (err) {
      } finally {
        setMarkingSeen(false);
      }
    }
  };

  const roleUser = UserFromLoader;
  const notifications = notifData?.notifications || UserFromLoader?.notifications || [];
  const isSeen = notifData ? notifData.isSeen : (UserFromLoader?.isSeen ?? true);

  const LinkItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </NavLink>
  );

  const NavDropdown = ({ label, items }) => {
    const [open, setOpen] = useState(false);
    return (
      <div 
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button className="flex items-center gap-1 px-2 xl:px-4 py-2 rounded-lg transition hover:text-[#7b1e3c] text-sm xl:text-base font-medium text-slate-700 dark:text-gray-300">
          {label} <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute left-0 mt-0 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1.5 z-50">
            {items.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.to}
                className={({ isActive }) => `block px-4 py-2 text-sm transition hover:text-[#7b1e3c] hover:bg-slate-50 dark:hover:bg-slate-700 ${isActive ? 'text-[#7b1e3c] bg-[#7b1e3c]/10 font-semibold' : 'text-slate-700 dark:text-gray-300'}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 ">
      <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
        {/* Left - Logo */}
        <button
          onClick={() => { window.location.href = "/"; }}
          className="flex items-center gap-1.5 lg:gap-2 text-lg xl:text-2xl font-bold text-slate-900 dark:text-white shrink-0"
          aria-label="Go to home"
        >
          <img
            src="/f-logo.svg"
            alt="BRACU Logo"
            className="h-8 xl:h-10 w-auto shrink-0"
          />
          <span className="whitespace-nowrap">BRACU Research <span className="text-[#7b1e3c]">Connect</span></span>
        </button>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-slate-900 dark:text-white" />
          ) : (
            <Menu className="h-6 w-6 text-slate-900 dark:text-white" />
          )}
        </button>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1 xl:gap-2 text-slate-700 dark:text-gray-300 font-medium">
          <LinkItem to="/">Home</LinkItem>
          <LinkItem to="/thesis-process">Thesis Process</LinkItem>
          <LinkItem to="/supervisors">Supervisors</LinkItem>

          {/* Workspace Dropdown for Student and Supervisor */}
          {roleUser?.role === "student" && (
            <NavDropdown
              label="Workspace"
              items={[
                { label: "Proposal Submission", to: "/thesis-proposal" },
                { label: "View Announcement", to: "/view-announcement" },
              ]}
            />
          )}

          {roleUser?.role === "supervisor" && (
            <NavDropdown
              label="Workspace"
              items={[
                { label: "View Announcement", to: "/view-announcement" },
                { label: "Schedule Meetings", to: "/schedule-meetings" },
              ]}
            />
          )}

          {roleUser?.role === "admin" && (
            <LinkItem to="/admin-dashboard">Dashboard</LinkItem>
          )}
          {roleUser?.role === "admin" && (
            <LinkItem to="/semester">Semester</LinkItem>
          )}
          {roleUser?.role === "supervisor" && (
            <LinkItem to="/supervisor-dashboard">Dashboard</LinkItem>
          )}

          <LinkItem to="/all-thesis">All Thesis</LinkItem>

          {roleUser?.role === "student" && (
            <LinkItem to="/student-dashboard">Dashboard</LinkItem>
          )}
        </ul>

        {/* Right - Notifications & Auth */}
        <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 relative">
          {(roleUser?.role === "student" ||
            roleUser?.role === "supervisor") && (
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                aria-haspopup="menu"
                aria-expanded={showNotifications}
              >
                <Bell className="text-slate-900 dark:text-white" size={22} />
                {isSeen === false && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                  />
                )}
                <span className="sr-only">Open notifications</span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                  {Array.isArray(notifications) &&
                  notifications.length > 0 ? (
                    [...notifications].reverse().map((n, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={() => {
                          if (n.link) window.location.href = n.link;
                          setShowNotifications(false);
                        }}
                      >
                        <p className="font-medium">{n.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(n.date).toLocaleString()}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-gray-500">
                      No notifications
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {user ? (
            <NavLink to="/login">
              <button
                onClick={logOut}
                disabled={loading}
                className="px-4 py-2 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730] transition disabled:opacity-60"
              >
                Logout
              </button>
            </NavLink>
          ) : (
            <NavLink to="/login">
              <button className="px-4 py-2 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730] transition">
                Login
              </button>
            </NavLink>
          )}
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        className={`lg:hidden border-t border-gray-200 dark:border-gray-800 ${
          mobileOpen ? "block" : "hidden"
        }`}
      >
        <div className="px-6 py-4 space-y-2 text-slate-800 dark:text-gray-200 font-medium">
          <LinkItem to="/">Home</LinkItem>
          <LinkItem to="/thesis-process">Thesis Process</LinkItem>
          <LinkItem to="/supervisors">Supervisors</LinkItem>

          {roleUser?.role === "student" && (
            <LinkItem to="/thesis-proposal">Proposal Submission</LinkItem>
          )}

          {(roleUser?.role === "supervisor" ||
            roleUser?.role === "student") && (
            <LinkItem to="/view-announcement">View Announcement</LinkItem>
          )}

          {roleUser?.role === "admin" && (
            <LinkItem to="/admin-dashboard">Dashboard</LinkItem>
          )}
          {roleUser?.role === "admin" && (
            <LinkItem to="/semester">Semester</LinkItem>
          )}
          {roleUser?.role === "supervisor" && (
            <LinkItem to="/supervisor-dashboard">Dashboard</LinkItem>
          )}

          <LinkItem to="/all-thesis">All Thesis</LinkItem>

          {roleUser?.role === "student" && (
            <LinkItem to="/student-dashboard">Dashboard</LinkItem>
          )}

          {/* Notifications on mobile */}
          {(roleUser?.role === "student" ||
            roleUser?.role === "supervisor") && (
            <div className="pt-2">
              <button
                onClick={toggleNotifications}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <Bell size={20} />
                <span>Notifications</span>
                {isSeen === false && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {showNotifications && (
                <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {Array.isArray(notifications) &&
                  notifications.length > 0 ? (
                    [...notifications].reverse().map((n, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
                        onClick={() => {
                          if (n.link) window.location.href = n.link;
                          setShowNotifications(false);
                          setMobileOpen(false);
                        }}
                      >
                        <p className="font-medium">{n.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(n.date).toLocaleString()}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-gray-500">
                      No notifications
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Auth buttons on mobile */}
          <div className="pt-2">
            {user ? (
              <button
                onClick={() => {
                  logOut();
                  setMobileOpen(false);
                }}
                disabled={loading}
                className="w-full px-4 py-2 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730] transition disabled:opacity-60"
              >
                Logout
              </button>
            ) : (
              <NavLink to="/login" onClick={() => setMobileOpen(false)}>
                <span className="block w-full text-center px-4 py-2 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730] transition">
                  Login
                </span>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
