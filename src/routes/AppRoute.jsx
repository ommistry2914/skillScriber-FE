import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoute";
import PublicRoutes from "./PublicRoute";
import { useSelector } from "react-redux";

function AppRoutes() {

  const {user} = useSelector((state)=> state.auth);

  return (
    <Routes>
      {!user ? (
        <>
          {PublicRoutes()}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          {ProtectedRoutes()}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

export default AppRoutes;
