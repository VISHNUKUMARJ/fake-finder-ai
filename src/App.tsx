import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrainableDetectionProvider } from "@/context/TrainableDetectionContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import ImageDetection from "./pages/ImageDetection";
import VideoDetection from "./pages/VideoDetection";
import TextDetection from "./pages/TextDetection";
import AudioDetection from "./pages/AudioDetection";
import Profile from "./pages/Profile";
import Settings, { LanguageProvider } from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

// Initialize theme from localStorage
const initializeTheme = () => {
  const theme = localStorage.getItem("fakefinder_theme") || "light";
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Show loading while checking auth
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    initializeTheme();
    
    // Check if the user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      // Set localStorage flag for backward compatibility
      localStorage.setItem("fakefinder_isLoggedIn", data.session ? "true" : "false");
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
        localStorage.setItem("fakefinder_isLoggedIn", session ? "true" : "false");
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TrainableDetectionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
                } />
                <Route path="/signup" element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : <SignUp />
                } />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/image-detection" element={
                  <ProtectedRoute>
                    <ImageDetection />
                  </ProtectedRoute>
                } />
                <Route path="/video-detection" element={
                  <ProtectedRoute>
                    <VideoDetection />
                  </ProtectedRoute>
                } />
                <Route path="/text-detection" element={
                  <ProtectedRoute>
                    <TextDetection />
                  </ProtectedRoute>
                } />
                <Route path="/audio-detection" element={
                  <ProtectedRoute>
                    <AudioDetection />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                {/* Redirect to login if not authenticated, otherwise to dashboard */}
                <Route path="/" element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TrainableDetectionProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
