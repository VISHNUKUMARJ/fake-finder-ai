
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Logo } from "@/components/common/Logo";
import { supabase } from "@/integrations/supabase/client";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (password.length < minLength) {
      return "Password must be at least 12 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    if (!hasSymbol) {
      return "Password must contain at least one symbol";
    }
    
    return ""; // No error
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      toast({
        title: "Invalid password",
        description: passwordValidationError,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .limit(1);
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Email already in use",
          description: "This email is already registered. Please use a different email or try logging in.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Email already in use",
            description: "This email is already registered. Please use a different email or try logging in.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        throw error;
      }
      
      // Successful signup
      toast({
        title: "Account created",
        description: "Welcome to FakeFinder AI!",
      });
      
      // Store session info
      localStorage.setItem("fakefinder_isLoggedIn", "true");
      
      // Store user info
      if (data.user) {
        // Check if this is the first user - make them admin
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        const isFirstUser = count === 0 || count === null;
        
        // If first user or email ends with @admin.com, make them admin
        const isAdmin = isFirstUser || email.endsWith('@admin.com');
        
        // Wait for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the profile to set admin status if needed
        if (isAdmin) {
          await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', data.user.id);
        }
        
        localStorage.setItem("fakefinder_user", JSON.stringify({
          id: data.user.id,
          name: name,
          email: data.user.email,
          avatar: null,
          isAdmin: isAdmin
        }));
      }
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo size="lg" className="mb-2" />
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 12 characters with 1 uppercase letter, 1 number, and 1 symbol
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <p className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:text-blue-600">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUp;
