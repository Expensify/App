/**
 * Sentry integration that profiles only the Search Router open with Hermes. `hermesProfilingIntegration` rolls
 * `profilesSampleRate` on every root span start and stops the running profile when the next root span starts. Every
 * `Manual*` span is a root, so a global rate would cut profiles within milliseconds, run the synchronous stop (dump,
 * file read, JSON parse) inside the next measured span, and flood the profile quota.
 */
import {getSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import type {Client, ClientOptions, Integration, Span} from '@sentry/core';
import type {ReactNativeOptions} from '@sentry/react-native';

import {getRootSpan, spanToJSON} from '@sentry/core';

import searchRouterProfileSampleRate from './searchRouterProfileSampleRate';

const NAVIGATION_SPAN_OP = 'navigation';

// Mirrors `MAX_PROFILE_DURATION_MS` in `@sentry/react-native/dist/js/profiling/constants`, which is not exported. Past it
// the SDK has already stopped the profile on its own, so the next root span pays nothing.
const MAX_PROFILE_DURATION_MS = 30_000;

// Core's client type omits the RN-only profiler rate that `hermesProfilingIntegration` reads back from the live options.
type ProfilingClientOptions = ClientOptions & Pick<ReactNativeOptions, 'profilesSampleRate'>;

/**
 * The rate is 1 only for the navigation span dispatched while `ManualOpenSearchRouter` is open: it is the last root the
 * open starts. `profiled` goes on the open and page-visible spans, which are separate roots that run while the profiler
 * samples, so their profiler overhead can be split out. A root that starts while that profile still runs (e.g.
 * `ManualSearchRouterQuery` on fast typing) pays the stop, so it gets `profiled: true` too. The attribute records that a
 * profile was requested; whether the native profiler actually started is not visible here.
 *
 * Relies on `hermesProfilingIntegration` reading `profilesSampleRate` from the live client options in its own
 * `spanStart` listener (`_shouldStartProfiling`), verified on `@sentry/react-native` 8.27.0. Must be registered before
 * it, so this listener sets the rate first. Setting `profilesSampleRate` in `Sentry.init` would break that: the SDK
 * would add its own profiler ahead of this sampler.
 */
function searchRouterProfilingSampler(): Integration {
    const sampledOpenSpans = new WeakSet<Span>();
    let profiledRootSpan: Span | undefined;
    let profileRequestedAt = 0;

    return {
        name: 'SearchRouterProfilingSampler',
        setup(client: Client) {
            client.on('spanStart', (span) => {
                if (getRootSpan(span) !== span) {
                    return;
                }

                if (profiledRootSpan) {
                    if (Date.now() - profileRequestedAt < MAX_PROFILE_DURATION_MS) {
                        span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_PROFILED, true);
                    }
                    profiledRootSpan = undefined;
                }

                const options = client.getOptions() as ProfilingClientOptions;
                options.profilesSampleRate = 0;

                if (spanToJSON(span).op !== NAVIGATION_SPAN_OP) {
                    return;
                }

                const openSpan = getSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
                if (!openSpan || sampledOpenSpans.has(openSpan)) {
                    return;
                }
                sampledOpenSpans.add(openSpan);

                const isProfiled = Math.random() < searchRouterProfileSampleRate;
                openSpan.setAttribute(CONST.TELEMETRY.ATTRIBUTE_PROFILED, isProfiled);
                getSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_PROFILED, isProfiled);
                if (isProfiled) {
                    options.profilesSampleRate = 1;
                    profiledRootSpan = span;
                    profileRequestedAt = Date.now();
                }
            });

            client.on('spanEnd', (span) => {
                if (span !== profiledRootSpan) {
                    return;
                }
                profiledRootSpan = undefined;
            });
        },
    };
}

export default searchRouterProfilingSampler;
