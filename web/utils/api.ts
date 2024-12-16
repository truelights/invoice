import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log(token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    window.location.replace("/auth/login");
  }
  return config;
});

export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

export const createOrder = (planId: string) =>
  api.post("/payments/create-order", { planId });

export const verifyPayment = (paymentData: any) =>
  api.post("/payments/verify-payment", paymentData);

export const fetchBillByReceiptNo = async (receiptNo: string) =>
  api.get(`/bills/batch/${receiptNo}`);
export const register = async (userData: {
  email: string;
  password: string;
  businessName: string;
  gst: string;
  address: string;
  phone: string;
  planId: string;
  paymentId?: string;
  orderId?: string;
  signature?: string;
}) => {
  try {
    console.log("Starting registration flow");

    // First, create an order
    const orderResponse = await createOrder(userData.planId);
    const { id: orderId, amount } = orderResponse.data;
    console.log("Order created successfully:", orderResponse);

    // Initialize Razorpay payment
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount,
      currency: "INR",
      name: "Invoice App",
      description: "Plan Subscription",
      order_id: orderId,
      handler: async (response: any) => {
        try {
          console.log("Payment handler triggered");

          // Verify the payment
          await verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          console.log("Payment verified successfully");

          // If payment is verified, proceed with registration
          const registrationData = {
            ...userData,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          };
          console.log("Registration data prepared:", registrationData);

          const registrationResponse = await api.post(
            "/auth/register",
            registrationData
          );
          console.log("Registration response:", registrationResponse);
          return registrationResponse.data;
        } catch (error) {
          console.error("Error during payment verification:", error);
          throw new Error("Payment verification failed.");
        }
      },
      prefill: {
        email: userData.email,
        contact: userData.phone,
      },
    };

    return new Promise((resolve, reject) => {
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response);
        reject(new Error("Payment failed"));
      });

      paymentObject.on("payment.success", (response: any) => {
        console.log("Payment successful:", response);
        resolve(response);
      });
    });
  } catch (error) {
    console.error("Error in registration flow:", error);
    throw error; // Re-throw the error for further handling
  }
};

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
