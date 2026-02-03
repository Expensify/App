import {findFocusedRoute} from '@react-navigation/native';
import type {NavigationState} from '@react-navigation/routers';
import type {OnyxCollection} from 'react-native-onyx';
import type {SearchQueryItem} from '@components/SelectionListWithSections/Search/SearchQueryListItem';
import {getPolicyNameWithFallback, sanitizeSearchValue} from '@libs/SearchQueryUtils';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type ContextualReportData = {
    contextualReportID: string | undefined;
    isSearchRouterScreen: boolean;
};

/**
 * Extracts contextual report data from the navigation state.
 *
 * This function determines:
 * 1. Whether the current screen is the SearchRouter modal
 * 2. The reportID of the contextual report (if any) that was focused before opening the SearchRouter
 *
 * When the SearchRouter is open, it looks at the previous route in the stack to find the underlying
 * report context. Otherwise it looks @ current screen for report context.
 * This allows the search to provide contextual suggestions based on the report
 * the user was viewing when they opened the search.
 *
 * @param state - The root navigation state from useRootNavigationState hook
 * @returns Object containing contextualReportID (the report ID if on a report screen) and isSearchRouterScreen (whether SearchRouter is focused)
 */
function getContextualReportData(state: NavigationState | undefined): ContextualReportData {
    // Safe handling when navigation is not yet initialized
    if (!state) {
        return {contextualReportID: undefined, isSearchRouterScreen: false};
    }
    let maybeReportRoute = findFocusedRoute(state);
    const isSearchRouterScreen = maybeReportRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_ROUTER;
    if (isSearchRouterScreen) {
        const stateWithoutLastRoute = {
            ...state,
            routes: state.routes.slice(0, -1),
            index: state.index !== 0 ? state.index - 1 : 0,
        };
        maybeReportRoute = findFocusedRoute(stateWithoutLastRoute);
    }

    if (maybeReportRoute?.name === SCREENS.REPORT || maybeReportRoute?.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT) {
        // We're guaranteed that the type of params is of SCREENS.REPORT
        return {contextualReportID: (maybeReportRoute?.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT]).reportID, isSearchRouterScreen};
    }
    return {contextualReportID: undefined, isSearchRouterScreen};
}

function getContextualSearchAutocompleteKey(item: SearchQueryItem, policies: OnyxCollection<OnyxTypes.Policy>, reports?: OnyxCollection<OnyxTypes.Report>) {
    if (item.roomType === CONST.SEARCH.DATA_TYPES.INVOICE) {
        return `${CONST.SEARCH.SYNTAX_FILTER_KEYS.TO}:${item.searchQuery}`;
    }
    if (item.roomType === CONST.SEARCH.DATA_TYPES.CHAT) {
        return `${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN}:${item.searchQuery}`;
    }
    if (item.roomType === CONST.SEARCH.DATA_TYPES.EXPENSE) {
        return `${CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID}:${item.policyID ? getPolicyNameWithFallback(item.policyID, policies, reports) : ''}`;
    }
}

function getContextualSearchQuery(item: SearchQueryItem, policies: OnyxCollection<OnyxTypes.Policy>, reports?: OnyxCollection<OnyxTypes.Report>) {
    const baseQuery = `${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TYPE}:${item.roomType}`;
    let additionalQuery = '';

    switch (item.roomType) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            additionalQuery += ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID}:${sanitizeSearchValue(item.policyID ? getPolicyNameWithFallback(item.policyID, policies, reports) : '')}`;
            break;
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            additionalQuery += ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID}:${item.policyID}`;
            if (item.autocompleteID) {
                additionalQuery += ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TO}:${sanitizeSearchValue(item.searchQuery ?? '')}`;
            }
            break;
        case CONST.SEARCH.DATA_TYPES.CHAT:
        default:
            additionalQuery = ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IN}:${sanitizeSearchValue(item.searchQuery ?? '')}`;
            break;
    }
    return baseQuery + additionalQuery;
}

export {getContextualReportData, getContextualSearchAutocompleteKey, getContextualSearchQuery};
export type {ContextualReportData};
