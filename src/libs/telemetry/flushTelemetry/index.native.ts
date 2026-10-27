import Log from '@libs/Log';

import * as Sentry from '@sentry/react-native';

import type FlushTelemetry from './types';

/**
 * Drains the JS-side Sentry queue (buffered logs and events still being processed) into the native SDK,
 * which persists envelopes to disk. Without this, anything still buffered in JS when the OS suspends or
 * kills a backgrounded app is lost.
 */
const flushTelemetry: FlushTelemetry = () => {
    Sentry.flush().catch((error: unknown) => {
        Log.warn('[Telemetry] Failed to flush Sentry queue', {error});
    });
};

export default flushTelemetry;
