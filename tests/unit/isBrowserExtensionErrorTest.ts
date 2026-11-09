import isBrowserExtensionError from '@libs/isBrowserExtensionError';

// Urban VPN Proxy, whose rejections flooded the Log API in production
// cspell:disable-next-line
const EXTENSION_SCRIPT_URL = 'chrome-extension://eppiocemhmnlbhjplcgkofciiegomcon/executors/200.js';

function createError(stack: string | undefined): Error {
    const error = new TypeError("Cannot read properties of undefined (reading 'M_ID')");
    error.stack = stack;
    return error;
}

describe('isBrowserExtensionError', () => {
    it('detects a Chrome extension error', () => {
        // Given a rejection whose stack only has frames from an extension script
        const error = createError(
            ["TypeError: Cannot read properties of undefined (reading 'M_ID')", `    at Y (${EXTENSION_SCRIPT_URL}:1:761)`, `    at E (${EXTENSION_SCRIPT_URL}:1:1442)`].join('\n'),
        );

        // When we check where the error came from
        const result = isBrowserExtensionError(error);

        // Then it is treated as an extension error because every frame is in the extension
        expect(result).toBe(true);
    });

    it('detects Firefox and Safari extension errors', () => {
        // Given errors from Firefox and Safari extensions, using each browser's stack format
        const firefoxError = createError('Y@moz-extension://1b2c3d4e-0000-4000-8000-123456789abc/content.js:1:761');
        const safariError = createError('Y@safari-web-extension://ABCDEF12-3456-7890-ABCD-EF1234567890/content.js:1:761');
        const maskedSafariError = createError('Y@webkit-masked-url://hidden/:1:761');

        // When we check where the errors came from
        const results = [firefoxError, safariError, maskedSafariError].map(isBrowserExtensionError);

        // Then all of them are treated as extension errors
        expect(results).toEqual([true, true, true]);
    });

    it('does not ignore an error that passes through App code', () => {
        // Given an extension error whose stack also contains an App frame, so our code may be involved
        const error = createError(
            ["TypeError: Cannot read properties of undefined (reading 'M_ID')", `    at Y (${EXTENSION_SCRIPT_URL}:1:761)`, '    at onPress (https://new.expensify.com/main.js:1:2345)'].join(
                '\n',
            ),
        );

        // When we check where the error came from
        const result = isBrowserExtensionError(error);

        // Then it is still reported, because we can't rule out an App bug
        expect(result).toBe(false);
    });

    it('does not ignore an error without a stack', () => {
        // Given errors with no stack or a stack without any URL, so we can't tell where they came from
        const errorWithoutStack = createError(undefined);
        const errorWithoutURLs = createError('TypeError: Failed to fetch\n    at async Promise.all (index 0)');

        // When we check where the errors came from
        const results = [errorWithoutStack, errorWithoutURLs].map(isBrowserExtensionError);

        // Then they are still reported
        expect(results).toEqual([false, false]);
    });
});
