import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error)
      ) : (
        <div className="p-8 text-center text-destructive">
          <p>Something went wrong.</p>
          <p className="text-sm text-muted-foreground">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
