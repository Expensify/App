import * as Sentry from '@sentry/react-native';
import type {Span} from '@sentry/react-native';

let appStartupSpan: Span | null = null;
let startTimestamp: number | null = null;

const STARTUP_SPAN_NAME = 'app.startup';

function startStartupSpan(): void {
    if (appStartupSpan) {
        return;
    }

    startTimestamp = Date.now();

    appStartupSpan = Sentry.startInactiveSpan({
        name: STARTUP_SPAN_NAME,
        op: STARTUP_SPAN_NAME,
    });
}

function endStartupSpan(): void {
    if (!appStartupSpan) {
        return;
    }

    const endTimestamp = Date.now();
    const duration = startTimestamp ? endTimestamp - startTimestamp : 0;

    appStartupSpan.setAttribute(`${STARTUP_SPAN_NAME}.duration_ms`, duration);
    appStartupSpan.end();

    appStartupSpan = null;
    startTimestamp = null;
}

export {startStartupSpan, endStartupSpan};
