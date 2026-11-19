import {renderHook} from '@testing-library/react-native';

import useOnboardingFlowRouter from '@hooks/useOnboardingFlow';

import {WRITE_COMMANDS} from '@libs/API/types';
import {deferPendingNativeShareUntilOnboardingExit, openPendingNativeShare} from '@libs/Navigation/helpers/pendingNativeShare';
import type * as NetworkStateModule from '@libs/NetworkState';
import {didUserLogInDuringSession} from '@libs/SessionUtils';

import {startOnboardingFlow} from '@userActions/Welcome/OnboardingFlow';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// Keeps the request queue idle, so the OpenApp request these tests write to it stays there until a test removes it.
jest.mock('@libs/NetworkState', () => ({
    ...jest.requireActual<typeof NetworkStateModule>('@libs/NetworkState'),
    getIsOffline: () => true,
}));

jest.mock('@libs/SessionUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/SessionUtils'),
    didUserLogInDuringSession: jest.fn(() => true),
}));

jest.mock('@libs/Navigation/helpers/pendingNativeShare', () => ({
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
const mockedDidUserLogInDuringSession = jest.mocked(didUserLogInDuringSession);

const OPEN_APP_REQUEST: AnyRequest = {command: WRITE_COMMANDS.OPEN_APP, data: {}};

async function setQueuedRequests(requests: AnyRequest[]) {
    await Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
    await waitForBatchedUpdates();
}

async function renderRouter() {
    const result = renderHook(() => useOnboardingFlowRouter());
    await waitForBatchedUpdates();
    return result;
}

/** Mounts the router while the OpenApp of this sign-in is in flight, then lets that request finish. */
async function renderRouterThroughOpenApp() {
    await setQueuedRequests([OPEN_APP_REQUEST]);
    const result = await renderRouter();
    await setQueuedRequests([]);
    return result;
}

describe('useOnboardingFlowRouter', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockedDidUserLogInDuringSession.mockReturnValue(true);
        await Onyx.clear();
        // The stored flags read "loaded". On their own they say nothing about the OpenApp of this sign-in
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

            // When the router evaluates and the OpenApp of this sign-in finishes
            await renderRouterThroughOpenApp();

            // Then a parked share is opened now, and nothing is deferred to an onboarding exit that will never come
            expect(mockedOpenPendingNativeShare).toHaveBeenCalled();
            expect(mockedDeferPendingNativeShare).not.toHaveBeenCalled();
            expect(mockedStartOnboardingFlow).not.toHaveBeenCalled();
        });

        it('defers the share to the onboarding exit for an account that needs onboarding', async () => {
            // Given a brand-new account that still needs onboarding
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});

            // When the router evaluates and the OpenApp of this sign-in finishes
            await renderRouterThroughOpenApp();

            // Then onboarding starts and the share waits for the onboarding exit, so it is never opened under the onboarding modal
            expect(mockedDeferPendingNativeShare).toHaveBeenCalled();
            expect(mockedStartOnboardingFlow).toHaveBeenCalled();
            expect(mockedOpenPendingNativeShare).not.toHaveBeenCalled();
        });

        it('opens the share for an account whose onboarding is skipped', async () => {
            // Given an invited/group member who never sees onboarding even though the flag says it is incomplete
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);

            // When the router evaluates and the OpenApp of this sign-in finishes
            await renderRouterThroughOpenApp();

            // Then the share opens now; deferring it would strand it, since no onboarding exit will run
            expect(mockedOpenPendingNativeShare).toHaveBeenCalled();
            expect(mockedDeferPendingNativeShare).not.toHaveBeenCalled();
            expect(mockedStartOnboardingFlow).not.toHaveBeenCalled();
        });

        it('waits for the app to be marked as loaded before opening the share', async () => {
            // Given the OpenApp response has not been applied yet (HAS_LOADED_APP unset), so the missing onboarding NVP still
            // reads as "completed" even though a fresh sign-up may still need onboarding
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, null);
            await waitForBatchedUpdates();

            // When the router evaluates and the request leaves the queue
            await renderRouterThroughOpenApp();

            // Then the share is not opened yet: doing so would race the onboarding that OpenApp may reveal is needed
            expect(mockedOpenPendingNativeShare).not.toHaveBeenCalled();

            // When the response lands for an account that is completed
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await waitForBatchedUpdates();

            // Then the router re-evaluates and opens it
            expect(mockedOpenPendingNativeShare).toHaveBeenCalled();
        });

        it('does not open the share on loaded flags alone, before the OpenApp of this sign-in has run', async () => {
            // Given a fresh sign-in whose stored flags already read "loaded" and whose onboarding NVP has not arrived yet,
            // so onboarding looks completed although OpenApp has not said so. This is the window in which the share
            // used to open and was then removed by onboarding
            await renderRouter();

            // Then the share stays parked
            expect(mockedOpenPendingNativeShare).not.toHaveBeenCalled();

            // When the OpenApp of this sign-in is sent
            await setQueuedRequests([OPEN_APP_REQUEST]);

            // Then the share still waits for it
            expect(mockedOpenPendingNativeShare).not.toHaveBeenCalled();

            // When it finishes for an account that does not need onboarding
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await setQueuedRequests([]);

            // Then the share opens
            expect(mockedOpenPendingNativeShare).toHaveBeenCalled();
            expect(mockedStartOnboardingFlow).not.toHaveBeenCalled();
        });

        it('does not open the share when the OpenApp of this sign-in reveals that onboarding is needed', async () => {
            // Given a fresh sign-in whose onboarding NVP has not arrived yet
            await setQueuedRequests([OPEN_APP_REQUEST]);
            await renderRouter();

            // When OpenApp finishes and says the account still needs onboarding
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await setQueuedRequests([]);

            // Then onboarding starts and the share is handed to the onboarding exit without ever being opened
            expect(mockedOpenPendingNativeShare).not.toHaveBeenCalled();
            expect(mockedDeferPendingNativeShare).toHaveBeenCalled();
            expect(mockedStartOnboardingFlow).toHaveBeenCalled();
        });

        it('does not wait for OpenApp in a session that was already signed in at startup', async () => {
            // Given a returning user whose session and data were on disk when the app started, so no OpenApp is sent
            mockedDidUserLogInDuringSession.mockReturnValue(false);
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});

            // When the router evaluates
            await renderRouter();

            // Then onboarding is settled straight away
            expect(mockedOpenPendingNativeShare).toHaveBeenCalled();
        });
    });
});
