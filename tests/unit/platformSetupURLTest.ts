/** Verify the URL passed to the app at web startup. */
import {APP_UPDATE_QUERY_PARAM} from '@libs/AppUpdateURL';

import {AppRegistry} from 'react-native';

import type platformSetupImpl from '../../src/setup/platformSetup/index';

jest.mock('@libs/CacheAPI', () => ({__esModule: true, default: {init: jest.fn()}}));
jest.mock('@libs/checkForUpdates', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/DateUtils', () => ({__esModule: true, default: {startCurrentDateUpdater: jest.fn()}}));
jest.mock('@libs/Visibility', () => ({__esModule: true, default: {isVisible: jest.fn()}}));
jest.mock('@src/CONFIG', () => ({__esModule: true, default: {IS_IN_PRODUCTION: false, APP_NAME: 'test-app'}}));

const {default: platformSetup} = jest.requireActual<{default: typeof platformSetupImpl}>('../../src/setup/platformSetup/index.ts');

describe('web startup URL', () => {
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

    it.each([
        ['/insights', '/insights/spend'],
        [`/insights/?backTo=${encodeURIComponent('/home')}#details`, `/insights/spend?backTo=${encodeURIComponent('/home')}#details`],
        [`/insights?${APP_UPDATE_QUERY_PARAM}=true&backTo=${encodeURIComponent('/home')}`, `/insights/spend?backTo=${encodeURIComponent('/home')}`],
    ])('starts on Spend when opening %s', (path, expectedPath) => {
        // Given a direct visit to the Insights root
        const state = {route: 'insights'};
        window.history.replaceState(state, '', path);
        const runApplication = jest.mocked(AppRegistry.runApplication);
        runApplication.mockImplementationOnce(() => {
            expect(window.location.href).toBe(new URL(expectedPath, originalURL).href);
            expect(window.history.state).toEqual(state);
        });

        // When web setup starts the app
        platformSetup();

        // Then the app starts with the Spend URL already in the address bar
        expect(runApplication).toHaveBeenCalledTimes(1);
    });

    it.each(['/r/123?existing=keep#details', '/insights/compliance', '/insights/spend/details/topMerchants'])('leaves %s untouched', (path) => {
        // Given a navigation that already points to a specific page
        window.history.replaceState({route: 'app'}, '', path);
        const replaceState = jest.spyOn(window.history, 'replaceState');

        // When web setup starts the app
        platformSetup();

        // Then no unnecessary history update is made
        expect(replaceState).not.toHaveBeenCalled();
    });
});
