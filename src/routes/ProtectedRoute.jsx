import { Route } from "react-router-dom";
import Layout from "@/Layout";
import Home from "@/pages/Home";
import Setting from "@/pages/Setting";

function ProtectedRoutes() {
  return (
      <Route element={<Layout/>}>
        <Route path="/" element={<Home />} />
        <Route path="/setting" element={<Setting/>}/>
      </Route>
  );
}

export default ProtectedRoutes;
