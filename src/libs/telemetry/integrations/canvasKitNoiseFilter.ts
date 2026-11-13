/** Filters the internal CanvasKit initialization rejection, keeping the chart boundary's load warning. */
import type {Integration} from '@sentry/core';

const CANVASKIT_LOAD_MESSAGES = new Set([
    'Aborted(both async and sync fetching of the wasm failed)',
    'Aborted(both async and sync fetching of the wasm failed). Build with -sASSERTIONS for more info.',
]);

let hasCanvasKitLoadStarted = false;

/** Keep identical errors from other runtimes visible until a chart actually starts loading CanvasKit. */
function markCanvasKitLoadStarted() {
    // Internal rejections can be reported after the load settles, so retain this marker for the session.
    hasCanvasKitLoadStarted = true;
}

const canvasKitNoiseFilterIntegration: Integration = {
    name: 'CanvasKitNoiseFilter',
    processEvent: (event) => {
        // CanvasKit rejects an inaccessible internal promise as well as the promise React catches.
        // Keep the boundary report even if its capture mechanism changes in a future SDK release.
        if (!hasCanvasKitLoadStarted || event.fingerprint?.includes('skia-web-chart-load-failure')) {
            return event;
        }

        const values = event.exception?.values ?? [];
        const isCanvasKitRejection =
            values.length > 0 &&
            values.every(
                (value) =>
                    value.mechanism?.type === 'auto.browser.global_handlers.onunhandledrejection' && value.mechanism.handled === false && CANVASKIT_LOAD_MESSAGES.has(value.value ?? ''),
            );
        return isCanvasKitRejection ? null : event;
    },
};

export default canvasKitNoiseFilterIntegration;
export {markCanvasKitLoadStarted};
