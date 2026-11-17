import canSendAuthTokenToURL from '@libs/canSendAuthTokenToURL';

import CONFIG from '@src/CONFIG';

type ExpensifyConfig = typeof CONFIG.EXPENSIFY;

const FILE_PATH = 'chat-attachments/123/w_abc.pdf';

// Jest loads `.env.example`, so these are the dev roots. Reading them from CONFIG keeps the tests valid if that file changes.
const EXPENSIFY_ROOT = CONFIG.EXPENSIFY.EXPENSIFY_URL;
const EXPENSIFY_HOST = new URL(EXPENSIFY_ROOT).host;

const ATTACKER_FILE_URL = 'https://attacker.example/file.pdf';

/**
 * The trusted roots are read once when the module loads, so each config change needs a fresh copy of the module.
 */
function loadWithExpensifyConfig(overrides: Partial<ExpensifyConfig>): typeof canSendAuthTokenToURL {
    let loadedFunction: typeof canSendAuthTokenToURL | undefined;
    jest.isolateModules(() => {
        jest.doMock('@src/CONFIG', () => ({
            __esModule: true,
            default: {...CONFIG, EXPENSIFY: {...CONFIG.EXPENSIFY, ...overrides}},
        }));
        loadedFunction = jest.requireActual<{
            default: typeof canSendAuthTokenToURL;
        }>('@libs/canSendAuthTokenToURL').default;
    });
    jest.dontMock('@src/CONFIG');

    if (!loadedFunction) {
        throw new Error('Failed to load canSendAuthTokenToURL');
    }
    return loadedFunction;
}

describe('canSendAuthTokenToURL', () => {
    describe('URLs on Expensify servers', () => {
        it.each([
            ['main Expensify server', CONFIG.EXPENSIFY.EXPENSIFY_URL],
            ['secure Expensify server', CONFIG.EXPENSIFY.SECURE_EXPENSIFY_URL],
            ['staging server', CONFIG.EXPENSIFY.STAGING_API_ROOT],
            ['secure staging server', CONFIG.EXPENSIFY.STAGING_SECURE_API_ROOT],
        ])('returns true for a file on the %s', (_, root) => {
            // Given a file URL on one of the configured Expensify servers
            const url = `${root}${FILE_PATH}`;

            // When checking whether the token can go to that URL
            const result = canSendAuthTokenToURL(url);

            // Then it can, because the Expensify servers need the token to serve private files
            expect(result).toBe(true);
        });

        it('returns true for an API command URL that already has query parameters', () => {
            // Given an API command URL like the one used to stream a workspace rules document
            const url = `${EXPENSIFY_ROOT}api/GetPolicyRulesDocument?policyID=ABC123&cacheBuster=${encodeURIComponent('https://example.com/rules.pdf')}`;

            // When checking whether the token can go to that URL
            const result = canSendAuthTokenToURL(url);

            // Then it can, because a URL in the query does not change the host the request goes to
            expect(result).toBe(true);
        });

        it('returns true for a path on the current origin', () => {
            // Given a path with one leading slash, which the browser loads from the origin that serves the App
            const url = `/${FILE_PATH}`;

            // When checking whether the token can go to that URL
            const result = canSendAuthTokenToURL(url);

            // Then it can, because the request stays on the App's own origin
            expect(result).toBe(true);
        });
    });

    describe('URLs on other hosts', () => {
        it.each([
            ['an unrelated host', ATTACKER_FILE_URL],
            ['a host that starts with the Expensify host', `https://${EXPENSIFY_HOST}.attacker.example/${FILE_PATH}`],
            ['a host that ends with the Expensify host', `https://attacker${EXPENSIFY_HOST}/${FILE_PATH}`],
            ['user info that looks like the Expensify host', `https://${EXPENSIFY_HOST}@attacker.example/${FILE_PATH}`],
            ['a backslash in place of the slash after the Expensify host', `https://${EXPENSIFY_HOST}\\@attacker.example/${FILE_PATH}`],
            ['the Expensify host on another port', `https://${EXPENSIFY_HOST}:8443/${FILE_PATH}`],
            ['the Expensify host over plain HTTP', `http://${EXPENSIFY_HOST}/${FILE_PATH}`],
            ['an Expensify URL inside the path', `https://attacker.example/${EXPENSIFY_ROOT}${FILE_PATH}`],
            ['an Expensify URL inside the query', `https://attacker.example/file.pdf?next=${EXPENSIFY_ROOT}`],
            ['a protocol relative URL', '//attacker.example/file.pdf'],
            ['a backslash after the leading slash', '/\\attacker.example/file.pdf'],
            ['a tab between the leading slashes', '/\t/attacker.example/file.pdf'],
            ['a line break between the leading slashes', '/\n/attacker.example/file.pdf'],
            ['a leading space before a protocol relative URL', ' //attacker.example/file.pdf'],
        ])('returns false for %s', (_, url) => {
            // Given a URL that a browser or native networking stack sends to a host other than Expensify
            // When checking whether the token can go to that URL
            const result = canSendAuthTokenToURL(url);

            // Then it cannot, because whoever runs that host could reuse the token
            expect(result).toBe(false);
        });
    });

    describe('URLs that do not point at a server', () => {
        it.each([
            ['an empty string', ''],
            ['a blob URL', 'blob:https://new.expensify.com/1234-5678'],
            ['a file URL', 'file:///data/user/0/receipt.jpg'],
            ['a data URL', 'data:text/plain,receipt'],
            // eslint-disable-next-line no-script-url -- Verify that a script URL never receives the token.
            ['a javascript URL', 'javascript:alert(1)'],
            ['a relative path without a leading slash', FILE_PATH],
        ])('returns false for %s', (_, url) => {
            // Given a URL that is not an Expensify server URL
            // When checking whether the token can go to that URL
            const result = canSendAuthTokenToURL(url);

            // Then it cannot, because only Expensify server URLs need the token
            expect(result).toBe(false);
        });
    });

    describe('configuration', () => {
        it('allows paths on the current origin but not other hosts when the web proxy makes the API root a relative path', () => {
            // Given the web proxy config, where the API root is the relative path `/`
            const canSendWithWebProxy = loadWithExpensifyConfig({
                DEFAULT_API_ROOT: '/',
                DEFAULT_SECURE_API_ROOT: '/',
            });

            // When checking a path on the current origin, a protocol relative URL and another host
            // Then only the path on the current origin can receive the token
            expect(canSendWithWebProxy(`/${FILE_PATH}`)).toBe(true);
            expect(canSendWithWebProxy('//attacker.example/file.pdf')).toBe(false);
            expect(canSendWithWebProxy(ATTACKER_FILE_URL)).toBe(false);
        });

        it('ignores server roots that are not configured', () => {
            // Given a config where the QA roots are empty strings, which is the default when no QA server is set up
            const canSendWithoutQA = loadWithExpensifyConfig({
                QA_API_ROOT: '',
                QA_SECURE_API_ROOT: '',
            });

            // When checking a URL on another host
            const result = canSendWithoutQA(ATTACKER_FILE_URL);

            // Then it cannot receive the token, because an empty root must not match every URL
            expect(result).toBe(false);
        });

        it('allows the QA server when it is configured', () => {
            // Given a config that points the App at a QA server
            const qaRoot = 'https://qa.expensify.example/';
            const canSendWithQA = loadWithExpensifyConfig({QA_API_ROOT: qaRoot});

            // When checking a file URL on that QA server
            const result = canSendWithQA(`${qaRoot}${FILE_PATH}`);

            // Then it can receive the token, because the QA server serves the same private files
            expect(result).toBe(true);
        });
    });
});
