import type {StackNavigationState} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import RootStackRouter from '@libs/Navigation/AppNavigator/createRootStackNavigator/RootStackRouter';
import {evaluateGuards} from '@libs/Navigation/guards';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/guards', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    createGuardContext: jest.fn(() => ({
        isAuthenticated: true,
        isLoading: false,
        currentUrl: '',
    })),
    evaluateGuards: jest.fn(() => ({type: 'ALLOW'})),
    registerGuard: jest.fn(),
    clearGuards: jest.fn(),
    getRegisteredGuards: jest.fn(() => []),
}));

jest.mock('@libs/Navigation/helpers/getAdaptedStateFromPath', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));

const mockedEvaluateGuards = evaluateGuards as jest.Mock;
const mockedGetAdaptedStateFromPath = getAdaptedStateFromPath as jest.Mock;

const routeNames = [SCREENS.HOME, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR, NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR];

describe('handleNavigationGuards - REDIRECT stack preservation', () => {
    const router = RootStackRouter({});

    const configOptions = {
        routeNames,
        routeParamList: {} as ParamListBase,
        routeGetIdList: {} as Record<string, ((params: Record<string, unknown>) => string) | undefined>,
    };

    const mockAction = {
        type: 'NAVIGATE' as const,
        payload: {name: SCREENS.HOME},
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedEvaluateGuards.mockReturnValue({type: 'ALLOW'});
    });

    it('should preserve existing fullscreen routes and append redirect target on top', () => {
        // Given the current stack has a deep-linked report (a fullscreen route)
        const state: StackNavigationState<ParamListBase> = {
            key: 'root',
            index: 0,
            routeNames,
            routes: [{key: 'report-1', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, params: undefined}],
            stale: false,
            type: 'stack',
            preloadedRoutes: [],
        };

        // When the guard returns REDIRECT to onboarding and getAdaptedStateFromPath returns a state with Home + OnboardingModalNavigator
        mockedEvaluateGuards.mockReturnValue({type: 'REDIRECT', route: 'onboarding/purpose'});
        mockedGetAdaptedStateFromPath.mockReturnValue({
            routes: [
                {name: SCREENS.HOME, key: 'home-1'},
                {name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR, key: 'onboarding-1'},
            ],
        });

        const result = router.getStateForAction(state, mockAction, configOptions);

        // Then the deep-linked report should be preserved and onboarding should be appended on top
        expect(result).not.toBeNull();
        expect(result?.routes).toHaveLength(2);
        expect(result?.routes[0].name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        expect(result?.routes[1].name).toBe(NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
        expect(result?.index).toBe(1);
    });

    it('should use the full redirect state when no existing fullscreen route is present', () => {
        // Given a fresh app state with no fullscreen routes (e.g., only a non-fullscreen route)
        const state: StackNavigationState<ParamListBase> = {
            key: 'root',
            index: 0,
            routeNames: [...routeNames, 'SomeNonFullScreenRoute'],
            routes: [{key: 'other-1', name: 'SomeNonFullScreenRoute', params: undefined}],
            stale: false,
            type: 'stack',
            preloadedRoutes: [],
        };

        // When the guard returns REDIRECT to onboarding
        mockedEvaluateGuards.mockReturnValue({type: 'REDIRECT', route: 'onboarding/purpose'});
        mockedGetAdaptedStateFromPath.mockReturnValue({
            routes: [
                {name: SCREENS.HOME, key: 'home-1'},
                {name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR, key: 'onboarding-1'},
            ],
        });

        const result = router.getStateForAction(state, mockAction, configOptions);

        // Then the full redirect state (Home + Onboarding) should be used since there's no fullscreen route to preserve
        expect(result).not.toBeNull();
        expect(result?.routes).toHaveLength(2);
        expect(result?.routes[0].name).toBe(SCREENS.HOME);
        expect(result?.routes[1].name).toBe(NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
        expect(result?.index).toBe(1);
    });

    it('should use the full redirect state for non-modal redirects even when fullscreen routes exist', () => {
        // Given the current stack has a deep-linked report (a fullscreen route)
        const state: StackNavigationState<ParamListBase> = {
            key: 'root',
            index: 0,
            routeNames,
            routes: [{key: 'report-1', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, params: undefined}],
            stale: false,
            type: 'stack',
            preloadedRoutes: [],
        };

        // When the guard returns a non-modal REDIRECT (e.g., to SettingsSplitNavigator)
        mockedEvaluateGuards.mockReturnValue({type: 'REDIRECT', route: 'settings'});
        mockedGetAdaptedStateFromPath.mockReturnValue({
            routes: [{name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, key: 'settings-1'}],
        });

        const result = router.getStateForAction(state, mockAction, configOptions);

        // Then the full redirect state should be used (no route preservation for non-modal redirects)
        expect(result).not.toBeNull();
        expect(result?.routes).toHaveLength(1);
        expect(result?.routes[0].name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
        expect(result?.index).toBe(0);
    });

    it('should not process redirect when guard allows navigation', () => {
        // Given the guard allows navigation
        const state: StackNavigationState<ParamListBase> = {
            key: 'root',
            index: 0,
            routeNames,
            routes: [{key: 'home-1', name: SCREENS.HOME, params: undefined}],
            stale: false,
            type: 'stack',
            preloadedRoutes: [],
        };

        mockedEvaluateGuards.mockReturnValue({type: 'ALLOW'});

        // Normal routing may error with minimal config — we only care that redirect logic was not triggered
        try {
            router.getStateForAction(state, mockAction, configOptions);
        } catch {
            // Expected: StackRouter needs full config for normal routing
        }

        // Then getAdaptedStateFromPath should NOT have been called (no redirect processing)
        expect(mockedGetAdaptedStateFromPath).not.toHaveBeenCalled();
    });

    it('should return unchanged state when guard blocks navigation', () => {
        // Given the guard blocks navigation
        const state: StackNavigationState<ParamListBase> = {
            key: 'root',
            index: 0,
            routeNames,
            routes: [{key: 'home-1', name: SCREENS.HOME, params: undefined}],
            stale: false,
            type: 'stack',
            preloadedRoutes: [],
        };

        mockedEvaluateGuards.mockReturnValue({type: 'BLOCK', reason: 'Test block'});

        const result = router.getStateForAction(state, mockAction, configOptions);

        // Then the state should be returned unchanged
        expect(result).toEqual(state);
    });
});
