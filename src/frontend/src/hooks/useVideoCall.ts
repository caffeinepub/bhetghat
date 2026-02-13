import { useState, useRef, useEffect, useCallback } from 'react';
import { Principal } from '@dfinity/principal';
import { useSendSignaling, useGetSignalingMessages, useClearSignaling } from './useQueries';
import type { TranslationKey } from '../i18n/translations';
import type { ChatId } from '../backend';

type CallState = 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'connected' | 'ended' | 'error';

interface VideoCallConfig {
  recipientPrincipal: Principal | null;
  chatId: ChatId | null;
}

export interface VideoCallError {
  type: 'permission' | 'connection' | 'signaling' | 'unknown';
  messageKey: TranslationKey;
}

export function useVideoCall({ recipientPrincipal, chatId }: VideoCallConfig) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [error, setError] = useState<VideoCallError | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const processedCandidatesRef = useRef<Set<string>>(new Set());
  
  const sendSignalingMutation = useSendSignaling();
  const clearSignalingMutation = useClearSignaling();
  
  // Poll for signaling messages during setup
  const shouldPoll = callState === 'outgoing' || callState === 'incoming' || callState === 'connecting';
  const { data: signalingMessages } = useGetSignalingMessages(
    chatId,
    shouldPoll ? 0n : -1n,
    shouldPoll
  );

  // ICE configuration with public STUN servers
  const iceConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Clean up function
  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    pendingCandidatesRef.current = [];
    processedCandidatesRef.current.clear();
  }, [localStream]);

  // Initialize peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(iceConfiguration);
    
    pc.onicecandidate = (event) => {
      if (event.candidate && recipientPrincipal) {
        const candidateData = JSON.stringify({
          type: 'candidate',
          candidate: event.candidate.toJSON(),
        });
        sendSignalingMutation.mutate({
          recipient: recipientPrincipal,
          signalingData: candidateData,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallState('connected');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setError({ type: 'connection', messageKey: 'callConnectionError' });
        setCallState('error');
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [recipientPrincipal, sendSignalingMutation]);

  // Start outgoing call
  const startCall = useCallback(async () => {
    if (!recipientPrincipal || callState !== 'idle') return false;

    try {
      setCallState('outgoing');
      setError(null);

      // Get local media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection and add tracks
      const pc = createPeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const offerData = JSON.stringify({
        type: 'offer',
        sdp: offer.sdp,
      });

      await sendSignalingMutation.mutateAsync({
        recipient: recipientPrincipal,
        signalingData: offerData,
      });

      setCallState('connecting');
      return true;
    } catch (err: any) {
      console.error('Error starting call:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError({ type: 'permission', messageKey: 'callPermissionDenied' });
      } else {
        setError({ type: 'unknown', messageKey: 'callGenericError' });
      }
      setCallState('error');
      cleanup();
      return false;
    }
  }, [recipientPrincipal, callState, createPeerConnection, sendSignalingMutation, cleanup]);

  // Accept incoming call
  const acceptCall = useCallback(async (offerSdp: string) => {
    if (!recipientPrincipal || callState !== 'incoming') return false;

    try {
      setCallState('connecting');
      setError(null);

      // Get local media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection and add tracks
      const pc = createPeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Set remote description
      await pc.setRemoteDescription({
        type: 'offer',
        sdp: offerSdp,
      });

      // Process pending candidates
      for (const candidate of pendingCandidatesRef.current) {
        await pc.addIceCandidate(candidate);
      }
      pendingCandidatesRef.current = [];

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const answerData = JSON.stringify({
        type: 'answer',
        sdp: answer.sdp,
      });

      await sendSignalingMutation.mutateAsync({
        recipient: recipientPrincipal,
        signalingData: answerData,
      });

      return true;
    } catch (err: any) {
      console.error('Error accepting call:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError({ type: 'permission', messageKey: 'callPermissionDenied' });
      } else {
        setError({ type: 'unknown', messageKey: 'callGenericError' });
      }
      setCallState('error');
      cleanup();
      return false;
    }
  }, [recipientPrincipal, callState, createPeerConnection, sendSignalingMutation, cleanup]);

  // Decline incoming call
  const declineCall = useCallback(async () => {
    setCallState('idle');
    setError(null);
    cleanup();
    if (chatId !== null) {
      await clearSignalingMutation.mutateAsync(chatId);
    }
  }, [cleanup, chatId, clearSignalingMutation]);

  // End call
  const endCall = useCallback(async () => {
    setCallState('ended');
    cleanup();
    if (chatId !== null) {
      await clearSignalingMutation.mutateAsync(chatId);
    }
    setTimeout(() => setCallState('idle'), 2000);
  }, [cleanup, chatId, clearSignalingMutation]);

  // Process incoming signaling messages
  useEffect(() => {
    if (!signalingMessages || signalingMessages.length === 0) return;

    const processMessages = async () => {
      for (const msg of signalingMessages) {
        try {
          const data = JSON.parse(msg.signalingData);
          
          if (data.type === 'offer' && callState === 'idle') {
            setCallState('incoming');
            // Store offer for later processing when user accepts
            pendingCandidatesRef.current = [];
          } else if (data.type === 'answer' && callState === 'connecting' && peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription({
              type: 'answer',
              sdp: data.sdp,
            });
          } else if (data.type === 'candidate') {
            const candidateKey = JSON.stringify(data.candidate);
            if (!processedCandidatesRef.current.has(candidateKey)) {
              processedCandidatesRef.current.add(candidateKey);
              const candidate = new RTCIceCandidate(data.candidate);
              
              if (peerConnectionRef.current) {
                if (peerConnectionRef.current.remoteDescription) {
                  await peerConnectionRef.current.addIceCandidate(candidate);
                } else {
                  pendingCandidatesRef.current.push(candidate);
                }
              }
            }
          }
        } catch (err) {
          console.error('Error processing signaling message:', err);
        }
      }
    };

    processMessages();
  }, [signalingMessages, callState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    callState,
    error,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    isLoading: sendSignalingMutation.isPending || clearSignalingMutation.isPending,
  };
}
