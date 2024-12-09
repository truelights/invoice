import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

export const register = (userData: {
  email: string;
  password: string;
  businessName: string;
  gst: string;
  address: string;
  phone: string;
}) => api.post("/auth/register", userData);

export const getSettings = () => api.get("/settings");

export const updateSettings = (settings: any) =>
  api.patch("/settings", settings);

export const getNewBillNumbers = () => api.get("/bills/new-numbers");

export const createBill = (billData: any) => api.post("/bills", billData);

export const getBills = () => api.get("/bills");

export const getBill = (id: string) => api.get(`/bills/${id}`);

export const updateBill = (id: string, billData: any) =>
  api.patch(`/bills/${id}`, billData);

export const deleteBill = (id: string) => api.delete(`/bills/${id}`);

export const transactions = () => api.get("/bills/transactions");


export default api;
