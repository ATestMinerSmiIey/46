import { useState } from 'react';
import { Header } from '@/components/Header';
import { LandingHero } from '@/components/LandingHero';
import { LoginModal } from '@/components/LoginModal';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} />
      
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <LandingHero onLoginClick={() => setIsLoginModalOpen(true)} />
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
