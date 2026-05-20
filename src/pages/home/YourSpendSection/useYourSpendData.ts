import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useMemo, useState} from 'react';
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
    // Fraction (0–1) of the card's unapproved expense limit that has been spent.
    // `undefined` when the card has no limit configured, in which case the consumer
    // should not render the remaining-limit indicator.
    spentFraction: number | undefined;
};

type YourSpendApplicability = {
    isApprovalApplicable: boolean;
    isPaymentApplicable: boolean;
};

function getYourSpendApplicability(policies: OnyxCollection<Policy> | undefined): YourSpendApplicability {
    const policyList = Object.values(policies ?? {});
    const isApprovalApplicable = policyList.some((policy) => hasApprovalFlow(policy));
    const isPaymentApplicable = policyList.some((policy) => isPaidGroupPolicy(policy) && arePaymentsEnabled(policy ?? undefined));
    return {isApprovalApplicable, isPaymentApplicable};
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

    const awaitingApprovalQuery = buildAwaitingApprovalQuery(accountID);
    const repaidLast30DaysQuery = buildRepaidLast30DaysQuery(accountID);

    const approvalQueryJSON = buildSearchQueryJSON(awaitingApprovalQuery);
    const paymentQueryJSON = buildSearchQueryJSON(repaidLast30DaysQuery);

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [approvalSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${approvalQueryJSON?.hash}`);
    const [paymentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${paymentQueryJSON?.hash}`);

    const {isApprovalApplicable, isPaymentApplicable} = getYourSpendApplicability(policies);

    // Anchor for the displayable-cards memoization chain. The compiler chooses
    // not to extract `getDisplayableExpensifyCards(cardList)` into a cache slot
    // on its own, so without this `useMemo` every downstream value derived from
    // `displayableCards` (cardQueryByCardID, cardSnapshotKeys, cardSnapshotsSelector,
    // cardRows, the useOnyx options object) gets a new identity every render —
    // which then defeats the compiler's own caches for those values.
    const displayableCards = useMemo(() => getDisplayableExpensifyCards(cardList), [cardList]);

    // Stable signature of the displayable card IDs. Used as a dependency for the
    // search-firing effect so it re-runs when cards finish loading after first
    // focus, without re-firing on unrelated cardList updates.
    const displayableCardIDsKey = displayableCards
        .map((card) => card.cardID)
        .sort((a, b) => a - b)
        .join(',');

    // For each displayable card, precompute the query string and its parsed JSON exactly once.
    // Reused below for snapshot lookup, card-row construction, and firing the search.
    // Kept as `useMemo` (rather than relying on the compiler) because it's a chain
    // anchor: cardSnapshotKeys/cardSnapshotsSelector/cardRows all depend on this.
    const cardQueryByCardID = useMemo(
        () =>
            displayableCards.reduce<Record<number, {query: string; queryJSON: ReturnType<typeof buildSearchQueryJSON>}>>((acc, card) => {
                const query = buildRecentCardTransactionsQuery(accountID, card.cardID);
                acc[card.cardID] = {query, queryJSON: buildSearchQueryJSON(query)};
                return acc;
            }, {}),
        [displayableCards, accountID],
    );

    // Onyx subscribes to the snapshot collection but the selector narrows the
    // observed data to only the snapshots for our displayable cards. useOnyx
    // does a deep equality check on selector output, so unrelated snapshot
    // mutations elsewhere in the app no longer re-render this hook's consumers.
    // The projection is further narrowed to just {count, total, currency} so the
    // deep-equal comparison is O(1) per card instead of O(transactions).
    // Kept as `useMemo` because `cardSnapshotsSelector` (and therefore the
    // `{selector}` options object passed to `useOnyx`) depends on this array's
    // identity.
    const cardSnapshotKeys = useMemo(
        () =>
            Object.values(cardQueryByCardID)
                .map((entry) => entry.queryJSON?.hash)
                .filter((hash): hash is number => hash !== undefined)
                .map((hash) => `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`),
        [cardQueryByCardID],
    );

    type CardSnapshotSummary = {
        count: number | undefined;
        total: number | undefined;
        currency: string | undefined;
    };

    const cardSnapshotsSelector = (snapshots: OnyxCollection<SearchResults> | undefined): Record<string, CardSnapshotSummary | undefined> | undefined => {
        if (!snapshots || cardSnapshotKeys.length === 0) {
            return undefined;
        }
        const projected: Record<string, CardSnapshotSummary | undefined> = {};
        for (const key of cardSnapshotKeys) {
            const s = snapshots[key];
            projected[key] = s ? {count: s.search.count, total: s.search.total, currency: s.search.currency} : undefined;
        }
        return projected;
    };
    const [cardSnapshots] = useOnyx(ONYXKEYS.COLLECTION.SNAPSHOT, {selector: cardSnapshotsSelector});

    // Returned to consumers and rendered as a list, so we want a stable identity
    // when nothing relevant changed. Kept as `useMemo` because the compiler does
    // not extract this reduce into a cache slot on its own.
    const cardRows: YourSpendCardRow[] = useMemo(
        () =>
            displayableCards.reduce<YourSpendCardRow[]>((acc, card) => {
                const entry = cardQueryByCardID[card.cardID];
                const hash = entry?.queryJSON?.hash;
                const snapshotKey = hash !== undefined ? `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` : undefined;
                const snapshot = snapshotKey ? cardSnapshots?.[snapshotKey] : undefined;
                if (!entry || !snapshot?.count) {
                    return acc;
                }
                const unapprovedExpenseLimit = card.nameValuePairs?.unapprovedExpenseLimit;
                const spentFraction = unapprovedExpenseLimit ? 1 - (card.availableSpend ?? 0) / unapprovedExpenseLimit : undefined;
                acc.push({
                    cardID: card.cardID,
                    lastFour: card.lastFourPAN ?? '',
                    query: entry.query,
                    total: snapshot.total,
                    currency: snapshot.currency,
                    spentFraction,
                });
                return acc;
            }, []),
        [displayableCards, cardQueryByCardID, cardSnapshots],
    );

    const approvalRowStateRaw = getYourSpendRowState({isApplicable: isApprovalApplicable, isOffline, searchResults: approvalSearchResults});
    const paymentRowStateRaw = getYourSpendRowState({isApplicable: isPaymentApplicable, isOffline, searchResults: paymentSearchResults});

    const approvalTotalsRaw: YourSpendRowTotals = {total: approvalSearchResults?.search.total, currency: approvalSearchResults?.search.currency};
    const paymentTotalsRaw: YourSpendRowTotals = {total: paymentSearchResults?.search.total, currency: paymentSearchResults?.search.currency};

    // The Search screen reuses the same snapshot key for the same query and fires `search()` with
    // `shouldCalculateTotals: false` (default). That optimistically clears `count/total/currency`
    // on the shared snapshot, then the response SETs `search` without totals — causing this row to
    // briefly flip to HIDDEN_EMPTY between navigation and the home re-fetch. Cache the last READY
    // totals and reuse them whenever the snapshot is loaded but its count has been wiped. A
    // genuine `count === 0` is still treated as empty.
    const [cachedApprovalReady, setCachedApprovalReady] = useState<YourSpendRowTotals | null>(null);
    const [cachedPaymentReady, setCachedPaymentReady] = useState<YourSpendRowTotals | null>(null);

    if (
        approvalRowStateRaw === YOUR_SPEND_ROW_STATE.READY &&
        (!cachedApprovalReady || cachedApprovalReady.total !== approvalTotalsRaw.total || cachedApprovalReady.currency !== approvalTotalsRaw.currency)
    ) {
        setCachedApprovalReady({total: approvalTotalsRaw.total, currency: approvalTotalsRaw.currency});
    }
    if (
        paymentRowStateRaw === YOUR_SPEND_ROW_STATE.READY &&
        (!cachedPaymentReady || cachedPaymentReady.total !== paymentTotalsRaw.total || cachedPaymentReady.currency !== paymentTotalsRaw.currency)
    ) {
        setCachedPaymentReady({total: paymentTotalsRaw.total, currency: paymentTotalsRaw.currency});
    }

    const approvalCount = approvalSearchResults?.search.count;
    const paymentCount = paymentSearchResults?.search.count;
    const approvalCountIsMissing = approvalCount === undefined || approvalCount === null;
    const paymentCountIsMissing = paymentCount === undefined || paymentCount === null;

    const shouldUseCachedApproval =
        approvalRowStateRaw === YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY && approvalCountIsMissing && approvalSearchResults !== undefined && cachedApprovalReady !== null;
    const shouldUseCachedPayment = paymentRowStateRaw === YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY && paymentCountIsMissing && paymentSearchResults !== undefined && cachedPaymentReady !== null;

    const approvalRowState = shouldUseCachedApproval ? YOUR_SPEND_ROW_STATE.READY : approvalRowStateRaw;
    const paymentRowState = shouldUseCachedPayment ? YOUR_SPEND_ROW_STATE.READY : paymentRowStateRaw;
    const approvalTotals: YourSpendRowTotals = shouldUseCachedApproval && cachedApprovalReady ? cachedApprovalReady : approvalTotalsRaw;
    const paymentTotals: YourSpendRowTotals = shouldUseCachedPayment && cachedPaymentReady ? cachedPaymentReady : paymentTotalsRaw;

    // Stable key that changes whenever approval/payment applicability flips, so the
    // search-firing effect re-runs and the gating inside fireSearches takes effect.
    const applicabilityKey = `${isApprovalApplicable ? 1 : 0}${isPaymentApplicable ? 1 : 0}`;

    const fireSearches = useEffectEvent(() => {
        if (isOffline) {
            return;
        }
        for (const card of displayableCards) {
            const cardQueryJSON = cardQueryByCardID[card.cardID]?.queryJSON;
            if (!cardQueryJSON) {
                continue;
            }
            search({
                queryJSON: cardQueryJSON,
                searchKey: undefined,
                offset: 0,
                isOffline,
                isLoading: false,
                shouldCalculateTotals: true,
                shouldUpdateLastSearchParams: false,
            });
        }
        if (isApprovalApplicable && approvalQueryJSON) {
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
        if (isPaymentApplicable && paymentQueryJSON) {
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
    }, [isFocused, isOffline, displayableCardIDsKey, applicabilityKey]);

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
