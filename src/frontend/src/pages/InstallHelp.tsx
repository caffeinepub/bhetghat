import { useI18n } from '../i18n/I18nProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Smartphone, Download } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export function InstallHelp() {
  const { t } = useI18n();

  return (
    <div className="container max-w-3xl py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Download className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('installTitle')}</h1>
          <p className="text-muted-foreground mt-1">{t('installDescription')}</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="android" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="font-semibold">{t('androidTitle')}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ol className="space-y-3 mt-4 list-decimal list-inside">
              <li className="text-sm">{t('androidStep1')}</li>
              <li className="text-sm">{t('androidStep2')}</li>
              <li className="text-sm">{t('androidStep3')}</li>
              <li className="text-sm">{t('androidStep4')}</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ios" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="font-semibold">{t('iosTitle')}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ol className="space-y-3 mt-4 list-decimal list-inside">
              <li className="text-sm">{t('iosStep1')}</li>
              <li className="text-sm">{t('iosStep2')}</li>
              <li className="text-sm">{t('iosStep3')}</li>
              <li className="text-sm">{t('iosStep4')}</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Alert className="mt-6">
        <AlertDescription className="text-sm">
          {t('installNote')}
        </AlertDescription>
      </Alert>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Why Install?</CardTitle>
          <CardDescription>Benefits of installing Bhetghat</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✓ Quick access from your home screen</li>
            <li>✓ Full-screen experience without browser UI</li>
            <li>✓ Works offline with cached content</li>
            <li>✓ Faster loading and better performance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
