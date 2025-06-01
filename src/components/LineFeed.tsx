
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LineCard } from './LineCard';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export const LineFeed = () => {
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const dateFilter = searchParams.get('date');

  const fetchLines = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('lines')
        .select(`
          *,
          profiles!lines_author_id_fkey (username)
        `)
        .order('created_at', { ascending: false });

      if (dateFilter) {
        const filterDate = new Date(dateFilter);
        const startOfDay = new Date(filterDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filterDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
      }

      const { data: linesData, error } = await query;
      
      if (error) throw error;

      // Fetch likes and bookmarks for the current user
      let userLikes: string[] = [];
      let userBookmarks: string[] = [];

      if (user && linesData) {
        const lineIds = linesData.map(line => line.id);
        
        const [likesResponse, bookmarksResponse] = await Promise.all([
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

        userLikes = likesResponse.data?.map(like => like.line_id) || [];
        userBookmarks = bookmarksResponse.data?.map(bookmark => bookmark.line_id) || [];
      }

      // Transform data to match Line interface
      const transformedLines = (linesData || []).map((line: LineWithProfile) => ({
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

      setLines(transformedLines);
    } catch (error) {
      console.error('Error fetching lines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
  }, [user, dateFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {dateFilter 
            ? 'No lines found for this date. Try a different date or check back later!'
            : 'No lines yet. Be the first to share your thoughts!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dateFilter && (
        <div className="bg-muted/50 p-3 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Showing lines from {new Date(dateFilter).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      )}
      
      {lines.map((line) => (
        <LineCard key={line.id} line={line} onUpdate={fetchLines} />
      ))}
      
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">End of feed</p>
      </div>
    </div>
  );
};
