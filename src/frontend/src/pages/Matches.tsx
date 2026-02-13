import { useI18n } from '../i18n/I18nProvider';
import { useGetMatches } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { MessageCircle, Users, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import type { DatingProfile } from '../backend';
import type { Principal } from '@dfinity/principal';

interface MatchesProps {
  onSelectMatch: (profile: DatingProfile, principal: Principal) => void;
}

export function Matches({ onSelectMatch }: MatchesProps) {
  const { t } = useI18n();
  const { data: matches, isLoading } = useGetMatches();

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('loadingMatches')}</p>
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="container max-w-4xl py-12 px-4">
        <Alert>
          <AlertDescription className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">{t('noMatches')}</p>
            <p className="text-sm text-muted-foreground">{t('startSwiping')}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 px-4 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('yourMatches')}</h1>
        <p className="text-sm text-muted-foreground">
          {matches.length} {matches.length === 1 ? t('match') : t('matchesCount')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <Card 
            key={match.principal.toString()} 
            className="hover:shadow-xl transition-all cursor-pointer rounded-2xl border-2 overflow-hidden group"
            onClick={() => onSelectMatch(match.profile, match.principal)}
          >
            <div className="aspect-square bg-muted relative overflow-hidden">
              {match.profile.profilePicUrl && (
                <img
                  src={match.profile.profilePicUrl}
                  alt={match.profile.firstName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-bold text-lg">
                  {match.profile.firstName} {match.profile.lastName}
                </h3>
                <p className="text-white/90 text-sm">
                  {match.profile.age} • {match.profile.location}
                </p>
              </div>
            </div>
            <CardContent className="p-4">
              <Button className="w-full rounded-full" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('sendMessage')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
