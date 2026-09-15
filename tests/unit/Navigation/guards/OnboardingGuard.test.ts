import OnboardingGuard from '@libs/Navigation/guards/OnboardingGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, NavigationState} from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

let mockSkipOnboarding = false;

jest.mock('@src/CONFIG', () => {
    const actualConfig = jest.requireActual<{default: Record<string, unknown>}>('@src/CONFIG').default;
    return {
        __esModule: true,
        default: {
            ...actualConfig,
            get SKIP_ONBOARDING() {
                return mockSkipOnboarding;
            },
        },
    };
});

describe('OnboardingGuard', () => {
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

    // A realistic navigation state that matches what the guard's REDIRECT reset produces:
    // HOME at the bottom, OnboardingModalNavigator on top (focused).
    const stateWithOnboardingNavigator: NavigationState = {
        key: 'root',
        index: 1,
        routeNames: [SCREENS.HOME, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR],
        routes: [
            {key: 'home', name: SCREENS.HOME},
            {
                key: 'onboarding-modal',
                name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
                state: {
                    key: 'onboarding-stack',
                    index: 0,
                    routeNames: [SCREENS.ONBOARDING.WORK_EMAIL],
                    routes: [{key: 'work-email', name: SCREENS.ONBOARDING.WORK_EMAIL}],
                    stale: false,
                    type: 'stack',
                },
            },
        ],
        stale: false,
        type: 'stack',
    };

    // Advancing between onboarding steps reaches the root router as a NAVIGATE that targets the
    // OnboardingModalNavigator itself. The guard admits these, so this is the action that exercises
    // the loop-prevention branch now that navigation out of the flow is blocked.
    const navigateWithinOnboardingAction: NavigationAction = {
        type: CONST.NAVIGATION.ACTION_TYPE.NAVIGATE,
        payload: {name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
    };

    const authenticatedContext: GuardContext = {
        isAuthenticated: true,
        isLoading: false,
        currentUrl: '',
        isSupportalSession: false,
    };

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockSkipOnboarding = false;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('early return when onboarding completed', () => {
        it('should return ALLOW when user has completed onboarding', async () => {
            // Given a user who has already completed the guided setup flow, meaning they've finished all onboarding steps
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            // When the guard evaluates a standard navigation action
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then navigation should be allowed because completed users should not be forced back into onboarding
            expect(result.type).toBe('ALLOW');
        });

        it('should return ALLOW when onboarding data is undefined (old/migrated accounts)', async () => {
            // Given a user with null onboarding data, which indicates an old or migrated account that predates the guided setup flow
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, null);
            await waitForBatchedUpdates();

            // When the guard evaluates a navigation action
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then navigation should be allowed because null onboarding data is treated as "completed" to avoid forcing legacy users through onboarding
            expect(result.type).toBe('ALLOW');
        });
    });

    describe('early exit conditions', () => {
        it('should allow during app transition', () => {
            // Given an authenticated user whose current URL contains a transition path, indicating the app is mid-transition between states
            const transitionContext: GuardContext = {
                isAuthenticated: true,
                isLoading: false,
                currentUrl: 'https://new.expensify.com/transition',
                isSupportalSession: false,
            };

            // When the guard evaluates during the transition
            const result = OnboardingGuard.evaluate(mockState, mockAction, transitionContext);

            // Then navigation should be allowed because the guard should not interfere with app transitions to avoid breaking the transition flow
            expect(result.type).toBe('ALLOW');
        });

        it('should BLOCK RESET action when user is on onboarding and tries to reset to non-onboarding screen', async () => {
            // Given a user who is currently on the onboarding purpose screen and has not yet completed onboarding
            const onboardingState: NavigationState = {
                key: 'root',
                index: 0,
                routeNames: [SCREENS.ONBOARDING.PURPOSE],
                routes: [{key: 'purpose', name: SCREENS.ONBOARDING.PURPOSE}],
                stale: false,
                type: 'root',
            };

            // When a RESET action attempts to navigate them away from onboarding to the HOME screen
            const resetAction: NavigationAction = {
                type: CONST.NAVIGATION_ACTIONS.RESET,
                payload: {
                    key: 'root',
                    index: 0,
                    routeNames: [SCREENS.HOME],
                    routes: [{key: 'home', name: SCREENS.HOME}],
                    stale: false,
                    type: 'root',
                },
            };

            const result = OnboardingGuard.evaluate(onboardingState, resetAction, authenticatedContext);

            // Then the action should be blocked because users who haven't completed onboarding should not be able to skip it via a RESET action
            expect(result.type).toBe('BLOCK');
            if (result.type === 'BLOCK') {
                expect(result.reason).toBe('Cannot reset to non-onboarding screen while on onboarding');
            }
        });
    });

    describe('skip onboarding conditions', () => {
        it('should allow when onboarding is completed', async () => {
            // Given a user who has already completed the guided setup flow
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            // When the guard evaluates a navigation action
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then navigation should be allowed because completed users should bypass all onboarding checks
            expect(result.type).toBe('ALLOW');
        });

        it('should allow migrated users', async () => {
            // Given a user who was migrated from the classic app via the nudge migration flow, which means they already have an established account
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                classicRedirect: {
                    dismissed: false,
                },
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();

            // When the guard evaluates a navigation action
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then navigation should be allowed because migrated users should skip onboarding since they are already familiar with the product
            expect(result.type).toBe('ALLOW');
        });

        it('should allow users with single entry from HybridApp', async () => {
            // Given a user who entered NewDot as a single-entry from HybridApp, meaning they are temporarily viewing NewDot from the classic app
            await Onyx.merge(ONYXKEYS.HYBRID_APP, {
                isSingleNewDotEntry: true,
            });
            await waitForBatchedUpdates();

            // When the guard evaluates a navigation action
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then navigation should be allowed because single-entry HybridApp users should not be forced into onboarding for a temporary visit
            expect(result.type).toBe('ALLOW');
        });

        it('should allow users with non-personal policies', async () => {
            // Given a user who belongs to a non-personal (e.g. corporate) policy, indicating they were added to a workspace
            await Onyx.merge(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);
            await waitForBatchedUpdates();

            // When the guard evaluates a navigation action
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then navigation should be allowed because users with workspace policies should skip the individual onboarding flow
            expect(result.type).toBe('ALLOW');
        });

        it('should allow invited users', async () => {
            // Given a user who was invited and has already selected their intro choice (SUBMIT), indicating they came through an invitation link
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
                choice: CONST.INTRO_CHOICES.SUBMIT,
            });
            await waitForBatchedUpdates();

            // When the guard evaluates a navigation action
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then navigation should be allowed because invited users have a predefined purpose and should skip the onboarding purpose selection
            expect(result.type).toBe('ALLOW');
        });
    });

    describe('redirect completed users away from onboarding routes', () => {
        it('should redirect to HOME when completed user navigates to onboarding via NAVIGATE action', async () => {
            // Given a user who has already completed the guided setup flow
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            // When a NAVIGATE action targets the OnboardingModalNavigator (e.g. via a deep link like /onboarding/purpose)
            const navigateToOnboardingAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.NAVIGATE,
                payload: {name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
            };

            const result = OnboardingGuard.evaluate(mockState, navigateToOnboardingAction, authenticatedContext);

            // Then the user should be redirected to HOME because the OnboardingModalNavigator is not mounted for completed users, and navigating there would silently fail
            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toBe('home');
            }
        });

        it('should redirect to HOME when completed user navigates to onboarding via PUSH action', async () => {
            // Given a user who has already completed the guided setup flow
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            // When a PUSH action targets the OnboardingModalNavigator
            const pushToOnboardingAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
                payload: {name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
            };

            const result = OnboardingGuard.evaluate(mockState, pushToOnboardingAction, authenticatedContext);

            // Then the user should be redirected to HOME because the OnboardingModalNavigator is not mounted for completed users
            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toBe('home');
            }
        });

        it('should ALLOW when completed user navigates to a non-onboarding route', async () => {
            // Given a user who has completed the guided setup flow
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            // When a RESET action navigates to a non-onboarding screen (HOME)
            const resetToHomeAction: NavigationAction = {
                type: CONST.NAVIGATION_ACTIONS.RESET,
                payload: {
                    key: 'root',
                    index: 0,
                    routeNames: [SCREENS.HOME],
                    routes: [{key: 'home', name: SCREENS.HOME}],
                    stale: false,
                    type: 'root',
                },
            };

            const result = OnboardingGuard.evaluate(mockState, resetToHomeAction, authenticatedContext);

            // Then navigation should be allowed because the redirect-to-HOME logic should only trigger when the RESET target includes an onboarding route
            expect(result.type).toBe('ALLOW');
        });

        it('should ALLOW NAVIGATE actions for completed users when target is not onboarding', async () => {
            // Given a user who has completed the guided setup flow
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            // When a NAVIGATE action targets a non-onboarding screen (HOME)
            const navigateAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.NAVIGATE,
                payload: {name: SCREENS.HOME},
            };

            const result = OnboardingGuard.evaluate(mockState, navigateAction, authenticatedContext);

            // Then navigation should be allowed because the redirect only triggers when the target is the OnboardingModalNavigator
            expect(result.type).toBe('ALLOW');
        });

        it('should NOT redirect completed user for RESET actions containing onboarding routes', async () => {
            // Given a user who has completed the guided setup flow
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            // When a RESET action contains onboarding routes in its payload (not NAVIGATE/PUSH)
            const resetWithOnboardingAction: NavigationAction = {
                type: CONST.NAVIGATION_ACTIONS.RESET,
                payload: {
                    key: 'root',
                    index: 1,
                    routeNames: [SCREENS.HOME, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR],
                    routes: [
                        {key: 'home', name: SCREENS.HOME},
                        {key: 'onboarding', name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
                    ],
                    stale: false,
                    type: 'root',
                },
            };

            const result = OnboardingGuard.evaluate(mockState, resetWithOnboardingAction, authenticatedContext);

            // Then navigation should be allowed because isNavigatingToOnboardingFlow only checks NAVIGATE/PUSH actions, not RESET — RESET with onboarding routes does not reach the completed-user redirect
            expect(result.type).toBe('ALLOW');
        });

        it('should NOT redirect completed user for REPLACE actions targeting onboarding', async () => {
            // Given a user who has completed the guided setup flow
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            // When a REPLACE action targets the OnboardingModalNavigator
            const replaceAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.REPLACE,
                payload: {name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
            };

            const result = OnboardingGuard.evaluate(mockState, replaceAction, authenticatedContext);

            // Then navigation should be allowed because isNavigatingToOnboardingFlow only handles NAVIGATE and PUSH action types, not REPLACE
            expect(result.type).toBe('ALLOW');
        });
    });

    describe('SKIP_ONBOARDING test builds', () => {
        it('should redirect NAVIGATE into onboarding to home when SKIP_ONBOARDING is set', () => {
            // Given a test build with SKIP_ONBOARDING enabled and a user who has NOT completed onboarding
            mockSkipOnboarding = true;

            // When a NAVIGATE action targets the OnboardingModalNavigator
            const navigateAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.NAVIGATE,
                payload: {name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
            };

            const result = OnboardingGuard.evaluate(mockState, navigateAction, authenticatedContext);

            // Then the user should be redirected to home because test builds never show the onboarding UI
            expect(result).toEqual({type: 'REDIRECT', route: ROUTES.HOME});
        });

        it('should redirect REPLACE into onboarding to home when SKIP_ONBOARDING is set', () => {
            // Given a test build with SKIP_ONBOARDING enabled and a user who has NOT completed onboarding
            mockSkipOnboarding = true;

            // When a REPLACE action targets the OnboardingModalNavigator (e.g. forceReplace navigation)
            const replaceAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.REPLACE,
                payload: {name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
            };

            const result = OnboardingGuard.evaluate(mockState, replaceAction, authenticatedContext);

            // Then the user should be redirected to home; with SKIP_ONBOARDING there is no legitimate
            // way to be mid-onboarding, so the usual REPLACE allowance does not apply
            expect(result).toEqual({type: 'REDIRECT', route: ROUTES.HOME});
        });

        it('should NOT redirect an incomplete user REPLACE into onboarding when SKIP_ONBOARDING is off', () => {
            // Given a regular build (flag off) and a user who has NOT completed onboarding

            // When a REPLACE action targets the OnboardingModalNavigator (advancing between onboarding steps)
            const replaceAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.REPLACE,
                payload: {name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
            };

            const result = OnboardingGuard.evaluate(mockState, replaceAction, authenticatedContext);

            // Then navigation should be allowed so real users can move through onboarding steps
            expect(result.type).toBe('ALLOW');
        });
    });

    describe('redirect to onboarding', () => {
        it('should redirect when authenticated user needs onboarding and is not on onboarding', async () => {
            // Given a new user from a public email domain who has not completed the guided setup flow
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            // When the guard evaluates a navigation action while the user is on a non-onboarding screen
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then the user should be redirected to onboarding because new users must complete the setup flow before accessing the app
            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toContain('onboarding');
            }
        });

        it('should redirect to correct step for users with accessible policies', async () => {
            // Given a user from a private domain with accessible domain policies who has not completed onboarding
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: false,
                hasAccessibleDomainPolicies: true,
            });
            await waitForBatchedUpdates();

            // When the guard evaluates a navigation action while the user is on a non-onboarding screen
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then the user should be redirected to onboarding because their domain/policy context determines which onboarding step they should land on
            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toContain('onboarding');
            }
        });

        it('should skip onboarding for invited or group members even when they have not completed onboarding', async () => {
            // Given an invited user who has not completed the NewDot guided setup
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
                choice: CONST.INTRO_CHOICES.SUBMIT,
            });
            await Onyx.merge(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            // When the guard evaluates on a non-onboarding screen
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then allow navigation (skip onboarding) because the user is an invited workspace member
            expect(result.type).toBe('ALLOW');
        });
    });

    describe('infinite loop prevention (APP-7FR)', () => {
        it('should ALLOW when user is already on onboarding to prevent redirect loop', async () => {
            // Given a HybridApp user who needs onboarding (all shouldSkipOnboarding conditions are false)
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            // When the guard evaluates an in-flow action while the user is already on the OnboardingModalNavigator
            const result = OnboardingGuard.evaluate(stateWithOnboardingNavigator, navigateWithinOnboardingAction, authenticatedContext);

            // Then navigation should be ALLOWED because the user is already on onboarding;
            // redirecting again would produce a redundant state reset that causes an infinite loop
            expect(result.type).toBe('ALLOW');
        });

        it('should not REDIRECT again for an action that leaves onboarding, so no loop can form', async () => {
            // Given a user who needs onboarding and is already on the OnboardingModalNavigator
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            // When the action navigates out of the flow (a warm-start deep link reaches the root router this way)
            const result = OnboardingGuard.evaluate(stateWithOnboardingNavigator, mockAction, authenticatedContext);

            // Then the guard blocks rather than redirects. BLOCK leaves the state unchanged and issues no
            // follow-up action, so the guard is not re-entered and the APP-7FR loop still cannot form
            expect(result.type).not.toBe('REDIRECT');
            expect(result.type).toBe('BLOCK');
        });

        it('should prove the guard reaches a stable state (no infinite loop)', async () => {
            // Given a user who needs onboarding
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            // When the guard first evaluates on a non-onboarding state, it redirects
            const firstResult = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);
            expect(firstResult.type).toBe('REDIRECT');

            // And then subsequent evaluations on the post-redirect state (OnboardingModalNavigator mounted)
            // reach a stable ALLOW state, breaking any potential loop
            const secondResult = OnboardingGuard.evaluate(stateWithOnboardingNavigator, navigateWithinOnboardingAction, authenticatedContext);
            expect(secondResult.type).toBe('ALLOW');

            const thirdResult = OnboardingGuard.evaluate(stateWithOnboardingNavigator, navigateWithinOnboardingAction, authenticatedContext);
            expect(thirdResult.type).toBe('ALLOW');
        });

        it('should still redirect when user is NOT on onboarding and needs it', async () => {
            // Given a user who needs onboarding and is on the HOME screen (not on onboarding)
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            // When the guard evaluates on a state without OnboardingModalNavigator
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            // Then the guard should redirect because the user needs onboarding and isn't on it yet
            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toContain('onboarding');
            }
        });

        it('should still redirect when onboarding is in routes but not focused', async () => {
            // Given a user who needs onboarding, and a state where OnboardingModalNavigator
            // exists in routes but HOME is focused (index: 0)
            const stateWithOnboardingUnfocused: NavigationState = {
                key: 'root',
                index: 0,
                routeNames: [SCREENS.HOME, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR],
                routes: [
                    {key: 'home', name: SCREENS.HOME},
                    {key: 'onboarding-modal', name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
                ],
                stale: false,
                type: 'stack',
            };

            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            // When the guard evaluates while onboarding is NOT focused
            const result = OnboardingGuard.evaluate(stateWithOnboardingUnfocused, mockAction, authenticatedContext);

            // Then the guard should still redirect because the user isn't actively on onboarding
            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toContain('onboarding');
            }
        });

        it('should still BLOCK RESET to non-onboarding even when on onboarding', async () => {
            // Given a user on onboarding who has not completed it
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await waitForBatchedUpdates();

            // Note: shouldPreventReset uses findFocusedRoute which checks the deepest focused route name.
            // In a state with onboarding screens at the root level (as used by shouldPreventReset tests),
            // the focused route IS an onboarding screen name.
            const onboardingRootState: NavigationState = {
                key: 'root',
                index: 0,
                routeNames: [SCREENS.ONBOARDING.PURPOSE],
                routes: [{key: 'purpose', name: SCREENS.ONBOARDING.PURPOSE}],
                stale: false,
                type: 'root',
            };

            const resetToHome: NavigationAction = {
                type: CONST.NAVIGATION_ACTIONS.RESET,
                payload: {
                    key: 'root',
                    index: 0,
                    routeNames: [SCREENS.HOME],
                    routes: [{key: 'home', name: SCREENS.HOME}],
                    stale: false,
                    type: 'root',
                },
            };

            const result = OnboardingGuard.evaluate(onboardingRootState, resetToHome, authenticatedContext);

            // Then the RESET should still be blocked by shouldPreventReset (runs before the new check)
            expect(result.type).toBe('BLOCK');
            if (result.type === 'BLOCK') {
                expect(result.reason).toBe('Cannot reset to non-onboarding screen while on onboarding');
            }
        });
    });

    describe('deep link opened while the onboarding modal is focused (#96863)', () => {
        beforeEach(async () => {
            // Given a user who needs onboarding, sitting on the OnboardingModalNavigator
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();
        });

        it('should BLOCK a NAVIGATE whose target is outside the onboarding flow', () => {
            // When a universal link opened on a warm app reaches the root router as NAVIGATE with a
            // root-level target of its own, which is the shape shouldPreventReset never sees
            const navigateToReportAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.NAVIGATE,
                payload: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            };

            const result = OnboardingGuard.evaluate(stateWithOnboardingNavigator, navigateToReportAction, authenticatedContext);

            // Then it is blocked, so the plain StackRouter never pops the onboarding modal off the stack
            expect(result.type).toBe('BLOCK');
            if (result.type === 'BLOCK') {
                expect(result.reason).toBe('Cannot navigate away from onboarding before it is completed');
            }
        });

        it('should BLOCK a PUSH whose target is outside the onboarding flow', () => {
            // When the same link arrives as a PUSH
            const pushToReportAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
                payload: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            };

            const result = OnboardingGuard.evaluate(stateWithOnboardingNavigator, pushToReportAction, authenticatedContext);

            // Then it is blocked for the same reason
            expect(result.type).toBe('BLOCK');
            if (result.type === 'BLOCK') {
                expect(result.reason).toBe('Cannot navigate away from onboarding before it is completed');
            }
        });

        it('should ALLOW a NAVIGATE that targets the onboarding navigator itself', () => {
            // When the user advances between onboarding steps
            const result = OnboardingGuard.evaluate(stateWithOnboardingNavigator, navigateWithinOnboardingAction, authenticatedContext);

            // Then the guard admits it, because narrowing the allowance must not break the flow it protects
            expect(result.type).toBe('ALLOW');
        });

        it('should ALLOW a PUSH that targets the onboarding navigator itself', () => {
            const pushWithinOnboardingAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
                payload: {name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
            };

            const result = OnboardingGuard.evaluate(stateWithOnboardingNavigator, pushWithinOnboardingAction, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });

        it('should ALLOW GO_BACK, which stays inside the onboarding flow', () => {
            // When the user steps back within onboarding. Only NAVIGATE and PUSH can leave the flow,
            // so everything else keeps the pre-existing ALLOW
            const goBackAction: NavigationAction = {type: 'GO_BACK'};

            const result = OnboardingGuard.evaluate(stateWithOnboardingNavigator, goBackAction, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });

        it('should ALLOW a NAVIGATE away once onboarding is completed', async () => {
            // Given the same state but a user who has finished onboarding
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            const navigateToReportAction: NavigationAction = {
                type: CONST.NAVIGATION.ACTION_TYPE.NAVIGATE,
                payload: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            };

            const result = OnboardingGuard.evaluate(stateWithOnboardingNavigator, navigateToReportAction, authenticatedContext);

            // Then the block does not apply, because shouldSkipOnboarding returns before it
            expect(result.type).toBe('ALLOW');
        });
    });

    describe('required 2FA setup exception', () => {
        // Pre-verify required-2FA state: overlay is active and setup wizard is open.
        const required2FAAccount = {
            twoFactorAuthSetupInProgress: true,
            requiresTwoFactorAuth: false,
            needsTwoFactorAuthSetup: true,
        };

        const onboardingRootState: NavigationState = {
            key: 'root',
            index: 0,
            routeNames: [SCREENS.ONBOARDING.PURPOSE],
            routes: [{key: 'purpose', name: SCREENS.ONBOARDING.PURPOSE}],
            stale: false,
            type: 'root',
        };

        const twoFactorSetupState: NavigationState = {
            key: 'root',
            index: 0,
            routeNames: [SCREENS.TWO_FACTOR_AUTH.DYNAMIC_ROOT],
            routes: [{key: '2fa-root', name: SCREENS.TWO_FACTOR_AUTH.DYNAMIC_ROOT}],
            stale: false,
            type: 'root',
        };

        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, required2FAAccount);
            await waitForBatchedUpdates();
        });

        it('should ALLOW RESET to 2FA setup when required-2FA overlay is active', () => {
            const resetTo2FA: NavigationAction = {
                type: CONST.NAVIGATION_ACTIONS.RESET,
                payload: {
                    key: 'root',
                    index: 0,
                    routeNames: [SCREENS.TWO_FACTOR_AUTH.DYNAMIC_ROOT],
                    routes: [{key: '2fa-root', name: SCREENS.TWO_FACTOR_AUTH.DYNAMIC_ROOT}],
                    stale: false,
                    type: 'root',
                },
            };

            const result = OnboardingGuard.evaluate(onboardingRootState, resetTo2FA, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });

        it('should ALLOW navigation while user is on a 2FA setup screen', () => {
            const result = OnboardingGuard.evaluate(twoFactorSetupState, mockAction, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });

        it('should still REDIRECT unrelated navigation when required-2FA overlay is active', () => {
            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toContain('onboarding');
            }
        });
    });

    describe('supportal session', () => {
        it('should return ALLOW and skip onboarding during a supportal session', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(mockState, mockAction, {...authenticatedContext, isSupportalSession: true});

            expect(result.type).toBe('ALLOW');
        });
    });

    describe('copilot session', () => {
        it('should return ALLOW and skip onboarding when acting as a copilot', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'copilot@expensify.com'}});
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });
    });
});
