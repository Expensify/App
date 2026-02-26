import type {NavigationAction, NavigationState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import TestDriveModalGuard, {resetSessionFlag} from '@libs/Navigation/guards/TestDriveModalGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
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

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        resetSessionFlag();
        await waitForBatchedUpdates();
    });

    it('should allow when app is loading', () => {
        const result = TestDriveModalGuard.evaluate(mockState, mockAction, {...defaultContext, isLoading: true});
        expect(result.type).toBe('ALLOW');
    });

    it('should redirect when onboarding complete and modal not dismissed', async () => {
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

    it('should allow when modal dismissed', async () => {
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
            hasCompletedGuidedSetupFlow: true,
            testDriveModalDismissed: true,
        });
        await waitForBatchedUpdates();

        const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should allow when onboarding not complete', async () => {
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
            hasCompletedGuidedSetupFlow: false,
            testDriveModalDismissed: false,
        });
        await waitForBatchedUpdates();

        const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should not redirect multiple times (session flag)', async () => {
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
            hasCompletedGuidedSetupFlow: true,
            testDriveModalDismissed: false,
        });
        await waitForBatchedUpdates();

        const firstResult = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(firstResult.type).toBe('REDIRECT');

        const secondResult = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(secondResult.type).toBe('ALLOW');
    });

    it('should skip modal when user has accessible workspace', async () => {
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
            hasCompletedGuidedSetupFlow: true,
            testDriveModalDismissed: false,
        });
        await Onyx.set(ONYXKEYS.ONBOARDING_POLICY_ID, 'policy123');
        await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);
        await waitForBatchedUpdates();

        const result = TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should redirect to home when accessing dismissed modal via URL', async () => {
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
            hasCompletedGuidedSetupFlow: true,
            testDriveModalDismissed: true,
        });
        await waitForBatchedUpdates();

        const testDriveModalState: NavigationState = {
            key: 'root',
            index: 0,
            routeNames: [SCREENS.TEST_DRIVE_MODAL.ROOT],
            routes: [{key: 'testDrive', name: SCREENS.TEST_DRIVE_MODAL.ROOT}],
            stale: false,
            type: 'root',
        };

        const result = TestDriveModalGuard.evaluate(testDriveModalState, mockAction, defaultContext);
        expect(result.type).toBe('REDIRECT');
        if (result.type === 'REDIRECT') {
            expect(result.route).toBe(ROUTES.HOME);
        }
    });

    describe('shouldBlockWhileModalActive', () => {
        const stateWithModalOnTop: NavigationState = {
            key: 'root',
            index: 1,
            routeNames: [SCREENS.HOME, NAVIGATORS.TEST_DRIVE_MODAL_NAVIGATOR],
            routes: [
                {key: 'home', name: SCREENS.HOME},
                {key: 'testDriveModal', name: NAVIGATORS.TEST_DRIVE_MODAL_NAVIGATOR},
            ],
            stale: false,
            type: 'stack',
        };

        const tabSwitchAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
            payload: {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
        };

        const dismissModalAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL,
        };

        const goBackAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.GO_BACK,
        };

        it('should block tab switches when the test drive modal is on top', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
                testDriveModalDismissed: false,
            });
            await waitForBatchedUpdates();

            // Trigger the redirect first so hasRedirectedToTestDriveModal is true
            TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);

            const result = TestDriveModalGuard.evaluate(stateWithModalOnTop, tabSwitchAction, defaultContext);
            expect(result.type).toBe('BLOCK');
        });

        it('should allow DISMISS_MODAL when the test drive modal is on top', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
                testDriveModalDismissed: false,
            });
            await waitForBatchedUpdates();

            // Trigger the redirect first
            TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);

            const result = TestDriveModalGuard.evaluate(stateWithModalOnTop, dismissModalAction, defaultContext);
            expect(result.type).not.toBe('BLOCK');
        });

        it('should allow GO_BACK when the test drive modal is on top', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
                testDriveModalDismissed: false,
            });
            await waitForBatchedUpdates();

            // Trigger the redirect first
            TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);

            const result = TestDriveModalGuard.evaluate(stateWithModalOnTop, goBackAction, defaultContext);
            expect(result.type).not.toBe('BLOCK');
        });

        it('should not block when the modal has been dismissed', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
                testDriveModalDismissed: false,
            });
            await waitForBatchedUpdates();

            // Trigger the redirect first
            TestDriveModalGuard.evaluate(mockState, mockAction, defaultContext);

            // Now mark modal as dismissed
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {testDriveModalDismissed: true});
            await waitForBatchedUpdates();

            const result = TestDriveModalGuard.evaluate(stateWithModalOnTop, tabSwitchAction, defaultContext);
            expect(result.type).not.toBe('BLOCK');
        });
    });
});
