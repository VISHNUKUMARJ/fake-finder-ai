
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, FileVideo, FileText, FileAudio, ArrowRight, HelpCircle, BarChart, PieChart, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSearchHistory, SearchHistoryItem } from "@/utils/historyManager";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [stats, setStats] = useState<{
    totalDetections: number;
    manipulatedDetections: number;
    authenticDetections: number;
    byType: Record<string, { total: number; manipulated: number }>
  }>({
    totalDetections: 0,
    manipulatedDetections: 0,
    authenticDetections: 0,
    byType: {}
  });
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  
  useEffect(() => {
    // Load search history
    const loadHistory = async () => {
      const history = await getSearchHistory();
      setSearchHistory(history);
      
      // Calculate stats
      const calcStats = {
        totalDetections: history.length,
        manipulatedDetections: history.filter(item => item.result).length,
        authenticDetections: history.filter(item => !item.result).length,
        byType: {} as Record<string, { total: number; manipulated: number }>
      };
      
      // Group by type
      history.forEach(item => {
        if (!calcStats.byType[item.type]) {
          calcStats.byType[item.type] = { total: 0, manipulated: 0 };
        }
        calcStats.byType[item.type].total += 1;
        if (item.result) {
          calcStats.byType[item.type].manipulated += 1;
        }
      });
      
      setStats(calcStats);
    };
    
    loadHistory();
  }, []);
  
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
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
    <AppLayout title="Dashboard">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome to FakeFinder AI</h2>
            <p className="text-muted-foreground mt-2">
              Select a detection tool to analyze content for potential manipulation
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setIsLearnMoreOpen(true)}
          >
            <HelpCircle className="h-4 w-4" />
            Learn More
          </Button>
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
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent detection activities</CardDescription>
            </CardHeader>
            <CardContent>
              {searchHistory.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {searchHistory.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <div>
                          <p className="text-sm font-medium capitalize">{item.type} Detection</p>
                          <p className="text-xs text-muted-foreground">
                            {item.filename || item.textSnippet?.substring(0, 20) || "Content"}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(item.date)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activities found
                </div>
              )}
            </CardContent>
            {searchHistory.length > 0 && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  View All History
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Detection Stats
              </CardTitle>
              <CardDescription>Summary of your detection results</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalDetections > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{stats.totalDetections}</p>
                      <p className="text-xs text-muted-foreground">Total Detections</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-red-500">{stats.manipulatedDetections}</p>
                      <p className="text-xs text-muted-foreground">Fake Content</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-green-500">{stats.authenticDetections}</p>
                      <p className="text-xs text-muted-foreground">Authentic Content</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Detection by Type</p>
                    {Object.entries(stats.byType).map(([type, data]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1 capitalize">
                            {getTypeIcon(type)} {type}
                          </span>
                          <span>{data.total} total</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${(data.manipulated / data.total) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{data.manipulated} fake</span>
                          <span>{data.total - data.manipulated} authentic</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No detection data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Learn More Dialog */}
      <Dialog open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">About FakeFinder AI</DialogTitle>
            <DialogDescription>
              Learn how to use our tools to detect manipulated media
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">What is FakeFinder AI?</h3>
              <p className="text-muted-foreground">
                FakeFinder AI is a comprehensive suite of detection tools designed to identify potentially manipulated or AI-generated content across various media types. 
                Our platform uses advanced artificial intelligence to analyze patterns and artifacts that may indicate manipulation.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Our Detection Tools</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center">
                        <Image className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Image Detection</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Upload images to analyze for signs of AI generation, digital manipulation, and inconsistencies. 
                      Our tool examines metadata, pixel patterns, and visual anomalies.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-500 w-8 h-8 rounded-lg flex items-center justify-center">
                        <FileVideo className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Video Detection</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Identify deepfakes and manipulated videos through analysis of facial movements, 
                      audio-video sync issues, and temporal inconsistencies.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500 w-8 h-8 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Text Detection</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Analyze text to determine if it was written by an AI or a human. 
                      Examines linguistic patterns, stylometric features, and statistical signatures.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-500 w-8 h-8 rounded-lg flex items-center justify-center">
                        <FileAudio className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Audio Detection</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Detect voice cloning and synthetic audio by examining frequency patterns, 
                      spectral inconsistencies, and unnatural speech rhythms.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">How To Use FakeFinder</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Select the appropriate detection tool based on your content type</li>
                <li>Upload your file or paste your text for analysis</li>
                <li>Wait for the AI to complete its multi-layered analysis</li>
                <li>Review the detailed results, including confidence scores and specific issues identified</li>
                <li>Use the tracking features to review your detection history in your profile</li>
              </ol>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Understanding Results</h3>
              <p className="text-muted-foreground mb-2">
                Our detection tools provide confidence scores to indicate the likelihood of content being authentic or manipulated.
                Higher scores indicate greater confidence in the analysis.
              </p>
              <p className="text-muted-foreground">
                Remember that no detection system is perfect. While our AI employs advanced techniques, 
                it's best to use these results as part of a broader verification process.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Dashboard;
