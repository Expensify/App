import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {setIsGPSInProgressModalOpen} from '@userActions/isGPSInProgressModalOpen';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    clearPreloadedRoutes: jest.fn(),
}));

jest.mock('@userActions/isGPSInProgressModalOpen', () => ({
    setIsGPSInProgressModalOpen: jest.fn(),
}));

Onyx.init({keys: ONYXKEYS});

type HybridAppModuleWithClose = {
    closeReactNativeApp: (params: {shouldSetNVP: boolean}) => void;
};

type HybridAppActionsModule = {
    closeReactNativeApp: (params: {shouldSetNVP: boolean; isTrackingGPS: boolean}) => void;
};

describe('HybridApp actions', () => {
    const {default: HybridAppModule} = require('@expensify/react-native-hybrid-app') as {default: HybridAppModuleWithClose};
    const {closeReactNativeApp} = require('@libs/actions/HybridApp') as HybridAppActionsModule;
    let closeNativeAppSpy: jest.SpiedFunction<HybridAppModuleWithClose['closeReactNativeApp']>;

    beforeEach(async () => {
        jest.clearAllMocks();
        closeNativeAppSpy = jest.spyOn(HybridAppModule, 'closeReactNativeApp').mockImplementation(() => {});
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('blocks shouldSetNVP exits when the user is locked to NewApp', async () => {
        await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, {
            isLockedToNewApp: true,
        });
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});

        expect(closeNativeAppSpy).not.toHaveBeenCalled();
        expect(Navigation.clearPreloadedRoutes).not.toHaveBeenCalled();
    });

    it('blocks the GPS OldApp handoff modal when the user is locked to NewApp', async () => {
        await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, {
            isLockedToNewApp: true,
        });
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: true});

        expect(setIsGPSInProgressModalOpen).not.toHaveBeenCalled();
        expect(closeNativeAppSpy).not.toHaveBeenCalled();
    });

    it('allows shouldSetNVP exits once tryNewDot resolves without a mobile lock', async () => {
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});

        expect(Navigation.clearPreloadedRoutes).toHaveBeenCalled();
        expect(closeNativeAppSpy).toHaveBeenCalledWith({shouldSetNVP: true});
    });

    it('blocks shouldSetNVP false exits when the user is locked to NewApp', async () => {
        await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, {
            isLockedToNewApp: true,
        });
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: false, isTrackingGPS: false});

        expect(Navigation.clearPreloadedRoutes).not.toHaveBeenCalled();
        expect(closeNativeAppSpy).not.toHaveBeenCalled();
    });

    it('re-blocks shouldSetNVP exits after tryNewDot is cleared until the next app load finishes', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.NVP_TRY_NEW_DOT]: {
                classicRedirect: {
                    dismissed: true,
                },
            },
        });
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});
        expect(closeNativeAppSpy).toHaveBeenCalledWith({shouldSetNVP: true});

        jest.clearAllMocks();

        await Onyx.clear([ONYXKEYS.IS_LOADING_APP]);
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});
        expect(closeNativeAppSpy).not.toHaveBeenCalled();

        await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
        await waitForBatchedUpdatesWithAct();
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});
        expect(closeNativeAppSpy).toHaveBeenCalledWith({shouldSetNVP: true});
    });

    it('re-blocks shouldSetNVP exits after a session switch until the new tryNewDot state resolves', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.SESSION]: {
                accountID: 1,
                authToken: 'old-auth-token',
            },
            [ONYXKEYS.NVP_TRY_NEW_DOT]: {
                classicRedirect: {
                    dismissed: true,
                },
            },
        });
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});
        expect(closeNativeAppSpy).toHaveBeenCalledWith({shouldSetNVP: true});

        jest.clearAllMocks();

        await Onyx.set(ONYXKEYS.SESSION, {
            accountID: 2,
            authToken: 'new-auth-token',
        });
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});
        expect(closeNativeAppSpy).not.toHaveBeenCalled();

        await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, {
            classicRedirect: {
                dismissed: false,
            },
        });
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});
        expect(closeNativeAppSpy).toHaveBeenCalledWith({shouldSetNVP: true});
    });

    it('preserves shouldSetNVP exits when the auth token rotates for the same session', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.SESSION]: {
                accountID: 1,
                authToken: 'old-auth-token',
            },
            [ONYXKEYS.NVP_TRY_NEW_DOT]: {
                classicRedirect: {
                    dismissed: true,
                },
            },
        });
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});
        expect(closeNativeAppSpy).toHaveBeenCalledWith({shouldSetNVP: true});

        jest.clearAllMocks();

        await Onyx.merge(ONYXKEYS.SESSION, {
            authToken: 'rotated-auth-token',
        });
        await waitForBatchedUpdatesWithAct();

        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});
        expect(closeNativeAppSpy).toHaveBeenCalledWith({shouldSetNVP: true});
    });

    it('preserves shouldSetNVP false exits for existing non-force-mobile flows', () => {
        closeReactNativeApp({shouldSetNVP: false, isTrackingGPS: false});

        expect(Navigation.clearPreloadedRoutes).toHaveBeenCalled();
        expect(closeNativeAppSpy).toHaveBeenCalledWith({shouldSetNVP: false});
    });
});
