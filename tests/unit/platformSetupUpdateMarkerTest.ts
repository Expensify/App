/** Verify upgrade navigation markers are removed before app routing starts, and the service worker is registered only where it belongs. */
import {APP_UPDATE_QUERY_PARAM} from '@libs/AppUpdateURL';
import {isSharedProductHost, readExperienceCookie} from '@libs/ExperienceCookie';

import CONST from '@src/CONST';

import {AppRegistry} from 'react-native';

import type platformSetupImpl from '../../src/setup/platformSetup/index';

jest.mock('@libs/CacheAPI', () => ({__esModule: true, default: {init: jest.fn()}}));
jest.mock('@libs/checkForUpdates', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/DateUtils', () => ({__esModule: true, default: {startCurrentDateUpdater: jest.fn()}}));
jest.mock('@libs/Visibility', () => ({__esModule: true, default: {isVisible: jest.fn()}}));
jest.mock('@libs/ExperienceCookie', () => ({isSharedProductHost: jest.fn(() => false), readExperienceCookie: jest.fn(() => undefined)}));

let mockIsInProduction = false;
jest.mock('@src/CONFIG', () => ({
    __esModule: true,
    default: {
        get IS_IN_PRODUCTION() {
            return mockIsInProduction;
        },
        APP_NAME: 'test-app',
    },
}));

const {default: platformSetup} = jest.requireActual<{default: typeof platformSetupImpl}>('../../src/setup/platformSetup/index.ts');

describe('web upgrade marker cleanup', () => {
    const originalURL = window.location.href;
    const originalState: unknown = window.history.state;

    beforeEach(() => {
        jest.spyOn(AppRegistry, 'runApplication').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
        window.history.replaceState(originalState, '', originalURL);
    });

    it('removes only the upgrade marker before starting the app', () => {
        // Given an upgrade deep link whose other parameters, fragment, and history state must survive
        const state = {route: 'report'};
        window.history.replaceState(state, '', `/r/123?existing=keep&${APP_UPDATE_QUERY_PARAM}=true#details`);
        const runApplication = jest.mocked(AppRegistry.runApplication);
        runApplication.mockImplementationOnce(() => {
            expect(window.location.pathname).toBe('/r/123');
            expect(window.location.search).toBe('?existing=keep');
            expect(window.location.hash).toBe('#details');
            expect(window.history.state).toEqual(state);
        });

        // When web setup starts the app
        platformSetup();

        // Then routing sees the original app URL and future reloads use the normal offline timeout
        expect(runApplication).toHaveBeenCalled();
        expect(new URL(window.location.href).searchParams.has(APP_UPDATE_QUERY_PARAM)).toBe(false);
    });

    it('leaves ordinary navigation history untouched', () => {
        // Given an ordinary app navigation with no upgrade marker
        window.history.replaceState({route: 'report'}, '', '/r/123?existing=keep#details');
        const replaceState = jest.spyOn(window.history, 'replaceState');

        // When web setup starts the app
        platformSetup();

        // Then no unnecessary history update is made
        expect(replaceState).not.toHaveBeenCalled();
    });
});

describe('service worker registration', () => {
    let register: jest.Mock;
    let deleteCache: jest.Mock;

    beforeEach(() => {
        mockIsInProduction = true;
        jest.spyOn(AppRegistry, 'runApplication').mockImplementation(() => {});
        register = jest.fn(async () => ({}));
        deleteCache = jest.fn(async () => true);
        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: {register},
        });
        Object.defineProperty(globalThis, 'caches', {
            configurable: true,
            value: {delete: deleteCache},
        });
        jest.mocked(isSharedProductHost).mockReturnValue(false);
        jest.mocked(readExperienceCookie).mockReturnValue(undefined);
    });

    afterEach(() => {
        mockIsInProduction = false;
        jest.restoreAllMocks();
        Reflect.deleteProperty(navigator, 'serviceWorker');
        Reflect.deleteProperty(globalThis, 'caches');
    });

    /** Runs web setup and the page load that registers the worker */
    async function startAppAndLoad() {
        const loadListeners: EventListener[] = [];
        jest.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
            if (type !== 'load' || typeof listener !== 'function') {
                return;
            }
            loadListeners.push(listener);
        });
        platformSetup();
        for (const listener of loadListeners) {
            listener(new Event('load'));
        }
        // Registration waits for Cache Storage first; process.nextTick is not faked, unlike timers
        for (let tick = 0; tick < 2; tick++) {
            await new Promise<void>((resolve) => {
                process.nextTick(resolve);
            });
        }
    }

    it.each([
        ['on New Expensify’s own host', false, undefined, true],
        ['for a New Expensify user on the shared host', true, CONST.EXPERIENCE_COOKIE.VALUES.NEW, true],
        ['for an Expensify Classic user on the shared host', true, CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC, false],
        ['without the experience cookie on the shared host', true, undefined, false],
    ] as const)('registers the worker %s only when it should', async (_, isShared, cookie, shouldRegister) => {
        // Given the host and the product the experience cookie selects
        jest.mocked(isSharedProductHost).mockReturnValue(isShared);
        jest.mocked(readExperienceCookie).mockReturnValue(cookie);

        // When the app starts
        await startAppAndLoad();

        // Then only users who would have the worker on New Expensify's own host get it, and saved media is unblocked first
        expect(register).toHaveBeenCalledTimes(shouldRegister ? 1 : 0);
        expect(deleteCache).toHaveBeenCalledTimes(shouldRegister ? 1 : 0);
        if (shouldRegister) {
            expect(deleteCache).toHaveBeenCalledWith('user-media-blocked');
            expect(deleteCache.mock.invocationCallOrder.at(0)).toBeLessThan(register.mock.invocationCallOrder.at(0) ?? 0);
        }
    });

    it('registers the worker even when unblocking saved media fails', async () => {
        // Given Cache Storage that rejects
        deleteCache.mockRejectedValue(new Error('Cache Storage unavailable'));
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

        // When the app starts
        await startAppAndLoad();

        // Then the worker is still registered
        expect(register).toHaveBeenCalledWith('/service-worker.js', {
            updateViaCache: 'none',
        });
        expect(warn).toHaveBeenCalledWith('[SW] failed to unblock saved media', expect.any(Error));
    });
});
