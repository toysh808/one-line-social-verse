
import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeSelector } from './ThemeSelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComposeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ComposeModal = ({ open, onOpenChange }: ComposeModalProps) => {
  const [step, setStep] = useState<'text' | 'theme'>('text');
  const [text, setText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('Default');
  const [isPosting, setIsPosting] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const characterLimit = 150;
  const remainingChars = characterLimit - text.length;

  const handleNext = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post a line.",
        variant: "destructive"
      });
      return;
    }
    if (text.trim()) {
      setStep('theme');
    }
  };

  const handlePost = async () => {
    if (!user || !text.trim()) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('lines')
        .insert({
          text: text.trim(),
          author_id: user.id,
          theme: selectedTheme
        });

      if (error) throw error;

      toast({
        title: "Posted!",
        description: "Your line has been shared with the world."
      });
      
      // Reset form and close modal
      setText('');
      setSelectedTheme('Default');
      setStep('text');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to post your line. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    setText('');
    setSelectedTheme('Default');
    setStep('text');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className={`${
          isMobile 
            ? 'h-full max-h-full m-0 rounded-none w-full' 
            : 'sm:max-w-md'
        } p-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {step === 'theme' ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep('text')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <div />
            )}
            
            <h2 className="text-lg font-semibold">
              {step === 'text' ? 'Compose Line' : 'Choose Theme'}
            </h2>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {step === 'text' ? (
              <div className="space-y-4">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's on your mind?"
                  className="min-h-32 resize-none text-lg"
                  maxLength={characterLimit}
                  autoFocus
                />
                <div className="flex justify-between items-center">
                  <span 
                    className={`text-sm ${
                      remainingChars < 20 ? 'text-red-500' : 'text-muted-foreground'
                    }`}
                  >
                    {remainingChars} characters remaining
                  </span>
                  <Button
                    onClick={handleNext}
                    disabled={!text.trim() || !user}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ThemeSelector
                  selectedTheme={selectedTheme}
                  onThemeSelect={setSelectedTheme}
                />
                <Button
                  onClick={handlePost}
                  disabled={isPosting}
                  className="w-full"
                >
                  {isPosting ? 'Posting...' : 'Post Line'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
