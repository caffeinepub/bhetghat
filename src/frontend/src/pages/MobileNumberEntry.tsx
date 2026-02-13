import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Phone } from 'lucide-react';

interface MobileNumberEntryProps {
  onContinue: (phoneNumber: string) => void;
  onSkip: () => void;
}

export function MobileNumberEntry({ onContinue, onSkip }: MobileNumberEntryProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleContinue = () => {
    const trimmed = phoneNumber.trim();
    onContinue(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Bhetghat</CardTitle>
          <CardDescription>
            Enter your mobile number to get started. This will be used as your username.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter your mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-lg"
            />
          </div>
          <div className="space-y-3">
            <Button 
              onClick={handleContinue} 
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
            <Button 
              onClick={onSkip} 
              variant="ghost" 
              className="w-full"
              size="lg"
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
