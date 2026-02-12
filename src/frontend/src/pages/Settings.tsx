import { useI18n } from '../i18n/I18nProvider';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LanguageToggle } from '../components/LanguageToggle';
import { Settings as SettingsIcon, LogOut, Globe, Info } from 'lucide-react';
import { Separator } from '../components/ui/separator';

export function Settings() {
  const { t, language } = useI18n();
  const { identity, clear } = useInternetIdentity();

  const handleLogout = async () => {
    await clear();
  };

  return (
    <div className="container max-w-2xl py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('settings')}</h1>
        <p className="text-sm text-muted-foreground">{t('settingsDescription')}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('language')}
            </CardTitle>
            <CardDescription>{t('languageDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('currentLanguage')}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? t('english') : t('nepali')}
                </p>
              </div>
              <LanguageToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t('account')}
            </CardTitle>
            <CardDescription>{t('accountDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {identity && (
              <>
                <div>
                  <p className="text-sm font-medium mb-1">{t('principal')}</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {identity.getPrincipal().toString()}
                  </p>
                </div>
                <Separator />
              </>
            )}
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t('aboutApp')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>{t('appName')}</strong></p>
            <p>{t('appMotto')}</p>
            <p className="text-xs pt-2">© {new Date().getFullYear()} {t('appName')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
