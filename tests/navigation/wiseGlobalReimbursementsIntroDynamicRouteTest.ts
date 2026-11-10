import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

const SUFFIX = DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path;
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

describe('Wise global reimbursements intro dynamic route', () => {
    it.each(ENTRY_POINTS)('opens the intro page on top of %s', (_label, basePath) => {
        // Given the intro suffix appended to an entry point the banner or bank account menu lives on
        const route = createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(BANK_ACCOUNT_ID), basePath);

        // When the URL is parsed into navigation state
        const focusedRoute = getFocusedRoute(getStateFromPath(route));

        // Then the single dynamic intro screen is focused with the bank account from the suffix
        expect(focusedRoute.name).toBe(SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_GLOBAL_REIMBURSEMENTS_INTRO);
        expect(focusedRoute.params).toMatchObject({bankAccountID: String(BANK_ACCOUNT_ID)});
    });

    it.each(ENTRY_POINTS)('goes back to %s once the suffix is stripped', (_label, basePath) => {
        // Given the intro page opened on top of an entry point
        const route = createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(BANK_ACCOUNT_ID), basePath);

        // When computing the back path from the current URL
        const match = findAllMatchingDynamicSuffixes(route).find((m) => m.pattern === SUFFIX);
        expect(match).toBeDefined();
        if (!match) {
            return;
        }
        const backPath = getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);

        // Then going back lands on the page the user came from, including the selected Workflows tab
        expect(backPath).toBe(basePath);
    });
});
