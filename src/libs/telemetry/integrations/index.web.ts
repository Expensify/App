import SENTRY_APPLICATION_KEY from '@libs/telemetry/sentryApplicationKey';

import * as SentryReact from '@sentry/react';

import classCallCheckNoiseFilterIntegration from './classCallCheckNoiseFilter';
import {breadcrumbsIntegration, browserProfilingIntegration, consoleIntegration, navigationIntegration, shouldCreateSpanForRequest} from './common';

/**
 * `typeof` guard rather than a bare read: the define is absent from bundles that do not go through
 * `getCommonConfiguration` (Storybook, Jest), where reading the identifier directly would throw.
 */
function isApplicationKeyStamped(): boolean {
    return typeof __SENTRY_APPLICATION_KEY_STAMPED__ !== 'undefined' && __SENTRY_APPLICATION_KEY_STAMPED__;
}

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
 * Our bundle is recognized by the application key `@sentry/webpack-plugin` embeds in every chunk.
 * Without a stamped key every frame looks foreign and *all* our errors get mislabeled, so the guard
 * reads the same variable that gates the plugin (`config/rsbuild/rsbuild.common.ts`).
 */
const thirdPartyErrorFilterIntegration = isApplicationKeyStamped()
    ? SentryReact.thirdPartyErrorFilterIntegration({
          filterKeys: [SENTRY_APPLICATION_KEY],
          behaviour: 'apply-tag-if-exclusively-contains-third-party-frames',
      })
    : undefined;

export {
    navigationIntegration,
    tracingIntegration,
    browserProfilingIntegration,
    breadcrumbsIntegration,
    consoleIntegration,
    reportingObserverIntegration,
    thirdPartyErrorFilterIntegration,
    classCallCheckNoiseFilterIntegration,
};
