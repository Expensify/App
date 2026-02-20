import * as Sentry from '@sentry/react-native';
import {browserProfilingIntegration, navigationIntegration, shouldCreateSpanForRequest, breadcrumbsIntegration, consoleIntegration} from './common';

const tracingIntegration = Sentry.reactNativeTracingIntegration({
    shouldCreateSpanForRequest,
});

export {navigationIntegration, tracingIntegration, browserProfilingIntegration, breadcrumbsIntegration, consoleIntegration};
