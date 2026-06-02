import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useMemo, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {search} from '@libs/actions/Search';
import {getDisplayableExpensifyCards, getDisplayableThirdPartyCards, isPersonalCard, lastFourNumbersFromCardName} from '@libs/CardUtils';
import {arePaymentsEnabled, hasApprovalFlow, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, Policy} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type SearchResults from '@src/types/onyx/SearchResults';
import {YOUR_SPEND_CARD_KIND, YOUR_SPEND_ROW_STATE} from './const';
import {buildAwaitingApprovalQuery, buildRecentCardTransactionsQuery, buildRepaidLast30DaysQuery} from './queries';

type YourSpendRowState = ValueOf<typeof YOUR_SPEND_ROW_STATE>;
type YourSpendCardKind = ValueOf<typeof YOUR_SPEND_CARD_KIND>;

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

    // Fraction (0–1) of the card's unapproved expense limit. `undefined` when no
    // limit is configured or for third-party rows; suppresses the limit indicator.
    spentFraction: number | undefined;

    kind: YourSpendCardKind;
    bank: CardFeedWithNumber;

    // Set for employer-feed third-party cards; `undefined` for personal Plaid cards.
    fundID: string | undefined;

    // `isPersonalCard` semantics (no `fundID`, `fundID === '0'`, or CSV bank). Personal
    // cards render the bare bank artwork; employer-feed cards key the icon by `feed|domainID`.
    isPersonal: boolean;
};

type TaggedCard = {card: Card; kind: YourSpendCardKind};

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

    // Destructure here so downstream memos depend only on the sub-records, not on
    // the parent value that's rebuilt on every CARD_FEED_ERRORS tick.
    const {cardsWithBrokenFeedConnection, personalCardsWithBrokenConnection} = useCardFeedErrors();

    // Memo anchor: the compiler does not auto-cache these calls, so downstream
    // memos would invalidate every render without it.
    const expensifyCards = useMemo(() => getDisplayableExpensifyCards(cardList), [cardList]);
    const thirdPartyCards = useMemo(
        () => getDisplayableThirdPartyCards(cardList, {cardsWithBrokenFeedConnection, personalCardsWithBrokenConnection}),
        [cardList, cardsWithBrokenFeedConnection, personalCardsWithBrokenConnection],
    );

    // Ordering invariant: Expensify Card rows first, then third-party rows.
    const displayableCards = useMemo<TaggedCard[]>(
        () => [
            ...expensifyCards.map((card): TaggedCard => ({card, kind: YOUR_SPEND_CARD_KIND.EXPENSIFY})),
            ...thirdPartyCards.map((card): TaggedCard => ({card, kind: YOUR_SPEND_CARD_KIND.THIRD_PARTY})),
        ],
        [expensifyCards, thirdPartyCards],
    );

    // Stable signature for the search-firing effect — re-fires on card-set changes
    // but not on unrelated `cardList` mutations.
    const displayableCardIDsKey = displayableCards
        .map(({card}) => card.cardID)
        .sort((a, b) => a - b)
        .join(',');

    const cardQueryByCardID = useMemo(
        () =>
            displayableCards.reduce<Record<number, {query: string; queryJSON: ReturnType<typeof buildSearchQueryJSON>}>>((acc, {card}) => {
                const query = buildRecentCardTransactionsQuery(accountID, card.cardID);
                acc[card.cardID] = {query, queryJSON: buildSearchQueryJSON(query)};
                return acc;
            }, {}),
        [displayableCards, accountID],
    );

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

    // Project snapshots down to {count, total, currency} so unrelated snapshot
    // mutations don't re-render us (useOnyx deep-equals selector output).
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

    // Per-card READY totals cache; see the approval/payment cache below for the mechanic.
    const [cachedCardTotals, setCachedCardTotals] = useState<Record<number, YourSpendRowTotals>>({});

    const cardCacheUpdates: Record<number, YourSpendRowTotals> = {};
    let hasCardCacheUpdates = false;
    for (const {card} of displayableCards) {
        const entry = cardQueryByCardID[card.cardID];
        const hash = entry?.queryJSON?.hash;
        const snapshotKey = hash !== undefined ? `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` : undefined;
        const snapshot = snapshotKey ? cardSnapshots?.[snapshotKey] : undefined;
        if (!snapshot?.count) {
            continue;
        }
        const cached = cachedCardTotals[card.cardID];
        if (!cached || cached.total !== snapshot.total || cached.currency !== snapshot.currency) {
            cardCacheUpdates[card.cardID] = {total: snapshot.total, currency: snapshot.currency};
            hasCardCacheUpdates = true;
        }
    }
    if (hasCardCacheUpdates) {
        setCachedCardTotals((prev) => ({...prev, ...cardCacheUpdates}));
    }

    const cardRows: YourSpendCardRow[] = useMemo(
        () =>
            displayableCards.reduce<YourSpendCardRow[]>((acc, {card, kind}) => {
                const entry = cardQueryByCardID[card.cardID];
                if (!entry) {
                    return acc;
                }
                const hash = entry.queryJSON?.hash;
                const snapshotKey = hash !== undefined ? `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` : undefined;
                const snapshot = snapshotKey ? cardSnapshots?.[snapshotKey] : undefined;

                // Snapshot loaded but count wiped by the Search screen — fall back to cached READY totals.
                const countIsMissing = snapshot !== undefined && (snapshot.count === undefined || snapshot.count === null);
                const cached = cachedCardTotals[card.cardID];
                const shouldUseCached = countIsMissing && cached !== undefined;

                if (!snapshot?.count && !shouldUseCached) {
                    return acc;
                }

                const total = snapshot?.count ? snapshot.total : cached?.total;
                const currency = snapshot?.count ? snapshot.currency : cached?.currency;

                // Fallback for third-party cards with empty `lastFourPAN` and digits in `cardName`
                // (e.g. "CREDIT CARD...1234"; no-space names fall through to ""). Ternary so
                // empty-string `lastFourPAN` also falls through.
                const lastFour = card.lastFourPAN ? card.lastFourPAN : lastFourNumbersFromCardName(card.cardName);
                if (!lastFour) {
                    return acc;
                }

                let spentFraction: number | undefined;
                if (kind === YOUR_SPEND_CARD_KIND.EXPENSIFY) {
                    const unapprovedExpenseLimit = card.nameValuePairs?.unapprovedExpenseLimit;
                    spentFraction = unapprovedExpenseLimit ? 1 - (card.availableSpend ?? 0) / unapprovedExpenseLimit : undefined;
                }
                acc.push({
                    cardID: card.cardID,
                    lastFour,
                    query: entry.query,
                    total,
                    currency,
                    spentFraction,
                    kind,
                    bank: card.bank,
                    fundID: card.fundID,
                    isPersonal: isPersonalCard(card),
                });
                return acc;
            }, []),
        [displayableCards, cardQueryByCardID, cardSnapshots, cachedCardTotals],
    );

    const approvalRowStateRaw = getYourSpendRowState({isApplicable: isApprovalApplicable, isOffline, searchResults: approvalSearchResults});
    const paymentRowStateRaw = getYourSpendRowState({isApplicable: isPaymentApplicable, isOffline, searchResults: paymentSearchResults});

    const approvalTotalsRaw: YourSpendRowTotals = {total: approvalSearchResults?.search.total, currency: approvalSearchResults?.search.currency};
    const paymentTotalsRaw: YourSpendRowTotals = {total: paymentSearchResults?.search.total, currency: paymentSearchResults?.search.currency};

    // The Search screen calls `search()` with `shouldCalculateTotals: false` on the
    // same snapshot key, wiping count/total/currency and briefly flipping the row
    // to HIDDEN_EMPTY. Cache the last READY totals and reuse them when the snapshot
    // is loaded but count is missing; a genuine `count === 0` is still empty.
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

    // Re-fires the search effect when approval/payment applicability flips.
    const applicabilityKey = `${isApprovalApplicable ? 1 : 0}${isPaymentApplicable ? 1 : 0}`;

    const fireSearches = useEffectEvent(() => {
        if (isOffline) {
            return;
        }
        for (const {card} of displayableCards) {
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

export {YOUR_SPEND_CARD_KIND, YOUR_SPEND_ROW_STATE, getYourSpendApplicability, getYourSpendRowState, useYourSpendData};
export type {GetYourSpendRowStateParams, UseYourSpendDataReturn, YourSpendApplicability, YourSpendCardKind, YourSpendCardRow, YourSpendRowState, YourSpendRowTotals};
