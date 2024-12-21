import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
export interface Business {
  _id: string;
  name: string;
  gst: string;
  address: string;
  phone: string;
  logo: string | null;
  expenseLabels: string[];
  commission: number;
  plan: string;
  planExpiry: string;
  verified: boolean;
  products: Array<{ name: string; price: number; _id: string }>;
  customers: Array<{
    name: string;
    address: string;
    phone: string;
    _id: string;
  }>;
  vendors: Array<{ name: string; address: string; phone: string; _id: string }>;
  lastReceiptNumber: number;
  lastReceiptDate: string;
  lastInvoiceNumber: number;
}
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
  duration: number;
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

export const getBusinessInfo = async (): Promise<Business | Business[]> => {
  const response = await axios.get(`${API_URL}/business`);
  return response.data;
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

export const updateBusinessInfo = async (
  business: Business,
  id: string
): Promise<Business> => {
  const response = await axios.put(`${API_URL}/business/${id}`, business);
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
