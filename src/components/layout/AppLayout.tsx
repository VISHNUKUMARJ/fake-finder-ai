import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Home, Image, FileVideo, FileAudio, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AIAssistant } from "@/components/chat/AIAssistant";
import { Logo } from "@/components/common/Logo";

type AppLayoutProps = {
  children: ReactNode;
  title?: string;
};

export const AppLayout = ({ children, title = "Dashboard" }: AppLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("fakefinder_isLoggedIn");
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("fakefinder_isLoggedIn");
    localStorage.removeItem("fakefinder_user");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/login");
  };

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Image, label: "Image Detection", path: "/image-detection" },
    { icon: FileVideo, label: "Video Detection", path: "/video-detection" },
    { icon: FileText, label: "Text Detection", path: "/text-detection" },
    { icon: FileAudio, label: "Audio Detection", path: "/audio-detection" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-all duration-200",
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div
        className={cn(
          "flex flex-col w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-50",
          isMobile && "fixed top-0 bottom-0 left-0",
          isMobile && !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <Logo />
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <Separator />
        
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  window.location.pathname === item.path && "bg-gray-100 dark:bg-gray-700"
                )}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setIsSidebarOpen(false);
                }}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>
        </ScrollArea>
        
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 sm:px-6">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="mr-4">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
        
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>

      <AIAssistant />
    </div>
  );
};
