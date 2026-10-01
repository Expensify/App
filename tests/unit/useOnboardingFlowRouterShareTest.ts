import {act, renderHook} from '@testing-library/react-native';

import useOnboardingFlowRouter from '@hooks/useOnboardingFlow';

import {setPendingShareIntent} from '@libs/Navigation/helpers/pendingShareIntent';
import Navigation from '@libs/Navigation/Navigation';

import {startOnboardingFlow} from '@userActions/Welcome/OnboardingFlow';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getActiveRoute: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        navigate: jest.fn(),
    },
}));

// Run the hook's deferred callback right away; there are no navigation transitions in this test.
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: ({callback}: {callback: () => void}) => {
            callback();
            return {cancel: jest.fn()};
        },
    },
}));

jest.mock('@userActions/Welcome/OnboardingFlow', () => ({
    buildOnboardingFlowParams: jest.fn(() => ({})),
    startOnboardingFlow: jest.fn(),
}));

jest.mock('@hooks/useShouldSuppressPromotionalUI', () => ({
    __esModule: true,
    default: () => false,
}));

describe('useOnboardingFlowRouter with a share sent before sign-in', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('does not open the share before OpenApp lands, and holds it for onboarding once it does', async () => {
        // Given a share parked at sign-in, and the state right after a new user signs in on a device that was signed in
        // before: IS_LOADING_APP is still `false` from the last session and the onboarding NVP was cleared at sign-out
        setPendingShareIntent();
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.NVP_TRY_NEW_DOT]: {},
            [ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING]: {},
        });

        // When the router runs before OpenApp has loaded this session's data
        renderHook(() => useOnboardingFlowRouter());
        await waitForBatchedUpdatesWithAct();

        // Then the share doesn't open, because the empty onboarding NVP only looks completed
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When OpenApp lands and says the user still has to onboard
        await act(() =>
            Onyx.multiSet({
                [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: false},
                [ONYXKEYS.HAS_LOADED_APP]: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // Then onboarding starts and the share still doesn't open, because it waits for onboarding to finish
        expect(startOnboardingFlow).toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('opens the share once OpenApp lands for a user who has already onboarded', async () => {
        // Given a share parked at sign-in, for a user who signs in before OpenApp has loaded this session's data
        setPendingShareIntent();
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.NVP_TRY_NEW_DOT]: {},
            [ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING]: {},
        });
        renderHook(() => useOnboardingFlowRouter());
        await waitForBatchedUpdatesWithAct();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When OpenApp lands and says onboarding is complete
        await act(() =>
            Onyx.multiSet({
                [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: true},
                [ONYXKEYS.HAS_LOADED_APP]: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // Then the share opens right away, once
        expect(startOnboardingFlow).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_ROOT);
    });
});
