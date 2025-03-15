
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Get all users from localStorage
    const usersString = localStorage.getItem("fakefinder_users");
    const users = usersString ? JSON.parse(usersString) : [];
    
    // Find the user with the provided email
    const user = users.find((u: any) => u.email === email);
    
    setTimeout(() => {
      if (user && user.password === password) {
        // Valid credentials - log the user in
        localStorage.setItem("fakefinder_isLoggedIn", "true");
        localStorage.setItem("fakefinder_user", JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null
        }));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
        
        navigate("/dashboard");
      } else {
        // Invalid credentials
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPasswordSubmit = () => {
    setResetError("");
    
    if (resetStep === 'email') {
      // Check if email exists
      const usersString = localStorage.getItem("fakefinder_users");
      const users = usersString ? JSON.parse(usersString) : [];
      const userExists = users.some((u: any) => u.email === resetEmail);
      
      if (!userExists) {
        setResetError("No account found with this email address.");
        return;
      }
      
      // In a real app, we would send an email with a reset link
      // For this demo, we'll just move to the next step
      setResetStep('reset');
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
      
      // Update the password in localStorage
      const usersString = localStorage.getItem("fakefinder_users");
      const users = usersString ? JSON.parse(usersString) : [];
      const updatedUsers = users.map((user: any) => {
        if (user.email === resetEmail) {
          return { ...user, password: newPassword };
        }
        return user;
      });
      
      localStorage.setItem("fakefinder_users", JSON.stringify(updatedUsers));
      
      // Show success toast
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in.",
      });
      
      // Close the dialog and reset state
      setForgotPasswordOpen(false);
      setResetEmail("");
      setNewPassword("");
      setConfirmNewPassword("");
      setResetStep('email');
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
              {resetStep === 'email' ? 'Continue' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
