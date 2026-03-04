import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Lock, Mail, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DarkModeToggle from "@/components/DarkModeToggle";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAs, setLoginAs] = useState<"doctor" | "patient">("doctor");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate(loginAs === "doctor" ? "/patients" : "/my-recovery");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result =
      mode === "signin"
        ? await login(email, password)
        : await register(email, password);

    setIsLoading(false);

    if (result.success) {
      navigate(loginAs === "doctor" ? "/patients" : "/my-recovery");
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-medical items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary-foreground/20"
              style={{
                width: `${200 + i * 120}px`,
                height: `${200 + i * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm mb-8">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4 leading-tight">
            Autonomous Patient Follow-up Agent
          </h1>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            Proactively monitor patient recovery post-surgery with automated check-ins and intelligent alerts.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {["Automated Check-ins", "Symptom Tracking", "Doctor Alerts", "Recovery Dashboard"].map((feat) => (
              <div key={feat} className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-4 py-3 text-sm text-primary-foreground/90 font-medium">
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-6 right-6">
          <DarkModeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-medical flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">Patient Follow-up</span>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {mode === "signin"
              ? "Sign in to access the patient dashboard"
              : "Register a new account to get started"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role toggle */}
            <div className="flex rounded-xl border border-border overflow-hidden">
              {(["doctor", "patient"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setLoginAs(role)}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${loginAs === role
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                    }`}
                >
                  {role === "doctor" ? "🩺 Doctor" : "🧑 Patient"}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === "signup" ? "Min 6 characters" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold shadow-medical gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                "Please wait..."
              ) : mode === "signin" ? (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("signin"); setError(""); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </p>

          <p className="text-center text-muted-foreground text-xs mt-4">
            Healthcare monitoring platform — secure access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
