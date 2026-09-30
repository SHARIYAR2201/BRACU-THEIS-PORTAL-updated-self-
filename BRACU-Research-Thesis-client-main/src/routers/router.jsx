import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import RootLayout from "../layouts/RootLayout";
import Error from "../pages/Error/Error";

// ── Route-level code splitting ────────────────────────────────────────────────
// All page components are lazy-loaded so each is only downloaded when needed.
const Home = lazy(() => import("../pages/Home/Home"));
const Register = lazy(() => import("../pages/Authentication/Register"));
const Login = lazy(() => import("../pages/Authentication/Login"));
const ThesisProposalForm = lazy(() =>
  import("../pages/Thesis/ThesisProposalForm")
);
const AssignSupervisor = lazy(() => import("../pages/Admin/AssignSupervisor"));
const AdminRoute = lazy(() => import("../Private/AdminRoute"));
const Announcement = lazy(() => import("../pages/Announcement/Announcement"));
const AdminDashboard = lazy(() =>
  import("../pages/Dashboard/AdminDashboard")
);
const StudentDashboard = lazy(() =>
  import("../pages/Dashboard/StudentDashboard")
);
const SupervisorDashboard = lazy(() =>
  import("../pages/Dashboard/SupervisorDashboard")
);
const ViewAnnouncement = lazy(() =>
  import("../pages/Announcement/ViewAnnouncements")
);
const ManageUsers = lazy(() => import("../pages/Admin/ManageUsers"));
const CreateGroup = lazy(() => import("../pages/StudentGroup/CreateGroup"));
const FindGroup = lazy(() => import("../pages/StudentGroup/FindGroup"));
const CreateFaqs = lazy(() => import("../pages/Admin/CreateFaqs"));
const AllFaqs = lazy(() => import("../pages/FAQs/AllFaqs"));
const ViewProposals = lazy(() => import("../pages/Thesis/ViewProposals"));
const SupervisorGroups = lazy(() =>
  import("../pages/SupGroups/SupervisorGroups")
);
const ViewRecievedProposals = lazy(() =>
  import("../pages/Thesis/ViewRecievedProposals")
);
const Profile = lazy(() => import("../pages/Student/Profile"));
const SupervisorProfile = lazy(() =>
  import("../pages/Supervisor/SupervisorProfile")
);
const SupervisorsList = lazy(() =>
  import("../pages/Supervisor/SupervisorsList")
);
const Searchpaper = lazy(() => import("../pages/Student/Searchpaper"));
const Savedpapers = lazy(() => import("../pages/Student/Savedpapers"));
const Recommended = lazy(() => import("../pages/Student/Recommended"));
const ScheduleMeetings = lazy(() =>
  import("../pages/Meeting/ScheduleMeetings")
);
const AllThesis = lazy(() => import("../pages/Thesis/AllThesis"));
const Semester = lazy(() => import("../pages/Semester/Semester"));
const ThesisProcess = lazy(() => import("../pages/Thesis/ThesisProcess"));
const Search = lazy(() => import("../pages/Home/Search"));

const API_BASE = "https://bracu-research-server-eta.vercel.app";

// ── Shared Suspense fallback spinner ─────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#7b1e3c] border-t-transparent" />
  </div>
);

const wrap = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// ── Router ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    // Root loader removed — current user is fetched via UserContext instead
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: wrap(Home),
      },
      {
        path: "/search-feature",
        element: wrap(Search),
      },
      {
        path: "/register",
        element: wrap(Register),
      },
      {
        path: "/login",
        element: wrap(Login),
      },
      {
        path: "/thesis-proposal",
        element: wrap(ThesisProposalForm),
        // loader removed — uses UserContext
      },
      {
        path: "view-announcement",
        element: wrap(ViewAnnouncement),
      },
      {
        path: "/profile",
        element: wrap(Profile),
        // loader removed — uses UserContext
      },
      {
        path: "/supervisor-profile",
        element: wrap(SupervisorProfile),
        // loader removed — uses UserContext
      },
      {
        path: "/supervisors",
        element: wrap(SupervisorsList),
      },
      {
        path: "/manage-users",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          </Suspense>
        ),
      },
      {
        path: "/assign-supervisor",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminRoute>
              <AssignSupervisor />
            </AdminRoute>
          </Suspense>
        ),
      },
      {
        path: "/announcements",
        element: wrap(Announcement),
        // loader removed — uses UserContext
      },
      {
        path: "/admin-dashboard",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </Suspense>
        ),
      },
      {
        path: "/supervisor-dashboard",
        element: wrap(SupervisorDashboard),
        // loader removed — uses UserContext
      },
      {
        path: "/student-dashboard",
        element: wrap(StudentDashboard),
        // loader removed — uses UserContext
      },
      {
        path: "/find-group/:id",
        element: wrap(FindGroup),
      },
      {
        path: "/create-group/:id",
        element: wrap(CreateGroup),
      },
      {
        path: "/manage-faqs",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminRoute>
              <CreateFaqs />
            </AdminRoute>
          </Suspense>
        ),
      },
      {
        path: "/semester",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminRoute>
              <Semester />
            </AdminRoute>
          </Suspense>
        ),
        // loader removed — uses UserContext
      },
      {
        path: "/all-faqs",
        element: wrap(AllFaqs),
      },
      {
        path: "/view-proposals",
        element: wrap(ViewProposals),
        // loader removed — uses UserContext
      },
      {
        path: "/supervisor-groups",
        element: wrap(SupervisorGroups),
        // loader removed — uses UserContext
      },
      {
        path: "/view-recieved-proposals",
        element: wrap(ViewRecievedProposals),
        // loader removed — uses UserContext
      },
      {
        path: "/search",
        element: wrap(Searchpaper),
        // loader removed — uses UserContext
      },
      {
        path: "/saved-papers",
        element: wrap(Savedpapers),
        // loader removed — uses UserContext
      },
      {
        path: "/recommended",
        element: wrap(Recommended),
        // loader removed — uses UserContext
      },
      {
        path: "/schedule-meetings",
        element: wrap(ScheduleMeetings),
        // loader removed — uses UserContext
      },
      {
        path: "/all-thesis",
        element: wrap(AllThesis),
        loader: () => fetch(`${API_BASE}/theses`), // theses data stays as loader
      },
      {
        path: "/thesis-process",
        element: wrap(ThesisProcess),
      },
    ],
  },
]);

export default router;
