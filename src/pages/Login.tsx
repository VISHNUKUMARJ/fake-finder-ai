
import { useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/common/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { useAuthStateChange } from "@/hooks/useAuthStateChange";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";

const Login = () => {
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'reset'>('email');
  const { toast } = useToast();
  const location = useLocation();

  // Check if user arrived after email verification
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromVerification = searchParams.get('verified') === 'true';
    
    if (fromVerification) {
      toast({
        title: "Email verified",
        description: "Your email has been verified. You can now log in.",
        duration: 5000,
      });
      
      // Clean up URL parameter
      const newUrl = location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location, toast]);

  // Handle password reset link callback
  const handleAuthStateCallback = useCallback((accessToken: string | null) => {
    if (accessToken) {
      setForgotPasswordOpen(true);
      setResetStep('reset');
    }
  }, []);

  // Use the auth state change hook
  useAuthStateChange(handleAuthStateCallback);

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
        
        <LoginForm onForgotPassword={() => setForgotPasswordOpen(true)} />
      </Card>

      <ForgotPasswordDialog 
        open={forgotPasswordOpen} 
        onClose={() => setForgotPasswordOpen(false)} 
      />
    </div>
  );
};

export default Login;
