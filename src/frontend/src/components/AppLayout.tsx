import { type ReactNode } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { LanguageToggle } from './LanguageToggle';
import { Heart, Menu, Home, Users, User, Settings, Download } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { useState } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  currentPage?: 'home' | 'matches' | 'profile' | 'settings' | 'install' | 'chat';
  onNavigate?: (page: string) => void;
}

export function AppLayout({ children, currentPage = 'home', onNavigate }: AppLayoutProps) {
  const { t } = useI18n();
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleNavigation = (page: string) => {
    setSheetOpen(false);
    onNavigate?.(page);
  };

  const navItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'matches', label: t('matches'), icon: Users },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'settings', label: t('settings'), icon: Settings },
    { id: 'install', label: t('installHelp'), icon: Download },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="text-xl font-bold text-primary">{t('appName')}</span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            
            {identity ? (
              <Button variant="ghost" size="sm" onClick={clear}>
                {t('logout')}
              </Button>
            ) : (
              <Button size="sm" onClick={login} disabled={isLoggingIn}>
                {isLoggingIn ? '...' : t('login')}
              </Button>
            )}

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>{t('appName')}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentPage === item.id ? 'secondary' : 'ghost'}
                        className="justify-start"
                        onClick={() => handleNavigation(item.id)}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Transparent overlay when menu is open */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent backdrop-blur-[2px]"
          onClick={() => setSheetOpen(false)}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 pb-safe">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6 mt-auto">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            {t('builtWith')} <Heart className="inline h-4 w-4 text-primary fill-primary" /> {t('using')}{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'bhetghat'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1 text-xs">© {new Date().getFullYear()} {t('appName')}</p>
        </div>
      </footer>
    </div>
  );
}
