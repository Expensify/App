/**
 * Regression test for https://github.com/Expensify/App/issues/86534
 *
 * react-native-web's AccessibilityInfo.isScreenReaderEnabled() is hardcoded to
 * always resolve `true` (no browser API exists to detect screen readers). This
 * caused useScreenReaderStatus() to return `true` on web, which in turn blocked
 * auto-focus in useAutoFocusInput and similar hooks.
 *
 * The fix: a web-specific isScreenReaderEnabled module that always returns false,
 * so auto-focus is never skipped on web due to a phantom screen-reader detection.
 */
describe('isScreenReaderEnabled (web)', () => {
    it('returns false even when AccessibilityInfo.isScreenReaderEnabled resolves to true', async () => {
        // Directly import the web module (index.ts, not index.native.ts).
        // jest-expo defaults to ios platform which would resolve index.native.ts,
        // but the fix lives in the web-specific index.ts.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const {default: isScreenReaderEnabled} = require('../../../../src/libs/Accessibility/isScreenReaderEnabled/index') as {default: () => Promise<boolean>};

        const result = await isScreenReaderEnabled();

        expect(result).toBe(false);
    });
});
