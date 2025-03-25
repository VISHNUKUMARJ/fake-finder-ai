
import { AppLayout } from "@/components/layout/AppLayout";
import ActivityHistory from "@/components/dashboard/ActivityHistory";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, ImageIcon, Film, Mic, TextQuote } from "lucide-react";
import { ModelStatusCard } from "@/components/dashboard/ModelStatusCard";
import { useState, useEffect } from "react";
import { SearchHistoryItem, getSearchHistory } from "@/utils/historyManager";

const Dashboard = () => {
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  
  const loadHistoryItems = async () => {
    const items = await getSearchHistory();
    setHistoryItems(items);
  };
  
  useEffect(() => {
    loadHistoryItems();
  }, []);
  
  return (
    <AppLayout>
      <div className="container py-6 space-y-8">
        {/* Welcome Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Welcome to FakeFinder AI</CardTitle>
              <CardDescription>Your AI-powered tool for detecting fake content.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Get started by selecting a detection tool below or reviewing your recent activity.</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Detection Tools */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Detection Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/image-detection">
              <Card className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Image Detection</CardTitle>
                  <CardDescription>Analyze images for AI-generated content.</CardDescription>
                </CardHeader>
                <CardContent>
                  Detect manipulated or AI-generated images with advanced analysis techniques.
                </CardContent>
              </Card>
            </Link>
            <Link to="/video-detection">
              <Card className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Film className="h-5 w-5" /> Video Detection</CardTitle>
                  <CardDescription>Detect deepfakes and video manipulations.</CardDescription>
                </CardHeader>
                <CardContent>
                  Identify inconsistencies and anomalies in videos that indicate AI manipulation.
                </CardContent>
              </Card>
            </Link>
            <Link to="/audio-detection">
              <Card className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Audio Detection</CardTitle>
                  <CardDescription>Analyze audio for synthetic voices and manipulations.</CardDescription>
                </CardHeader>
                <CardContent>
                  Detect AI-generated voices and other audio manipulations with spectral analysis.
                </CardContent>
              </Card>
            </Link>
            <Link to="/text-detection">
              <Card className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TextQuote className="h-5 w-5" /> Text Detection</CardTitle>
                  <CardDescription>Identify AI-generated text and writing patterns.</CardDescription>
                </CardHeader>
                <CardContent>
                  Analyze text for statistical patterns and stylistic anomalies indicative of AI generation.
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
        
        {/* Model Status */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Model Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModelStatusCard type="image" />
            <ModelStatusCard type="video" />
            <ModelStatusCard type="audio" />
            <ModelStatusCard type="text" />
          </div>
        </div>
        
        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <ActivityHistory items={historyItems} onDelete={loadHistoryItems} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
