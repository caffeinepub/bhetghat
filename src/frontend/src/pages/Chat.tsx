import { useI18n } from '../i18n/I18nProvider';
import { useGetMessages, useSendMessage } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useVideoCall } from '../hooks/useVideoCall';
import { computeChatId } from '../utils/chatId';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { ArrowLeft, Send, Loader2, Video, PhoneOff, Phone, PhoneIncoming } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { DatingProfile, ChatId } from '../backend';
import { Principal } from '@dfinity/principal';
import { Alert, AlertDescription } from '../components/ui/alert';

interface ChatProps {
  match: DatingProfile;
  matchPrincipal: Principal | null;
  onBack: () => void;
}

export function Chat({ match, matchPrincipal, onBack }: ChatProps) {
  const { t } = useI18n();
  const { identity } = useInternetIdentity();
  const { data: messages, isLoading } = useGetMessages(matchPrincipal);
  const sendMutation = useSendMessage();
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute chat ID for video calling
  const chatId: ChatId | null = identity && matchPrincipal 
    ? computeChatId(identity.getPrincipal(), matchPrincipal)
    : null;

  const {
    callState,
    error: callError,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    isLoading: callLoading,
  } = useVideoCall({
    recipientPrincipal: matchPrincipal,
    chatId,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !matchPrincipal) return;

    try {
      await sendMutation.mutateAsync({
        recipient: matchPrincipal,
        content: messageText.trim(),
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartCall = async () => {
    if (!match.hasVideoChatEnabled) {
      return;
    }
    await startCall();
  };

  const handleAcceptCall = async () => {
    await acceptCall('');
  };

  if (!matchPrincipal) {
    return (
      <div className="container max-w-4xl py-12 px-4">
        <Alert variant="destructive">
          <AlertDescription>
            {t('chatError')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render video call UI when in call
  if (callState !== 'idle' && callState !== 'ended') {
    return (
      <div className="container max-w-6xl py-4 px-4 h-[calc(100vh-8rem)] flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-xl">
          <CardHeader className="border-b flex flex-row items-center gap-4 space-y-0 py-4 bg-muted/30">
            <Avatar className="h-10 w-10">
              <AvatarImage src={match.profilePicUrl} alt={match.firstName} />
              <AvatarFallback>{match.firstName[0]}{match.lastName[0]}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg flex-1">
              {match.firstName} {match.lastName}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {callState === 'connecting' && t('callConnecting')}
              {callState === 'connected' && t('callConnected')}
              {callState === 'outgoing' && t('callOutgoing')}
              {callState === 'incoming' && t('callIncoming')}
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 relative bg-black">
            {/* Incoming call prompt */}
            {callState === 'incoming' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90">
                <div className="text-center text-white space-y-6">
                  <PhoneIncoming className="h-16 w-16 mx-auto animate-pulse" />
                  <div>
                    <p className="text-2xl font-bold mb-2">{t('incomingCall')}</p>
                    <p className="text-lg">{match.firstName} {match.lastName}</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      size="lg"
                      variant="destructive"
                      className="rounded-full h-16 w-16"
                      onClick={declineCall}
                    >
                      <PhoneOff className="h-8 w-8" />
                    </Button>
                    <Button
                      size="lg"
                      className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700"
                      onClick={handleAcceptCall}
                    >
                      <Phone className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Video streams */}
            <div className="relative w-full h-full">
              {/* Remote video (full screen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Local video (picture-in-picture) */}
              <div className="absolute top-4 right-4 w-32 h-48 sm:w-40 sm:h-56 rounded-xl overflow-hidden shadow-2xl border-2 border-white">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Call controls */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                <Button
                  size="lg"
                  variant="destructive"
                  className="rounded-full h-16 w-16 shadow-xl"
                  onClick={endCall}
                >
                  <PhoneOff className="h-8 w-8" />
                </Button>
              </div>
            </div>

            {callError && (
              <div className="absolute top-4 left-4 right-4">
                <Alert variant="destructive">
                  <AlertDescription>{callError.messageKey ? t(callError.messageKey) : 'Call error'}</AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular chat UI
  return (
    <div className="container max-w-4xl py-4 px-4 h-[calc(100vh-8rem)] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-xl">
        <CardHeader className="border-b flex flex-row items-center gap-4 space-y-0 py-4 bg-muted/30">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={match.profilePicUrl} alt={match.firstName} />
            <AvatarFallback>{match.firstName[0]}{match.lastName[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg flex-1">
            {match.firstName} {match.lastName}
          </CardTitle>
          {match.hasVideoChatEnabled && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleStartCall}
              disabled={callLoading}
              className="rounded-full"
            >
              {callLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Video className="h-5 w-5" />}
            </Button>
          )}
        </CardHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.slice().reverse().map((message, idx) => {
                const isOwn = identity && message.sender.toString() === identity.getPrincipal().toString();
                return (
                  <div
                    key={idx}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>{t('noMessages')}</p>
            </div>
          )}
        </ScrollArea>

        <CardContent className="border-t p-4 bg-muted/30">
          <div className="flex gap-2">
            <Input
              placeholder={t('typeMessage')}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMutation.isPending}
              className="flex-1 rounded-full"
            />
            <Button
              onClick={handleSend}
              disabled={!messageText.trim() || sendMutation.isPending}
              size="icon"
              className="rounded-full"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
