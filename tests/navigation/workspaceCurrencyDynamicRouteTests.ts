import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';

import NAVIGATORS from '@src/NAVIGATORS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';

type StateRoute = {name: string; state?: {routes: StateRoute[]}};

/** Returns the workspace page rebuilt under the RHP, which is the last screen of the workspace split navigator. */
function getWorkspacePageUnderRHP(routes: StateRoute[] | undefined): string | undefined {
    for (const route of routes ?? []) {
        if (route.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
            return route.state?.routes.at(-1)?.name;
        }
        const nestedPage = getWorkspacePageUnderRHP(route.state?.routes);
        if (nestedPage) {
            return nestedPage;
        }
    }
    return undefined;
}

function loadPath(path: string) {
    const state = getAdaptedStateFromPath(path, undefined);
    return {
        focusedRoute: state ? findFocusedRoute(state) : undefined,
        pageUnderRHP: getWorkspacePageUnderRHP(state?.routes),
    };
}

describe('workspace currency page on a fresh load', () => {
    it.each([
        ['Connections, from the Digits currency prompt', '/workspaces/1/connections/workspace-currency', SCREENS.WORKSPACE.CONNECTIONS, {}],
        [
            'Workflows, from the bank account currency prompt',
            '/workspaces/1/workflows/workspace-currency?tab=payments&isForcedToChangeCurrency=true',
            SCREENS.WORKSPACE.WORKFLOWS,
            {isForcedToChangeCurrency: 'true'},
        ],
        [
            'Invoices, from the bank account currency prompt',
            '/workspaces/1/invoices/workspace-currency?isForcedToChangeCurrency=true',
            SCREENS.WORKSPACE.INVOICES,
            {isForcedToChangeCurrency: 'true'},
        ],
        [
            'Expensify Card, from the card currency prompt',
            '/workspaces/1/expensify-card/workspace-currency?shouldStartExpensifyCardEnrollment=true',
            SCREENS.WORKSPACE.EXPENSIFY_CARD,
            {shouldStartExpensifyCardEnrollment: 'true'},
        ],
    ])('keeps %s under the currency page', (_label, path, pageUnderCurrencyPage, flags) => {
        // Given a currency page the admin opened from a page that asked for a currency change
        // When the page is refreshed
        const {focusedRoute, pageUnderRHP} = loadPath(path);

        // Then the currency page reopens with its flags on top of the page it was opened from, instead of on top of Overview
        expect(focusedRoute?.name).toBe(SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_CURRENCY);
        expect(focusedRoute?.params).toEqual(expect.objectContaining({policyID: '1', ...flags}));
        expect(pageUnderRHP).toBe(pageUnderCurrencyPage);
    });

    it.each([
        [
            'Workflows',
            '/workspaces/1/workflows/workspace-currency/government-rate-country/EUR?isForcedToChangeCurrency=true',
            SCREENS.WORKSPACE.WORKFLOWS,
            {isForcedToChangeCurrency: 'true'},
        ],
        [
            'Expensify Card',
            '/workspaces/1/expensify-card/workspace-currency/government-rate-country/EUR?shouldStartExpensifyCardEnrollment=true',
            SCREENS.WORKSPACE.EXPENSIFY_CARD,
            {shouldStartExpensifyCardEnrollment: 'true'},
        ],
    ])('keeps %s under the currency page when the government rate country page is refreshed', (_label, path, pageUnderCurrencyPage, flags) => {
        // Given the government rate country page, opened from a currency page that another workspace page opened
        // When the page is refreshed
        const {focusedRoute, pageUnderRHP} = loadPath(path);

        // Then it reopens for the chosen currency with the currency page's flags, still on top of the page that asked for the change
        expect(focusedRoute?.name).toBe(SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_CURRENCY_GOVERNMENT_RATE_COUNTRY);
        expect(focusedRoute?.params).toEqual(expect.objectContaining({policyID: '1', currencyCode: 'EUR', ...flags}));
        expect(pageUnderRHP).toBe(pageUnderCurrencyPage);
    });

    it('keeps Overview under the currency page that Overview opens', () => {
        // Given the currency page opened from Overview, which keeps its own route
        // When the page is refreshed
        const {focusedRoute, pageUnderRHP} = loadPath('/workspaces/1/overview/currency');

        // Then Overview is still the page under it
        expect(focusedRoute?.name).toBe(SCREENS.WORKSPACE.CURRENCY);
        expect(pageUnderRHP).toBe(SCREENS.WORKSPACE.PROFILE);
    });
});

describe('going back from the workspace currency pages', () => {
    it('returns to the page that opened the currency page, without the currency page flags', () => {
        // Given a currency page Workflows opened on its Payments tab
        // When the currency page closes
        const backPath = stripDynamicRouteSuffixFromPath('workspaces/1/workflows/workspace-currency?tab=payments&isForcedToChangeCurrency=true', DYNAMIC_ROUTES.WORKSPACE_CURRENCY.path);

        // Then it goes back to the same Workflows tab, and the flag that only the currency page reads is dropped
        expect(backPath).toBe('workspaces/1/workflows?tab=payments');
    });

    it('returns from the government rate country page to the currency page with its flags', () => {
        // Given the government rate country page opened from a currency page that carries a flag
        // When the country page closes
        const backPath = stripDynamicRouteSuffixFromPath(
            'workspaces/1/expensify-card/workspace-currency/government-rate-country/EUR?shouldStartExpensifyCardEnrollment=true',
            DYNAMIC_ROUTES.WORKSPACE_CURRENCY_GOVERNMENT_RATE_COUNTRY.path,
        );

        // Then the currency page keeps the flag, so choosing another currency still continues to the card enrollment
        expect(backPath).toBe('workspaces/1/expensify-card/workspace-currency?shouldStartExpensifyCardEnrollment=true');
    });
});
