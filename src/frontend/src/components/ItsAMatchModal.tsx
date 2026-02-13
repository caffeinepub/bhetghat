import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, MessageCircle, X } from 'lucide-react';
import type { DatingProfile } from '../backend';
import { useI18n } from '../i18n/I18nProvider';

interface ItsAMatchModalProps {
  open: boolean;
  onClose: () => void;
  matchedProfile: DatingProfile;
  currentUserProfile: DatingProfile | null;
  onStartChat: () => void;
}

export function ItsAMatchModal({ 
  open, 
  onClose, 
  matchedProfile, 
  currentUserProfile,
  onStartChat 
}: ItsAMatchModalProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold text-primary">
            {t('itsAMatch')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('matchDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-4 py-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={currentUserProfile?.profilePicUrl} alt={currentUserProfile?.firstName} />
              <AvatarFallback>
                {currentUserProfile?.firstName?.[0]}{currentUserProfile?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <Heart className="h-12 w-12 text-primary fill-primary animate-pulse" />

          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={matchedProfile.profilePicUrl} alt={matchedProfile.firstName} />
              <AvatarFallback>
                {matchedProfile.firstName[0]}{matchedProfile.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-lg font-semibold">
            {t('youAnd')} {matchedProfile.firstName} {t('likedEachOther')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            size="lg" 
            className="w-full rounded-full"
            onClick={onStartChat}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            {t('sendMessage')}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full rounded-full"
            onClick={onClose}
          >
            {t('keepSwiping')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
