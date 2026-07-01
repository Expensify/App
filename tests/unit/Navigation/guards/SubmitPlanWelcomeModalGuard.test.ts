import type {NavigationAction, NavigationState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import SubmitPlanWelcomeModalGuard, {onSessionOrLoadingAppChanged, resetSessionFlag} from '@libs/Navigation/guards/SubmitPlanWelcomeModalGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
// eslint-disable-next-line no-restricted-imports -- type-only namespace import used solely to type jest.requireActual for the module mock below
import type * as PolicyUtilsModule from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const mockGetGroupPoliciesWhereReportCanBeCreated = jest.fn<unknown[], unknown[]>(() => []);
jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtilsModule>('@libs/PolicyUtils'),
    getGroupPoliciesWhereReportCanBeCreated: (...args: unknown[]) => mockGetGroupPoliciesWhereReportCanBeCreated(...args),
}));

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]) => {
        mockNavigate(...args);
    },
    getActiveRoute: () => 'home',
}));

const submitPlanWelcomeRoute = createDynamicRoute(DYNAMIC_ROUTES.SUBMIT_PLAN_WELCOME.path, ROUTES.HOME);

/** Enables all trigger conditions so the guard would redirect. */
async function setUpEligibleUser() {
    mockGetGroupPoliciesWhereReportCanBeCreated.mockReturnValue([]);
    await Onyx.merge(ONYXKEYS.BETAS, [CONST.BETAS.SUBMIT_2026]);
    await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.EMPLOYER});
    await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
    await waitForBatchedUpdates();
}

describe('SubmitPlanWelcomeModalGuard', () => {
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
        onSessionOrLoadingAppChanged(undefined, true);
        resetSessionFlag();
        mockNavigate.mockClear();
        mockGetGroupPoliciesWhereReportCanBeCreated.mockReset();
        mockGetGroupPoliciesWhereReportCanBeCreated.mockReturnValue([]);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should allow when app is loading', () => {
        const result = SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, {...defaultContext, isLoading: true});
        expect(result.type).toBe('ALLOW');
    });

    it('should redirect when all conditions are met', async () => {
        await setUpEligibleUser();

        const result = SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('REDIRECT');
        if (result.type === 'REDIRECT') {
            expect(result.route).toBe(submitPlanWelcomeRoute);
        }
    });

    it('should allow when the SUBMIT_2026 beta is not enabled', async () => {
        await setUpEligibleUser();
        await Onyx.merge(ONYXKEYS.BETAS, []);
        await waitForBatchedUpdates();

        const result = SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should allow when the user did not select the EMPLOYER intent', async () => {
        await setUpEligibleUser();
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
        await waitForBatchedUpdates();

        const result = SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should allow when the user already belongs to a group/submit workspace', async () => {
        await setUpEligibleUser();
        mockGetGroupPoliciesWhereReportCanBeCreated.mockReturnValue([{id: 'policy1'}]);

        const result = SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should allow when the modal has been dismissed', async () => {
        await setUpEligibleUser();
        await Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
            [CONST.SUBMIT_PLAN_WELCOME_MODAL]: {
                timestamp: new Date().toISOString(),
                dismissedMethod: 'click',
            },
        });
        await waitForBatchedUpdates();

        const result = SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should not redirect multiple times in the same session', async () => {
        await setUpEligibleUser();

        const firstResult = SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(firstResult.type).toBe('REDIRECT');

        const secondResult = SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(secondResult.type).toBe('ALLOW');
    });

    it('should allow when already on the submit plan welcome modal screen', async () => {
        await setUpEligibleUser();

        const modalState: NavigationState = {
            key: 'root',
            index: 0,
            routeNames: [SCREENS.SUBMIT_PLAN_WELCOME_MODAL.DYNAMIC_ROOT],
            routes: [
                {
                    key: 'submitPlanModal',
                    name: SCREENS.SUBMIT_PLAN_WELCOME_MODAL.DYNAMIC_ROOT,
                },
            ],
            stale: false,
            type: 'root',
        };

        const result = SubmitPlanWelcomeModalGuard.evaluate(modalState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    describe('proactive navigation via onSessionOrLoadingAppChanged', () => {
        it('should navigate when all conditions are met and session becomes ready', async () => {
            await setUpEligibleUser();
            mockNavigate.mockClear();

            onSessionOrLoadingAppChanged({authToken: 'test-token', accountID: 123}, false);

            expect(mockNavigate).toHaveBeenCalledWith(submitPlanWelcomeRoute);
        });

        it('should not navigate when there is no session', async () => {
            await setUpEligibleUser();
            mockNavigate.mockClear();

            onSessionOrLoadingAppChanged(undefined, false);

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not navigate when the user already belongs to a group/submit workspace', async () => {
            await setUpEligibleUser();
            mockGetGroupPoliciesWhereReportCanBeCreated.mockReturnValue([{id: 'policy1'}]);
            mockNavigate.mockClear();

            onSessionOrLoadingAppChanged({authToken: 'test-token', accountID: 123}, false);

            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe('shouldBlockWhileModalActive', () => {
        const stateWithModalOnTop: NavigationState = {
            key: 'root',
            index: 1,
            routeNames: [SCREENS.HOME, NAVIGATORS.SUBMIT_PLAN_MODAL_NAVIGATOR],
            routes: [
                {key: 'home', name: SCREENS.HOME},
                {key: 'submitPlanModal', name: NAVIGATORS.SUBMIT_PLAN_MODAL_NAVIGATOR},
            ],
            stale: false,
            type: 'stack',
        };

        it('should block tab switches when the submit plan modal is on top', async () => {
            await setUpEligibleUser();

            // Trigger redirect first to set the session flag
            SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);

            const tabSwitchAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
                payload: {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
            };
            const result = SubmitPlanWelcomeModalGuard.evaluate(stateWithModalOnTop, tabSwitchAction, defaultContext);
            expect(result.type).toBe('BLOCK');
        });

        it('should allow GO_BACK when the submit plan modal is on top', async () => {
            await setUpEligibleUser();

            SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);

            const goBackAction: NavigationAction = {type: CONST.NAVIGATION.ACTION_TYPE.GO_BACK};
            const result = SubmitPlanWelcomeModalGuard.evaluate(stateWithModalOnTop, goBackAction, defaultContext);
            expect(result.type).not.toBe('BLOCK');
        });
    });
});
