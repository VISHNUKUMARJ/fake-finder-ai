
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, FileVideo, FileText, FileAudio, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  
  const detectionCards = [
    {
      title: "Image Detection",
      description: "Detect AI-generated or manipulated images",
      icon: Image,
      color: "bg-blue-500",
      path: "/image-detection",
    },
    {
      title: "Video Detection",
      description: "Detect deepfakes and manipulated videos",
      icon: FileVideo,
      color: "bg-purple-500",
      path: "/video-detection",
    },
    {
      title: "Text Detection",
      description: "Identify AI-generated text content",
      icon: FileText,
      color: "bg-green-500",
      path: "/text-detection",
    },
    {
      title: "Audio Detection",
      description: "Spot voice cloning and manipulated audio",
      icon: FileAudio,
      color: "bg-orange-500",
      path: "/audio-detection",
    },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to FakeFinder AI</h2>
          <p className="text-muted-foreground mt-2">
            Select a detection tool to analyze content for potential manipulation
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {detectionCards.map((card) => (
            <Card key={card.title} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => navigate(card.path)}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent detection activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                No recent activities found
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detection Stats</CardTitle>
              <CardDescription>Summary of your detection results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                No detection data available yet
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
