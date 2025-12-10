import { useState } from 'react';
import { Header } from '@/components/Header';
import { LandingHero } from '@/components/LandingHero';
import { LoginModal } from '@/components/LoginModal';
import { Dashboard } from '@/components/Dashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ChatSidebar } from '@/components/ChatSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin } = useAdmin();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <div className="flex min-h-screen">
          <div className="flex-1 flex flex-col min-w-0">
            <Header onLoginClick={() => setIsLoginModalOpen(true)} />
            
            {isAuthenticated ? (
              <Dashboard />
            ) : (
              <LandingHero onLoginClick={() => setIsLoginModalOpen(true)} />
            )}
          </div>

          <ChatSidebar />
        </div>
      )}

        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
     </div>
  );
};

export default Index;
