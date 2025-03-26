
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, X, Minimize, Maximize, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/pages/Settings";

type Message = {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

// Suggested questions for the user
const suggestedQuestions = [
  "How does image detection work?",
  "What is a deepfake?",
  "How accurate is FakeFinder?",
  "How can I train a model?",
  "Can it detect AI generated text?",
  "What file formats are supported?"
];

// Initial messages the AI assistant will have
const initialMessages: Message[] = [
  {
    id: "welcome-message",
    text: "Hello! I'm your FakeFinder AI Assistant. How can I help you detect fake content today?",
    sender: "assistant",
    timestamp: new Date(),
  },
];

// Create a dictionary of responses for common questions
const responseDatabase: Record<string, string> = {
  "how does image detection work": "Our image detection uses advanced AI to analyze visual inconsistencies, metadata, and manipulation patterns that might indicate a fake. It checks for common signs like unusual shadows, lighting inconsistencies, and digital artifacts.",
  "what is a deepfake": "Deepfakes are synthetic media where a person's likeness is replaced with someone else's using AI. FakeFinder can detect deepfakes by analyzing inconsistencies in facial movements, blinking patterns, and other subtle cues that aren't perfectly replicated by AI.",
  "how accurate is fakefinder": "FakeFinder achieves high accuracy rates between 85-95% depending on the content type. However, as AI-generated fakes improve, we continuously update our detection models to stay ahead of new techniques.",
  "can it detect ai generated text": "Yes, our text detection feature can identify AI-generated content by analyzing patterns, consistency, and stylistic elements that differentiate between human and AI writing patterns.",
  "what file formats are supported": "We support common formats: JPG, PNG, and WebP for images; MP4, WebM for videos; MP3, WAV for audio; and plain text for text analysis.",
  "how can i train a model": "Admin users can train detection models by navigating to the dashboard and clicking on 'Train Model' next to each detection type. You can upload your own datasets or use our online datasets for training. Models are saved permanently for all users to access.",
  "how do i become an admin": "Administrators can be assigned in one of three ways: 1) The first user to sign up automatically becomes an admin, 2) Users with email addresses ending in '@admin.com' are automatically made admins, or 3) An existing admin can promote you through the Settings > Admin Dashboard panel.",
  "who can see my uploads": "Your uploaded content is private and only used for detection purposes. Other users cannot see your uploaded files or analysis results.",
  "how do i use video detection": "To use video detection, upload your video file on the Video Detection page. Our AI will analyze frame consistency, audio-visual sync, and digital manipulation signs to determine if the video has been altered.",
  "where are models stored": "Models are stored securely on our servers. When an admin trains a model, the improvements are permanent and available to all users of the platform.",
  "privacy policy": "We take privacy seriously. The content you upload for detection is processed securely and not stored permanently. For full details, please check our Privacy Policy in the Settings section.",
  "how to report false detection": "If you believe there's been a false detection, you can report it through the feedback button on any detection result page. This helps us improve our algorithms.",
};

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { translate } = useLanguage();

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const findBestResponse = (query: string): string => {
    // Convert the query to lowercase for case-insensitive matching
    const normalizedQuery = query.toLowerCase();
    
    // Check for direct matches first
    for (const [key, response] of Object.entries(responseDatabase)) {
      if (normalizedQuery.includes(key)) {
        return response;
      }
    }
    
    // If no direct match, check for partial matches with key words
    const keywords = ["image", "video", "text", "audio", "deepfake", "detection", "accuracy", "fake", "ai", "admin", "train"];
    for (const keyword of keywords) {
      if (normalizedQuery.includes(keyword)) {
        const relevantResponses = Object.entries(responseDatabase)
          .filter(([key]) => key.includes(keyword))
          .map(([_, response]) => response);
        
        if (relevantResponses.length > 0) {
          return relevantResponses[0];
        }
      }
    }
    
    // Fallback response if no match is found
    return "I don't have specific information about that. I can help with questions about fake content detection, how to use our tools, or understanding different types of manipulated media. Try asking about 'deepfakes', 'AI text', or 'training models'.";
  };

  const handleSendMessage = (text: string = input) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setShowSuggestions(false);
    
    // Simulate AI thinking
    setTimeout(() => {
      const response = findBestResponse(text);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSuggestionClick = (question: string) => {
    handleSendMessage(question);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-80 shadow-lg transition-all duration-300 z-50",
      isMinimized ? "h-14" : "h-[500px]"
    )}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center">
          <Bot className="h-5 w-5 mr-2 text-blue-500" />
          FakeFinder Assistant
        </CardTitle>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMinimize}>
            {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <>
          <CardContent className="p-4 pb-0">
            <ScrollArea className="h-[360px] pr-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "mb-3 p-3 rounded-lg max-w-[90%]",
                    msg.sender === "assistant"
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "bg-blue-500 text-white ml-auto"
                  )}
                >
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-w-[90%] mb-3">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              
              {/* Suggested questions */}
              {showSuggestions && messages.length === 1 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">You can ask me about:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSuggestionClick(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div ref={bottomRef} />
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-2">
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button size="icon" onClick={() => handleSendMessage()} disabled={!input.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};
