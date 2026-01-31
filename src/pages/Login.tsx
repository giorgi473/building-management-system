import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { Building2, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Failed to login");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Building2 className="h-7 w-7 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-sidebar-accent-foreground">
                ABOS
              </h1>
              <p className="text-sm text-sidebar-foreground">
                Building Management System
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-display font-bold text-sidebar-accent-foreground leading-tight">
              Manage your buildings
              <br />
              with confidence
            </h2>
            <p className="text-lg text-sidebar-foreground max-w-md">
              A complete solution for property managers, building admins, and
              residents to streamline operations and improve communication.
            </p>
          </div>

          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-sidebar-primary">500+</p>
              <p className="text-sm text-sidebar-foreground">
                Buildings Managed
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sidebar-primary">10K+</p>
              <p className="text-sm text-sidebar-foreground">
                Active Residents
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sidebar-primary">99.9%</p>
              <p className="text-sm text-sidebar-foreground">Uptime</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sidebar-primary/10" />
        <div className="absolute top-1/4 -right-16 w-64 h-64 rounded-full bg-sidebar-accent/20" />
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold">ABOS</h1>
              <p className="text-xs text-muted-foreground">Building Manager</p>
            </div>
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-display">
                Welcome back
              </CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  Don't have an account?{" "}
                </span>
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Create one
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
