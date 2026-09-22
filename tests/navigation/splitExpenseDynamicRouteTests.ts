import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import type {State} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const CHAT_REPORT_ID = '8951981506501769';
const SPLIT_REPORT_ID = '7778889990001112';
const TRANSACTION_ID = '1234567890123456';
const SPLIT_TRANSACTION_ID = '6543210987654321';

function getFocusedRoute(path: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- these URLs are composed at runtime, so they are not entries in the production Route union
    return findFocusedRouteWithOnyxTabGuard(getStateFromPath(path as Route) as State);
}

describe('split expense dynamic routes', () => {
    it.each([
        ['the overview route', DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE, SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE],
        ['the search overview route', DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE_SEARCH, SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE_SEARCH],
    ])('resolves %s with the split params carried in the query', (_label, dynamicRoute, screen) => {
        const basePath = screen === SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE_SEARCH ? `/search?q=${encodeURIComponent('type:expense')}` : `/r/${CHAT_REPORT_ID}`;
        const url = createDynamicRoute(dynamicRoute.getRoute(SPLIT_REPORT_ID, TRANSACTION_ID, SPLIT_TRANSACTION_ID), basePath);
        const route = getFocusedRoute(url);

        expect(route?.name).toBe(screen);
        expect(route?.params).toMatchObject({
            splitReportID: SPLIT_REPORT_ID,
            originalTransactionID: TRANSACTION_ID,
            splitExpenseTransactionID: SPLIT_TRANSACTION_ID,
        });
    });

    /**
     * Naming the split report `reportID` would collide with the report details route, which already carries `reportID`
     * in its query, making `createDynamicRoute` throw.
     */
    it('does not collide with the report details route, which also carries a report in its query', () => {
        const detailsPath = createDynamicRoute(DYNAMIC_ROUTES.REPORT_DETAILS.getRoute(CHAT_REPORT_ID), `/r/${CHAT_REPORT_ID}`);

        const url = createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE.getRoute(SPLIT_REPORT_ID, TRANSACTION_ID), detailsPath);
        const route = getFocusedRoute(url);

        expect(route?.name).toBe(SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE);
        expect(route?.params).toMatchObject({reportID: CHAT_REPORT_ID, splitReportID: SPLIT_REPORT_ID, originalTransactionID: TRANSACTION_ID});
    });

    it('restores the active tab from the URL', () => {
        const url = `${createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE.getRoute(SPLIT_REPORT_ID, TRANSACTION_ID), `/r/${CHAT_REPORT_ID}`)}`;
        const [path, query] = url.split('?');
        const route = getFocusedRoute(`${path}/${CONST.TAB.SPLIT.PERCENTAGE}?${query}`);

        expect(route?.name).toBe(SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE);
        expect(route?.state?.routes.at(0)?.name).toBe(CONST.TAB.SPLIT.PERCENTAGE);
    });

    it('strips the suffix and its query params to build the back path', () => {
        const url = createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE.getRoute(SPLIT_REPORT_ID, TRANSACTION_ID), `/r/${CHAT_REPORT_ID}`);
        const [path, query] = url.split('?');
        const urlWithTab = `${path}/${CONST.TAB.SPLIT.DATE}?${query}`;

        const match = findAllMatchingDynamicSuffixes(urlWithTab).find((candidate) => candidate.pattern === DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE.path);

        expect(match?.strippedTabPath).toBe(CONST.TAB.SPLIT.DATE);
        expect(getPathWithoutDynamicSuffix(match?.pathUsedForMatching ?? '', match?.actualSuffix ?? '', match?.pattern)).toBe(`/r/${CHAT_REPORT_ID}`);
    });

    it('inherits the split params on the create date range route', () => {
        const overviewUrl = createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE.getRoute(SPLIT_REPORT_ID, TRANSACTION_ID), `/r/${CHAT_REPORT_ID}`);
        const [path, query] = overviewUrl.split('?');

        const url = createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE_CREATE_DATE_RANGE.path, `${path}/${CONST.TAB.SPLIT.DATE}?${query}`);
        const route = getFocusedRoute(url);

        expect(route?.name).toBe(SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE_CREATE_DATE_RANGE);
        expect(route?.params).toMatchObject({splitReportID: SPLIT_REPORT_ID, originalTransactionID: TRANSACTION_ID});
    });

    it('resolves the tapped split, not the split inherited from the edit-splits overview query, when their transaction IDs differ', () => {
        const OTHER_SPLIT_TRANSACTION_ID = '1112223334445556';
        const overviewUrl = createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE.getRoute(SPLIT_REPORT_ID, TRANSACTION_ID, SPLIT_TRANSACTION_ID), `/r/${CHAT_REPORT_ID}`);
        const editUrl = createDynamicRoute(DYNAMIC_ROUTES.SPLIT_EXPENSE_EDIT.getRoute(SPLIT_REPORT_ID, OTHER_SPLIT_TRANSACTION_ID), overviewUrl);

        const route = getFocusedRoute(editUrl);

        expect(route?.name).toBe(SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE_EDIT);
        expect(route?.params).toMatchObject({editSplitExpenseTransactionID: OTHER_SPLIT_TRANSACTION_ID});
    });

    it('does not collide with the transactionID query param used by expense step screens opened from the split edit page', () => {
        const overviewUrl = createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE.getRoute(SPLIT_REPORT_ID, TRANSACTION_ID), `/r/${CHAT_REPORT_ID}`);
        const editUrl = createDynamicRoute(DYNAMIC_ROUTES.SPLIT_EXPENSE_EDIT.getRoute(SPLIT_REPORT_ID, SPLIT_TRANSACTION_ID), overviewUrl);

        expect(() =>
            createDynamicRoute(
                DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.SPLIT_EXPENSE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, SPLIT_REPORT_ID),
                editUrl,
            ),
        ).not.toThrow();
    });
});
