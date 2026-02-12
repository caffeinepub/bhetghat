import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { AppLayout } from './components/AppLayout';
import { OfflineState } from './components/OfflineState';
import { Welcome } from './pages/Welcome';
import { InstallHelp } from './pages/InstallHelp';
import { useState } from 'react';

type PageType = 'home' | 'matches' | 'profile' | 'settings' | 'install';

function App() {
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  if (!isOnline) {
    return <OfflineState />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'install' ? (
        <InstallHelp />
      ) : !identity ? (
        <Welcome />
      ) : (
        <div className="container max-w-4xl py-12 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground">
            Profile creation, matching, and chat features will be available soon.
          </p>
        </div>
      )}
    </AppLayout>
  );
}

export default App;
