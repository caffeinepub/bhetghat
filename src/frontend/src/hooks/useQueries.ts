import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DatingProfile, Message } from '../backend';
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

// Discovery queries
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

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likeProfile(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useRejectProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectProfile(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

// Match queries - we need to derive matches from profiles we've liked
export function useGetMatches() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DatingProfile[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!actor) return [];
      // Get all profiles and filter for matches
      // In a real implementation, the backend would provide a dedicated getMatches method
      // For now, we'll return an empty array as the backend doesn't expose matched profiles directly
      return [];
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
