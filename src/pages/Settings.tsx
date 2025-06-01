
import { useState } from 'react';
import { ArrowLeft, Crown, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [language, setLanguage] = useState('en');
  const { user, profile, signOut, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePremiumUpgrade = async () => {
    if (profile?.is_premium) return;
    
    // Mock premium upgrade
    const { error } = await updateProfile({ is_premium: true });
    if (!error) {
      toast({
        title: "🎉 Premium Upgrade",
        description: "Congratulations! You are now a Premium member! 🎉"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
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

        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Settings</h1>

          {/* Premium Section */}
          <Card className={profile?.is_premium ? 'bg-yellow-50 dark:bg-yellow-950' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Premium Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.is_premium ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    ✨ You're a Premium member!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enjoy unlimited custom themes and exclusive features.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Upgrade to Premium</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Unlock all custom themes</li>
                      <li>• Priority support</li>
                      <li>• Exclusive features</li>
                      <li>• Ad-free experience</li>
                    </ul>
                  </div>
                  <Button onClick={handlePremiumUpgrade} className="w-full">
                    Upgrade to Premium - $5/month
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <span>Dark Mode</span>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
