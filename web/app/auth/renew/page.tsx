"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import api from "@/utils/api"

interface Plan {
  _id: string
  name: string
  price: number
  duration: number
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => Promise<void>
  prefill: {
    name: string
    email: string
  }
  theme: {
    color: string
  }
}

interface RazorpayClass {
  new (options: RazorpayOptions): {
    open: () => void;
  };
}

// Declare Razorpay on window without modifying the Window interface
declare const Razorpay: RazorpayClass;

export default function RenewPlanForm() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get("/auth/plans")
        const data = response.data as Plan[]
        setPlans(data)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        console.error("Error fetching plans:", errorMessage)
        toast({
          title: "Error",
          description: "Failed to fetch plans. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchPlans()
  }, [toast])

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value)
  }

  const handleSubmit = async () => {
    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Please select a plan.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const plan = plans.find((p) => p._id === selectedPlan)
      if (!plan) throw new Error("Invalid plan selected")

      const response = await api.post("/payments/create-order", { planId: selectedPlan })
      const order = response.data

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: plan.price * 100,
        currency: "INR",
        name: "Your Company Name",
        description: `Renew ${plan.name} Plan`,
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            const result = await api.post("/auth/renew-plan", {
              planId: selectedPlan,
              paymentId: response.razorpay_payment_id,
            })

            if (result.status === 200) {
              toast({
                title: "Success",
                description: "Plan renewed successfully!",
              })
              router.push("/dashboard")
            } else {
              throw new Error("Failed to renew plan")
            }
          } catch (error) {
            console.error("Error renewing plan:", error)
            toast({
              title: "Error",
              description: "Failed to renew plan. Please try again.",
              variant: "destructive",
            })
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
        },
        theme: {
          color: "#3B82F6",
        },
      }

      const razorpayInstance = new Razorpay(options)
      razorpayInstance.open()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      console.error("Error initiating payment:", errorMessage)
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Select a Plan to Renew</CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={handlePlanChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan._id} value={plan._id}>
                {plan.name} - ₹{plan.price} for {plan.duration} days
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={loading || !selectedPlan} className="w-full">
          {loading ? "Processing..." : "Renew Plan"}
        </Button>
      </CardFooter>
    </Card>
  )
}
