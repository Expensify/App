import type {TurboModule} from 'react-native';

import {TurboModuleRegistry} from 'react-native';

import type FetchFramesDelay from './types';

type SentryFramesModule = TurboModule & {
    fetchNativeFramesDelay?: (startTimestampSeconds: number, endTimestampSeconds: number) => Promise<number | null>;
};

// Sentry's native SDKs already watch every frame and keep each delayed one for 5+ minutes (SentryFramesTracker on iOS,
// SentryFrameMetricsCollector on Android); this is the query the Sentry JS SDK itself uses to put frames.delay on spans.
// Reusing it means frame drop attribution adds no frame observer of its own. The method isn't public Sentry API, so a
// missing module or method just disables attribution.
const sentryModule = TurboModuleRegistry.get<SentryFramesModule>('RNSentry');

const fetchFramesDelay: FetchFramesDelay = (startTimestampSeconds, endTimestampSeconds) => {
    if (!sentryModule?.fetchNativeFramesDelay) {
        return Promise.resolve(undefined);
    }
    return sentryModule
        .fetchNativeFramesDelay(startTimestampSeconds, endTimestampSeconds)
        .then((delaySeconds) => delaySeconds ?? undefined)
        .catch(() => undefined);
};

export default fetchFramesDelay;
