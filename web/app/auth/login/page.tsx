"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/utils/api";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      authLogin(response.data.token);
      router.push("/");
    } catch (error) {
      console.log(error);
      setError("Invalid credentials");
    }
  };
  return (
    <div className="min-h-screen flex">
      {/* Left side illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-50 p-12">
        <Image
          src="/rr-5-10.png"
          alt="Login illustration"
          width={400}
          height={400}
          className="max-w-full h-auto"
        />
      </div>
      {/* Right side login form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[440px] space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/soft-flow-logo-10.png"
              alt="Login illustration"
              width={400}
              height={400}
              className="max-w-full h-12 w-12"
            />
          </div>
          {/* Login form */}
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
              <p className="text-sm text-muted-foreground">Login</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      /* Handle OTP send */
                    }}
                  >
                    Send OTP
                  </Button>
                  <Input
                    type="text"
                    placeholder="Enter OTP sent on Email"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </Button>
                </div>
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-gray-900 text-white hover:bg-gray-500 hover:text-white"
                  onClick={() => router.push("/auth/register")}
                >
                  Create New Account
                </Button>
              </div>
            </form>
            <Button
              type="button"
              variant="link"
              className="w-full text-sm"
              onClick={() => router.push("/features")}
            >
              View All Features
            </Button>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Image
              src="/logo-50-x-50-10.png"
              alt="Login illustration"
              width={50}
              height={100}
              className="h-6 w-6"
            />
            <a
              href="https://www.softflowsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              www.softflowsolutions.com
            </a>
            <span>© Softflow Solutions 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}
