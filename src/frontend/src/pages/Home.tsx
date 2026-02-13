import { useI18n } from '../i18n/I18nProvider';
import { useGetProfiles, useLikeProfile, useRejectProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Heart, X, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { Alert, AlertDescription } from '../components/ui/alert';
import type { DatingProfile } from '../backend';

interface HomeProps {
  onMatch?: (matchedProfile: DatingProfile, matchedPrincipal: Principal) => void;
}

export function Home({ onMatch }: HomeProps) {
  const { t } = useI18n();
  const { data: profiles, isLoading: profilesLoading } = useGetProfiles();
  const { identity } = useInternetIdentity();
  const likeMutation = useLikeProfile();
  const rejectMutation = useRejectProfile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'like' | 'pass'; show: boolean }>({ type: 'like', show: false });
  const [error, setError] = useState<string | null>(null);

  // Since backend doesn't return principals with profiles, we'll work with what we have
  // This is a known limitation that should be addressed in backend
  const availableProfiles = profiles || [];
  const currentProfile = availableProfiles[currentIndex];

  const handleLike = async () => {
    if (!currentProfile) return;
    
    setError(null);
    setActionFeedback({ type: 'like', show: true });
    
    try {
      // We need a principal to like - this is a backend limitation
      // For now, we'll show feedback but can't actually call the backend
      // In a real implementation, profiles would include their principals
      
      setTimeout(() => {
        setActionFeedback({ type: 'like', show: false });
        setCurrentIndex((prev) => prev + 1);
      }, 500);
      
      // TODO: Once backend provides principals with profiles, uncomment:
      // const isMatch = await likeMutation.mutateAsync(profilePrincipal);
      // if (isMatch && onMatch) {
      //   onMatch(currentProfile, profilePrincipal);
      // }
    } catch (err: any) {
      setActionFeedback({ type: 'like', show: false });
      setError(err.message || 'Failed to like profile');
      console.error('Error liking profile:', err);
    }
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    
    setError(null);
    setActionFeedback({ type: 'pass', show: true });

    try {
      setTimeout(() => {
        setActionFeedback({ type: 'pass', show: false });
        setCurrentIndex((prev) => prev + 1);
      }, 500);
      
      // TODO: Once backend provides principals with profiles, uncomment:
      // await rejectMutation.mutateAsync(profilePrincipal);
    } catch (err: any) {
      setActionFeedback({ type: 'pass', show: false });
      setError(err.message || 'Failed to pass profile');
      console.error('Error passing profile:', err);
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
    <div className="container max-w-2xl py-6 px-4 sm:py-8">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('discover')}</h1>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {availableProfiles.length}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        {actionFeedback.show && (
          <div className={`absolute inset-0 z-10 flex items-center justify-center bg-background/90 rounded-2xl transition-opacity ${
            actionFeedback.type === 'like' ? 'text-green-500' : 'text-red-500'
          }`}>
            {actionFeedback.type === 'like' ? (
              <Heart className="h-24 w-24 fill-current" />
            ) : (
              <X className="h-24 w-24" />
            )}
          </div>
        )}

        <Card className="overflow-hidden shadow-lg rounded-2xl border-2">
          {currentProfile.profilePicUrl && (
            <div className="aspect-[3/4] bg-muted relative overflow-hidden">
              <img
                src={currentProfile.profilePicUrl}
                alt={`${currentProfile.firstName}'s profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h2 className="text-white text-3xl font-bold mb-1">
                  {currentProfile.firstName} {currentProfile.lastName}, {currentProfile.age}
                </h2>
                <p className="text-white/90 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {currentProfile.location}
                </p>
              </div>
            </div>
          )}
          
          {!currentProfile.profilePicUrl && (
            <CardHeader>
              <CardTitle className="text-2xl">
                {currentProfile.firstName} {currentProfile.lastName}, {currentProfile.age}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {currentProfile.location}
              </CardDescription>
            </CardHeader>
          )}

          <CardContent className="space-y-4 p-6">
            {currentProfile.bioSections.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-base">{t('aboutSection')}</h3>
                {currentProfile.bioSections.map((bio, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground mb-2 leading-relaxed">{bio}</p>
                ))}
              </div>
            )}

            {currentProfile.interests.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-base">{t('interests')}</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.interests.map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="rounded-full">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}

            {currentProfile.hobbies.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-base">{t('hobbies')}</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.hobbies.map((hobby, idx) => (
                    <Badge key={idx} variant="outline" className="rounded-full">{hobby}</Badge>
                  ))}
                </div>
              </div>
            )}

            {currentProfile.languages.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-base">{t('languagesSpoken')}</h3>
                <p className="text-sm text-muted-foreground">{currentProfile.languages.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-6 mt-8 justify-center items-center">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-20 w-20 border-2 border-red-500 hover:bg-red-50 hover:border-red-600 transition-all shadow-lg"
            onClick={handlePass}
            disabled={likeMutation.isPending || rejectMutation.isPending}
          >
            <X className="h-10 w-10 text-red-500" />
          </Button>
          <Button
            size="lg"
            className="rounded-full h-20 w-20 bg-primary hover:bg-primary/90 transition-all shadow-lg"
            onClick={handleLike}
            disabled={likeMutation.isPending || rejectMutation.isPending}
          >
            <Heart className="h-10 w-10 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
