
import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const themes = [
  { name: 'Default', class: 'bg-gradient-to-r from-blue-500 to-purple-600' },
  { name: 'Sunset', class: 'bg-gradient-to-r from-orange-400 to-pink-600' },
  { name: 'Ocean', class: 'bg-gradient-to-r from-cyan-400 to-blue-600' },
  { name: 'Forest', class: 'bg-gradient-to-r from-green-400 to-emerald-600' },
  { name: 'Royal', class: 'bg-gradient-to-r from-purple-500 to-indigo-600' },
  { name: 'Fire', class: 'bg-gradient-to-r from-red-400 to-yellow-500' }
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeSelect: (theme: string) => void;
}

export const ThemeSelector = ({ selectedTheme, onThemeSelect }: ThemeSelectorProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleThemeSelect = (themeName: string) => {
    if (themeName !== 'Default' && !profile?.is_premium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Premium to unlock custom themes! Only $5/month",
        variant: "destructive"
      });
      return;
    }
    onThemeSelect(themeName);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {themes.map((theme) => {
        const isLocked = theme.name !== 'Default' && !profile?.is_premium;
        const isSelected = selectedTheme === theme.name;
        
        return (
          <Button
            key={theme.name}
            variant="outline"
            className={`relative h-16 overflow-hidden border-2 ${
              isSelected ? 'border-primary' : 'border-border'
            }`}
            onClick={() => handleThemeSelect(theme.name)}
          >
            <div className={`absolute inset-0 ${theme.class}`} />
            {isLocked && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Crown className="h-6 w-6 text-yellow-400" />
              </div>
            )}
            <span className="relative z-10 text-white font-medium text-sm">
              {theme.name}
            </span>
          </Button>
        );
      })}
    </div>
  );
};
