import type {NavigationAction, NavigationState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import TwoFactorAuthGuard from '@libs/Navigation/guards/TwoFactorAuthGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

describe('TwoFactorAuthGuard', () => {
    const mockContext: GuardContext = {
        isAuthenticated: true,
        isLoading: false,
        currentUrl: '',
    };

    beforeEach(() => {
        // Clear Onyx data before each test
        Onyx.clear();
    });

    describe('shouldApply', () => {
        it('should not apply when loading', () => {
            const loadingContext: GuardContext = {
                ...mockContext,
                isLoading: true,
            };
            const mockState = {
                key: 'test-key',
                index: 0,
                routeNames: [],
                routes: [],
                type: 'test',
                stale: false,
            } as NavigationState;
            const mockAction = {type: 'NAVIGATE', payload: {name: 'TestScreen'}} as NavigationAction;

            expect(TwoFactorAuthGuard.shouldApply(mockState, mockAction, loadingContext)).toBe(false);
        });

        it('should apply when not loading', () => {
            const mockState = {
                key: 'test-key',
                index: 0,
                routeNames: [],
                routes: [],
                type: 'test',
                stale: false,
            } as NavigationState;
            const mockAction = {type: 'NAVIGATE', payload: {name: 'TestScreen'}} as NavigationAction;

            expect(TwoFactorAuthGuard.shouldApply(mockState, mockAction, mockContext)).toBe(true);
        });
    });

    describe('evaluate - when 2FA not required', () => {
        it('should allow navigation when account is null', () => {
            Onyx.merge(ONYXKEYS.ACCOUNT, null);

            const mockState = {
                key: 'test-key',
                index: 0,
                routeNames: [],
                routes: [],
                type: 'test',
                stale: false,
            } as NavigationState;
            const mockAction = {type: 'NAVIGATE', payload: {name: 'TestScreen'}} as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should allow navigation when 2FA is not needed', () => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {
                needsTwoFactorAuthSetup: false,
                requiresTwoFactorAuth: false,
            });

            const mockState = {
                key: 'test-key',
                index: 0,
                routeNames: [],
                routes: [],
                type: 'test',
                stale: false,
            } as NavigationState;
            const mockAction = {type: 'NAVIGATE', payload: {name: 'TestScreen'}} as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should allow navigation when 2FA is already completed', () => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {
                needsTwoFactorAuthSetup: true,
                requiresTwoFactorAuth: true,
            });

            const mockState = {
                key: 'test-key',
                index: 0,
                routeNames: [],
                routes: [],
                type: 'test',
                stale: false,
            } as NavigationState;
            const mockAction = {type: 'NAVIGATE', payload: {name: 'TestScreen'}} as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });
    });

    describe('evaluate - when 2FA required (needsTwoFactorAuthSetup)', () => {
        beforeEach(() => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {
                needsTwoFactorAuthSetup: true,
                requiresTwoFactorAuth: false,
            });
        });

        it('should allow navigation when already on 2FA landing page', () => {
            const mockState = {
                routes: [{name: SCREENS.REQUIRE_TWO_FACTOR_AUTH, key: 'test'}],
            } as unknown as NavigationState;
            const mockAction = {type: 'NAVIGATE', payload: {name: 'OtherScreen'}} as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should allow navigation when already on 2FA setup screen', () => {
            const mockState = {
                routes: [{name: SCREENS.RIGHT_MODAL.TWO_FACTOR_AUTH, key: 'test'}],
            } as unknown as NavigationState;
            const mockAction = {type: 'NAVIGATE', payload: {name: 'OtherScreen'}} as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should allow navigation when navigating to 2FA screen directly', () => {
            const mockState = {routes: [{name: 'HomeScreen', key: 'test'}]} as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: SCREENS.RIGHT_MODAL.TWO_FACTOR_AUTH},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should allow navigation when navigating to 2FA screen via nested navigator', () => {
            const mockState = {routes: [{name: 'HomeScreen', key: 'test'}]} as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {
                    name: 'RightModalNavigator',
                    params: {screen: SCREENS.RIGHT_MODAL.TWO_FACTOR_AUTH},
                },
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should redirect when navigating to non-2FA screen', () => {
            const mockState = {routes: [{name: 'HomeScreen', key: 'test'}]} as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: 'Settings'},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({
                type: 'REDIRECT',
                route: ROUTES.REQUIRE_TWO_FACTOR_AUTH,
            });
        });
    });

    describe('evaluate - when 2FA setup in progress', () => {
        it('should redirect when onboarding not completed', async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                twoFactorAuthSetupInProgress: true,
                needsTwoFactorAuthSetup: false,
                requiresTwoFactorAuth: false,
            });
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await waitForBatchedUpdates();

            const mockState = {routes: [{name: 'HomeScreen', key: 'test'}]} as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: 'Settings'},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({
                type: 'REDIRECT',
                route: ROUTES.REQUIRE_TWO_FACTOR_AUTH,
            });
        });

        it('should allow navigation when onboarding is completed', async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                twoFactorAuthSetupInProgress: true,
                needsTwoFactorAuthSetup: false,
                requiresTwoFactorAuth: false,
            });
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await waitForBatchedUpdates();

            const mockState = {routes: [{name: 'HomeScreen', key: 'test'}]} as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: 'Settings'},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });
    });

    describe('isNavigatingTo2FAPage detection', () => {
        beforeEach(() => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {
                needsTwoFactorAuthSetup: true,
                requiresTwoFactorAuth: false,
            });
        });

        it('should detect navigation to REQUIRE_TWO_FACTOR_AUTH screen', () => {
            const mockState = {routes: [{name: 'HomeScreen', key: 'test'}]} as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: SCREENS.REQUIRE_TWO_FACTOR_AUTH},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should detect navigation to Settings_TwoFactorAuth_Root screen', () => {
            const mockState = {routes: [{name: 'HomeScreen', key: 'test'}]} as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: SCREENS.TWO_FACTOR_AUTH.ROOT},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should detect navigation to Settings_TwoFactorAuth_Verify screen', () => {
            const mockState = {routes: [{name: 'HomeScreen', key: 'test'}]} as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: SCREENS.TWO_FACTOR_AUTH.VERIFY},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should detect navigation to Settings_TwoFactorAuth_VerifyAccount screen', () => {
            const mockState = {routes: [{name: 'HomeScreen', key: 'test'}]} as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: SCREENS.TWO_FACTOR_AUTH.VERIFY_ACCOUNT},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should detect navigation to nested 2FA screen via params.screen', () => {
            const mockState = {routes: [{name: 'HomeScreen', key: 'test'}]} as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {
                    name: 'RightModalNavigator',
                    params: {screen: SCREENS.TWO_FACTOR_AUTH.VERIFY_ACCOUNT},
                },
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });
    });

    describe('isCurrentlyOn2FAPage detection', () => {
        beforeEach(() => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {
                needsTwoFactorAuthSetup: true,
                requiresTwoFactorAuth: false,
            });
        });

        it('should detect REQUIRE_TWO_FACTOR_AUTH in navigation state', () => {
            const mockState = {
                routes: [{name: SCREENS.REQUIRE_TWO_FACTOR_AUTH, key: 'test'}],
            } as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: 'AnyScreen'},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should detect RIGHT_MODAL.TWO_FACTOR_AUTH in navigation state', () => {
            const mockState = {
                routes: [{name: SCREENS.RIGHT_MODAL.TWO_FACTOR_AUTH, key: 'test'}],
            } as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: 'AnyScreen'},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should detect TWO_FACTOR_AUTH.ROOT in navigation state', () => {
            const mockState = {
                routes: [{name: SCREENS.TWO_FACTOR_AUTH.ROOT, key: 'test'}],
            } as unknown as NavigationState;
            const mockAction = {
                type: 'NAVIGATE',
                payload: {name: 'AnyScreen'},
            } as NavigationAction;

            const result = TwoFactorAuthGuard.evaluate(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });
    });
});
