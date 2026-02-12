import { useI18n } from '../i18n/I18nProvider';
import { WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function OfflineState() {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Alert className="max-w-md">
        <WifiOff className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">{t('offline')}</AlertTitle>
        <AlertDescription className="mt-2">
          {t('offlineDescription')}
        </AlertDescription>
      </Alert>
    </div>
  );
}
