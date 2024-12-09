"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gst, setGst] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const token = localStorage.getItem("token");
  console.log(token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        businessName,
        gst,
        address,
        phone,
      });
      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (error) {
      console.log(error);

      setError("Registration failed. Please try again.");
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Create a new account for your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gst">GST Number</Label>
            <Input
              id="gst"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
