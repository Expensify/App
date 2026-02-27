import * as SentryReact from '@sentry/react';
import {browserProfilingIntegration, navigationIntegration, shouldCreateSpanForRequest} from './common';

/**
 * Browser tracing integration is enabled on Web to support web health measurements
 * such as INP, LCP, FCP, CLS.
 */
const tracingIntegration = SentryReact.browserTracingIntegration({
    shouldCreateSpanForRequest,
});

export {navigationIntegration, tracingIntegration, browserProfilingIntegration};
