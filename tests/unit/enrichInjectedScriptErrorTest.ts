import {getStackScriptHosts, hasOnlyOpaqueFrames} from '@libs/telemetry/middlewares/enrichInjectedScriptError';

import type {ErrorEvent} from '@sentry/core';

describe('enrichInjectedScriptError', () => {
    describe('getStackScriptHosts', () => {
        it('returns only hostnames, never paths, query strings, or credentials', () => {
            const stack = [
                'TypeError: something broke for bob@corp.com',
                '    at fn (https://cdn.example.com/tag.js?token=SECRET123:12:34)',
                '    at https://user:hunter2@third.example.com/x.js:1:2',
                'g@https://y.example.com/b.js#access_token=SECRET:3:4',
            ].join('\n');
            const hosts = getStackScriptHosts(stack);
            expect(hosts).toEqual(['cdn.example.com', 'third.example.com', 'y.example.com']);
        });

        it('keeps the port as part of the host', () => {
            expect(getStackScriptHosts('    at fn (https://host.example.com:8082/app.js:3:4)')).toEqual(['host.example.com:8082']);
        });

        it('extracts extension scheme hosts', () => {
            expect(getStackScriptHosts('    at inj (chrome-extension://abcdefghijklmnop/content.js:3:4)')).toEqual(['abcdefghijklmnop']);
        });

        it('ignores data: URLs and unparsable tokens', () => {
            expect(getStackScriptHosts('    at d (data:text/javascript;base64,U0VDUkVU:1:1)')).toEqual([]);
        });

        it('deduplicates hosts', () => {
            const stack = '    at a (https://cdn.example.com/a.js:1:1)\n    at b (https://cdn.example.com/b.js:2:2)';
            expect(getStackScriptHosts(stack)).toEqual(['cdn.example.com']);
        });

        it('returns an empty list for a stack without URLs', () => {
            expect(getStackScriptHosts('Error: x\n    at fn (<anonymous>:1:1)')).toEqual([]);
        });
    });

    describe('hasOnlyOpaqueFrames', () => {
        function eventWithFilenames(filenames: Array<string | undefined>): ErrorEvent {
            return {
                type: undefined,
                exception: {
                    values: [{stacktrace: {frames: filenames.map((filename) => ({filename}))}}],
                },
            };
        }

        it('returns true when every frame is app:///, <anonymous>, or empty', () => {
            expect(hasOnlyOpaqueFrames(eventWithFilenames(['app:///', '<anonymous>', undefined]))).toBe(true);
        });

        it('returns false when any frame resolves to a real file', () => {
            expect(hasOnlyOpaqueFrames(eventWithFilenames(['app:///', 'app:///src/App.tsx']))).toBe(false);
        });

        it('returns false when there are no frames at all', () => {
            expect(hasOnlyOpaqueFrames({type: undefined})).toBe(false);
        });
    });
});
