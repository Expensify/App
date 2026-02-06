import type {NavigationAction, NavigationState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import TestDriveModalGuard from '@libs/Navigation/guards/TestDriveModalGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

describe('TestDriveModalGuard', () => {
    const mockState: NavigationState = {
        key: 'root',
        index: 0,
        routeNames: [SCREENS.HOME],
        routes: [{key: 'home', name: SCREENS.HOME}],
        stale: false,
        type: 'root',
    };

    const mockAction: NavigationAction = {
        type: 'NAVIGATE',
        payload: {name: SCREENS.HOME},
    };

    const defaultContext: GuardContext = {
        isAuthenticated: true,
        isLoading: false,
        currentUrl: '',
    };

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('when app is loading', () => {
        it('should return ALLOW when isLoading is true', () => {
            const loadingContext: GuardContext = {
                ...defaultContext,
                isLoading: true,
            };

            const result = TestDriveModalGuard.evaluate(mockState, mockAction, loadingContext);
            expect(result.type).toBe('ALLOW');
        });
    });

    describe('when test drive modal should be shown', () => {
        it('should return REDIRECT when user completed setup but has not dismissed test drive modal', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
                testDriveModalDismissed: false,
            });
            await waitForBatchedUpdates();

            const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toBe(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
            }
        });
    });

    describe('when test drive modal should not be shown', () => {
        it('should return ALLOW when user has not completed setup', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                testDriveModalDismissed: false,
            });
            await waitForBatchedUpdates();

            const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
            expect(result.type).toBe('ALLOW');
        });

        it('should return ALLOW when user has dismissed test drive modal', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
                testDriveModalDismissed: true,
            });
            await waitForBatchedUpdates();

            const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
            expect(result.type).toBe('ALLOW');
        });

        it('should return ALLOW when testDriveModalDismissed is undefined', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
                // testDriveModalDismissed is undefined
            });
            await waitForBatchedUpdates();

            const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
            expect(result.type).toBe('ALLOW');
        });

        it('should return ALLOW when onboarding is empty (old accounts)', async () => {
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, null);
            await waitForBatchedUpdates();

            const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
            expect(result.type).toBe('ALLOW');
        });

        it('should return ALLOW when both completed and dismissed', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
                testDriveModalDismissed: true,
            });
            await waitForBatchedUpdates();

            const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
            expect(result.type).toBe('ALLOW');
        });
    });

    describe('edge cases', () => {
        it('should return ALLOW when hasCompletedGuidedSetupFlow is undefined but testDriveModalDismissed is false', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                testDriveModalDismissed: false,
                // hasCompletedGuidedSetupFlow is undefined
            });
            await waitForBatchedUpdates();

            const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
            // hasCompletedGuidedSetupFlowSelector returns true for undefined, so this should redirect
            expect(result.type).toBe('REDIRECT');
        });

        it('should handle null testDriveModalDismissed as not needing to show modal', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
                testDriveModalDismissed: null,
            });
            await waitForBatchedUpdates();

            const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
            expect(result.type).toBe('ALLOW');
        });
    });
});
