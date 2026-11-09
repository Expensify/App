import * as NativeExperienceCookie from '@libs/ExperienceCookie/index.native';
import type * as WebExperienceCookie from '@libs/ExperienceCookie/index.ts';

import CONST from '@src/CONST';

let mockEnvironment: string = CONST.ENVIRONMENT.DEV;
let mockExpensifyURL = 'https://www.expensify.com.dev/';

jest.mock('@src/CONFIG', () => {
    const actualConfig = jest.requireActual<{default: {EXPENSIFY: Record<string, unknown>}}>('@src/CONFIG').default;
    return {
        __esModule: true,
        default: {
            ...actualConfig,
            get ENVIRONMENT() {
                return mockEnvironment;
            },
            EXPENSIFY: {
                ...actualConfig.EXPENSIFY,
                get EXPENSIFY_URL() {
                    return mockExpensifyURL;
                },
            },
        },
    };
});

const mockLogHmmm = jest.fn<void, unknown[]>();
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {info: jest.fn(), hmmm: (...args: unknown[]) => mockLogHmmm(...args)},
}));

// The React Native preset resolves index.native.ts first, so the web implementation is loaded by its file name
const {writeExperienceCookie, clearExperienceCookie} = jest.requireActual<typeof WebExperienceCookie>('@libs/ExperienceCookie/index.ts');

const HOST_ONLY_DELETE = 'experience=; Max-Age=0; Path=/; Secure; SameSite=Lax';

let cookieSetter: jest.SpyInstance<void, [string]>;
let realLocation: Location;

/** Points jsdom at the given host without triggering a real navigation */
function arrangeHostname(hostname: string) {
    Object.defineProperty(window, 'location', {value: {hostname}, writable: true, configurable: true});
}

/** Lists the raw strings written to document.cookie, since jsdom drops cookies whose Domain doesn't match its own URL */
function getCookieWrites(): string[] {
    return cookieSetter.mock.calls.map(([cookie]) => cookie);
}

beforeEach(() => {
    mockEnvironment = CONST.ENVIRONMENT.DEV;
    mockExpensifyURL = 'https://www.expensify.com.dev/';
    realLocation = window.location;

    // jsdom defines cookie as an accessor on Document.prototype, and its setter throws when called with another receiver
    cookieSetter = jest.spyOn(Document.prototype, 'cookie', 'set');
    jest.clearAllMocks();
});

afterEach(() => {
    cookieSetter.mockRestore();
    Object.defineProperty(window, 'location', {value: realLocation, writable: true, configurable: true});
});

describe('ExperienceCookie', () => {
    it('writes the cookie on the shared domain after deleting the host-only cookie', () => {
        // Given the dev build served from the HybridWeb host
        arrangeHostname('expensify.com.dev');

        // When the user switches to Classic
        const didWrite = writeExperienceCookie(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);

        // Then the cookie matches the one Web-Expensify writes, and a host-only cookie can't shadow it
        expect(didWrite).toBe(true);
        expect(getCookieWrites()).toEqual([HOST_ONLY_DELETE, 'experience=classic; Max-Age=31536000; Domain=.expensify.com.dev; Path=/; Secure; SameSite=Lax']);
    });

    it('clears both the host-only and the shared-domain cookie', () => {
        // Given the dev build served from the HybridWeb host
        arrangeHostname('expensify.com.dev');

        // When the user signs out
        const didClear = clearExperienceCookie();

        // Then both variants are expired, because a cookie can exist in either
        expect(didClear).toBe(true);
        expect(getCookieWrites()).toEqual([HOST_ONLY_DELETE, 'experience=; Max-Age=0; Domain=.expensify.com.dev; Path=/; Secure; SameSite=Lax']);
    });

    it.each(['dev.new.expensify.com', 'new.expensify.com', 'www.expensify.com.dev'])('does nothing on %s', (hostname) => {
        // Given New Expensify served from a host other than the HybridWeb host, where its behavior must not change
        arrangeHostname(hostname);

        // When the user switches to Classic and signs out
        const didWrite = writeExperienceCookie(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);
        const didClear = clearExperienceCookie();

        // Then no cookie is touched
        expect(didWrite).toBe(false);
        expect(didClear).toBe(false);
        expect(getCookieWrites()).toEqual([]);
    });

    it.each([
        [CONST.ENVIRONMENT.PRODUCTION, 'expensify.com'],
        [CONST.ENVIRONMENT.STAGING, 'staging.expensify.com'],
    ])('writes the .expensify.com cookie for the %s build on %s', (environment, hostname) => {
        // Given a build whose Expensify Classic URL is www.expensify.com, served from that environment's HybridWeb host
        mockEnvironment = environment;
        mockExpensifyURL = 'https://www.expensify.com/';
        arrangeHostname(hostname);

        // When the user switches to Classic
        writeExperienceCookie(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);

        // Then the cookie uses the domain Web-Expensify uses for www.expensify.com
        expect(getCookieWrites().at(-1)).toBe('experience=classic; Max-Age=31536000; Domain=.expensify.com; Path=/; Secure; SameSite=Lax');
    });

    it('does nothing and logs when the cookie domain does not cover the HybridWeb host', () => {
        // Given a dev build misconfigured with the production Expensify Classic URL
        mockExpensifyURL = 'https://www.expensify.com/';
        arrangeHostname('expensify.com.dev');

        // When the user switches to Classic
        const didWrite = writeExperienceCookie(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);

        // Then no cookie is written for the real expensify.com, and the misconfiguration is logged
        expect(didWrite).toBe(false);
        expect(getCookieWrites()).toEqual([]);
        expect(mockLogHmmm).toHaveBeenCalledWith(expect.stringContaining('[ExperienceCookie]'), {hostname: 'expensify.com.dev', cookieDomain: '.expensify.com'});
    });

    it('never writes a cookie on native', () => {
        // Given the native implementation, which can't run on the HybridWeb host
        arrangeHostname('expensify.com.dev');

        // When the user switches to Classic and signs out
        const didWrite = NativeExperienceCookie.writeExperienceCookie(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);
        const didClear = NativeExperienceCookie.clearExperienceCookie();

        // Then nothing is written
        expect(didWrite).toBe(false);
        expect(didClear).toBe(false);
        expect(getCookieWrites()).toEqual([]);
    });
});
