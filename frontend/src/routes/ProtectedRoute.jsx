import {
  useEffect,
  useState
} from "react";

import {
  Navigate,
  useLocation
} from "react-router-dom";

import { authenticateUser }
  from "@/services/profileApi";
import { useAuth } from "../services/AuthContext";


const ProtectedRoute = ({ children, requireProfile = true, }) => {

  const {
    user,
    token,
    loading,
    profileCompleted
  } = useAuth();
  const location = useLocation();

  // LOADING
  if (loading) {
    
    return <div>Loading...</div>;
  }

    // NOT LOGGED IN
  if (!user) {
    return <Navigate to="/login" />;
  }
  // PROFILE INCOMPLETE
  if (
    requireProfile &&
    profileCompleted===false
  ) {
    return (
      <Navigate to="/create-profile" />
    );
  }

  // Everything valid
  return children;
};

export default ProtectedRoute;