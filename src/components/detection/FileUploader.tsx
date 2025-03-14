
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type FileUploaderProps = {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  file: File | null;
};

export const FileUploader = ({ 
  onFileSelected, 
  accept = "*/*", 
  maxSizeMB = 10,
  file
}: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = (selectedFile: File) => {
    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB`,
      });
      return;
    }
    
    // For accept types like "image/*", check if the file mime type starts with the required type
    const fileType = selectedFile.type;
    const acceptArray = accept.split(",").map((type) => type.trim());
    
    const isTypeValid = acceptArray.some((type) => {
      if (type.endsWith("/*")) {
        const category = type.split("/")[0];
        return fileType.startsWith(`${category}/`);
      }
      return type === "*/*" || type === fileType;
    });
    
    if (!isTypeValid) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `Please upload a file of type: ${accept}`,
      });
      return;
    }
    
    onFileSelected(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const handleRemoveFile = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileSelected(null as unknown as File);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-300 dark:border-gray-700",
            "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {accept.includes("image") ? "PNG, JPG or GIF" : 
               accept.includes("video") ? "MP4, WebM or AVI" : 
               accept.includes("audio") ? "MP3, WAV or OGG" : "File"} 
              (max. {maxSizeMB}MB)
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center max-w-[80%]">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                  <Upload className="w-6 h-6 text-blue-500" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {file.type.startsWith("image/") && (
            <div className="mt-4 max-w-md">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="rounded-lg shadow-md max-h-[300px] w-auto object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
