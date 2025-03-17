
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Sparkles } from "lucide-react";

interface ResultAlertProps {
  result: {
    isManipulated: boolean;
    confidenceScore: number;
    detailsText: string;
    issues?: string[];
  } | null;
  color?: "red" | "orange" | "green";
}

export const ResultAlert = ({ result, color = "red" }: ResultAlertProps) => {
  if (!result) return null;
  
  const { isManipulated, confidenceScore, detailsText, issues } = result;
  
  if (isManipulated) {
    const bgColor = color === "red" ? "bg-red-50 dark:bg-red-950/50" : "bg-orange-50 dark:bg-orange-950/50";
    const borderColor = color === "red" ? "border-red-500" : "border-orange-500";
    const textColor = color === "red" ? "text-red-700 dark:text-red-300" : "text-orange-700 dark:text-orange-300";
    const iconColor = color === "red" ? "text-red-500" : "text-orange-500";
    
    return (
      <Alert className={`mt-6 ${borderColor} ${bgColor}`}>
        {color === "red" ? (
          <Sparkles className={`h-5 w-5 ${iconColor}`} />
        ) : (
          <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
        )}
        <AlertTitle className={`${textColor} text-lg font-semibold`}>
          AI-Generated or Manipulated Content Detected
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p>{detailsText}</p>
          {issues && issues.length > 0 && (
            <div className="mt-3">
              <p className="font-medium">AI detection signals:</p>
              <ul className="list-disc pl-5 mt-1">
                {issues.map((issue, index) => (
                  <li key={index} className={textColor}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3">
            <strong>AI confidence score: {confidenceScore}%</strong>
          </p>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="mt-6 border-green-500 bg-green-50 dark:bg-green-950/50">
      <CheckCircle2 className="h-5 w-5 text-green-500" />
      <AlertTitle className="text-green-700 dark:text-green-300 text-lg font-semibold">
        Likely Authentic Content
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p>{detailsText}</p>
        <p className="mt-2">
          <strong>Confidence score: {confidenceScore}%</strong>
        </p>
      </AlertDescription>
    </Alert>
  );
};
