import type {GroupedItem, SearchQueryJSON} from '@components/Search/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';

import {getSections, getSortedSections, isGroupedItemArray, isGroupEntry} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxEntry} from 'react-native-onyx';

/** Returns the accounts named in the snapshot's groups, so the hook can subscribe to just their personal details. */
function getGroupedAccountIDs(data: SearchResults['data'] = {}): number[] {
    return Object.keys(data).flatMap((key) => (isGroupEntry(key) && 'accountID' in data[key] && data[key].accountID ? [data[key].accountID] : []));
}

/**
 * Turns a search snapshot into the sorted rows a chart plots, grouped and ordered the way the query asks for.
 * Returns nothing until the snapshot holds data, which is what a caller reads as "not loaded yet".
 * Caps the rows to the query's limit, since the backend may return more rows than the chart shows.
 */
function useGroupedItems(searchResults: OnyxEntry<SearchResults>, queryJSON: Readonly<SearchQueryJSON> | undefined): GroupedItem[] | undefined {
    const {translate, localeCompare, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID, login} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const groupBy = queryJSON?.groupBy;
    const [onyxPersonalDetailsList] = usePersonalDetailsByIDs(groupBy === CONST.SEARCH.GROUP_BY.FROM ? getGroupedAccountIDs(searchResults?.data) : undefined);

    const sortedSections =
        searchResults?.data && queryJSON && groupBy && login
            ? getSortedSections(
                  queryJSON.type,
                  getSections({
                      dateFnsLocale,
                      type: queryJSON.type,
                      data: searchResults.data,
                      groupBy,
                      queryJSON,
                      currentAccountID: accountID,
                      currentUserEmail: login,
                      translate,
                      formatPhoneNumber,
                      bankAccountList: undefined,
                      rules,
                      conciergeReportID,
                      convertToDisplayString,
                      onyxPersonalDetailsList,
                      reportAttributesDerivedValue: undefined,
                  })[0],
                  localeCompare,
                  translate,
                  queryJSON.sortBy,
                  queryJSON.sortOrder,
                  groupBy,
              )
            : undefined;

    const limitedSections = sortedSections && queryJSON?.limit ? sortedSections.slice(0, queryJSON.limit) : sortedSections;

    return limitedSections && isGroupedItemArray(limitedSections) ? limitedSections : undefined;
}

export default useGroupedItems;
