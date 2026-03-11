import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24">
          <Card className="w-full border-destructive/30 bg-card">
            <CardContent className="flex flex-col items-center p-8">
              <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Something went wrong
              </h2>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                An unexpected error occurred. Please try again.
              </p>
              {this.state.error && (
                <pre className="mb-6 max-h-32 w-full overflow-auto rounded-md border border-border bg-background p-3 font-mono-financial text-xs text-destructive">
                  {this.state.error.message}
                </pre>
              )}
              <Button size="sm" onClick={this.handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
