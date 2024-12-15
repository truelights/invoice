import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeRazorpayPayment = (orderId: string, email: string) => {
    return new Promise((resolve) => {
      if (!isScriptLoaded) {
        resolve({ success: false, error: "Razorpay script not loaded" });
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: "50000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "Your Company Name",
        description: "Test Transaction",
        image: "https://example.com/your_logo.png",
        order_id: orderId,
        handler: function (response: any) {
          resolve({ success: true, paymentId: response.razorpay_payment_id });
        },
        prefill: {
          email: email,
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    });
  };

  return { initializeRazorpayPayment };
};
