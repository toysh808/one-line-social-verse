
import { useState } from 'react';
import { ArrowUp, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LineCardProps {
  line: {
    id: string;
    text: string;
    author: string;
    authorId: string;
    likes: number;
    timestamp: Date;
    isLiked: boolean;
    isBookmarked: boolean;
    theme?: string;
  };
  onUpdate?: () => void;
}

const themes: Record<string, string> = {
  'Default': 'bg-gradient-to-r from-blue-500 to-purple-600',
  'Sunset': 'bg-gradient-to-r from-orange-400 to-pink-600',
  'Ocean': 'bg-gradient-to-r from-cyan-400 to-blue-600',
  'Forest': 'bg-gradient-to-r from-green-400 to-emerald-600',
  'Royal': 'bg-gradient-to-r from-purple-500 to-indigo-600',
  'Fire': 'bg-gradient-to-r from-red-400 to-yellow-500'
};

export const LineCard = ({ line, onUpdate }: LineCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like lines.",
        variant: "destructive"
      });
      return;
    }

    setIsLiking(true);
    try {
      if (line.isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('line_id', line.id);
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user.id, line_id: line.id });
      }
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark lines.",
        variant: "destructive"
      });
      return;
    }

    setIsBookmarking(true);
    try {
      if (line.isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('line_id', line.id);
      } else {
        await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, line_id: line.id });
      }
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const themeClass = themes[line.theme || 'Default'] || themes['Default'];
  const hasTheme = line.theme && line.theme !== 'Default';

  return (
    <Card className="p-4 hover:shadow-md transition-shadow animate-fade-in relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors cursor-help z-10" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{line.timestamp.toLocaleString()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="space-y-3">
        {hasTheme ? (
          <div className={`${themeClass} text-white p-4 rounded-lg`}>
            <p className="text-lg leading-relaxed">{line.text}</p>
          </div>
        ) : (
          <p className="text-lg leading-relaxed">{line.text}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">@{line.author}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(line.timestamp, { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`gap-1 ${line.isLiked ? 'text-primary' : ''}`}
            >
              <ArrowUp className={`h-4 w-4 ${line.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{line.likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={isBookmarking}
              className={line.isBookmarked ? 'text-primary' : ''}
            >
              <Bookmark className={`h-4 w-4 ${line.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
