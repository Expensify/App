import * as SentryReact from '@sentry/react';
import * as Sentry from '@sentry/react-native';

const shouldCreateSpanForRequest = (url: string): boolean => {
    const filteredPhrases = [
        '/api/Log',
        'firebaselogging-pa.googleapis.com',
        'analytics.google.com',
        'rs.fullstory.com',
        'api.github.com',
        'group-ib.com',
        'fp-api.expensify.com',
        // NetInfo polls this on a timer for every client, so it is heartbeat volume with nothing to debug in a span (GH #101449).
        '/api/Ping',
        // Google Ads/Analytics conversion endpoints. They are third-party requests we cannot act on, and they were
        // one of our largest sources of span volume (GH #101449).
        'ccm/collect',
        'rmkt/collect',
        'pagead/form-data',
        'ccm/form-data',
    ];
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
