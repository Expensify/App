import type canvasKitNoiseFilter from '@libs/telemetry/integrations/canvasKitNoiseFilter';
import type {markCanvasKitLoadStarted as markLoadStarted} from '@libs/telemetry/integrations/canvasKitNoiseFilter';

import type {Event} from '@sentry/core';

import {sentryClientStub} from '../utils/SentryEventTestUtils';

const WASM_FETCH_ERROR = 'Aborted(both async and sync fetching of the wasm failed). Build with -sASSERTIONS for more info.';
const UNHANDLED_REJECTION = {type: 'auto.browser.global_handlers.onunhandledrejection', handled: false};

let canvasKitNoiseFilterIntegration: typeof canvasKitNoiseFilter;
let markCanvasKitLoadStarted: typeof markLoadStarted;

function makeEvent(message = WASM_FETCH_ERROR, mechanism = UNHANDLED_REJECTION): Event {
    return {exception: {values: [{type: 'RuntimeError', value: message, mechanism}]}};
}

function processEvent(event: Event) {
    return canvasKitNoiseFilterIntegration.processEvent?.(event, {}, sentryClientStub);
}

describe('CanvasKitNoiseFilter', () => {
    beforeEach(async () => {
        jest.resetModules();
        const integration = await import('@libs/telemetry/integrations/canvasKitNoiseFilter');
        canvasKitNoiseFilterIntegration = integration.default;
        markCanvasKitLoadStarted = integration.markCanvasKitLoadStarted;
    });

    it.each([WASM_FETCH_ERROR, 'Aborted(both async and sync fetching of the wasm failed)'])('keeps the rejection before CanvasKit starts loading: %s', (message) => {
        // Given a matching WASM fetch error before any chart has loaded CanvasKit
        const event = makeEvent(message);

        // When the noise filter processes it
        const result = processEvent(event);

        // Then another runtime's failure remains visible
        expect(result).toBe(event);
    });

    it.each([WASM_FETCH_ERROR, 'Aborted(both async and sync fetching of the wasm failed)'])('drops the leaked browser rejection after CanvasKit starts loading: %s', (message) => {
        // Given the exact CanvasKit initialization signature after a chart starts loading it
        markCanvasKitLoadStarted();
        const event = makeEvent(message);

        // When the noise filter processes it
        const result = processEvent(event);

        // Then only the duplicate unhandled report is discarded
        expect(result).toBeNull();
    });

    it.each([false, true])('keeps missing-WebAssembly rejections when CanvasKit has started: %s', (hasStarted) => {
        // Given a missing global, which the capability probe prevents CanvasKit from using
        if (hasStarted) {
            markCanvasKitLoadStarted();
        }
        const event = makeEvent('WebAssembly is not defined');

        // When the noise filter processes it
        const result = processEvent(event);

        // Then the failure is never suppressed, even after another chart loaded
        expect(result).toBe(event);
    });

    it('keeps the chart boundary warning with the same error message', () => {
        // Given the real failure reported intentionally by the chart boundary
        markCanvasKitLoadStarted();
        const event = {...makeEvent(WASM_FETCH_ERROR, {type: 'generic', handled: true}), level: 'warning' as const, fingerprint: ['skia-web-chart-load-failure']};

        // When the noise filter processes it
        const result = processEvent(event);

        // Then the failure remains visible in Sentry
        expect(result).toBe(event);
    });

    it('keeps the boundary fingerprint even if the SDK changes its mechanism', () => {
        // Given an explicitly reported chart warning with the browser mechanism
        markCanvasKitLoadStarted();
        const event = {...makeEvent(), fingerprint: ['skia-web-chart-load-failure']};

        // When the noise filter processes it
        const result = processEvent(event);

        // Then the warning fingerprint takes precedence
        expect(result).toBe(event);
    });

    it.each([
        makeEvent('Other chart failure'),
        makeEvent(`${WASM_FETCH_ERROR} unrelated suffix`),
        makeEvent(WASM_FETCH_ERROR, {type: 'auto.browser.global_handlers.onerror', handled: false}),
        makeEvent(WASM_FETCH_ERROR, {type: 'generic', handled: false}),
        makeEvent(WASM_FETCH_ERROR, {...UNHANDLED_REJECTION, handled: true}),
        {exception: {values: [{value: WASM_FETCH_ERROR}]}},
        {message: WASM_FETCH_ERROR},
        {},
        {exception: {values: []}},
        {exception: {values: [...(makeEvent().exception?.values ?? []), {value: 'Unrelated failure'}]}},
    ])('keeps unrelated or non-browser-rejection events: %j', (event) => {
        // Given an event that does not exclusively match the leaked rejection
        markCanvasKitLoadStarted();
        // When the noise filter processes it
        const result = processEvent(event);

        // Then other failures are not hidden by message or stack alone
        expect(result).toBe(event);
    });

    it('keeps other errors even when CanvasKit is the throwing frame', () => {
        // Given a genuine CanvasKit error unrelated to initialization
        markCanvasKitLoadStarted();
        const event = makeEvent('Unexpected chart rendering error');
        const value = event.exception?.values?.at(0);
        if (value) {
            value.stacktrace = {frames: [{filename: 'https://example.com/canvaskit.js'}]};
        }

        // When the noise filter processes it
        const result = processEvent(event);

        // Then a vendor filename alone cannot suppress the failure
        expect(result).toBe(event);
    });
});
