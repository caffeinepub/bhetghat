import { useI18n } from '../i18n/I18nProvider';
import { useGetMatches } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { MessageCircle, Users, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import type { DatingProfile } from '../backend';

interface MatchesProps {
  onSelectMatch: (profile: DatingProfile) => void;
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
    <div className="container max-w-4xl py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('yourMatches')}</h1>
        <p className="text-sm text-muted-foreground">
          {matches.length} {matches.length === 1 ? t('match') : t('matchesCount')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {matches.map((match, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelectMatch(match)}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Avatar className="h-16 w-16">
                <AvatarImage src={match.profilePicUrl} alt={match.firstName} />
                <AvatarFallback>{match.firstName[0]}{match.lastName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {match.firstName} {match.lastName}
                </CardTitle>
                <CardDescription>
                  {match.age} • {match.location}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
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
