
import { ArrowUp, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LineOfTheDayProps {
  line?: {
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
}

export const LineOfTheDay = ({ line }: LineOfTheDayProps) => {
  const { user } = useAuth();

  const defaultLine = {
    id: 'default',
    text: "Welcome to OneLine - where every thought matters, no matter how brief.",
    author: "OneLine",
    authorId: "system",
    likes: 1337,
    timestamp: new Date(),
    isLiked: false,
    isBookmarked: false,
    theme: 'Default'
  };

  const displayLine = line || defaultLine;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg animate-fade-in relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/30 hover:bg-white/50 transition-colors cursor-help z-10" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{displayLine.timestamp.toLocaleString()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-white/80 mb-2">Line of the Day</h2>
          <p className="text-xl font-medium leading-relaxed">{displayLine.text}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80">@{displayLine.author}</span>
            <span className="text-sm text-white/80">•</span>
            <span className="text-sm text-white/80">
              {formatDistanceToNow(displayLine.timestamp, { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 text-white hover:bg-white/20 ${displayLine.isLiked ? 'bg-white/20' : ''}`}
            >
              <ArrowUp className={`h-4 w-4 ${displayLine.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{displayLine.likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`text-white hover:bg-white/20 ${displayLine.isBookmarked ? 'bg-white/20' : ''}`}
            >
              <Bookmark className={`h-4 w-4 ${displayLine.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
