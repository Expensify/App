import {useSession} from '@components/OnyxListItemProvider';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON} from '@components/Search/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useShowSearchSnapshots from '@hooks/useShowSearchSnapshots';

import {getSections, getSortedSections, isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {InsightsDetailsSectionState} from './insightsDetailsSectionState';

import {getInsightsDetailsSectionState, INSIGHTS_DETAILS_SECTION_STATE} from './insightsDetailsSectionState';

type TopExpenses = {
    expenses: TransactionListItemType[];
    state: InsightsDetailsSectionState;
};

/** Returns the largest expenses stored for a Spend table query, as Spend rows sorted by amount. */
function useInsightsTopExpenses(queryJSON: Readonly<SearchQueryJSON>): TopExpenses {
    const {translate, localeCompare, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const session = useSession();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}`);
    useShowSearchSnapshots([queryJSON.hash]);

    const isLoaded = isSearchDataLoaded(snapshot, queryJSON);
    const hasErrors = !isEmptyObject(snapshot?.errors);

    const state = getInsightsDetailsSectionState({isOffline, isLoaded, hasErrors, responseJsonCode: snapshot?.search?.responseJsonCode});

    if (!snapshot?.data || state !== INSIGHTS_DETAILS_SECTION_STATE.READY) {
        return {expenses: [], state};
    }

    const [sections] = getSections({
        dateFnsLocale,
        type: queryJSON.type,
        data: snapshot.data,
        currentAccountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
        currentUserEmail: session?.email ?? '',
        translate,
        formatPhoneNumber,
        bankAccountList: undefined,
        rules,
        conciergeReportID,
        convertToDisplayString,
        reportAttributesDerivedValue: undefined,
        queryJSON,
    });
    // The server sorts by the converted amount, while the client can only sort by each expense's own currency
    const sortedItems = snapshot.orderedKeys
        ? snapshot.orderedKeys.map((key) => sections.find((item) => 'transactionID' in item && `${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}` === key))
        : getSortedSections(queryJSON.type, sections, localeCompare, translate, queryJSON.sortBy, queryJSON.sortOrder);
    const expenses = sortedItems
        .filter((item): item is TransactionListItemType => !!item && 'transactionID' in item && item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .slice(0, queryJSON.limit);

    return {expenses, state};
}

export default useInsightsTopExpenses;
