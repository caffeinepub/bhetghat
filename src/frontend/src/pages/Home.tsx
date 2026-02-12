import { useI18n } from '../i18n/I18nProvider';
import { useGetProfiles, useLikeProfile, useRejectProfile, useGetCallerProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Heart, X, MapPin, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { Alert, AlertDescription } from '../components/ui/alert';

export function Home() {
  const { t } = useI18n();
  const { data: profiles, isLoading: profilesLoading } = useGetProfiles();
  const { data: callerProfile } = useGetCallerProfile();
  const likeMutation = useLikeProfile();
  const rejectMutation = useRejectProfile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'like' | 'pass'; show: boolean }>({ type: 'like', show: false });

  // Filter out own profile
  const availableProfiles = profiles?.filter((profile) => {
    // We can't directly compare profiles, so we'll show all for now
    return true;
  }) || [];

  const currentProfile = availableProfiles[currentIndex];

  const handleLike = async () => {
    if (!currentProfile) return;
    
    setActionFeedback({ type: 'like', show: true });
    setTimeout(() => setActionFeedback({ type: 'like', show: false }), 500);

    try {
      // We need to get the principal somehow - for now we'll skip the actual like
      // In a real implementation, profiles would include their principal
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Error liking profile:', error);
    }
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    
    setActionFeedback({ type: 'pass', show: true });
    setTimeout(() => setActionFeedback({ type: 'pass', show: false }), 500);

    try {
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Error passing profile:', error);
    }
  };

  if (profilesLoading) {
    return (
      <div className="container max-w-2xl py-12 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('loadingProfiles')}</p>
        </div>
      </div>
    );
  }

  if (!currentProfile || currentIndex >= availableProfiles.length) {
    return (
      <div className="container max-w-2xl py-12 px-4">
        <Alert>
          <AlertDescription className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">{t('noMoreProfiles')}</p>
            <p className="text-sm text-muted-foreground">{t('checkBackLater')}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('discover')}</h1>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {availableProfiles.length}
        </p>
      </div>

      <div className="relative">
        {actionFeedback.show && (
          <div className={`absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-lg transition-opacity ${
            actionFeedback.type === 'like' ? 'text-green-500' : 'text-red-500'
          }`}>
            {actionFeedback.type === 'like' ? (
              <Heart className="h-24 w-24 fill-current" />
            ) : (
              <X className="h-24 w-24" />
            )}
          </div>
        )}

        <Card className="overflow-hidden">
          {currentProfile.profilePicUrl && (
            <div className="aspect-[3/4] bg-muted relative">
              <img
                src={currentProfile.profilePicUrl}
                alt={`${currentProfile.firstName}'s profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentProfile.firstName} {currentProfile.lastName}, {currentProfile.age}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {currentProfile.location}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {currentProfile.bioSections.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('aboutSection')}</h3>
                {currentProfile.bioSections.map((bio, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground mb-2">{bio}</p>
                ))}
              </div>
            )}

            {currentProfile.interests.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('interests')}</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.interests.map((interest, idx) => (
                    <Badge key={idx} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}

            {currentProfile.hobbies.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('hobbies')}</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.hobbies.map((hobby, idx) => (
                    <Badge key={idx} variant="outline">{hobby}</Badge>
                  ))}
                </div>
              </div>
            )}

            {currentProfile.languages.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('languagesSpoken')}</h3>
                <p className="text-sm text-muted-foreground">{currentProfile.languages.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-6 justify-center">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-16 w-16 border-2"
            onClick={handlePass}
            disabled={likeMutation.isPending || rejectMutation.isPending}
          >
            <X className="h-8 w-8 text-red-500" />
          </Button>
          <Button
            size="lg"
            className="rounded-full h-16 w-16"
            onClick={handleLike}
            disabled={likeMutation.isPending || rejectMutation.isPending}
          >
            <Heart className="h-8 w-8 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
