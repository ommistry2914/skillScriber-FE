import docsService from "@/services/docs/docs.service";
import axiosInstance from "./axios";

const api = {
  ...axiosInstance,
  docs: docsService,
  
  
};

export default api;
