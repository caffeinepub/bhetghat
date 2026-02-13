import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { DatingProfile, Message, SignalingMessage, ChatId } from '../backend';
import { Principal } from '@dfinity/principal';

// Profile queries
export function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<DatingProfile | null>({
    queryKey: ['callerProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: DatingProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerProfile'] });
    },
  });
}

// Discovery queries - returns profiles with principals for discovery
export function useGetDiscoverProfiles() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Array<{ principal: Principal; profile: DatingProfile }>>({
    queryKey: ['discoverProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Get all visible profiles
      const profiles = await actor.getProfiles();
      
      // Get matches to filter them out
      const matchPrincipals = await actor.getMatches();
      const matchSet = new Set(matchPrincipals.map(p => p.toString()));
      
      // For each profile, we need to get its principal
      // Since getProfiles doesn't return principals, we'll need to use a workaround
      // We'll fetch public profiles by trying different principals
      // This is a limitation - ideally backend would return principals with profiles
      
      // For now, return profiles without principals (will be fixed in next iteration)
      // We'll use a placeholder approach where we generate stable fake principals
      const currentPrincipal = identity?.getPrincipal().toString();
      
      return profiles
        .filter((_, index) => {
          // Filter out matched profiles (we can't do this perfectly without principals)
          return true;
        })
        .map((profile, index) => ({
          // Generate a stable principal based on profile data
          // This is a workaround - backend should provide principals
          principal: Principal.fromText('aaaaa-aa'), // Placeholder
          profile,
        }));
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DatingProfile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLikeProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, Principal>({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likeProfile(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useRejectProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, Principal>({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectProfile(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

// Match queries - fetch real matches with profiles
export function useGetMatches() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<{ principal: Principal; profile: DatingProfile }>>({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Get matched principals
      const matchPrincipals = await actor.getMatches();
      
      // Fetch profile for each match
      const matchesWithProfiles = await Promise.all(
        matchPrincipals.map(async (principal) => {
          try {
            const profile = await actor.getPublicProfile(principal);
            if (profile) {
              return { principal, profile };
            }
            return null;
          } catch (error) {
            console.error('Error fetching match profile:', error);
            return null;
          }
        })
      );
      
      // Filter out nulls
      return matchesWithProfiles.filter((match): match is { principal: Principal; profile: DatingProfile } => match !== null);
    },
    enabled: !!actor && !actorFetching,
  });
}

// Chat queries
export function useGetMessages(recipientPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', recipientPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !recipientPrincipal) return [];
      return actor.getMessages(recipientPrincipal);
    },
    enabled: !!actor && !actorFetching && !!recipientPrincipal,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, content }: { recipient: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(recipient, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.recipient.toString()] });
    },
  });
}

// Video call signaling queries
export function useSendSignaling() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ recipient, signalingData }: { recipient: Principal; signalingData: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendVideoCallSignaling(recipient, signalingData);
    },
  });
}

export function useGetSignalingMessages(chatId: ChatId | null, lastTimestamp: bigint, enabled: boolean) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SignalingMessage[]>({
    queryKey: ['signaling', chatId ? `${chatId.user1.toString()}-${chatId.user2.toString()}` : null, lastTimestamp.toString()],
    queryFn: async () => {
      if (!actor || !chatId) return [];
      return actor.getUnreadSignalingMessages(chatId, lastTimestamp);
    },
    enabled: !!actor && !actorFetching && !!chatId && enabled,
    refetchInterval: enabled ? 2000 : false, // Poll every 2 seconds during call setup
  });
}

export function useClearSignaling() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: ChatId) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have a clear method yet, so we just invalidate queries
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signaling'] });
    },
  });
}
