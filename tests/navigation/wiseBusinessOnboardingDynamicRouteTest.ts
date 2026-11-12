import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

const BANK_ACCOUNT_ID = 9053192;
const POLICY_ID = 'ABCDEF1234567890';

type FocusedRoute = {name?: string; params?: unknown};

function getFocusedRoute(state: PartialState<NavigationState>): FocusedRoute {
    let current: PartialState<NavigationState> | undefined = state;
    let route: FocusedRoute = {};

    while (current?.routes) {
        const nextRoute = current.routes.at(current.index ?? current.routes.length - 1);
        route = {name: nextRoute?.name, params: nextRoute?.params};
        current = nextRoute?.state;
    }

    return route;
}

const ENTRY_POINTS = [
    ['Wallet', ROUTES.SETTINGS_WALLET],
    ['Workspace Workflows > Payments', ROUTES.WORKSPACE_WORKFLOWS.getRoute(POLICY_ID, CONST.TAB.WORKFLOWS.PAYMENTS)],
] as const;

function getIntroPath(basePath: string) {
    return createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(BANK_ACCOUNT_ID), basePath);
}

describe('Wise business onboarding dynamic routes', () => {
    it.each(ENTRY_POINTS)('opens a page of the onboarding on top of the intro from %s', (_label, basePath) => {
        // Given the onboarding suffix with a page, appended to the intro page
        const route = createDynamicRoute(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute('business', 'edit'), getIntroPath(basePath));

        // When the URL is parsed into navigation state
        const focusedRoute = getFocusedRoute(getStateFromPath(route));

        // Then the onboarding screen is focused with the page from its suffix and the bank account from the intro underneath
        expect(focusedRoute.name).toBe(SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING);
        expect(focusedRoute.params).toMatchObject({bankAccountID: String(BANK_ACCOUNT_ID), subPage: 'business', action: 'edit'});
    });

    it('opens the onboarding without a page, so the flow picks where to resume', () => {
        // Given Get started on the intro, which leaves the page out
        const route = createDynamicRoute(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute(), getIntroPath(ROUTES.SETTINGS_WALLET));

        // When the URL is parsed into navigation state
        const focusedRoute = getFocusedRoute(getStateFromPath(route));

        // Then the onboarding screen opens with no page for the flow to override
        expect(focusedRoute.name).toBe(SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING);
        expect(focusedRoute.params).not.toHaveProperty('subPage');
    });

    it.each([
        ['the terms', DYNAMIC_ROUTES.WISE_ACCEPT_TERMS.path, SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ACCEPT_TERMS],
        ['the status', DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path, SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS],
    ] as const)('opens %s on top of the intro, since each page after the form replaces the one before', (_label, suffix, screen) => {
        // Given the page's suffix appended to the intro, where the replaced form leaves it
        const route = createDynamicRoute(suffix, getIntroPath(ROUTES.SETTINGS_WALLET));

        // When the URL is parsed into navigation state, as on a refresh
        const focusedRoute = getFocusedRoute(getStateFromPath(route));

        // Then the page is focused with the bank account from the intro underneath
        expect(focusedRoute.name).toBe(screen);
        expect(focusedRoute.params).toMatchObject({bankAccountID: String(BANK_ACCOUNT_ID)});
    });

    it.each(ENTRY_POINTS)('goes back from the onboarding to the intro from %s', (_label, basePath) => {
        // Given a page of the onboarding opened on top of the intro
        const introPath = getIntroPath(basePath);
        const route = createDynamicRoute(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute('representative'), introPath);

        // When computing the back path from the current URL
        const backPath = stripDynamicRouteSuffixFromPath(route, DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.path);

        // Then going back lands on the intro page
        expect(backPath).toBe(introPath);
    });

    it('does not open the onboarding straight from Wallet, since the intro comes first', () => {
        // Given the onboarding suffix appended to Wallet without the intro
        const route = createDynamicRoute(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute('representative'), ROUTES.SETTINGS_WALLET);

        // When the URL is parsed into navigation state
        const focusedRoute = getFocusedRoute(getStateFromPath(route));

        // Then the entry screen check rejects it
        expect(focusedRoute.name).not.toBe(SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING);
    });
});
