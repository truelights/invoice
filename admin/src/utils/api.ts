import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log(token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const response = await api.post("/adminauth/login", { email, password });
  return response.data;
};
export const getPlans = async () => {
  const response = await api.post("/business/plans");
  console.log("plans", response.data);
  return response.data;
};

export const register = async (email: string, password: string) => {
  const response = await api.post("/adminauth/create", { email, password });
  return response.data;
};

export const getBusinessInfo = async () => {
  try {
    const response = await api.get("/business");
    console.log("business", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching business info:", error);
    throw error;
  }
};

export const Analytics = async () => {
  const response = await api.get("/business/analytics");

  return response.data;
};

export const updateBusinessInfo = async (data: any) => {
  const response = await api.put("/business", data);
  return response.data;
};

export const changePlan = async (planId: string, newPlan: any) => {
  const response = await api.post(`/business/change-plan${planId}`, {
    newPlan,
  });
  return response.data;
};

export const createPlan = async (data: any) => {
  const response = await api.post("/business/plans", data);
  return response.data;
};

export const getAllPlans = async () => {
  const response = await api.get("/business/plans");
  return response.data;
};

export const updatePlan = async (id: string, data: any) => {
  const response = await api.put(`/business/plans/${id}`, data);
  return response.data;
};

export const deletePlan = async (id: string) => {
  const response = await api.delete(`/business/plans/${id}`);
  return response.data;
};

export default api;
