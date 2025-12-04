import * as SentryReact from '@sentry/react';
import * as Sentry from '@sentry/react-native';
import {Platform} from 'react-native';

const navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: true,
});

const shouldCreateSpanForRequest = (url: string): boolean => {
    const filteredPhrases = ['/api/Log', '/api/SendPerformanceTiming', 'firebaselogging-pa.googleapis.com', 'analytics.google.com', 'rs.fullstory.com', 'api.github.com'];
    return !filteredPhrases.some((phrase) => url.includes(phrase));
};

const tracingIntegration = Sentry.reactNativeTracingIntegration({
    shouldCreateSpanForRequest,
});

// Browser tracing integration crashes on mobile in release builds
const browserTracingIntegration =
    Platform.OS === 'android' || Platform.OS === 'ios'
        ? null
        : SentryReact.browserTracingIntegration({
              shouldCreateSpanForRequest,
          });

const browserProfilingIntegration = SentryReact.browserProfilingIntegration();

export {navigationIntegration, tracingIntegration, browserTracingIntegration, browserProfilingIntegration};
