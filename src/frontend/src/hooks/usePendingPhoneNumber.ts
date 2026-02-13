import { useEffect } from 'react';
import { useActor } from './useActor';
import { useGetCallerProfile, useSaveProfile } from './useQueries';

const PENDING_PHONE_KEY = 'pendingPhoneNumber';

export function usePendingPhoneNumber() {
  const { actor } = useActor();
  const { data: profile, isFetched } = useGetCallerProfile();
  const saveMutation = useSaveProfile();

  useEffect(() => {
    // Only attempt to save if we have actor, profile is fetched, and profile exists
    if (!actor || !isFetched || !profile) {
      return;
    }

    const pendingPhone = localStorage.getItem(PENDING_PHONE_KEY);
    
    // If there's a pending phone number and the profile doesn't have one yet
    if (pendingPhone && !profile.phoneNumber) {
      // Save the profile with the pending phone number
      saveMutation.mutate(
        { ...profile, phoneNumber: pendingPhone },
        {
          onSuccess: () => {
            // Clear the pending phone number after successful save
            localStorage.removeItem(PENDING_PHONE_KEY);
            console.log('[usePendingPhoneNumber] Phone number saved successfully');
          },
          onError: (error) => {
            console.error('[usePendingPhoneNumber] Failed to save phone number:', error);
            // Keep the pending number in localStorage for retry
          },
        }
      );
    }
  }, [actor, profile, isFetched, saveMutation]);
}

export function setPendingPhoneNumber(phoneNumber: string) {
  if (phoneNumber) {
    localStorage.setItem(PENDING_PHONE_KEY, phoneNumber);
  }
}

export function clearPendingPhoneNumber() {
  localStorage.removeItem(PENDING_PHONE_KEY);
}
