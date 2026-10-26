import {getSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import type {Client, ClientOptions, Integration, Span} from '@sentry/core';
import type {ReactNativeOptions} from '@sentry/react-native';

import {getRootSpan, spanToJSON} from '@sentry/core';
import {Platform} from 'react-native';

/**
 * Share of Search Router opens that get a Hermes profile. Android carries the metric's tail on a few hundred opens a
 * week, so it gets the higher rate; both stay low because profiled opens pay the profiler's cost inside the measured span.
 */
const SEARCH_ROUTER_PROFILE_SAMPLE_RATE = Platform.OS === 'android' ? 0.2 : 0.05;

const NAVIGATION_SPAN_OP = 'navigation';

// Core's client type omits the RN-only profiler rate that `hermesProfilingIntegration` reads back from the live options.
type ProfilingClientOptions = ClientOptions & Pick<ReactNativeOptions, 'profilesSampleRate'>;

/**
 * `hermesProfilingIntegration` rolls `profilesSampleRate` on every root span start and stops the running profile when
 * the next root span starts. Every `Manual*` span is a root, so a global rate would cut profiles within milliseconds,
 * run the synchronous stop (dump, file read, JSON parse) inside the next measured span, and flood the profile quota.
 *
 * The rate is therefore 1 only for the navigation span dispatched while `ManualOpenSearchRouter` is open: it is the
 * last root the open starts and outlives the list render. `profiled` on the open span splits out profiler overhead.
 * A root that starts while that profile still runs (e.g. `ManualSearchRouterQuery` on fast typing) pays the stop, so it
 * gets `profiled: true` too.
 *
 * Must be registered before `hermesProfilingIntegration`, whose `spanStart` listener reads the rate. Setting
 * `profilesSampleRate` in `Sentry.init` would break that: the SDK would add its own profiler ahead of this sampler.
 */
function searchRouterProfilingSampler(): Integration {
    const sampledOpenSpans = new WeakSet<Span>();
    let profiledRootSpan: Span | undefined;

    return {
        name: 'SearchRouterProfilingSampler',
        setup(client: Client) {
            client.on('spanStart', (span) => {
                if (getRootSpan(span) !== span) {
                    return;
                }

                if (profiledRootSpan) {
                    span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_PROFILED, true);
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

                const isProfiled = Math.random() < SEARCH_ROUTER_PROFILE_SAMPLE_RATE;
                openSpan.setAttribute(CONST.TELEMETRY.ATTRIBUTE_PROFILED, isProfiled);
                if (isProfiled) {
                    options.profilesSampleRate = 1;
                    profiledRootSpan = span;
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
