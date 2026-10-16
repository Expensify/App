import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

function getFocusedRouteName(state: PartialState<NavigationState>): string | undefined {
    let current: PartialState<NavigationState> | undefined = state;
    let name: string | undefined;

    while (current?.routes) {
        const nextRoute = current.routes.at(current.index ?? current.routes.length - 1);
        name = nextRoute?.name;
        current = nextRoute?.state;
    }

    return name;
}

/**
 * The FAB "New workspace" item opens the confirmation route appended to whichever screen is active,
 * and the FAB is reachable from every tab. A host missing from `entryScreens` fails validation in
 * getStateFromPath, so the user lands on Not Found instead of the confirmation page.
 */
describe('WORKSPACE_CONFIRMATION', () => {
    it.each([
        ['the Account tab profile page', ROUTES.SETTINGS_PROFILE.route],
        ['the Insights tab', ROUTES.INSIGHTS.getRoute(CONST.INSIGHTS.DASHBOARD.SPEND)],
    ])('opens the confirmation page from %s', (_label, basePath) => {
        // Given the user is on a tab outside the original entry screens (the wide Account tab lands on the profile page)
        // When the FAB builds the confirmation route on top of that page
        const url = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION.path, basePath);

        // Then the path resolves to the confirmation screen instead of Not Found
        expect(getFocusedRouteName(getStateFromPath(url))).toBe(SCREENS.WORKSPACE_CONFIRMATION.DYNAMIC_ROOT);
    });
});

/**
 * The confirm workspace form always renders the currency row, and that row opens the `currency`
 * dynamic route appended to whichever screen is hosting the form. A host missing from
 * `entryScreens` fails validation in getStateFromPath, so the user lands on Not Found instead of
 * the currency selector. Regression guard for #94530.
 */
describe('WORKSPACE_CONFIRMATION_CURRENCY', () => {
    const currencyEntryScreens: readonly string[] = DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION_CURRENCY.entryScreens;

    it('allows opening the currency selector from every screen that hosts the confirm workspace form', () => {
        expect(currencyEntryScreens).toEqual(
            expect.arrayContaining([SCREENS.WORKSPACE_CONFIRMATION.DYNAMIC_ROOT, SCREENS.TRAVEL.DYNAMIC_WORKSPACE_CONFIRMATION, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_UPGRADE]),
        );
    });

    it('allows every host that the plan type row allows', () => {
        // Both rows sit on the same form, and the currency row is the one that renders for every
        // user, so any screen that can open the plan type selector must be able to open this one.
        const planTypeEntryScreens: readonly string[] = DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION_PLAN_TYPE.entryScreens;
        expect(currencyEntryScreens).toEqual(expect.arrayContaining([...planTypeEntryScreens]));
    });
});
