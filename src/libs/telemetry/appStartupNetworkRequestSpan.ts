import * as Sentry from '@sentry/react-native';
import APP_STARTUP_NETWORK_REQUEST from '@libs/AppStartupNetworkRequest';
import CONST from '@src/CONST';

type AppStartupInactiveSpan = ReturnType<typeof Sentry.startInactiveSpan>;

let hasMarkedLastNetworkSpanEnd = false;

let nativeAppStartupTimestampMs: number | undefined;

let manualAppStartupLastNetworkSpan: AppStartupInactiveSpan | undefined;

/** Start the span for the app startup network request. */
function markStartAppStartupNetworkRequestSpan(nativeAppStartupTimestampMsParam: number) {
    nativeAppStartupTimestampMs = nativeAppStartupTimestampMsParam;
    hasMarkedLastNetworkSpanEnd = false;

    manualAppStartupLastNetworkSpan = Sentry.startInactiveSpan({
        name: CONST.TELEMETRY.SPAN_APP_STARTUP_LAST_NETWORK,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP_LAST_NETWORK,
    });
}

/** End the span for the app startup network request. */
function markEndAppStartupNetworkRequestSpan(command: string | undefined): void {
    const isStartupHandshakeHttp = !!command && APP_STARTUP_NETWORK_REQUEST.has(command);

    if (hasMarkedLastNetworkSpanEnd || !isStartupHandshakeHttp || !nativeAppStartupTimestampMs) {
        return;
    }

    hasMarkedLastNetworkSpanEnd = true;

    const durationSinceNativeAppStartupMs = Math.round(performance.now() - nativeAppStartupTimestampMs);

    const sentrySpan = manualAppStartupLastNetworkSpan;
    if (!sentrySpan) {
        return;
    }

    manualAppStartupLastNetworkSpan = undefined;

    sentrySpan.setStatus({code: CONST.TELEMETRY.SPAN_STATUS_CODE.OK});
    sentrySpan.setAttributes({
        [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: command,
        [CONST.TELEMETRY.ATTRIBUTE_DURATION_SINCE_NATIVE_APP_STARTUP_MS]: durationSinceNativeAppStartupMs,
    });
    sentrySpan.end();
}

export {markStartAppStartupNetworkRequestSpan, markEndAppStartupNetworkRequestSpan};
