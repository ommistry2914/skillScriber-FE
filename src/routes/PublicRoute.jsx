import { Route } from "react-router-dom";

function PublicRoutes() {
  return (
      <Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
  );
}

export default PublicRoutes;
