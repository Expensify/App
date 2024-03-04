type LogError = (message: string, error: Error, errorInfo: string) => void;

type BaseErrorBoundaryProps = {
    /* A message posted to `logError` (along with error data) when this component intercepts an error */
    errorMessage: string;

    /* A function to perform the actual logging since different platforms support different tools */
    logError?: LogError;

    /* Actual content wrapped by this error boundary */
    children: React.ReactNode;
};

export type {BaseErrorBoundaryProps, LogError};
