
import { ReactNode } from "react";
import { Shield } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">FakeFinder AI</h1>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Advanced AI technology to detect manipulated images, videos, text, and audio
          </p>
        </div>
        
        {children}
        
        <p className="mt-8 text-center text-sm text-muted-foreground">
          By using this service, you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};
