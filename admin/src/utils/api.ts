import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/adminauth/login", {
    email,
    password,
  });
  return response.data;
};

export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export const getPlans = async (): Promise<Plan[]> => {
  const response = await api.get<Plan[]>("/business/plans");
  return response.data;
};

export const register = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/adminauth/create", {
    email,
    password,
  });
  return response.data;
};

interface BusinessInfo {
  id: string;
  name: string;
  address: string;
  owner: string;
}

export const getBusinessInfo = async (): Promise<BusinessInfo> => {
  try {
    const response = await api.get<BusinessInfo>("/business");
    return response.data;
  } catch (error) {
    console.error("Error fetching business info:", error);
    throw error;
  }
};

interface AnalyticsData {
  revenue: number;
  customers: number;
  newSignups: number;
}

export const Analytics = async (): Promise<AnalyticsData> => {
  const response = await api.get<AnalyticsData>("/business/analytics");
  return response.data;
};

interface UpdateBusinessInfoData {
  name?: string;
  address?: string;
  owner?: string;
}

export const updateBusinessInfo = async (
  data: UpdateBusinessInfoData,
  _id: string
): Promise<BusinessInfo> => {
  const response = await api.put<BusinessInfo>(`/business/${_id}`, data);
  return response.data;
};

export const changePlan = async (
  planId: string,
  newPlan: Plan
): Promise<Plan> => {
  const response = await api.post<Plan>(`/business/change-plan/${planId}`, {
    newPlan,
  });
  return response.data;
};

export const createPlan = async (data: Omit<Plan, "id">): Promise<Plan> => {
  const response = await api.post<Plan>("/business/plans", data);
  return response.data;
};

export const getAllPlans = async (): Promise<Plan[]> => {
  const response = await api.get<Plan[]>("/business/plans");
  return response.data;
};

export const updatePlan = async (
  id: string,
  data: Partial<Plan>
): Promise<Plan> => {
  const response = await api.put<Plan>(`/business/plans/${id}`, data);
  return response.data;
};

export const deletePlan = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/business/plans/${id}`
  );
  return response.data;
};

export default api;
