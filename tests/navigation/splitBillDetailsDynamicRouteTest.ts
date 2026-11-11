import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

const SUFFIX = DYNAMIC_ROUTES.SPLIT_BILL_DETAILS.path;
const CHAT_REPORT_ID = '111';
const REPORT_ACTION_ID = '222';
const SEARCH_CHAT_ROUTE = `search?q=${encodeURIComponent('type:chat')}`;

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

describe('Split bill details dynamic route', () => {
    it('opens split details from the Search root with the chat reportID from the query', () => {
        // Given a split preview pressed in a Type: Chat search row, where the Search root route has no reportID of its own
        const route = createDynamicRoute(DYNAMIC_ROUTES.SPLIT_BILL_DETAILS.getRoute(REPORT_ACTION_ID, CHAT_REPORT_ID), SEARCH_CHAT_ROUTE);

        // When the app resolves it, which is where the Search root used to fail the entry screen check
        const focusedRoute = getFocusedRoute(getStateFromPath(route));

        // Then split details is focused with the chat and action it needs, instead of the full screen not-found page
        expect(focusedRoute.name).toBe(SCREENS.SPLIT_DETAILS.DYNAMIC_ROOT);
        expect(focusedRoute.params).toMatchObject({reportID: CHAT_REPORT_ID, reportActionID: REPORT_ACTION_ID});
    });

    it('goes back to the filtered Search once the suffix and reportID are stripped', () => {
        // Given split details opened from the Search root, which is also the URL a refresh restores
        const route = createDynamicRoute(DYNAMIC_ROUTES.SPLIT_BILL_DETAILS.getRoute(REPORT_ACTION_ID, CHAT_REPORT_ID), SEARCH_CHAT_ROUTE);

        // When Back is resolved from that URL, as it is after a refresh with no history to pop
        const match = findAllMatchingDynamicSuffixes(route).find((m) => m.pattern === SUFFIX);
        expect(match).toBeDefined();
        if (!match) {
            return;
        }
        const backPath = getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);

        // Then Back lands on the same Search query, so the Type: Chat filter is kept
        expect(backPath).toBe(SEARCH_CHAT_ROUTE);
    });

    it('keeps the report route unchanged when opened from a chat', () => {
        // Given a split preview pressed inside the chat, whose route already carries the reportID
        const reportRoute = `r/${CHAT_REPORT_ID}`;
        const route = createDynamicRoute(DYNAMIC_ROUTES.SPLIT_BILL_DETAILS.getRoute(REPORT_ACTION_ID), reportRoute);

        // When the app resolves it, to guard the existing chat entry against the new Search root entry
        const focusedRoute = getFocusedRoute(getStateFromPath(route));

        // Then no reportID query is added and split details still gets the chat reportID from the report route
        expect(route).toBe(`${reportRoute}/split/${REPORT_ACTION_ID}`);
        expect(focusedRoute.name).toBe(SCREENS.SPLIT_DETAILS.DYNAMIC_ROOT);
        expect(focusedRoute.params).toMatchObject({reportID: CHAT_REPORT_ID, reportActionID: REPORT_ACTION_ID});
    });
});
