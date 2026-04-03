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

    it('preserves shouldSetNVP false exits for existing non-force-mobile flows', () => {
        closeReactNativeApp({shouldSetNVP: false, isTrackingGPS: false});

        expect(Navigation.clearPreloadedRoutes).toHaveBeenCalled();
        expect(closeNativeAppSpy).toHaveBeenCalledWith({shouldSetNVP: false});
    });
});
