import SubmitPlanWelcomeModalGuard, {resetSessionFlag} from '@libs/Navigation/guards/SubmitPlanWelcomeModalGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
// eslint-disable-next-line no-restricted-imports -- type-only namespace import used solely to type jest.requireActual for the module mock below
import type * as PolicyUtilsModule from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, NavigationState} from '@react-navigation/native';

import Onyx from 'react-native-onyx';

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
    // HAS_LOADED_APP flips to true only after OpenApp finishes loading this session's account data (incl. the
    // shown-flag), so the guard requires it before deciding. Set it here so the eligible user is "fully loaded".
    await Onyx.merge(ONYXKEYS.HAS_LOADED_APP, true);
    await waitForBatchedUpdates();
}

/** Simulates the session/app-load signal the guard subscribes to for the proactive redirect. */
async function markSessionReady(sessionValue?: {authToken: string; accountID: number; email?: string}) {
    if (sessionValue) {
        await Onyx.merge(ONYXKEYS.SESSION, sessionValue);
    }
    await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
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

    it('should allow when the modal has already been shown', async () => {
        await setUpEligibleUser();
        await Onyx.merge(ONYXKEYS.NVP_SUBMIT_MIGRATION_MODAL_SHOWN, true);
        await waitForBatchedUpdates();

        const result = SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it("should allow when the user's domain restricts workspace creation", async () => {
        await setUpEligibleUser();
        // The eligible user's domain security group forbids creating workspaces, so the modal (whose CTA
        // creates a Submit workspace) must not be shown.
        const restrictedDomain = 'restricted.example.com';
        await Onyx.merge(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[restrictedDomain]: 'group1'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SECURITY_GROUP}group1`, {enableRestrictedPolicyCreation: true});
        await waitForBatchedUpdates();
        // The guard reads the email from its cached session, populated via its SESSION subscription.
        await markSessionReady({authToken: 'test-token', accountID: 123, email: `employee@${restrictedDomain}`});

        const result = SubmitPlanWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should allow while the app is still loading this session (HAS_LOADED_APP not yet set)', async () => {
        await setUpEligibleUser();
        // Simulate the sign-in window where the eligibility NVPs are present but OpenApp has not yet delivered
        // the account data (and therefore the shown-flag) for this session.
        await Onyx.merge(ONYXKEYS.HAS_LOADED_APP, false);
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

    describe('proactive navigation on session/app-load', () => {
        it('should navigate when all conditions are met and session becomes ready', async () => {
            await setUpEligibleUser();
            mockNavigate.mockClear();

            // Proactive navigation is coalesced onto a microtask, so wait for it to flush before asserting.
            await markSessionReady({authToken: 'test-token', accountID: 123});

            expect(mockNavigate).toHaveBeenCalledWith(submitPlanWelcomeRoute);
        });

        it('should not navigate when there is no session', async () => {
            await setUpEligibleUser();
            mockNavigate.mockClear();

            await markSessionReady();

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not navigate when the user already belongs to a group/submit workspace', async () => {
            await setUpEligibleUser();
            mockGetGroupPoliciesWhereReportCanBeCreated.mockReturnValue([{id: 'policy1'}]);
            mockNavigate.mockClear();

            await markSessionReady({authToken: 'test-token', accountID: 123});

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not navigate when the modal has already been shown', async () => {
            await setUpEligibleUser();
            await Onyx.merge(ONYXKEYS.NVP_SUBMIT_MIGRATION_MODAL_SHOWN, true);
            await waitForBatchedUpdates();
            mockNavigate.mockClear();

            await markSessionReady({authToken: 'test-token', accountID: 123});

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not navigate during the sign-in window before the app has loaded (HAS_LOADED_APP false)', async () => {
            await setUpEligibleUser();
            await Onyx.merge(ONYXKEYS.HAS_LOADED_APP, false);
            await waitForBatchedUpdates();
            mockNavigate.mockClear();

            await markSessionReady({authToken: 'test-token', accountID: 123});

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
