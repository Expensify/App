import {act, renderHook, waitFor} from '@testing-library/react-native';

import useAIFeaturesPromoModal from '@hooks/useAIFeaturesPromoModal';

import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import clearOnyxAndSeedFullReconnect from '@userActions/clearOnyxAndSeedFullReconnect';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.unmock('@hooks/useAIFeaturesPromoModal');

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: () => 'settings/troubleshoot',
    waitForProtectedRoutes: jest.fn(),
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    getRootState: () => ({routes: [{name: 'Troubleshoot'}]}),
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(),
}));

describe('useAIFeaturesPromoModal', () => {
    const session = {authToken: 'test-token', accountID: 123};
    const dismissedTraining = {aiFeaturesPromoModal: {timestamp: '2026-10-01 12:00:00', dismissedMethod: 'x' as const}};
    let resolveProtectedRoutes: () => void;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: session,
            [ONYXKEYS.ACCOUNT]: {},
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.NVP_TRY_NEW_DOT]: {},
            [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: true},
            [ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING]: dismissedTraining,
        });
        await waitForBatchedUpdates();

        // Reset the session's redirect flag through the same dismissal effect used by the app.
        const hook = renderHook(() => useAIFeaturesPromoModal(session));
        await act(waitForBatchedUpdates);
        hook.unmount();
        await Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {});
        await waitForBatchedUpdates();

        jest.mocked(Navigation.waitForProtectedRoutes).mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveProtectedRoutes = resolve;
                }),
        );
        jest.mocked(TransitionTracker.runAfterTransitions).mockImplementation(({callback}) => {
            callback();
            return {cancel: jest.fn()};
        });
    });

    it('does not open a promo from a cancelled evaluation when the cache is cleared', async () => {
        // Given a promo evaluation waiting for protected routes before the user clears the cache.
        renderHook(() => useAIFeaturesPromoModal(session));
        await waitFor(() => expect(Navigation.waitForProtectedRoutes).toHaveBeenCalledTimes(1));

        // When the reset marks the app as loading and removes the account's training data.
        await act(async () => {
            await clearOnyxAndSeedFullReconnect([ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]);
            await waitForBatchedUpdates();
        });
        await act(async () => {
            resolveProtectedRoutes();
            await waitForBatchedUpdates();
        });

        // Then the old promise must not navigate using eligibility captured before the reset.
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does not open a promo when its dismissal arrives while protected routes are pending', async () => {
        // Given an evaluation that began before the server restored a previous dismissal.
        renderHook(() => useAIFeaturesPromoModal(session));
        await waitFor(() => expect(Navigation.waitForProtectedRoutes).toHaveBeenCalledTimes(1));

        // When the dismissal is restored before the pending navigation can run.
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, dismissedTraining);
            await waitForBatchedUpdates();
        });
        await act(async () => {
            resolveProtectedRoutes();
            await waitForBatchedUpdates();
        });

        // Then the cancelled evaluation must respect the dismissal.
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does not open a promo after the hook unmounts', async () => {
        // Given an evaluation waiting for protected routes in the authenticated screen tree.
        const {unmount} = renderHook(() => useAIFeaturesPromoModal(session));
        await waitFor(() => expect(Navigation.waitForProtectedRoutes).toHaveBeenCalledTimes(1));

        // When the screen tree unmounts before those routes become ready.
        unmount();
        await act(async () => {
            resolveProtectedRoutes();
            await waitForBatchedUpdates();
        });

        // Then its deferred callback must not navigate into the new screen tree.
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('opens the promo when the user remains eligible until protected routes are ready', async () => {
        // Given a signed-in user who has completed onboarding and has not dismissed the promo.
        renderHook(() => useAIFeaturesPromoModal(session));
        await waitFor(() => expect(Navigation.waitForProtectedRoutes).toHaveBeenCalledTimes(1));

        // When protected routes become ready without a reset or eligibility change.
        await act(async () => {
            resolveProtectedRoutes();
            await waitForBatchedUpdates();
        });

        // Then normal promo navigation still works from Troubleshoot.
        expect(Navigation.navigate).toHaveBeenCalledWith(`${ROUTES.SETTINGS_TROUBLESHOOT}/ai-features-promo`);
    });
});
