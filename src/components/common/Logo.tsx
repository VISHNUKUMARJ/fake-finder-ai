
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
      text: "text-sm",
    },
    md: {
      container: "h-8 w-8",
      text: "text-lg",
    },
    lg: {
      container: "h-10 w-10",
      text: "text-xl",
    },
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn(
        "flex items-center justify-center overflow-hidden rounded-lg",
        sizeMap[size].container
      )}>
        <img 
          src="/lovable-uploads/be02dc29-d430-4f2a-9241-e1486ad09f86.png" 
          alt="FakeFinder AI Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      {withText && (
        <span className={cn("font-semibold", sizeMap[size].text)}>
          FakeFinder AI
        </span>
      )}
    </div>
  );
};
