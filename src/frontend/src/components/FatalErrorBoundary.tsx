import React, { Component, type ReactNode } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FatalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Fatal error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                The application encountered an unexpected error and needs to reload.
              </AlertDescription>
            </Alert>
            
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Application Error</h2>
                <p className="text-sm text-muted-foreground">
                  We apologize for the inconvenience. Please reload the page to continue.
                </p>
              </div>
              
              {this.state.error && (
                <details className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <summary className="cursor-pointer font-medium">Error details</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              
              <Button 
                onClick={this.handleReload} 
                className="w-full"
                size="lg"
              >
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
