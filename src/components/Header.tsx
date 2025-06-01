
import { useState } from 'react';
import { Search, PenTool, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { ComposeModal } from './ComposeModal';
import { SearchModal } from './SearchModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleUserAction = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            OneLine
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="h-10 w-10"
            >
              <Search className="h-5 w-5" />
            </Button>

            {!isMobile && (
              <Button
                onClick={() => setIsComposeOpen(true)}
                className="h-10 w-10 p-0"
              >
                <PenTool className="h-6 w-6" />
              </Button>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUserAction}
                className="h-10 w-10"
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <ComposeModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};
