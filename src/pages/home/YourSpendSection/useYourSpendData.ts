import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {search} from '@libs/actions/Search';
import {getDisplayableExpensifyCards} from '@libs/CardUtils';
import {arePaymentsEnabled, hasApprovalFlow, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {CardList} from '@src/types/onyx/Card';
import type SearchResults from '@src/types/onyx/SearchResults';
import YOUR_SPEND_ROW_STATE from './const';
import {buildAwaitingApprovalQuery, buildRecentCardTransactionsQuery, buildRepaidLast30DaysQuery} from './queries';

type YourSpendRowState = ValueOf<typeof YOUR_SPEND_ROW_STATE>;

type GetYourSpendRowStateParams = {
    isApplicable: boolean;
    isOffline: boolean;
    searchResults: OnyxEntry<SearchResults>;
};

type YourSpendCardRow = {
    cardID: number;
    lastFour: string;
    query: string;
    total: number | undefined;
    currency: string | undefined;
};

type YourSpendApplicability = {
    isApprovalApplicable: boolean;
    isPaymentApplicable: boolean;
    isCardApplicable: boolean;
};

function getYourSpendApplicability(policies: OnyxCollection<Policy> | undefined, cardList: CardList | undefined): YourSpendApplicability {
    const policyList = Object.values(policies ?? {});
    const isApprovalApplicable = policyList.some((policy) => hasApprovalFlow(policy));
    const isPaymentApplicable = policyList.some((policy) => isPaidGroupPolicy(policy) && arePaymentsEnabled(policy ?? undefined));
    const isCardApplicable = getDisplayableExpensifyCards(cardList).length > 0;
    return {isApprovalApplicable, isPaymentApplicable, isCardApplicable};
}

type YourSpendRowTotals = {
    total: number | undefined;
    currency: string | undefined;
};

type UseYourSpendDataReturn = {
    approvalRowState: YourSpendRowState;
    approvalTotals: YourSpendRowTotals;
    paymentRowState: YourSpendRowState;
    paymentTotals: YourSpendRowTotals;
    cardRows: YourSpendCardRow[];
    awaitingApprovalQuery: string;
    repaidLast30DaysQuery: string;
};

function getYourSpendRowState({isApplicable, isOffline, searchResults}: GetYourSpendRowStateParams): YourSpendRowState {
    if (!isApplicable) {
        return YOUR_SPEND_ROW_STATE.HIDDEN;
    }
    if (isOffline && !searchResults) {
        return YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY;
    }
    if (!searchResults) {
        return YOUR_SPEND_ROW_STATE.LOADING;
    }
    if (!searchResults.search.count) {
        return YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY;
    }
    return YOUR_SPEND_ROW_STATE.READY;
}

function useYourSpendData(): UseYourSpendDataReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();

    const awaitingApprovalQuery = useMemo(() => buildAwaitingApprovalQuery(accountID), [accountID]);
    const repaidLast30DaysQuery = useMemo(() => buildRepaidLast30DaysQuery(accountID), [accountID]);

    const approvalQueryJSON = useMemo(() => buildSearchQueryJSON(awaitingApprovalQuery), [awaitingApprovalQuery]);
    const paymentQueryJSON = useMemo(() => buildSearchQueryJSON(repaidLast30DaysQuery), [repaidLast30DaysQuery]);

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [approvalSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${approvalQueryJSON?.hash}`);
    const [paymentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${paymentQueryJSON?.hash}`);
    const [allSnapshots] = useOnyx(ONYXKEYS.COLLECTION.SNAPSHOT);

    const {isApprovalApplicable, isPaymentApplicable} = useMemo(() => getYourSpendApplicability(policies, cardList), [policies, cardList]);

    const displayableCards = useMemo(() => getDisplayableExpensifyCards(cardList), [cardList]);

    // Map cardID → snapshot hash so we can look up totals from allSnapshots
    const cardQueryHashByCardID = useMemo(
        () =>
            displayableCards.reduce<Record<number, number | undefined>>((acc, card) => {
                const cardQuery = buildRecentCardTransactionsQuery(accountID, card.cardID);
                acc[card.cardID] = buildSearchQueryJSON(cardQuery)?.hash;
                return acc;
            }, {}),
        [displayableCards, accountID],
    );

    const cardRows: YourSpendCardRow[] = useMemo(
        () =>
            displayableCards.map((card) => {
                const hash = cardQueryHashByCardID[card.cardID];
                const snapshot = hash !== undefined ? allSnapshots?.[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`] : undefined;
                return {
                    cardID: card.cardID,
                    lastFour: card.lastFourPAN ?? '',
                    query: buildRecentCardTransactionsQuery(accountID, card.cardID),
                    total: snapshot?.search.total,
                    currency: snapshot?.search.currency,
                };
            }),
        [displayableCards, accountID, cardQueryHashByCardID, allSnapshots],
    );

    const approvalRowState = getYourSpendRowState({isApplicable: isApprovalApplicable, isOffline, searchResults: approvalSearchResults});
    const paymentRowState = getYourSpendRowState({isApplicable: isPaymentApplicable, isOffline, searchResults: paymentSearchResults});

    const approvalTotals: YourSpendRowTotals = {total: approvalSearchResults?.search.total, currency: approvalSearchResults?.search.currency};
    const paymentTotals: YourSpendRowTotals = {total: paymentSearchResults?.search.total, currency: paymentSearchResults?.search.currency};

    const fireSearches = useEffectEvent(() => {
        if (isOffline) {
            return;
        }
        if (approvalQueryJSON) {
            search({
                queryJSON: approvalQueryJSON,
                searchKey: undefined,
                offset: 0,
                isOffline,
                isLoading: false,
                shouldCalculateTotals: true,
                shouldUpdateLastSearchParams: false,
            });
        }
        if (paymentQueryJSON) {
            search({
                queryJSON: paymentQueryJSON,
                searchKey: undefined,
                offset: 0,
                isOffline,
                isLoading: false,
                shouldCalculateTotals: true,
                shouldUpdateLastSearchParams: false,
            });
        }
    });

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        fireSearches();
    }, [isFocused, isOffline]);

    return {
        approvalRowState,
        approvalTotals,
        paymentRowState,
        paymentTotals,
        cardRows,
        awaitingApprovalQuery,
        repaidLast30DaysQuery,
    };
}

export {YOUR_SPEND_ROW_STATE, getYourSpendApplicability, getYourSpendRowState, useYourSpendData};
export type {GetYourSpendRowStateParams, UseYourSpendDataReturn, YourSpendApplicability, YourSpendCardRow, YourSpendRowState, YourSpendRowTotals};
