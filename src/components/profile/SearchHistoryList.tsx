import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search, AlertCircle, ImageIcon, FileVideo, FileAudio, FileText, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchHistoryItem, deleteHistoryItem } from "@/utils/historyManager";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SearchHistoryListProps {
  searchHistory: SearchHistoryItem[];
  onDelete?: () => void;
}

export const SearchHistoryList = ({ searchHistory, onDelete }: SearchHistoryListProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      setIsLoading(true);
      const success = await deleteHistoryItem(itemToDelete);
      setIsLoading(false);
      
      if (success) {
        toast({
          title: "Item deleted",
          description: "The history item has been removed."
        });
        if (onDelete) onDelete();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the history item.",
          variant: "destructive"
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const formatConfidence = (item: SearchHistoryItem) => {
    const confidence = Math.round(item.confidenceScore);
    return item.result ? `${confidence}%` : `${100 - confidence}%`;
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
              <div key={item.id} className="border rounded-md p-4 relative">
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteItem(item.id)}
                    aria-label="Delete item"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="flex justify-between pr-8">
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
                      AI-Generated/Manipulated ({formatConfidence(item)})
                    </span>
                  ) : (
                    <span className="text-green-500 flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Authentic ({formatConfidence(item)})
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this history item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
