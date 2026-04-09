import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Zap, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";

interface AuthPageProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

const AuthPage = ({ onSuccess, onBack }: AuthPageProps) => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to DEX
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dex", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back! ⚡" });
      onSuccess?.();
      navigate("/dex", { replace: true });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dex`,
        data: { full_name: displayName || email },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // Email already registered
      toast({
        title: "Email already in use",
        description: "An account with this email already exists. Please sign in instead.",
        variant: "destructive",
      });
      setMode("login");
    } else {
      // Mark as new user so the onboarding tour triggers after email confirmation
      localStorage.setItem("zyra_new_signup", "true");
      toast({ title: "Check your email", description: "We sent you a confirmation link. Once confirmed you'll be taken to the DEX." });
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "Password reset link sent." });
    }
  };

  // Don't render form if already logged in
  if (!authLoading && user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-2xl font-display font-bold">Zyra</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Sign in to your account" : mode === "signup" ? "Create your account" : "Reset your password"}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 gradient-border">
          <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-9 bg-secondary/30 border-border/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 bg-secondary/30 border-border/50"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9 bg-secondary/30 border-border/50"
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            )}

            <Button type="submit" className="w-full h-11 font-semibold glow-sm" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "login" ? (
                "Sign In"
              ) : mode === "signup" ? (
                "Create Account"
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <span>Don't have an account? <button onClick={() => setMode("signup")} className="text-primary hover:underline">Sign up</button></span>
            ) : mode === "signup" ? (
              <span>Already have an account? <button onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button></span>
            ) : (
              <button onClick={() => setMode("login")} className="text-primary hover:underline">Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
