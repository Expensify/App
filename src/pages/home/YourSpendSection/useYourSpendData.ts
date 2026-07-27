import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {search} from '@libs/actions/Search';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getDisplayableExpensifyCards, getDisplayableThirdPartyCards, isPersonalCard, lastFourNumbersFromCardName} from '@libs/CardUtils';
import {arePaymentsEnabled, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, Policy, Report} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {AnyRequest} from '@src/types/onyx/Request';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useMemo, useState} from 'react';

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
    // True when offline with a queued change that would move this specific total,
    // so its row renders greyed out until the next online refresh.
    isApprovalStale: boolean;
    isPaymentStale: boolean;
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

// Offline queue commands that move each "Your spend" total. Read from the action
// queue rather than inferred from a report's status, because a report can pass
// through several states offline (e.g. approve then pay) and only its final status
// would otherwise survive — dropping the earlier action's stale signal.
const YOUR_SPEND_APPROVAL_COMMANDS = new Set<string>([
    WRITE_COMMANDS.SUBMIT_REPORT,
    WRITE_COMMANDS.RETRACT_REPORT,
    WRITE_COMMANDS.APPROVE_MONEY_REQUEST,
    WRITE_COMMANDS.UNAPPROVE_EXPENSE_REPORT,
]);
const YOUR_SPEND_PAYMENT_COMMANDS = new Set<string>([
    WRITE_COMMANDS.PAY_MONEY_REQUEST,
    WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET,
    WRITE_COMMANDS.MARK_REPORT_PAYMENT_RECEIVED,
    WRITE_COMMANDS.CANCEL_PAYMENT,
]);

type YourSpendPendingBuckets = {
    // A queued offline change would move the "Awaiting approval" (status:outstanding) total.
    approval: boolean;
    // A queued offline change would move the "Repaid last 30 days" (status:paid) total.
    payment: boolean;
};

// Which reports the user owns on a paid group workspace, plus the totals an amount
// change (edit / delete / reject; marked by `pendingFields.total`) would move. Amount
// changes keep a report in the same bucket, so the report's current status classifies
// them; state transitions are handled from the queue instead.
//
// Reduced to primitives (a sorted ID signature, not a per-report map) because this is
// the output Onyx deep-equals on every change to the REPORT collection.
type YourSpendReportsSignature = {
    // Sorted, comma-joined IDs of those reports, used to scope queued commands to them.
    ownedReportIDs: string;
    amount: YourSpendPendingBuckets;
};

function getYourSpendReportsSignature(reports: OnyxCollection<Report> | undefined, paidGroupPolicyIDs: string[], accountID: number): YourSpendReportsSignature {
    const signature: YourSpendReportsSignature = {ownedReportIDs: '', amount: {approval: false, payment: false}};
    if (!reports || paidGroupPolicyIDs.length === 0) {
        return signature;
    }
    const policyIDSet = new Set(paidGroupPolicyIDs);
    const ids: string[] = [];
    for (const report of Object.values(reports)) {
        if (report?.ownerAccountID !== accountID || !report?.policyID || !policyIDSet.has(report.policyID) || report.statusNum === undefined) {
            continue;
        }
        ids.push(report.reportID);
        if (report.pendingFields?.total == null) {
            continue;
        }
        if (report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED) {
            signature.amount.approval = true;
        } else if (report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED) {
            signature.amount.payment = true;
        }
    }
    signature.ownedReportIDs = ids.sort().join(',');
    return signature;
}

// A queued "Your spend" command reduced to the only fields staleness needs. Full
// requests carry large optimistic/success/failure payloads that Onyx would deep-equal
// on every queue mutation.
type QueuedSpendRequest = {
    command: string;
    reportID: string | undefined;
};

function projectQueuedSpendRequests(requests: AnyRequest[] | undefined): QueuedSpendRequest[] {
    const projected: QueuedSpendRequest[] = [];
    for (const request of requests ?? []) {
        const command = request?.command;
        if (!command || (!YOUR_SPEND_APPROVAL_COMMANDS.has(command) && !YOUR_SPEND_PAYMENT_COMMANDS.has(command))) {
            continue;
        }
        // Report-level commands carry `reportID`; money-request commands (e.g. pay) carry `iouReportID`.
        const rawReportID = request.data?.reportID ?? request.data?.iouReportID;
        projected.push({command, reportID: typeof rawReportID === 'string' ? rawReportID : undefined});
    }
    return projected;
}

// Which "Your spend" totals a queued offline change would move. The totals come
// from server-computed search snapshots we cannot recompute offline, so instead of
// patching a value we can't trust we detect that a relevant change is pending and
// grey only the affected total until the next online refresh.
//
// State transitions (submit / retract / approve / unapprove / pay / cancel) are read
// from the offline action queue: every queued command persists for the whole offline
// session, so a report that was approved and then paid keeps BOTH signals. Amount
// changes (edit / delete / reject) don't move a report between buckets, so they're
// classified by the report's current status (see getYourSpendReportsSignature).
function getYourSpendPendingBuckets(reportsSignature: YourSpendReportsSignature, queuedRequests: QueuedSpendRequest[] | undefined): YourSpendPendingBuckets {
    const buckets: YourSpendPendingBuckets = {approval: reportsSignature.amount.approval, payment: reportsSignature.amount.payment};
    const ownedReportIDs = new Set(reportsSignature.ownedReportIDs ? reportsSignature.ownedReportIDs.split(',') : []);
    for (const {command, reportID} of queuedRequests ?? []) {
        // Only count commands acting on one of the user's own paid-group reports.
        if (!reportID || !ownedReportIDs.has(reportID)) {
            continue;
        }
        if (YOUR_SPEND_APPROVAL_COMMANDS.has(command)) {
            buckets.approval = true;
        } else {
            buckets.payment = true;
        }
        if (buckets.approval && buckets.payment) {
            break;
        }
    }
    return buckets;
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

    // Which totals a queued offline change would move. When offline we can't
    // refresh the snapshots, so we grey only the affected total to signal it may
    // be stale rather than showing a value we know might be wrong.
    const [reportsSignature] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => getYourSpendReportsSignature(reports, paidGroupPolicyIDs, accountID),
    });
    const [queuedSpendRequests] = useOnyx(ONYXKEYS.PERSISTED_REQUESTS, {selector: projectQueuedSpendRequests});
    const pendingSpendBuckets = useMemo(
        () => getYourSpendPendingBuckets(reportsSignature ?? {ownedReportIDs: '', amount: {approval: false, payment: false}}, queuedSpendRequests),
        [reportsSignature, queuedSpendRequests],
    );

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
    const applicabilityKey = [isApprovalApplicable ? 1 : 0, isPaymentApplicable ? 1 : 0, paidGroupPolicyIDs.join(','), outstandingReportsSignature ?? ''].join('|');

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
    }, [isFocused, isOffline, displayableCardIDsKey, applicabilityKey, accountID]);

    return {
        approvalRowState,
        approvalTotals,
        paymentRowState,
        paymentTotals,
        cardRows,
        awaitingApprovalQuery,
        repaidLast30DaysQuery,
        isApprovalStale: isOffline && !!pendingSpendBuckets?.approval,
        isPaymentStale: isOffline && !!pendingSpendBuckets?.payment,
    };
}

export {
    YOUR_SPEND_CARD_KIND,
    YOUR_SPEND_ROW_STATE,
    getOutstandingReportsSignature,
    getYourSpendApplicability,
    getYourSpendPendingBuckets,
    getYourSpendReportsSignature,
    getYourSpendRowState,
    projectQueuedSpendRequests,
    useYourSpendData,
};
export type {
    GetYourSpendRowStateParams,
    QueuedSpendRequest,
    UseYourSpendDataReturn,
    YourSpendApplicability,
    YourSpendCardKind,
    YourSpendCardRow,
    YourSpendPendingBuckets,
    YourSpendReportsSignature,
    YourSpendRowState,
    YourSpendRowTotals,
};
