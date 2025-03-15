
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
};

export const Logo = ({ size = "md", withText = true, className }: LogoProps) => {
  const sizeMap = {
    sm: {
      container: "h-7 w-7",
      icon: "h-4 w-4",
      text: "text-sm",
    },
    md: {
      container: "h-8 w-8",
      icon: "h-5 w-5",
      text: "text-lg",
    },
    lg: {
      container: "h-10 w-10",
      icon: "h-6 w-6",
      text: "text-xl",
    },
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn(
        "flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white rounded-lg transition-colors",
        sizeMap[size].container
      )}>
        <Shield className={sizeMap[size].icon} />
      </div>
      {withText && (
        <span className={cn("font-semibold", sizeMap[size].text)}>
          FakeFinder AI
        </span>
      )}
    </div>
  );
};
