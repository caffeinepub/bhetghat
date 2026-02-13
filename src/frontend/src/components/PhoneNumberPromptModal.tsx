import { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { useSaveProfile, useGetCallerProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, Phone } from 'lucide-react';

interface PhoneNumberPromptModalProps {
  open: boolean;
  onClose: () => void;
}

export function PhoneNumberPromptModal({ open, onClose }: PhoneNumberPromptModalProps) {
  const { t } = useI18n();
  const { data: profile } = useGetCallerProfile();
  const saveMutation = useSaveProfile();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSave = async () => {
    if (!profile) return;

    const trimmedPhone = phoneNumber.trim();
    
    try {
      await saveMutation.mutateAsync({
        ...profile,
        phoneNumber: trimmedPhone || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error saving phone number:', error);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {t('phoneNumberPromptTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('phoneNumberPromptDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone-prompt">
              {t('phoneNumber')} <span className="text-muted-foreground text-xs">({t('optional')})</span>
            </Label>
            <Input
              id="phone-prompt"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t('phoneNumberPlaceholder')}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={saveMutation.isPending}
            className="w-full sm:w-auto"
          >
            {t('skip')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full sm:w-auto"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('saving')}
              </>
            ) : (
              t('save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
