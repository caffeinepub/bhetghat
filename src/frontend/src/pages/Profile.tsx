import { useI18n } from '../i18n/I18nProvider';
import { useGetCallerProfile, useSaveProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Loader2, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Gender, type DatingProfile } from '../backend';
import { Alert, AlertDescription } from '../components/ui/alert';

export function Profile() {
  const { t } = useI18n();
  const { data: profile, isLoading, isFetched } = useGetCallerProfile();
  const saveMutation = useSaveProfile();

  const [formData, setFormData] = useState<Partial<DatingProfile>>({
    firstName: '',
    lastName: '',
    age: 18,
    gender: Gender.other,
    location: '',
    profilePicUrl: '',
    images: [],
    bioSections: [''],
    interests: [],
    hobbies: [],
    personalityTraits: [],
    languages: [],
    socialMedia: [],
    links: [],
    isVisible: true,
    hasVideoChatEnabled: false,
    datingPreferences: {
      preferredGenders: [Gender.male, Gender.female, Gender.other],
      minAge: 18,
      maxAge: 99,
      minDistance: BigInt(0),
      maxDistance: BigInt(100),
    },
  });

  const [interestsInput, setInterestsInput] = useState('');
  const [hobbiesInput, setHobbiesInput] = useState('');
  const [languagesInput, setLanguagesInput] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setInterestsInput(profile.interests.join(', '));
      setHobbiesInput(profile.hobbies.join(', '));
      setLanguagesInput(profile.languages.join(', '));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const profileData: DatingProfile = {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      age: formData.age || 18,
      gender: formData.gender || Gender.other,
      location: formData.location || '',
      profilePicUrl: formData.profilePicUrl || '',
      images: formData.images || [],
      bioSections: formData.bioSections || [''],
      interests: interestsInput.split(',').map(s => s.trim()).filter(Boolean),
      hobbies: hobbiesInput.split(',').map(s => s.trim()).filter(Boolean),
      personalityTraits: formData.personalityTraits || [],
      languages: languagesInput.split(',').map(s => s.trim()).filter(Boolean),
      socialMedia: formData.socialMedia || [],
      links: formData.links || [],
      isVisible: formData.isVisible ?? true,
      hasVideoChatEnabled: formData.hasVideoChatEnabled ?? false,
      datingPreferences: formData.datingPreferences || {
        preferredGenders: [Gender.male, Gender.female, Gender.other],
        minAge: 18,
        maxAge: 99,
        minDistance: BigInt(0),
        maxDistance: BigInt(100),
      },
    };

    try {
      await saveMutation.mutateAsync(profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-12 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{profile ? t('editProfile') : t('createProfile')}</h1>
        <p className="text-sm text-muted-foreground">{t('profileDescription')}</p>
      </div>

      {saveMutation.isSuccess && (
        <Alert className="mb-6">
          <AlertDescription>{t('profileSaved')}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo')}</CardTitle>
            <CardDescription>{t('basicInfoDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('firstName')}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('lastName')}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">{t('age')}</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="99"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">{t('gender')}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.male}>{t('male')}</SelectItem>
                    <SelectItem value={Gender.female}>{t('female')}</SelectItem>
                    <SelectItem value={Gender.other}>{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t('location')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('locationPlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePicUrl">{t('profilePicture')}</Label>
              <Input
                id="profilePicUrl"
                value={formData.profilePicUrl}
                onChange={(e) => setFormData({ ...formData, profilePicUrl: e.target.value })}
                placeholder={t('profilePicturePlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('aboutYou')}</CardTitle>
            <CardDescription>{t('aboutYouDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">{t('bio')}</Label>
              <Textarea
                id="bio"
                value={formData.bioSections?.[0] || ''}
                onChange={(e) => setFormData({ ...formData, bioSections: [e.target.value] })}
                placeholder={t('bioPlaceholder')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">{t('interests')}</Label>
              <Input
                id="interests"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder={t('interestsPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hobbies">{t('hobbies')}</Label>
              <Input
                id="hobbies"
                value={hobbiesInput}
                onChange={(e) => setHobbiesInput(e.target.value)}
                placeholder={t('hobbiesPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">{t('languagesLabel')}</Label>
              <Input
                id="languages"
                value={languagesInput}
                onChange={(e) => setLanguagesInput(e.target.value)}
                placeholder={t('languagesPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('preferences')}</CardTitle>
            <CardDescription>{t('preferencesDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('profileVisible')}</Label>
                <p className="text-sm text-muted-foreground">{t('profileVisibleDescription')}</p>
              </div>
              <Switch
                checked={formData.isVisible}
                onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('videoChat')}</Label>
                <p className="text-sm text-muted-foreground">{t('videoChatDescription')}</p>
              </div>
              <Switch
                checked={formData.hasVideoChatEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, hasVideoChatEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('saveProfile')
          )}
        </Button>
      </form>
    </div>
  );
}
