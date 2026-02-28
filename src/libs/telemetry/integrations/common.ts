import * as SentryReact from '@sentry/react';
import * as Sentry from '@sentry/react-native';

const shouldCreateSpanForRequest = (url: string): boolean => {
    const filteredPhrases = ['/api/Log', 'firebaselogging-pa.googleapis.com', 'analytics.google.com', 'rs.fullstory.com', 'api.github.com'];
    return !filteredPhrases.some((phrase) => url.includes(phrase));
};

const navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: true,
});

const browserProfilingIntegration = SentryReact.browserProfilingIntegration();

const breadcrumbsIntegration = Sentry.breadcrumbsIntegration({
    console: false,
});

const consoleIntegration = Sentry.consoleLoggingIntegration({
    levels: ['error'],
});

export {navigationIntegration, shouldCreateSpanForRequest, browserProfilingIntegration, breadcrumbsIntegration, consoleIntegration};
