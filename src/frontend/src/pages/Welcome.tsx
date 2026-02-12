import { useI18n } from '../i18n/I18nProvider';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Heart, Users, MessageCircle, Shield } from 'lucide-react';

export function Welcome() {
  const { t } = useI18n();
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    {
      icon: Heart,
      title: 'Find Connections',
      description: 'Swipe to discover people who match your interests',
    },
    {
      icon: Users,
      title: 'Build Relationships',
      description: 'From casual contacts to meaningful relationships',
    },
    {
      icon: MessageCircle,
      title: 'Chat Safely',
      description: 'Message your matches in a secure environment',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is protected with Internet Identity',
    },
  ];

  return (
    <div className="container max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Heart className="h-16 w-16 text-primary fill-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('welcomeTitle')}</h1>
        <p className="text-xl text-muted-foreground mb-2">{t('welcomeSubtitle')}</p>
        <p className="text-sm text-muted-foreground italic">{t('appMotto')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="border-2">
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('loginPrompt')}</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            {t('loginDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            size="lg"
            variant="secondary"
            onClick={login}
            disabled={isLoggingIn}
            className="min-w-[200px]"
          >
            {isLoggingIn ? 'Connecting...' : t('getStarted')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
