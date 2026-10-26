import * as Sentry from '@sentry/react-native';

import {breadcrumbsIntegration, browserProfilingIntegration, consoleIntegration, navigationIntegration, shouldCreateSpanForRequest} from './common';
import searchRouterProfilingSampler from './searchRouterProfilingSampler';

const tracingIntegration = Sentry.reactNativeTracingIntegration({
    shouldCreateSpanForRequest,
});

// Only the Search Router open is profiled, see `searchRouterProfilingSampler`. Only the JS profiler runs: the platform
// profilers would add their own cost to the measured spans on top of Hermes sampling.
const searchRouterProfilingSamplerIntegration = searchRouterProfilingSampler();
const hermesProfilingIntegration = Sentry.hermesProfilingIntegration({platformProfilers: false});

// The Reporting API is a browser-only feature, so there is no native integration. This stub keeps
// the web/native export shape in parity; it is filtered out of the integrations list on native.
const reportingObserverIntegration = undefined;

// Only the web bundle is stamped with an application key by `@sentry/webpack-plugin`, so on native every
// frame would look foreign. Stub for export shape parity; filtered out of the integrations list here.
const thirdPartyErrorFilterIntegration = undefined;

// Web-only: the GH #93837 noise comes from injected scripts (every event so far is macOS Safari) and the predicate
// reads a tag only the web integration above sets. Stub for export shape parity; filtered out of the list here.
const classCallCheckNoiseFilterIntegration = undefined;

// Web-only, stub for export shape parity.
const googleTranslateRecursionNoiseFilterIntegration = undefined;

export {
    navigationIntegration,
    tracingIntegration,
    browserProfilingIntegration,
    searchRouterProfilingSamplerIntegration,
    hermesProfilingIntegration,
    breadcrumbsIntegration,
    consoleIntegration,
    reportingObserverIntegration,
    thirdPartyErrorFilterIntegration,
    classCallCheckNoiseFilterIntegration,
    googleTranslateRecursionNoiseFilterIntegration,
};
