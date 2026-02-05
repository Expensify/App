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

/**
 * Disable browser tracing integration on Android and iOS because it crashes on mobile in release builds.
 * On the Web we need this to enable web health measurements such as INP, LCP, FCP, CLS.
 * We need to configure this integration manually so there is no data duplication in sentry created by having both the React Native and React Web integrations enabled.
 */
const browserTracingIntegration =
    Platform.OS === 'android' || Platform.OS === 'ios'
        ? null
        : SentryReact.browserTracingIntegration({
              shouldCreateSpanForRequest: () => false, // Prevents duplicate network request spans
              instrumentNavigation: false, // Prevents duplicate navigation transactions
              instrumentPageLoad: false, // Prevents initial page load transaction duplication
          });

const browserProfilingIntegration = SentryReact.browserProfilingIntegration();

export {navigationIntegration, tracingIntegration, browserProfilingIntegration, browserTracingIntegration};
