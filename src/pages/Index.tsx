
import { useState } from 'react';
import { Header } from '@/components/Header';
import { LineOfTheDay } from '@/components/LineOfTheDay';
import { LineFeed } from '@/components/LineFeed';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ComposeModal } from '@/components/ComposeModal';

const Index = () => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          <LineOfTheDay />
          <LineFeed />
        </div>
      </main>

      <FloatingActionButton onClick={() => setIsComposeOpen(true)} />
      <ComposeModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />
    </div>
  );
};

export default Index;
