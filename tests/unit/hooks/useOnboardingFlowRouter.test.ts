import {renderHook} from '@testing-library/react-native';

import useOnboardingFlowRouter from '@hooks/useOnboardingFlow';

import {deferPendingNativeShareUntilOnboardingExit, openPendingNativeShare} from '@userActions/Share';
import {startOnboardingFlow} from '@userActions/Welcome/OnboardingFlow';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@userActions/Share', () => ({
    deferPendingNativeShareUntilOnboardingExit: jest.fn(),
    openPendingNativeShare: jest.fn(),
}));

jest.mock('@userActions/Welcome/OnboardingFlow', () => ({
    buildOnboardingFlowParams: jest.fn(() => ({})),
    startOnboardingFlow: jest.fn(),
}));

jest.mock('@userActions/Welcome', () => ({
    completeHybridAppOnboarding: jest.fn(),
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(({callback}: {callback: () => void}) => {
        callback();
        return {cancel: jest.fn()};
    }),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        isNavigationReady: jest.fn(() => Promise.resolve()),
        isValidateLoginFlow: jest.fn(() => false),
        getActiveRoute: jest.fn(() => ''),
    },
}));

jest.mock('@libs/Navigation/currentUrl', () => jest.fn(() => ''));
jest.mock('@hooks/useRootNavigationState', () => jest.fn(() => false));
jest.mock('@hooks/useShouldSuppressPromotionalUI', () => jest.fn(() => false));
jest.mock('@components/InitialURLContextProvider', () => ({
    useInitialURLState: jest.fn(() => ({initialURL: null, isAuthenticatedAtStartup: false})),
}));

const mockedOpenPendingNativeShare = jest.mocked(openPendingNativeShare);
const mockedDeferPendingNativeShare = jest.mocked(deferPendingNativeShareUntilOnboardingExit);
const mockedStartOnboardingFlow = jest.mocked(startOnboardingFlow);

async function renderRouter() {
    const result = renderHook(() => useOnboardingFlowRouter());
    await waitForBatchedUpdates();
    return result;
}

describe('useOnboardingFlowRouter', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        // OpenApp has finished for this session, so the onboarding NVP below is the server's answer
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.HAS_LOADED_APP]: true,
            [ONYXKEYS.ACCOUNT]: {isFromPublicDomain: true},
        });
        await waitForBatchedUpdates();
    });

    describe('pending native share', () => {
        it('opens the share once onboarding is ruled out for a completed account', async () => {
            // Given an account that has already completed onboarding
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});

            // When the router evaluates
            await renderRouter();

            // Then a share captured while signed out is opened now, and nothing is deferred to an onboarding exit that will never come
            expect(mockedOpenPendingNativeShare).toHaveBeenCalled();
            expect(mockedDeferPendingNativeShare).not.toHaveBeenCalled();
            expect(mockedStartOnboardingFlow).not.toHaveBeenCalled();
        });

        it('defers the share to the onboarding exit for an account that needs onboarding', async () => {
            // Given a brand-new account that still needs onboarding
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});

            // When the router evaluates
            await renderRouter();

            // Then onboarding starts and the share waits for the onboarding exit, so it is never opened under the onboarding modal
            expect(mockedDeferPendingNativeShare).toHaveBeenCalled();
            expect(mockedStartOnboardingFlow).toHaveBeenCalled();
            expect(mockedOpenPendingNativeShare).not.toHaveBeenCalled();
        });

        it('opens the share for an account whose onboarding is skipped', async () => {
            // Given an invited/group member who never sees onboarding even though the flag says it is incomplete
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);

            // When the router evaluates
            await renderRouter();

            // Then the share opens now; deferring it would strand it, since no onboarding exit will run
            expect(mockedOpenPendingNativeShare).toHaveBeenCalled();
            expect(mockedDeferPendingNativeShare).not.toHaveBeenCalled();
            expect(mockedStartOnboardingFlow).not.toHaveBeenCalled();
        });

        it('waits for OpenApp before opening the share', async () => {
            // Given OpenApp has not finished yet (HAS_LOADED_APP unset), so the missing onboarding NVP still reads as "completed"
            // even though a fresh sign-up may still need onboarding; IS_LOADING_APP survives sign-out so it is not a safe signal
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, null);
            await waitForBatchedUpdates();

            // When the router evaluates
            await renderRouter();

            // Then the share is not opened yet: doing so would race the onboarding that OpenApp may reveal is needed
            expect(mockedOpenPendingNativeShare).not.toHaveBeenCalled();

            // When OpenApp finishes for an account that is completed
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await waitForBatchedUpdates();

            // Then the router re-evaluates and opens it
            expect(mockedOpenPendingNativeShare).toHaveBeenCalled();
        });
    });
});
