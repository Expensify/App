import * as Sentry from '@sentry/react-native';
import {breadcrumbsIntegration, browserProfilingIntegration, consoleIntegration, navigationIntegration, shouldCreateSpanForRequest} from './common';

const tracingIntegration = Sentry.reactNativeTracingIntegration({
    shouldCreateSpanForRequest,
});

// The Reporting API is a browser-only feature, so there is no native integration. This stub keeps
// the web/native export shape in parity; it is filtered out of the integrations list on native.
const reportingObserverIntegration = undefined;

export {navigationIntegration, tracingIntegration, browserProfilingIntegration, breadcrumbsIntegration, consoleIntegration, reportingObserverIntegration};
