import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import * as NativeExperienceCookie from '@libs/ExperienceCookie/index.native';
import type * as WebExperienceCookie from '@libs/ExperienceCookie/index.ts';
import getSharedProductHostForEnvironment from '@libs/getSharedProductHostForEnvironment';

import CONST from '@src/CONST';

let mockExpensifyURL = 'https://www.expensify.com.dev/';

jest.mock('@src/CONFIG', () => {
    const actualConfig = jest.requireActual<{default: {EXPENSIFY: Record<string, unknown>}}>('@src/CONFIG').default;
    return {
        __esModule: true,
        default: {
            ...actualConfig,
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
const {writeExperienceCookie, clearExperienceCookie, readExperienceCookie, isSharedProductHost} = jest.requireActual<typeof WebExperienceCookie>('@libs/ExperienceCookie/index.ts');

const HOST_ONLY_DELETE = 'experience=; Max-Age=0; Path=/; Secure; SameSite=Lax';

let cookieSetter: jest.SpyInstance<void, [string]>;
let realLocation: Location;

// The build config defines this global, and Jest defines it with the development value
const SHARED_PRODUCT_HOST_GLOBAL = '__SHARED_PRODUCT_HOST__';
const DEV_SHARED_PRODUCT_HOST: unknown = Reflect.get(globalThis, SHARED_PRODUCT_HOST_GLOBAL);

/** Stands in for a build of another environment, whose shared product host the build config defines */
function arrangeBuildForEnvironment(environment: string) {
    Reflect.set(globalThis, SHARED_PRODUCT_HOST_GLOBAL, getSharedProductHostForEnvironment(environment) ?? '');
}

/** Points jsdom at the given host without triggering a real navigation */
function arrangeHostname(hostname: string) {
    Object.defineProperty(window, 'location', {value: {hostname}, writable: true, configurable: true});
}

/** Lists the raw strings written to document.cookie, since jsdom drops cookies whose Domain doesn't match its own URL */
function getCookieWrites(): string[] {
    return cookieSetter.mock.calls.map(([cookie]) => cookie);
}

beforeEach(() => {
    Reflect.set(globalThis, SHARED_PRODUCT_HOST_GLOBAL, DEV_SHARED_PRODUCT_HOST);
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
        // Given the dev build served from the shared product host
        arrangeHostname('expensify.com.dev');

        // When the user switches to Classic
        const didWrite = writeExperienceCookie(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);

        // Then the cookie has the shared domain and attributes, and a host-only cookie can't shadow it
        expect(didWrite).toBe(true);
        expect(getCookieWrites()).toEqual([HOST_ONLY_DELETE, 'experience=classic; Max-Age=31536000; Domain=.expensify.com.dev; Path=/; Secure; SameSite=Lax']);
    });

    it('clears both the host-only and the shared-domain cookie', () => {
        // Given the dev build served from the shared product host
        arrangeHostname('expensify.com.dev');

        // When the user signs out
        const didClear = clearExperienceCookie();

        // Then both variants are expired, because a cookie can exist in either
        expect(didClear).toBe(true);
        expect(getCookieWrites()).toEqual([HOST_ONLY_DELETE, 'experience=; Max-Age=0; Domain=.expensify.com.dev; Path=/; Secure; SameSite=Lax']);
    });

    it.each(['dev.new.expensify.com', 'new.expensify.com', 'www.expensify.com.dev'])('does nothing on %s', (hostname) => {
        // Given New Expensify served from a host other than the shared product host, where its behavior must not change
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
        // Given a build whose Expensify Classic URL is www.expensify.com, served from that environment's shared product host
        arrangeBuildForEnvironment(environment);
        mockExpensifyURL = 'https://www.expensify.com/';
        arrangeHostname(hostname);

        // When the user switches to Classic
        writeExperienceCookie(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);

        // Then the cookie uses the shared .expensify.com domain
        expect(getCookieWrites().at(-1)).toBe('experience=classic; Max-Age=31536000; Domain=.expensify.com; Path=/; Secure; SameSite=Lax');
    });

    it('does nothing and logs when the cookie domain does not cover the shared product host', () => {
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
        // Given the native implementation, which can't run on the shared product host
        arrangeHostname('expensify.com.dev');

        // When the user switches to Classic and signs out
        const didWrite = NativeExperienceCookie.writeExperienceCookie(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);
        const didClear = NativeExperienceCookie.clearExperienceCookie();

        // Then nothing is written
        expect(didWrite).toBe(false);
        expect(didClear).toBe(false);
        expect(getCookieWrites()).toEqual([]);
    });

    it.each(Object.values(CONST.ENVIRONMENT))('uses the Expensify Classic host without www. as the shared product host for %s builds', (environment) => {
        // Given a build for an environment
        // When the build config looks up the shared host for it
        const sharedProductHost = getSharedProductHostForEnvironment(environment);

        // Then it is the host Expensify Classic runs on in that environment, which also serves New Expensify
        expect(sharedProductHost).toBe(new URL(getOldDotURLFromEnvironment(environment)).hostname.replace(/^www\./, ''));
    });

    it('recognizes the shared product host only where the build says it is', () => {
        // Given a production build
        arrangeBuildForEnvironment(CONST.ENVIRONMENT.PRODUCTION);
        mockExpensifyURL = 'https://www.expensify.com/';

        // When the page is opened on expensify.com and on New Expensify's own host
        const hostResults = ['expensify.com', 'new.expensify.com'].map((hostname) => {
            arrangeHostname(hostname);
            return isSharedProductHost();
        });

        // Then only expensify.com is the shared host
        expect(hostResults).toEqual([true, false]);
    });

    it('treats every host as unshared when the build has no shared product host', () => {
        // Given a build for an environment without a shared host
        arrangeBuildForEnvironment('unknown');
        arrangeHostname('expensify.com.dev');

        // When the app checks whether it runs on the shared host
        const isShared = isSharedProductHost();

        // Then nothing is treated as the shared host
        expect(isShared).toBe(false);
    });

    it.each([
        ['experience=new', CONST.EXPERIENCE_COOKIE.VALUES.NEW],
        ['other=1; experience=classic; last=2', CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC],
        ['experienced=new', undefined],
        ['experience=other', undefined],
        ['', undefined],
    ])("reads the experience cookie from '%s'", (cookie, expected) => {
        // Given the cookies the browser sends for this page
        const cookieGetter = jest.spyOn(Document.prototype, 'cookie', 'get').mockReturnValue(cookie);

        // When the app reads the experience cookie
        const experience = readExperienceCookie();

        // Then only a known experience value is returned
        expect(experience).toBe(expected);
        cookieGetter.mockRestore();
    });

    it('never reads a cookie on native', () => {
        // Given the native implementation, which has no browser cookies
        // When the app reads the cookie and checks the host
        const experience = NativeExperienceCookie.readExperienceCookie();
        const isShared = NativeExperienceCookie.isSharedProductHost();

        // Then there is no cookie and no shared product host
        expect(experience).toBeUndefined();
        expect(isShared).toBe(false);
    });
});
