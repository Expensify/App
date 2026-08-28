import classCallCheckNoiseFilterIntegration, {CLASS_CALL_CHECK_MESSAGE, isClassCallCheckNoise, THIRD_PARTY_CODE_TAG} from '@libs/telemetry/integrations/classCallCheckNoiseFilter';
import {classCallCheckNoiseFilterIntegration as webClassCallCheckNoiseFilterIntegration} from '@libs/telemetry/integrations/index.web';

import type {Client, ErrorEvent, Exception, StackFrame} from '@sentry/core';

const THIRD_PARTY_TAGS: ErrorEvent['tags'] = {[THIRD_PARTY_CODE_TAG]: true};

/** The exact frames Sentry received for APP-JY0 on release 9.4.53-10. */
const APP_JY0_FRAMES: StackFrame[] = [
    {filename: 'app:///', lineno: 156, colno: 387215, function: 'r'},
    {filename: 'app:///', lineno: 156, colno: 384862, function: 'G'},
];

/** `type: undefined` is what marks an error event in the SDK types, as opposed to `'transaction'`. */
function buildEvent(values: Exception[], tags: ErrorEvent['tags'] = THIRD_PARTY_TAGS): ErrorEvent {
    return {type: undefined, tags, exception: {values}};
}

function buildClassCallCheckEvent(frames: StackFrame[], tags: ErrorEvent['tags'] = THIRD_PARTY_TAGS): ErrorEvent {
    return buildEvent([{type: 'TypeError', value: CLASS_CALL_CHECK_MESSAGE, stacktrace: {frames}}], tags);
}

describe('classCallCheckNoiseFilter', () => {
    describe('recognizes the GH #93837 signature', () => {
        it('matches the exact APP-JY0 event shape', () => {
            expect(isClassCallCheckNoise(buildClassCallCheckEvent(APP_JY0_FRAMES))).toBe(true);
        });

        it('matches frames that carry no filename at all', () => {
            expect(isClassCallCheckNoise(buildClassCallCheckEvent([{}, {filename: ''}]))).toBe(true);
        });

        it('matches the rewritten <anonymous> marker', () => {
            expect(isClassCallCheckNoise(buildClassCallCheckEvent([{filename: 'app:///<anonymous>'}]))).toBe(true);
        });

        it('matches native frames, which the rewrite leaves untouched', () => {
            expect(isClassCallCheckNoise(buildClassCallCheckEvent([{filename: 'app:///'}, {filename: '[native code]'}, {filename: 'native'}]))).toBe(true);
        });

        it('matches the pre-rewrite <anonymous> marker, so frame order relative to rewriteFrames does not matter', () => {
            expect(isClassCallCheckNoise(buildClassCallCheckEvent([{filename: '<anonymous>'}]))).toBe(true);
        });

        it('matches the pre-rewrite WebKit masked URL, so frame order relative to rewriteFrames does not matter', () => {
            expect(isClassCallCheckNoise(buildClassCallCheckEvent([{filename: 'webkit-masked-url://hidden/'}]))).toBe(true);
        });

        it('matches a chained error when every value is the signature and every frame is anonymous', () => {
            const event = buildEvent([
                {type: 'TypeError', value: CLASS_CALL_CHECK_MESSAGE, stacktrace: {frames: [{filename: 'app:///'}]}},
                {type: 'TypeError', value: CLASS_CALL_CHECK_MESSAGE, stacktrace: {frames: [{filename: '<anonymous>'}]}},
            ]);
            expect(isClassCallCheckNoise(event)).toBe(true);
        });
    });

    describe('leaves everything else alone', () => {
        it('keeps a different error even when it is anonymous and tagged third-party', () => {
            const event = buildEvent([{type: 'TypeError', value: "Cannot read properties of undefined (reading 'se')", stacktrace: {frames: [{filename: 'app:///'}]}}]);
            expect(isClassCallCheckNoise(event)).toBe(false);
        });

        it('keeps the signature when a frame is attributable to our bundle', () => {
            const event = buildClassCallCheckEvent([{filename: 'app:///'}, {filename: 'app:///76-f662df2d477d1a4f.bundle.js'}]);
            expect(isClassCallCheckNoise(event)).toBe(false);
        });

        it('keeps the signature when the frame is a named vendor script, spelled as in APP-J2J', () => {
            const event = buildClassCallCheckEvent([{filename: 'app:///10042537-100413459.js', lineno: 3448}]);
            expect(isClassCallCheckNoise(event)).toBe(false);
        });

        it('keeps the signature when the frame is a named extension script, spelled as in APP-J1W', () => {
            const event = buildClassCallCheckEvent([{filename: 'app:///extension-script.js'}]);
            expect(isClassCallCheckNoise(event)).toBe(false);
        });

        it('keeps the signature when the event is not tagged third-party', () => {
            expect(isClassCallCheckNoise(buildClassCallCheckEvent(APP_JY0_FRAMES, {}))).toBe(false);
        });

        it('keeps a chained error when only one value is the signature', () => {
            const event = buildEvent([
                {type: 'TypeError', value: CLASS_CALL_CHECK_MESSAGE, stacktrace: {frames: [{filename: 'app:///'}]}},
                {type: 'Error', value: 'something real', stacktrace: {frames: [{filename: 'app:///'}]}},
            ]);
            expect(isClassCallCheckNoise(event)).toBe(false);
        });

        it('keeps a tagged event with no exception values', () => {
            expect(isClassCallCheckNoise({type: undefined, tags: THIRD_PARTY_TAGS})).toBe(false);
        });

        it('keeps the signature when it carries no frames at all', () => {
            expect(isClassCallCheckNoise(buildEvent([{type: 'TypeError', value: CLASS_CALL_CHECK_MESSAGE}]))).toBe(false);
        });

        it('keeps a transaction event, which never carries exception values', () => {
            expect(isClassCallCheckNoise({type: 'transaction', tags: THIRD_PARTY_TAGS})).toBe(false);
        });
    });

    describe('as a Sentry integration', () => {
        // `processEvent` ignores its client argument, so an empty stub satisfies the signature without stubbing the SDK.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the filter never reads the client, this only satisfies the hook signature
        const client = Object.create(null) as Client;
        const processEvent = (event: ErrorEvent) => classCallCheckNoiseFilterIntegration.processEvent?.(event, {}, client);

        it('is named so it can be identified in the integrations list', () => {
            expect(classCallCheckNoiseFilterIntegration.name).toBe('ClassCallCheckNoiseFilter');
        });

        it('drops the noise', () => {
            expect(processEvent(buildClassCallCheckEvent(APP_JY0_FRAMES))).toBeNull();
        });

        it('passes anything else through untouched', () => {
            const event = buildClassCallCheckEvent([{filename: 'app:///76-f662df2d477d1a4f.bundle.js'}]);
            expect(processEvent(event)).toBe(event);
        });
    });

    // `setupSentryIntegrationOrderTest` mocks the whole integrations module, so nothing there exercises the real
    // web index. Web is the only platform this filter runs on, so assert the export is the real integration and
    // not the `undefined` stub the native index ships.
    describe('web export wiring', () => {
        it('re-exports the real filter from the unmocked web index', () => {
            expect(webClassCallCheckNoiseFilterIntegration).toBe(classCallCheckNoiseFilterIntegration);
        });
    });
});
