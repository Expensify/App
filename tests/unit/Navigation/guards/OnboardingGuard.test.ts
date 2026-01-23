import type {NavigationAction, NavigationState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import OnboardingGuard from '@libs/Navigation/guards/OnboardingGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

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

    const authenticatedContext: GuardContext = {
        isAuthenticated: true,
        isLoading: false,
        currentUrl: '',
    };

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('shouldApply', () => {
        it('should always return true for all navigation', () => {
            expect(OnboardingGuard.shouldApply(mockState, mockAction, authenticatedContext)).toBe(true);
        });
    });

    describe('early exit conditions', () => {
        it('should allow when state is empty', () => {
            const emptyState: NavigationState = {
                key: 'root',
                index: 0,
                routeNames: [],
                routes: [],
                stale: false,
                type: 'root',
            };

            const result = OnboardingGuard.evaluate(emptyState, mockAction, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });

        it('should allow unauthenticated users', () => {
            const unauthContext: GuardContext = {
                isAuthenticated: false,
                isLoading: false,
                currentUrl: '',
            };

            const result = OnboardingGuard.evaluate(mockState, mockAction, unauthContext);

            expect(result.type).toBe('ALLOW');
        });

        it('should allow during app transition', () => {
            const transitionContext: GuardContext = {
                isAuthenticated: true,
                isLoading: false,
                currentUrl: 'https://new.expensify.com/transition',
            };

            const result = OnboardingGuard.evaluate(mockState, mockAction, transitionContext);

            expect(result.type).toBe('ALLOW');
        });
    });

    describe('skip onboarding conditions', () => {
        it('should allow when onboarding is completed', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });

        it('should allow migrated users', async () => {
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

            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });

        it('should allow users with single entry from HybridApp', async () => {
            await Onyx.merge(ONYXKEYS.HYBRID_APP, {
                isSingleNewDotEntry: true,
            });
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });

        it('should allow users with non-personal policies', async () => {
            await Onyx.merge(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });

        it('should allow invited users', async () => {
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
                choice: CONST.INTRO_CHOICES.SUBMIT,
            });
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            expect(result.type).toBe('ALLOW');
        });
    });

    describe('redirect to onboarding', () => {
        it('should redirect when authenticated user needs onboarding', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toContain('onboarding');
            }
        });

        it('should redirect to correct step for users with accessible policies', async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: false,
                hasAccessibleDomainPolicies: true,
            });
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(mockState, mockAction, authenticatedContext);

            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toContain('onboarding');
            }
        });

        it('should redirect when user tries to access wrong onboarding step', async () => {
            // User is on onboarding/purpose but should be on onboarding/work-email
            const onboardingState: NavigationState = {
                key: 'root',
                index: 0,
                routeNames: [SCREENS.ONBOARDING.PURPOSE],
                routes: [{key: 'purpose', name: SCREENS.ONBOARDING.PURPOSE}],
                stale: false,
                type: 'root',
            };

            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(onboardingState, mockAction, authenticatedContext);

            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toContain('onboarding');
            }
        });

        it('should redirect when user in onboarding tries to access non-onboarding path', async () => {
            // User is on onboarding screen but tries to navigate to home
            const onboardingState: NavigationState = {
                key: 'root',
                index: 0,
                routeNames: [SCREENS.ONBOARDING.PURPOSE],
                routes: [{key: 'purpose', name: SCREENS.ONBOARDING.PURPOSE}],
                stale: false,
                type: 'root',
            };

            const homeAction: NavigationAction = {
                type: 'NAVIGATE',
                payload: {name: SCREENS.HOME},
            };

            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(onboardingState, homeAction, authenticatedContext);

            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toContain('onboarding');
            }
        });

        it('should always redirect to correct onboarding step when user needs onboarding', async () => {
            // Even if user is on an onboarding screen, guard redirects to the correct step
            const onboardingState: NavigationState = {
                key: 'root',
                index: 0,
                routeNames: [SCREENS.ONBOARDING.WORK_EMAIL],
                routes: [{key: 'work-email', name: SCREENS.ONBOARDING.WORK_EMAIL}],
                stale: false,
                type: 'root',
            };

            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
            });
            await waitForBatchedUpdates();

            const result = OnboardingGuard.evaluate(onboardingState, mockAction, authenticatedContext);

            // Guard should redirect to ensure user is on correct step
            expect(result.type).toBe('REDIRECT');
            if (result.type === 'REDIRECT') {
                expect(result.route).toContain('onboarding');
            }
        });
    });
});
