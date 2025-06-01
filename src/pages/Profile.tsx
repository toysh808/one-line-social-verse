
import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LineCard } from '@/components/LineCard';
import { supabase } from '@/integrations/supabase/client';

interface LineWithProfile {
  id: string;
  text: string;
  author_id: string;
  theme: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
  } | null;
}

interface BookmarkWithLine {
  lines: LineWithProfile;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [userLines, setUserLines] = useState<any[]>([]);
  const [bookmarkedLines, setBookmarkedLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (profile) {
      setNewUsername(profile.username);
      fetchUserData();
    }
  }, [user, profile, navigate]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user's lines
      const { data: linesData } = await supabase
        .from('lines')
        .select(`
          *,
          profiles!lines_author_id_fkey (username)
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch bookmarked lines
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select(`
          lines (
            *,
            profiles!lines_author_id_fkey (username)
          )
        `)
        .eq('user_id', user.id);

      // Fetch user's likes and bookmarks
      const lineIds = [
        ...(linesData || []).map(line => line.id),
        ...(bookmarksData || []).map((bookmark: BookmarkWithLine) => bookmark.lines.id)
      ];

      const [likesResponse, allBookmarksResponse] = await Promise.all([
        supabase
          .from('likes')
          .select('line_id')
          .eq('user_id', user.id)
          .in('line_id', lineIds),
        supabase
          .from('bookmarks')
          .select('line_id')
          .eq('user_id', user.id)
          .in('line_id', lineIds)
      ]);

      const userLikes = likesResponse.data?.map(like => like.line_id) || [];
      const userBookmarks = allBookmarksResponse.data?.map(bookmark => bookmark.line_id) || [];

      // Transform user lines
      const transformedUserLines = (linesData || []).map((line: LineWithProfile) => ({
        id: line.id,
        text: line.text,
        author: line.profiles?.username || 'Unknown',
        authorId: line.author_id,
        likes: line.likes_count,
        timestamp: new Date(line.created_at),
        isLiked: userLikes.includes(line.id),
        isBookmarked: userBookmarks.includes(line.id),
        theme: line.theme
      }));

      // Transform bookmarked lines
      const transformedBookmarkedLines = (bookmarksData || []).map((bookmark: BookmarkWithLine) => ({
        id: bookmark.lines.id,
        text: bookmark.lines.text,
        author: bookmark.lines.profiles?.username || 'Unknown',
        authorId: bookmark.lines.author_id,
        likes: bookmark.lines.likes_count,
        timestamp: new Date(bookmark.lines.created_at),
        isLiked: userLikes.includes(bookmark.lines.id),
        isBookmarked: true,
        theme: bookmark.lines.theme
      }));

      setUserLines(transformedUserLines);
      setBookmarkedLines(transformedBookmarkedLines);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (newUsername.trim() && newUsername !== profile?.username) {
      const { error } = await updateProfile({ username: newUsername.trim() });
      if (!error) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleUpdateUsername}>
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setNewUsername(profile.username);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg font-medium">@{profile.username}</span>
                    {profile.is_premium && <Crown className="h-5 w-5 text-yellow-500" />}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Email: {user.email}</p>
              <p className="text-sm text-muted-foreground">
                Account Type: {profile.is_premium ? 'Premium' : 'Free'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="lines" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lines">
              My Lines ({userLines.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              Bookmarked ({bookmarkedLines.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lines" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : userLines.length > 0 ? (
              userLines.map((line) => (
                <LineCard key={line.id} line={line} onUpdate={fetchUserData} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven't posted any lines yet.
                </p>
                <Button onClick={() => navigate('/')}>
                  Share Your First Line
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : bookmarkedLines.length > 0 ? (
              bookmarkedLines.map((line) => (
                <LineCard key={line.id} line={line} onUpdate={fetchUserData} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No bookmarked lines yet.
                </p>
                <Button onClick={() => navigate('/')}>
                  Discover Lines to Bookmark
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
