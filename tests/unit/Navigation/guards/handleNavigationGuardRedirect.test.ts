import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import RootStackRouter from '@libs/Navigation/AppNavigator/createRootStackNavigator/RootStackRouter';
import {evaluateGuards} from '@libs/Navigation/guards';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/guards', () => ({
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
    __esModule: true,
    default: jest.fn(),
}));

const mockedEvaluateGuards = jest.mocked(evaluateGuards);
const mockedGetAdaptedStateFromPath = jest.mocked(getAdaptedStateFromPath);

const routeNames = [
    NAVIGATORS.TAB_NAVIGATOR,
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
    SCREENS.CONCIERGE,
    SCREENS.HOME,
    SCREENS.REPORT,
];

function createState(routes: Array<{key: string; name: string}>, index = routes.length - 1): StackNavigationState<ParamListBase> {
    return {
        key: 'root',
        index,
        routeNames,
        routes,
        stale: false,
        type: 'stack',
        preloadedRoutes: [],
    };
}

describe('handleNavigationGuards REDIRECT stack preservation', () => {
    const router = RootStackRouter({});
    const configOptions = {
        routeNames,
        routeParamList: {} as ParamListBase,
        routeGetIdList: {} as Record<string, ((params: Record<string, unknown>) => string) | undefined>,
    };
    const action = {type: 'NAVIGATE' as const, payload: {name: NAVIGATORS.TAB_NAVIGATOR}};
    const onboardingRedirectState = {
        routes: [
            {key: 'home', name: NAVIGATORS.TAB_NAVIGATOR},
            {key: 'onboarding', name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedEvaluateGuards.mockReturnValue({type: 'REDIRECT', route: 'onboarding/work-email'});
        mockedGetAdaptedStateFromPath.mockReturnValue(onboardingRedirectState);
    });

    it('drops the SignIn right modal before preserving a deep-linked report under onboarding', () => {
        const state = createState([
            {key: 'report', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            {key: 'sign-in-rhp', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
        ]);

        const result = router.getStateForAction(state, action, configOptions);

        expect(result?.routes.map((route) => route.name)).toEqual([NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]);
        expect(result?.index).toBe(1);
    });

    it('falls back to the default onboarding redirect state when no fullscreen route survives', () => {
        const state = createState([{key: 'concierge', name: SCREENS.CONCIERGE}]);

        const result = router.getStateForAction(state, action, configOptions);

        expect(result?.routes.map((route) => route.name)).toEqual([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]);
        expect(result?.index).toBe(1);
    });

    it('keeps non-onboarding redirects as full state replacements', () => {
        const state = createState([{key: 'report', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}]);
        mockedEvaluateGuards.mockReturnValue({type: 'REDIRECT', route: 'settings'});
        mockedGetAdaptedStateFromPath.mockReturnValue({
            routes: [{key: 'settings', name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}],
        });

        const result = router.getStateForAction(state, action, configOptions);

        expect(result?.routes.map((route) => route.name)).toEqual([NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]);
        expect(result?.index).toBe(0);
    });

    it('does not suppress HOME redirects when TabNavigator is already focused on another tab', () => {
        const state = createState([
            {
                key: 'tabs',
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    key: 'tabs-state',
                    index: 1,
                    routeNames: [SCREENS.HOME, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR],
                    routes: [
                        {key: 'home', name: SCREENS.HOME},
                        {
                            key: 'reports',
                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                            state: {
                                key: 'reports-state',
                                index: 0,
                                routeNames: [SCREENS.REPORT],
                                routes: [{key: 'report', name: SCREENS.REPORT, params: {reportID: '7075912447943023'}}],
                                stale: false,
                                type: 'stack',
                            },
                        },
                    ],
                    stale: false,
                    type: 'tab',
                },
            },
        ]);
        mockedEvaluateGuards.mockReturnValue({type: 'REDIRECT', route: 'home'});
        mockedGetAdaptedStateFromPath.mockReturnValue({
            routes: [
                {
                    key: 'tabs-home',
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        key: 'tabs-home-state',
                        index: 0,
                        routeNames: [SCREENS.HOME, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR],
                        routes: [{key: 'home', name: SCREENS.HOME}],
                        stale: false,
                        type: 'tab',
                    },
                },
            ],
        });

        const result = router.getStateForAction(state, action, configOptions);

        expect(result).not.toBe(state);
        expect(result?.routes).toHaveLength(1);
        expect(result?.routes.at(0)?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
        expect(result?.routes.at(0)?.state?.index).toBe(0);
        expect(result?.routes.at(0)?.state?.routes.at(0)?.name).toBe(SCREENS.HOME);
    });

    it('returns the current state when the redirect target is already focused', () => {
        const state = createState(
            [
                {key: 'home', name: NAVIGATORS.TAB_NAVIGATOR},
                {key: 'onboarding', name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
            ],
            1,
        );

        const result = router.getStateForAction(state, action, configOptions);

        expect(result).toBe(state);
    });
});
