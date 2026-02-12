import { useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useGetCallerProfile } from './hooks/useQueries';
import { AppLayout } from './components/AppLayout';
import { OfflineState } from './components/OfflineState';
import { Welcome } from './pages/Welcome';
import { InstallHelp } from './pages/InstallHelp';
import { Home } from './pages/Home';
import { Matches } from './pages/Matches';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { useState } from 'react';
import type { DatingProfile } from './backend';
import { Principal } from '@dfinity/principal';
import { FatalErrorBoundary } from './components/FatalErrorBoundary';
import { I18nProvider } from './i18n/I18nProvider';
import { ThemeProvider } from 'next-themes';

type PageType = 'home' | 'matches' | 'chat' | 'profile' | 'settings' | 'install';

function AppContent() {
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerProfile();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedMatch, setSelectedMatch] = useState<{ profile: DatingProfile; principal: Principal | null } | null>(null);

  const isAuthenticated = !!identity;

  // Signal that the app has mounted successfully
  useEffect(() => {
    window.dispatchEvent(new Event('app-mounted'));
    console.log('[App] React app mounted successfully');
  }, []);

  if (!isOnline) {
    return <OfflineState />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    if (page !== 'chat') {
      setSelectedMatch(null);
    }
  };

  const handleSelectMatch = (profile: DatingProfile) => {
    setSelectedMatch({ profile, principal: null });
    setCurrentPage('chat');
  };

  const handleBackFromChat = () => {
    setSelectedMatch(null);
    setCurrentPage('matches');
  };

  // Show install page regardless of auth
  if (currentPage === 'install') {
    return (
      <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
        <InstallHelp />
      </AppLayout>
    );
  }

  // Show welcome if not authenticated
  if (!isAuthenticated) {
    return (
      <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
        <Welcome />
      </AppLayout>
    );
  }

  // Check if profile exists (but don't show loading flash)
  const hasProfile = userProfile !== null;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && !hasProfile;

  // Always allow access to Profile and Settings
  if (currentPage === 'profile') {
    return (
      <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
        <Profile />
      </AppLayout>
    );
  }

  if (currentPage === 'settings') {
    return (
      <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
        <Settings />
      </AppLayout>
    );
  }

  // For other pages, require profile completion
  if (showProfileSetup) {
    return (
      <AppLayout currentPage="profile" onNavigate={handleNavigate}>
        <Profile />
      </AppLayout>
    );
  }

  // Show loading state while checking profile
  if (profileLoading || !isFetched) {
    return (
      <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
        <div className="container max-w-4xl py-12 px-4 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  // Render authenticated pages
  return (
    <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'home' && <Home />}
      {currentPage === 'matches' && <Matches onSelectMatch={handleSelectMatch} />}
      {currentPage === 'chat' && selectedMatch && (
        <Chat match={selectedMatch.profile} matchPrincipal={selectedMatch.principal} onBack={handleBackFromChat} />
      )}
    </AppLayout>
  );
}

function App() {
  return (
    <FatalErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>
          <AppContent />
        </I18nProvider>
      </ThemeProvider>
    </FatalErrorBoundary>
  );
}

export default App;
