import {useSession} from '@components/OnyxListItemProvider';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON, SearchQueryString} from '@components/Search/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {getSections, getSortedSections, isSearchDataLoaded} from '@libs/SearchUIUtils';

import {buildTopExpensesQueryJSON} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {InsightsDetailsQuery} from './buildInsightsDetailsQuery';
import type {InsightsDetailsSectionState} from './insightsDetailsSectionState';

import {getInsightsDetailsSectionState, INSIGHTS_DETAILS_SECTION_STATE} from './insightsDetailsSectionState';

type TopExpenses = {
    expenses: TransactionListItemType[];
    queryJSON: Readonly<SearchQueryJSON> | undefined;
    state: InsightsDetailsSectionState;
};

/** Returns the largest expenses the Details panel's request stored for a Spend table query, as Spend rows sorted by amount. */
function useInsightsTopExpenses(query: SearchQueryString, detailsQuery: InsightsDetailsQuery): TopExpenses {
    const {translate, localeCompare, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const session = useSession();
    const [details] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS_DETAILS}${detailsQuery.hash}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${detailsQuery.topExpensesSnapshotHash}`);
    const queryJSON = buildTopExpensesQueryJSON(query);

    const isLoaded = isSearchDataLoaded(snapshot, queryJSON);
    // A failed request stores its errors on the panel's entry, not on the snapshot
    const hasErrors = !isEmptyObject(details?.errors) || !isEmptyObject(snapshot?.errors);

    const state = getInsightsDetailsSectionState({isOffline, isLoaded, hasErrors, responseJsonCode: details?.responseJsonCode ?? snapshot?.search?.responseJsonCode});

    if (!queryJSON || !snapshot?.data || state !== INSIGHTS_DETAILS_SECTION_STATE.READY) {
        return {expenses: [], queryJSON, state};
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
    const expenses = getSortedSections(queryJSON.type, sections, localeCompare, translate, queryJSON.sortBy, queryJSON.sortOrder)
        .filter((item): item is TransactionListItemType => 'transactionID' in item && item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .slice(0, queryJSON.limit);

    return {expenses, queryJSON, state};
}

export default useInsightsTopExpenses;
