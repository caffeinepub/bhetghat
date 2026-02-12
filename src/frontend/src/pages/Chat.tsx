import { useI18n } from '../i18n/I18nProvider';
import { useGetMessages, useSendMessage } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { DatingProfile } from '../backend';
import { Principal } from '@dfinity/principal';

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

  return (
    <div className="container max-w-4xl py-4 px-4 h-[calc(100vh-8rem)] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b flex flex-row items-center gap-4 space-y-0 py-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={match.profilePicUrl} alt={match.firstName} />
            <AvatarFallback>{match.firstName[0]}{match.lastName[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg">
            {match.firstName} {match.lastName}
          </CardTitle>
        </CardHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.slice().reverse().map((message, idx) => {
                const isOwn = identity && message.sender.toString() === identity.getPrincipal().toString();
                return (
                  <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-muted-foreground mb-2">{t('noMessages')}</p>
                <p className="text-sm text-muted-foreground">{t('startConversation')}</p>
              </div>
            </div>
          )}
        </ScrollArea>

        <CardContent className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder={t('typeMessage')}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!messageText.trim() || sendMutation.isPending}
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
