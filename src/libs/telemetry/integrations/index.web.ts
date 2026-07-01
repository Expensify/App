import * as SentryReact from '@sentry/react';
import scrubPII from '@libs/telemetry/scrubPII';
import {breadcrumbsIntegration, browserProfilingIntegration, consoleIntegration, navigationIntegration, shouldCreateSpanForRequest} from './common';

/**
 * Browser tracing integration is enabled on Web to support web health measurements
 * such as INP, LCP, FCP, CLS.
 *
 * Transaction names are scrubbed of PII, because on Web, pageload/navigation spans are named
 * after `location.pathname`, which can contain a user login.
 */
const tracingIntegration = SentryReact.browserTracingIntegration({
    shouldCreateSpanForRequest,
    beforeStartSpan: (options) => ({...options, name: scrubPII(options.name)}),
});

/**
 * Reporting API integration (web only). Captures browser-emitted `crash` and `intervention`
 * reports (e.g. out-of-memory interventions) that never surface as JS exceptions, giving us an
 * early signal for browser-level crashes. See https://w3c.github.io/reporting/
 */
const reportingObserverIntegration = SentryReact.reportingObserverIntegration({
    types: ['crash', 'intervention'],
});

export {navigationIntegration, tracingIntegration, browserProfilingIntegration, breadcrumbsIntegration, consoleIntegration, reportingObserverIntegration};
