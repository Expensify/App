import {isDevelopment} from '@libs/Environment/Environment';

import * as SentryReact from '@sentry/react';

import {breadcrumbsIntegration, browserProfilingIntegration, consoleIntegration, navigationIntegration, shouldCreateSpanForRequest} from './common';

/**
 * Browser tracing integration is enabled on Web to support web health measurements
 * such as INP, LCP, FCP, CLS.
 */
const tracingIntegration = SentryReact.browserTracingIntegration({
    shouldCreateSpanForRequest,
});

/**
 * Reporting API integration (web only). Captures browser-emitted `crash` and `intervention`
 * reports (e.g. out-of-memory interventions) that never surface as JS exceptions, giving us an
 * early signal for browser-level crashes. See https://w3c.github.io/reporting/
 */
const reportingObserverIntegration = SentryReact.reportingObserverIntegration({
    types: ['crash', 'intervention'],
});

/**
 * Tags errors whose stack holds no frame from our own bundle with `third_party_code: true`, so noise
 * thrown by injected code (consent tools, tag managers, browser extensions) can be told apart from our
 * own errors in issue search (GH #93837).
 *
 * Our bundle is recognized by the application key `@sentry/webpack-plugin` embeds in every chunk, so the
 * key below has to match `applicationKey` in `config/rsbuild/rsbuild.common.ts`. That plugin only runs
 * for non-development builds, hence the guard: without a key in the bundle every frame looks foreign.
 */
const thirdPartyErrorFilterIntegration = isDevelopment()
    ? undefined
    : SentryReact.thirdPartyErrorFilterIntegration({
          filterKeys: ['expensify-app'],
          behaviour: 'apply-tag-if-exclusively-contains-third-party-frames',
      });

export {navigationIntegration, tracingIntegration, browserProfilingIntegration, breadcrumbsIntegration, consoleIntegration, reportingObserverIntegration, thirdPartyErrorFilterIntegration};
