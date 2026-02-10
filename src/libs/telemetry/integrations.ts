import * as SentryReact from '@sentry/react';
import * as Sentry from '@sentry/react-native';

const navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: true,
});

const shouldCreateSpanForRequest = (url: string): boolean => {
    const filteredPhrases = ['/api/Log', 'firebaselogging-pa.googleapis.com', 'analytics.google.com', 'rs.fullstory.com', 'api.github.com'];
    return !filteredPhrases.some((phrase) => url.includes(phrase));
};

const tracingIntegration = Sentry.reactNativeTracingIntegration({
    shouldCreateSpanForRequest,
});

const browserProfilingIntegration = SentryReact.browserProfilingIntegration();

export {navigationIntegration, tracingIntegration, browserProfilingIntegration};
