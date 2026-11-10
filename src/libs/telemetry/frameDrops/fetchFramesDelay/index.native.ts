import CONST from '@src/CONST';

import type {TurboModule} from 'react-native';

import {TurboModuleRegistry} from 'react-native';

import type {FetchFramesDelay, IsFramesDelayAvailable} from './types';

type SentryFramesModule = TurboModule & {
    fetchNativeFramesDelay?: (startTimestampSeconds: number, endTimestampSeconds: number) => Promise<number | null>;
};

// Sentry's native SDKs already watch every frame and keep each delayed one for 5+ minutes (SentryFramesTracker on iOS,
// SentryFrameMetricsCollector on Android); this is the query the Sentry JS SDK itself uses to put frames.delay on spans.
// Reusing it means frame drop attribution adds no frame observer of its own. The method isn't public Sentry API, so a
// missing module or method means attribution doesn't start at all.
const sentryModule = TurboModuleRegistry.get<SentryFramesModule>('RNSentry');

const isFramesDelayAvailable: IsFramesDelayAvailable = () => typeof sentryModule?.fetchNativeFramesDelay === 'function';

const fetchFramesDelay: FetchFramesDelay = (startTimestampSeconds, endTimestampSeconds) => {
    if (!sentryModule?.fetchNativeFramesDelay) {
        return Promise.resolve(undefined);
    }
    let timeoutID: ReturnType<typeof setTimeout> | undefined;
    // Like Sentry's own bridge calls, never wait for an answer forever: a query that doesn't settle counts as unmeasured.
    const timeout = new Promise<undefined>((resolve) => {
        timeoutID = setTimeout(() => resolve(undefined), CONST.TELEMETRY.FRAME_DROPS.QUERY_TIMEOUT_MS);
    });
    const query = sentryModule
        .fetchNativeFramesDelay(startTimestampSeconds, endTimestampSeconds)
        .then((delaySeconds) => delaySeconds ?? undefined)
        .catch(() => undefined);
    return Promise.race([query, timeout]).finally(() => clearTimeout(timeoutID));
};

export default fetchFramesDelay;
export {isFramesDelayAvailable};
