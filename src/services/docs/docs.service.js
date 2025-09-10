import axiosInstance from "@/api/axios";

const docsService = {
  uploadDocs: async (data) => {
    try {
      console.log("data",data);
      const response = await axiosInstance.post("/docs/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("responseData",response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default docsService;
