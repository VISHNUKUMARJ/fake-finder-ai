
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search, AlertCircle, ImageIcon, FileVideo, FileAudio, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SearchHistoryItem } from "@/utils/historyManager";

interface SearchHistoryListProps {
  searchHistory: SearchHistoryItem[];
}

export const SearchHistoryList = ({ searchHistory }: SearchHistoryListProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <FileVideo className="h-4 w-4" />;
      case 'audio':
        return <FileAudio className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Detection History
        </CardTitle>
        <CardDescription>Your recent detection activities</CardDescription>
      </CardHeader>
      <CardContent>
        {searchHistory.length > 0 ? (
          <div className="space-y-4">
            {searchHistory.map((item) => (
              <div key={item.id} className="border rounded-md p-4">
                <div className="flex justify-between">
                  <div className="font-medium flex items-center">
                    <span className="mr-2">{getTypeIcon(item.type)}</span>
                    <span className="capitalize">{item.type} Detection</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(item.date)}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  {item.filename && (
                    <p className="text-muted-foreground truncate">
                      File: {item.filename}
                    </p>
                  )}
                  {item.textSnippet && (
                    <p className="text-muted-foreground truncate">
                      Text: "{item.textSnippet}"
                    </p>
                  )}
                </div>
                <div className="mt-2 flex items-center">
                  {item.result ? (
                    <span className="text-red-500 flex items-center text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Manipulated content detected ({item.confidenceScore}% confidence)
                    </span>
                  ) : (
                    <span className="text-green-500 flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Authentic content ({item.confidenceScore}% confidence)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 flex flex-col items-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
            <p>No detection history found</p>
            <p className="text-sm mt-1">
              Your detection activities will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
