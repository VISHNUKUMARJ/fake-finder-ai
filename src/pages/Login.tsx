
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Logo } from "@/components/common/Logo";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<'email' | 'reset'>('email');
  const [resetError, setResetError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      // Successful login
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Store session info
      localStorage.setItem("fakefinder_isLoggedIn", "true");
      
      // Store user info
      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileData) {
          localStorage.setItem("fakefinder_user", JSON.stringify({
            id: data.user.id,
            name: profileData.name,
            email: data.user.email,
            avatar: profileData.avatar
          }));
        }
      }
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async () => {
    setResetError("");
    
    if (resetStep === 'email') {
      try {
        // Send password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${window.location.origin}/login`
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Password reset email sent",
          description: "Check your email for a link to reset your password."
        });
        
        // Close the dialog after successful email send
        setForgotPasswordOpen(false);
        setResetEmail("");
      } catch (error: any) {
        setResetError(error.message || "Failed to send reset email.");
      }
    } else {
      // Validate passwords match
      if (newPassword !== confirmNewPassword) {
        setResetError("Passwords don't match.");
        return;
      }
      
      if (newPassword.length < 6) {
        setResetError("Password must be at least 6 characters long.");
        return;
      }
      
      try {
        // Update password in Supabase
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) {
          throw error;
        }
        
        // Show success toast
        toast({
          title: "Password reset successful",
          description: "Your password has been updated. You can now log in."
        });
        
        // Close the dialog and reset state
        setForgotPasswordOpen(false);
        setResetEmail("");
        setNewPassword("");
        setConfirmNewPassword("");
        setResetStep('email');
      } catch (error: any) {
        setResetError(error.message || "Failed to update password.");
      }
    }
  };

  const handleCloseReset = () => {
    setForgotPasswordOpen(false);
    setResetEmail("");
    setNewPassword("");
    setConfirmNewPassword("");
    setResetStep('email');
    setResetError("");
  };

  // Check if user came from password reset
  const handleAuthStateChange = async () => {
    const hash = window.location.hash;
    
    if (hash && hash.includes('type=recovery')) {
      // Extract token from URL hash
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        setForgotPasswordOpen(true);
        setResetStep('reset');
        
        // Set session with the recovery token
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: ''
        });
        
        // Clear the hash
        window.history.replaceState(null, document.title, window.location.pathname);
      }
    }
  };

  // Listen for auth state changes when component mounts
  useState(() => {
    handleAuthStateChange();
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo size="lg" className="mb-2" />
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-sm p-0 h-auto font-normal text-blue-500"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <p className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-500 hover:text-blue-600">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={handleCloseReset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              {resetStep === 'email' 
                ? "Enter your email address and we'll send you a reset link." 
                : "Enter your new password below."}
            </DialogDescription>
          </DialogHeader>
          
          {resetError && (
            <Alert variant="destructive" className="my-2">
              <AlertDescription>{resetError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-2">
            {resetStep === 'email' ? (
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <Button type="button" variant="outline" onClick={handleCloseReset}>
              Cancel
            </Button>
            <Button type="button" onClick={handleForgotPasswordSubmit}>
              {resetStep === 'email' ? 'Send Reset Link' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
