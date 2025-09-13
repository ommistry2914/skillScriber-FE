import axiosInstance from "@/api/axios";

const testService = {
  checkTest: async (data) => {
    try {
      console.log("data",data);
      const response = await axiosInstance.post("/test/checkTest", data);
      console.log("responseData",response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default testService;
