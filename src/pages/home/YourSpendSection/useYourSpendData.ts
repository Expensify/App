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

type UseYourSpendDataReturn = {
    approvalRowState: YourSpendRowState;
    paymentRowState: YourSpendRowState;
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

    const {isApprovalApplicable, isPaymentApplicable} = useMemo(() => getYourSpendApplicability(policies, cardList), [policies, cardList]);

    const displayableCards = useMemo(() => getDisplayableExpensifyCards(cardList), [cardList]);
    const cardRows: YourSpendCardRow[] = useMemo(
        () =>
            displayableCards.map((card) => ({
                cardID: card.cardID,
                lastFour: card.lastFourPAN ?? '',
                query: buildRecentCardTransactionsQuery(accountID, card.cardID),
            })),
        [displayableCards, accountID],
    );

    const approvalRowState = getYourSpendRowState({isApplicable: isApprovalApplicable, isOffline, searchResults: approvalSearchResults});
    const paymentRowState = getYourSpendRowState({isApplicable: isPaymentApplicable, isOffline, searchResults: paymentSearchResults});

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
        paymentRowState,
        cardRows,
        awaitingApprovalQuery,
        repaidLast30DaysQuery,
    };
}

export {YOUR_SPEND_ROW_STATE, getYourSpendApplicability, getYourSpendRowState, useYourSpendData};
export type {GetYourSpendRowStateParams, UseYourSpendDataReturn, YourSpendApplicability, YourSpendCardRow, YourSpendRowState};
