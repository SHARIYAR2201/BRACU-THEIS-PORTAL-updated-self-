import React, { use } from "react";
import { AuthContext } from "../contexts/Auth/AuthContext";
import { useLocation, Navigate } from "react-router";  // Import Navigate

const AdminRoute = ({ children }) => {
  const { user, loading } = use(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }
  if (user?.email === "admin@g.bracu.ac.bd") {
    return children;
  }

  return <Navigate state={{ from: location }} to="/login" />;
};

export default AdminRoute;
