import {useSession} from '@components/OnyxListItemProvider';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON, SearchQueryString} from '@components/Search/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {search} from '@libs/actions/Search';
import {getSections, getSortedSections, isSearchDataLoaded} from '@libs/SearchUIUtils';

import {buildTopExpensesQueryJSON} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';

const TOP_EXPENSES_STATE = {
    READY: 'ready',
    LOADING: 'loading',
    STALE: 'stale',
    ERROR: 'error',
    OFFLINE: 'offline',
} as const;

type TopExpensesState = ValueOf<typeof TOP_EXPENSES_STATE>;

type TopExpenses = {
    expenses: TransactionListItemType[];
    queryJSON: Readonly<SearchQueryJSON> | undefined;
    state: TopExpensesState;
    retry: () => void;
};

/** Requests the largest expenses in a Spend table query and returns them as Spend rows, sorted by amount. */
function useInsightsTopExpenses(query: SearchQueryString | undefined): TopExpenses {
    const {translate, localeCompare, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const session = useSession();
    const queryJSON = query ? buildTopExpensesQueryJSON(query) : undefined;
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [spendDataSignature] = useOnyx(ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE);

    const retry = () => {
        if (!queryJSON || isOffline) {
            return;
        }
        search({queryJSON, searchKey: undefined, offset: 0, isLoading: false});
    };

    const onRefreshKeyChange = useEffectEvent(retry);

    // An expense edit moves the spend signature and can change which expenses match, so the list is fetched again.
    // A change made while an expense is open on top waits until the user is back on the list.
    const refreshKey = [queryJSON?.hash, isOffline, spendDataSignature?.expenses ?? 0].join('|');
    const lastRefreshKeyRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (!isFocused || refreshKey === lastRefreshKeyRef.current) {
            return;
        }
        lastRefreshKeyRef.current = refreshKey;
        onRefreshKeyChange();
    }, [refreshKey, isFocused]);

    const isLoaded = isSearchDataLoaded(snapshot, queryJSON);
    const hasErrors = Object.keys(snapshot?.errors ?? {}).length > 0;

    let state: TopExpensesState = TOP_EXPENSES_STATE.READY;
    if (isOffline && (!isLoaded || hasErrors)) {
        state = TOP_EXPENSES_STATE.OFFLINE;
    } else if (hasErrors) {
        state = snapshot?.search?.responseJsonCode === CONST.JSON_CODE.NO_RESPONSE ? TOP_EXPENSES_STATE.STALE : TOP_EXPENSES_STATE.ERROR;
    } else if (!isLoaded) {
        state = TOP_EXPENSES_STATE.LOADING;
    }

    if (!queryJSON || !snapshot?.data || state !== TOP_EXPENSES_STATE.READY) {
        return {expenses: [], queryJSON, state, retry};
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

    return {expenses, queryJSON, state, retry};
}

export {TOP_EXPENSES_STATE};
export default useInsightsTopExpenses;
