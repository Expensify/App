import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useMemo, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {search} from '@libs/actions/Search';
import {getDisplayableExpensifyCards} from '@libs/CardUtils';
import {arePaymentsEnabled, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
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
    // IDs of the user's Team/Corporate workspaces. Used to scope the
    // "Awaiting approval" query so IOU and personal expenses don't count.
    paidGroupPolicyIDs: string[];
};

function getYourSpendApplicability(policies: OnyxCollection<Policy> | undefined): YourSpendApplicability {
    const paidGroupPolicyIDs: string[] = [];
    let isPaymentApplicable = false;
    for (const policy of Object.values(policies ?? {})) {
        if (policy?.id && isPaidGroupPolicy(policy)) {
            paidGroupPolicyIDs.push(policy.id);
            if (!isPaymentApplicable && arePaymentsEnabled(policy)) {
                isPaymentApplicable = true;
            }
        }
    }
    return {
        isApprovalApplicable: paidGroupPolicyIDs.length > 0,
        isPaymentApplicable,
        paidGroupPolicyIDs,
    };
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

function getOutstandingReportsSignature(reports: OnyxCollection<Report> | undefined, paidGroupPolicyIDs: string[], accountID: number): string {
    if (!reports || paidGroupPolicyIDs.length === 0) {
        return '';
    }
    const policyIDSet = new Set(paidGroupPolicyIDs);
    const ids: string[] = [];
    for (const report of Object.values(reports)) {
        if (
            report?.policyID &&
            policyIDSet.has(report.policyID) &&
            report.ownerAccountID === accountID &&
            report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED &&
            report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED
        ) {
            ids.push(report.reportID);
        }
    }
    return ids.sort().join(',');
}

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

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    const {isApprovalApplicable, isPaymentApplicable, paidGroupPolicyIDs} = getYourSpendApplicability(policies);

    const awaitingApprovalQuery = buildAwaitingApprovalQuery(accountID, paidGroupPolicyIDs);
    const repaidLast30DaysQuery = buildRepaidLast30DaysQuery(accountID);

    const approvalQueryJSON = buildSearchQueryJSON(awaitingApprovalQuery);
    const paymentQueryJSON = buildSearchQueryJSON(repaidLast30DaysQuery);

    const [approvalSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${approvalQueryJSON?.hash}`);
    const [paymentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${paymentQueryJSON?.hash}`);

    // Signature of the reports the user owns on a paid group workspace that are currently
    // OUTSTANDING (awaiting approval). The home query results are cached snapshots that are
    // not patched when a report's state changes, so without this the "Awaiting approval"
    // total stays stale after the user approves their last outstanding expense. Folding the
    // signature into the search effect's key refires the search whenever a report enters or
    // leaves the OUTSTANDING state.
    const [outstandingReportsSignature] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => getOutstandingReportsSignature(reports, paidGroupPolicyIDs, accountID),
    });

    // Memo anchor. The compiler does not auto-cache this call, so without the
    // `useMemo` every downstream value derived from `displayableCards` would
    // get a new identity each render and defeat the compiler's downstream caches.
    const displayableCards = useMemo(() => getDisplayableExpensifyCards(cardList), [cardList]);

    // Stable signature of the displayable card IDs. Used as a dependency for the
    // search-firing effect so it re-runs when cards finish loading after first
    // focus, without re-firing on unrelated cardList updates.
    const displayableCardIDsKey = displayableCards
        .map((card) => card.cardID)
        .sort((a, b) => a - b)
        .join(',');

    // Precompute the query string and parsed JSON per card. Another memo anchor:
    // downstream caches key off this object's identity.
    const cardQueryByCardID = useMemo(
        () =>
            displayableCards.reduce<Record<number, {query: string; queryJSON: ReturnType<typeof buildSearchQueryJSON>}>>((acc, card) => {
                const query = buildRecentCardTransactionsQuery(accountID, card.cardID);
                acc[card.cardID] = {query, queryJSON: buildSearchQueryJSON(query)};
                return acc;
            }, {}),
        [displayableCards, accountID],
    );

    // Narrow the snapshot subscription to our displayable cards and project to just
    // {count, total, currency}, so `useOnyx`'s deep-equal on selector output is
    // O(1) per card and unrelated snapshot mutations don't re-render us.
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

    // Per-card equivalent of the approval/payment cache below; see that comment
    // for the full mechanic. Cached by cardID so each row keeps its last READY
    // totals when the shared snapshot is wiped by the Search screen.
    const [cachedCardTotals, setCachedCardTotals] = useState<Record<number, YourSpendRowTotals>>({});

    const cardCacheUpdates: Record<number, YourSpendRowTotals> = {};
    let hasCardCacheUpdates = false;
    for (const card of displayableCards) {
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

    // `useMemo` to keep a stable identity for the consumer list; the compiler
    // does not extract this reduce on its own.
    const cardRows: YourSpendCardRow[] = useMemo(
        () =>
            displayableCards.reduce<YourSpendCardRow[]>((acc, card) => {
                const entry = cardQueryByCardID[card.cardID];
                if (!entry) {
                    return acc;
                }
                const hash = entry.queryJSON?.hash;
                const snapshotKey = hash !== undefined ? `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` : undefined;
                const snapshot = snapshotKey ? cardSnapshots?.[snapshotKey] : undefined;

                // Snapshot loaded but its count was wiped by the Search screen — fall back
                // to cached READY totals. "Snapshot never loaded" and "count === 0" both
                // leave the row hidden.
                const countIsMissing = snapshot !== undefined && (snapshot.count === undefined || snapshot.count === null);
                const cached = cachedCardTotals[card.cardID];
                const shouldUseCached = countIsMissing && cached !== undefined;

                if (!snapshot?.count && !shouldUseCached) {
                    return acc;
                }

                const total = snapshot?.count ? snapshot.total : cached?.total;
                const currency = snapshot?.count ? snapshot.currency : cached?.currency;

                const unapprovedExpenseLimit = card.nameValuePairs?.unapprovedExpenseLimit;
                const spentFraction = unapprovedExpenseLimit ? 1 - (card.availableSpend ?? 0) / unapprovedExpenseLimit : undefined;
                acc.push({
                    cardID: card.cardID,
                    lastFour: card.lastFourPAN ?? '',
                    query: entry.query,
                    total,
                    currency,
                    spentFraction,
                });
                return acc;
            }, []),
        [displayableCards, cardQueryByCardID, cardSnapshots, cachedCardTotals],
    );

    const approvalRowStateRaw = getYourSpendRowState({isApplicable: isApprovalApplicable, isOffline, searchResults: approvalSearchResults});
    const paymentRowStateRaw = getYourSpendRowState({isApplicable: isPaymentApplicable, isOffline, searchResults: paymentSearchResults});

    const approvalTotalsRaw: YourSpendRowTotals = {total: approvalSearchResults?.search.total, currency: approvalSearchResults?.search.currency};
    const paymentTotalsRaw: YourSpendRowTotals = {total: paymentSearchResults?.search.total, currency: paymentSearchResults?.search.currency};

    // The Search screen reuses the same snapshot key and calls `search()` with
    // `shouldCalculateTotals: false`, wiping `count/total/currency` on the shared
    // snapshot and briefly flipping this row to HIDDEN_EMPTY between navigation
    // and the home re-fetch. Cache the last READY totals and reuse them when the
    // snapshot is loaded but its count has been wiped. A genuine `count === 0`
    // is still treated as empty. The approval cache is dropped whenever the query
    // hash changes (i.e. when the user joins/leaves a workspace) so a stale total
    // from the previous workspace set isn't reused for the new one.
    const [cachedApprovalReady, setCachedApprovalReady] = useState<YourSpendRowTotals | null>(null);
    const [cachedApprovalHash, setCachedApprovalHash] = useState<number | undefined>(undefined);
    const [cachedPaymentReady, setCachedPaymentReady] = useState<YourSpendRowTotals | null>(null);

    const approvalHash = approvalQueryJSON?.hash;
    if (cachedApprovalHash !== approvalHash) {
        setCachedApprovalReady(null);
        setCachedApprovalHash(approvalHash);
    }

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

    // Only bridge a wiped/missing count with the cached total while the user still owns an
    // OUTSTANDING report. An empty signature means nothing is awaiting approval, so the row
    // must hide immediately after approving the last expense — a zero-result search returns
    // no count, which would otherwise keep the stale cached total on screen.
    const shouldUseCachedApproval =
        approvalRowStateRaw === YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY &&
        approvalCountIsMissing &&
        approvalSearchResults !== undefined &&
        cachedApprovalReady !== null &&
        cachedApprovalHash === approvalHash &&
        outstandingReportsSignature !== '';
    const shouldUseCachedPayment = paymentRowStateRaw === YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY && paymentCountIsMissing && paymentSearchResults !== undefined && cachedPaymentReady !== null;

    const approvalRowState = shouldUseCachedApproval ? YOUR_SPEND_ROW_STATE.READY : approvalRowStateRaw;
    const paymentRowState = shouldUseCachedPayment ? YOUR_SPEND_ROW_STATE.READY : paymentRowStateRaw;
    const approvalTotals: YourSpendRowTotals = shouldUseCachedApproval && cachedApprovalReady ? cachedApprovalReady : approvalTotalsRaw;
    const paymentTotals: YourSpendRowTotals = shouldUseCachedPayment && cachedPaymentReady ? cachedPaymentReady : paymentTotalsRaw;

    // Re-fires the search effect when applicability flips, the user joins/leaves a workspace
    // (which changes the policyID filter), or the set of OUTSTANDING reports changes.
    const applicabilityKey = `${isApprovalApplicable ? 1 : 0}${isPaymentApplicable ? 1 : 0}|${paidGroupPolicyIDs.join(',')}|${outstandingReportsSignature ?? ''}`;

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

export {YOUR_SPEND_ROW_STATE, getOutstandingReportsSignature, getYourSpendApplicability, getYourSpendRowState, useYourSpendData};
export type {GetYourSpendRowStateParams, UseYourSpendDataReturn, YourSpendApplicability, YourSpendCardRow, YourSpendRowState, YourSpendRowTotals};
