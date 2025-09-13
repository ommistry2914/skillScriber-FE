import LoginPage from "@/pages/LoginPage";
import { Route } from "react-router-dom";

function PublicRoutes() {
  return (
      <Route>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/register" element={<Register />} /> */}
      </Route>
  );
}

export default PublicRoutes;
