import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import linkTo from '@libs/Navigation/helpers/linkTo';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, NavigationContainerRef, NavigationState} from '@react-navigation/native';

import createMock from '../utils/createMock';

const INTRO_ROUTE = createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(456), ROUTES.SETTINGS_WALLET);
const ONBOARDING_ROUTE = createDynamicRoute(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute(), INTRO_ROUTE);

type StackState = {index: number; routes: Array<{name: string; path: string}>};

type DispatchedAction = {
    target?: string;
    payload: {
        name: string;
        params: {state?: StackState; params?: {state?: StackState}};
    };
};

function linkToOnboarding(rootState: NavigationState): DispatchedAction | undefined {
    let dispatchedAction: NavigationAction | undefined;
    const navigation = createMock<NavigationContainerRef<RootNavigatorParamList>>({
        getRootState: () => rootState,
        dispatch: (action: NavigationAction) => {
            dispatchedAction = action;
        },
    });
    linkTo(navigation, ONBOARDING_ROUTE, {dynamicRouteBase: INTRO_ROUTE, skipMatchingFullScreenRoute: true});
    return createMock<DispatchedAction | undefined>(dispatchedAction);
}

const tabRoute = {key: 'tab', name: NAVIGATORS.TAB_NAVIGATOR};

describe('linkTo with a dynamic route base', () => {
    it('opens a stacked dynamic route together with the screen beneath it', () => {
        // Given the Wallet with no RHP open
        const rootState = createMock<NavigationState>({key: 'root', index: 0, routes: [tabRoute], type: 'stack'});

        // When the onboarding opens with the intro as its base
        const action = linkToOnboarding(rootState);

        // Then one action opens the RHP with the intro beneath the focused onboarding, so the intro never shows on its own
        const settingsStack = action?.payload.params.params?.state;
        expect(settingsStack?.index).toBe(1);
        expect(settingsStack?.routes.map((route) => [route.name, route.path])).toEqual([
            [SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_GLOBAL_REIMBURSEMENTS_INTRO, `/${INTRO_ROUTE}`],
            [SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING, `/${ONBOARDING_ROUTE}`],
        ]);
    });

    it('hands the whole stack to the RHP when its Settings stack is already open', () => {
        // Given an RHP whose Settings stack is already open on another page
        const rootState = createMock<NavigationState>({
            key: 'root',
            index: 1,
            type: 'stack',
            routes: [
                tabRoute,
                {
                    key: 'rhp-route',
                    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                    state: {
                        key: 'rhp',
                        index: 0,
                        routes: [{key: 'settings', name: 'Settings', state: {key: 'settings-stack', index: 0, routes: [{key: 'other', name: SCREENS.SETTINGS.WALLET.ROOT}]}}],
                    },
                },
            ],
        });

        // When the onboarding opens with the intro as its base
        const action = linkToOnboarding(rootState);

        // Then the RHP gets the Settings route with the intro and the onboarding as its stack, since only the navigator that owns
        // the route can replace its stack, and a descent into the Settings stack would drop it
        expect(action?.target).toBe('rhp');
        expect(action?.payload.name).toBe('Settings');
        expect(action?.payload.params.state?.routes.map((route) => route.name)).toEqual([
            SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_GLOBAL_REIMBURSEMENTS_INTRO,
            SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING,
        ]);
    });
});
