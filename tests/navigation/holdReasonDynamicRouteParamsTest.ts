import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

const CHAT_REPORT_ID = '8951981506501769';
const EXPENSE_REPORT_ID = '7778889990001112';
const SEARCH_REPORT_ID = '9998887776665554';
const TRANSACTION_ID = '1234567890123456';
const HOLD_REPORT_ID = '6543210987654321';

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

function resolveHoldReason(basePath: string, holdReportID?: string): FocusedRoute {
    const url = createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_HOLD_REASON.getRoute(TRANSACTION_ID, holdReportID), basePath);
    return getFocusedRoute(getStateFromPath(url));
}

/**
 * A dynamic route inherits the params of the screen it is opened on top of, so a query param that shares a name with a
 * base screen param silently falls back to the base value when it is absent. The hold reason page is the case where
 * that is harmful: its report is the transaction thread, which does not exist yet for a freshly created expense.
 * Holding from a report preview then wrote the hold actions into the parent chat instead of a new thread.
 * Regression test for https://github.com/Expensify/App/issues/98936.
 */
describe('hold reason dynamic route params', () => {
    it.each([
        ['a chat report', `/r/${CHAT_REPORT_ID}`],
        ['an expense report RHP', `/e/${EXPENSE_REPORT_ID}`],
        ['a search report RHP', `/search/view/${SEARCH_REPORT_ID}`],
    ])('does not inherit the report of %s when the transaction thread does not exist yet', (_label, basePath) => {
        const route = resolveHoldReason(basePath);

        expect(route.name).toBe(SCREENS.MONEY_REQUEST.DYNAMIC_HOLD_REASON);
        expect(route.params).toMatchObject({transactionID: TRANSACTION_ID});
        expect(route.params).not.toHaveProperty('holdReportID');
    });

    it('passes the transaction thread through when it already exists', () => {
        const route = resolveHoldReason(`/r/${CHAT_REPORT_ID}`, HOLD_REPORT_ID);

        expect(route.name).toBe(SCREENS.MONEY_REQUEST.DYNAMIC_HOLD_REASON);
        expect(route.params).toMatchObject({holdReportID: HOLD_REPORT_ID, transactionID: TRANSACTION_ID});
    });

    it('keeps the transaction thread out of the URL when it does not exist yet', () => {
        expect(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_HOLD_REASON.getRoute(TRANSACTION_ID, undefined), `/r/${CHAT_REPORT_ID}`)).toBe(
            `/r/${CHAT_REPORT_ID}/hold-reason?transactionID=${TRANSACTION_ID}`,
        );
        expect(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_HOLD_REASON.getRoute(TRANSACTION_ID, HOLD_REPORT_ID), `/r/${CHAT_REPORT_ID}`)).toBe(
            `/r/${CHAT_REPORT_ID}/hold-reason?transactionID=${TRANSACTION_ID}&holdReportID=${HOLD_REPORT_ID}`,
        );
    });
});
