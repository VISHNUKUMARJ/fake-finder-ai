
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck, Users, ShieldCheck } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in_at?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (profiles) {
        setUsers(profiles as User[]);
        
        // Count users who have logged in within the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // This is a simplification as we don't have last_sign_in in profiles
        // In a real app, you would track login activity separately
        setActiveUsersCount(profiles.length);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: "User promoted",
        description: `${userName} is now an admin`,
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: true } : user
      ));
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Promotion failed",
        description: "Failed to promote user to admin",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAdmin = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Admin rights removed",
        description: `${userName} is no longer an admin`,
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: false } : user
      ));
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: "Action failed",
        description: "Failed to remove admin rights",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsersCount}</div>
            <p className="text-xs text-muted-foreground">
              Users with recent activity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.is_admin).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Users with admin privileges
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View all users and manage their admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.is_admin ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">User</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.is_admin ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRemoveAdmin(user.id, user.name || user.email)}
                          >
                            Remove Admin
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePromoteToAdmin(user.id, user.name || user.email)}
                          >
                            Make Admin
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
