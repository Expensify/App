import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setOptimisticTransactionThread} from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isOneTransactionReport} from '@libs/ReportUtils';
import type {TransactionThreadNavigationDescriptor} from '@libs/TransactionThreadNavigationUtils';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';
import {isDeletedTransaction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {hasCompletedGuidedSetupFlowSelector, hasSeenTourSelector} from '@src/selectors/Onboarding';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {GestureResponderEvent} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {findFocusedRoute} from '@react-navigation/native';
import React, {startTransition, useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';

const CAROUSEL_PRESERVING_SCREENS = [
    SCREENS.RIGHT_MODAL.SEARCH_REPORT,
    SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT,
    SCREENS.RIGHT_MODAL.EXPENSE_REPORT,
    SCREENS.TRANSACTION_DUPLICATE.DYNAMIC_REVIEW,
] as const;

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentTransactionID: string;
    isFromReviewDuplicates?: boolean;
    shouldDisplayNarrowVersion?: boolean;
};

type PrevNextParentReportActions = {
    prevParentReportAction: OnyxTypes.ReportAction | undefined;
    nextParentReportAction: OnyxTypes.ReportAction | undefined;
};

/** IOU action types that reference a transaction without being the action that created the expense. */
const NON_EXPENSE_CREATION_IOU_TYPES = new Set<string>([
    CONST.IOU.REPORT_ACTION_TYPE.PAY,
    CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
    CONST.IOU.REPORT_ACTION_TYPE.REJECT,
    CONST.IOU.REPORT_ACTION_TYPE.CANCEL,
    CONST.IOU.REPORT_ACTION_TYPE.DELETE,
]);

/**
 * The transaction an action created, or undefined when the action merely references one.
 *
 * Paying, approving or rejecting an expense all produce IOU actions carrying the same `IOUTransactionID`, each with
 * its own thread. Paging onto one of those would open a system message ("marked as paid") rather than the expense.
 * Actions with no `type` are legacy expense-creating actions and are kept.
 */
const getCreatedTransactionID = (action: OnyxTypes.ReportAction): string | undefined => {
    if (!isMoneyRequestAction(action)) {
        return undefined;
    }
    const originalMessage = getOriginalMessage(action);
    if (!originalMessage?.IOUTransactionID) {
        return undefined;
    }
    return !originalMessage.type || !NON_EXPENSE_CREATION_IOU_TYPES.has(originalMessage.type) ? originalMessage.IOUTransactionID : undefined;
};

/**
 * Only the prev/next parent actions are ever read, so resolve them while scanning instead of collecting every money
 * request action on the parent reports (fast-equals compares the resulting collection on every Onyx update).
 */
const collectParentReportActions = (
    reportActions: OnyxEntry<OnyxTypes.ReportActions>,
    prevTransactionID: string | undefined,
    nextTransactionID: string | undefined,
    parentActions: PrevNextParentReportActions,
) => {
    for (const action of Object.values(reportActions ?? {})) {
        const transactionID = getCreatedTransactionID(action);
        if (!transactionID) {
            continue;
        }
        if (transactionID === prevTransactionID) {
            // eslint-disable-next-line no-param-reassign -- intentionally mutates the shared accumulator so callers can resolve both actions in a single pass across multiple report-action sources
            parentActions.prevParentReportAction = action;
        }
        if (transactionID === nextTransactionID) {
            // eslint-disable-next-line no-param-reassign -- intentionally mutates the shared accumulator so callers can resolve both actions in a single pass across multiple report-action sources
            parentActions.nextParentReportAction = action;
        }
    }
};

function MoneyRequestReportTransactionsNavigation({currentTransactionID, isFromReviewDuplicates, shouldDisplayNarrowVersion}: MoneyRequestReportRHPNavigationButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [seededTransactionIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    // When the carousel is opened from a search (e.g. the Spend page), the sibling transactions may only exist
    // in the search snapshot and not in the live collection yet. We keep the snapshot around to fall back to it
    // so prev/next navigation resolves the correct report instead of breaking.
    // `useOnyx`'s automatic snapshot redirection doesn't cover this: it only kicks in inside `SearchScopeProvider`
    // (which wraps the search list, not the RHP this header renders in), it reads the *currently displayed*
    // search hash rather than the one the carousel was seeded from, and it returns snapshot data *instead of*
    // live data — whereas here live data has to win over the snapshot (see the merge below).
    const [snapshotHash] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH);
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`);
    // Snapshot-backed flows (e.g. Home "Recently added") seed a descriptor per sibling so the carousel can
    // resolve (and lazily create) each sibling's thread on demand even when the sibling isn't in the live collection.
    const [siblingDescriptorsByTransactionID] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS);
    const {markReportRHPWidth} = useWideRHPActions();
    // Values required to create a transaction thread on the fly when paging onto an expense that has no thread yet.
    const {accountID, email} = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const personalDetails = usePersonalDetails();

    // The seeded list is a snapshot of what some other screen was showing, and it goes stale: deleting an expense
    // leaves its ID behind, so the counter keeps counting it and its arrow leads to a "not here" page. Validating
    // here — rather than trying to keep every writer perfectly in step — is what keeps the two in agreement.
    const validTransactionIDsSelector = useCallback(
        (allTransactions: OnyxCollection<OnyxTypes.Transaction>) =>
            seededTransactionIDs.filter((transactionID) => {
                const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
                const transaction = allTransactions?.[key] ?? snapshot?.data?.[key];
                // An unknown transaction is one that hasn't loaded yet, not one that is gone. Dropping those would
                // shrink the carousel under the user on a cold open.
                if (!transaction) {
                    return true;
                }
                return !isTransactionPendingDelete(transaction) && !isDeletedTransaction(transaction);
            }),
        [seededTransactionIDs, snapshot],
    );
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: validTransactionIDsSelector});

    const currentTransactionIndex = transactionIDsList.findIndex((id) => id === currentTransactionID);

    const {prevTransactionID, nextTransactionID} = useMemo(() => {
        if (transactionIDsList.length < 2 || currentTransactionIndex === -1) {
            return {prevTransactionID: undefined, nextTransactionID: undefined};
        }

        return {
            prevTransactionID: currentTransactionIndex > 0 ? transactionIDsList.at(currentTransactionIndex - 1) : undefined,
            nextTransactionID: transactionIDsList.at(currentTransactionIndex + 1),
        };
    }, [currentTransactionIndex, transactionIDsList]);

    const prevNextTransactionsSelector = useCallback(
        (allTransactions: OnyxCollection<OnyxTypes.Transaction>) =>
            [currentTransactionID, prevTransactionID, nextTransactionID].map((transactionID) => {
                const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
                return allTransactions?.[key] ?? snapshot?.data?.[key];
            }),
        [currentTransactionID, nextTransactionID, prevTransactionID, snapshot],
    );

    const [[currentTransaction, prevTransaction, nextTransaction] = getEmptyArray<OnyxTypes.Transaction>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: prevNextTransactionsSelector,
    });

    // Only the prev/next parent actions are ever read, so resolve them inside the selector instead of returning
    // a Map of every money request action on the three parent reports (fast-equals compares Maps in O(n^2)).
    const parentReportActionsSelector = useCallback(
        (allReportActions: OnyxCollection<OnyxTypes.ReportActions>) => {
            const parentActions: PrevNextParentReportActions = {prevParentReportAction: undefined, nextParentReportAction: undefined};
            if (!prevTransactionID && !nextTransactionID) {
                return parentActions;
            }
            const parentReportIDs = new Set([currentTransaction?.reportID, prevTransaction?.reportID, nextTransaction?.reportID]);
            for (const parentReportID of parentReportIDs) {
                const key = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}` as const;
                collectParentReportActions(allReportActions?.[key], prevTransactionID, nextTransactionID, parentActions);
            }
            return parentActions;
        },
        [currentTransaction?.reportID, nextTransaction?.reportID, nextTransactionID, prevTransaction?.reportID, prevTransactionID],
    );

    const [reportedParentReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: parentReportActionsSelector,
    });

    // The live pass above can only look up `report_actions_{transaction.reportID}`, which never resolves an
    // unreported (self-DM) sibling — its IOU action lives in the self-DM's report actions, not under reportID "0".
    // Scanning the snapshot's report actions is how those siblings get a parent action at all.
    const snapshotData = snapshot?.data;
    const snapshotParentReportActions = useMemo(() => {
        const parentActions: PrevNextParentReportActions = {prevParentReportAction: undefined, nextParentReportAction: undefined};
        if (snapshotData && (prevTransactionID ?? nextTransactionID)) {
            for (const [key, reportActionsForReport] of Object.entries(snapshotData)) {
                if (key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS)) {
                    collectParentReportActions(reportActionsForReport as OnyxTypes.ReportActions, prevTransactionID, nextTransactionID, parentActions);
                }
            }
        }
        return parentActions;
    }, [nextTransactionID, prevTransactionID, snapshotData]);

    // Live report actions win over the snapshot: the snapshot only fills in siblings the live pass couldn't resolve
    // (i.e. unreported ones). A search snapshot is a point-in-time copy, so for a reported transaction it can hold an
    // older copy of the same IOU action — e.g. one still missing the childReportID of a thread that has since been
    // created. Letting that stale copy win would make prev/next believe the sibling has no thread and create a
    // duplicate one instead of navigating to the existing thread.
    const prevParentReportAction = reportedParentReportActions?.prevParentReportAction ?? snapshotParentReportActions.prevParentReportAction;
    const nextParentReportAction = reportedParentReportActions?.nextParentReportAction ?? snapshotParentReportActions.nextParentReportAction;

    const prevParentReportID = prevParentReportAction?.reportID ?? prevTransaction?.reportID;
    const nextParentReportID = nextParentReportAction?.reportID ?? nextTransaction?.reportID;

    const [livePrevThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${prevParentReportAction?.childReportID}`);
    const [liveNextThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nextParentReportAction?.childReportID}`);
    const [livePrevTransactionParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${prevParentReportID}`);
    const [liveNextTransactionParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nextParentReportID}`);

    // Fall back to the search snapshot for reports that aren't in the live collection yet.
    const prevThreadReport = livePrevThreadReport ?? snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${prevParentReportAction?.childReportID}`];
    const nextThreadReport = liveNextThreadReport ?? snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${nextParentReportAction?.childReportID}`];
    const prevTransactionParentReport = livePrevTransactionParentReport ?? snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${prevParentReportID}`];
    const nextTransactionParentReport = liveNextTransactionParentReport ?? snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${nextParentReportID}`];

    /**
     * We clear the sibling transactionThreadIDs when unmounting this component
     * only when the mount actually goes to a different SCREEN (and not a different version of the same SCREEN)
     */
    useEffect(() => {
        return () => {
            const focusedRoute = findFocusedRoute(navigationRef.getRootState());
            if (focusedRoute?.name && (CAROUSEL_PRESERVING_SCREENS as readonly string[]).includes(focusedRoute.name)) {
                return;
            }
            clearActiveTransactionIDs();
        };
    }, []);

    // Two entries are the minimum for there to be anything to page between, and an anchor that isn't in the list
    // means this expense doesn't belong to the active carousel at all — the list belongs to a screen the user has
    // since left. Showing arrows then would step to an unrelated expense.
    if (transactionIDsList.length < 2 || currentTransactionIndex === -1) {
        return;
    }

    const getBackTo = () => {
        let backTo = Navigation.getActiveRoute();
        if (isFromReviewDuplicates) {
            const currentRoute = navigationRef.getCurrentRoute();
            const params = currentRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT] | undefined;
            backTo = params?.backTo ?? backTo;
        }
        return backTo;
    };

    const resolveContext = {introSelected, conciergeChat, betas, currentUserEmail: email, currentUserAccountID: accountID, personalDetails, isSelfTourViewed, hasCompletedGuidedSetupFlow};

    /**
     * Resolves which report shows a sibling expense, creating its transaction thread only when one doesn't exist.
     *
     * Both directions run through here so they can't drift apart: an earlier version resolved "next" and "previous"
     * with two near-identical copies of this logic, and stepping forward then back could land on a different screen
     * than the one the user started on.
     */
    const resolveSiblingReportID = (
        siblingTransactionID: string | undefined,
        siblingTransaction: OnyxTypes.Transaction | undefined,
        siblingParentReportAction: OnyxTypes.ReportAction | undefined,
        siblingParentReport: OnyxEntry<OnyxTypes.Report>,
        siblingThreadReport: OnyxEntry<OnyxTypes.Report>,
    ): string | undefined => {
        if (!siblingTransactionID) {
            return undefined;
        }

        const isReported = !!siblingTransaction?.reportID && siblingTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID;

        // A report holding a single expense *is* that expense's view, so open it directly rather than its thread.
        // Home's "Review expenses" entry point applies the same rule, so stepping back returns the user to the
        // screen they came from.
        if (isReported && isOneTransactionReport(siblingParentReport)) {
            return siblingTransaction?.reportID;
        }

        // Snapshot-backed flows (e.g. Home "Recently added") seed a descriptor per sibling because the sibling
        // transactions may be absent from the main Onyx collections. Resolve the target sibling lazily here so
        // we only ever create a thread for the expense the user actually navigates to, then let OpenReport
        // hydrate it on arrival.
        const descriptor: TransactionThreadNavigationDescriptor | undefined = siblingDescriptorsByTransactionID?.[siblingTransactionID];
        if (descriptor) {
            return getReportIDToOpenForExpense(descriptor, resolveContext);
        }

        const threadReportID = siblingParentReportAction?.childReportID;
        if (threadReportID) {
            if (!siblingThreadReport) {
                // The thread exists server-side but hasn't been fetched, so materialize it before navigating.
                setOptimisticTransactionThread(threadReportID, siblingParentReport?.reportID, siblingParentReportAction?.reportActionID, siblingParentReport?.policyID);
            }
            return threadReportID;
        }

        if (!siblingTransaction) {
            return undefined;
        }

        // No thread yet. The shared resolver creates one, including for an unreported (self-DM) expense, whose IOU
        // action lives in the self-DM rather than under report "0" — those used to fall through with no target at
        // all and dump the user in their self-DM.
        return getReportIDToOpenForExpense(
            {
                reportID: siblingTransaction.reportID ?? CONST.REPORT.UNREPORTED_REPORT_ID,
                transaction: siblingTransaction,
                reportAction: siblingParentReportAction,
                report: siblingParentReport ?? undefined,
            },
            resolveContext,
        );
    };

    const navigateToSibling = (
        e: GestureResponderEvent | KeyboardEvent | undefined,
        siblingTransactionID: string | undefined,
        siblingTransaction: OnyxTypes.Transaction | undefined,
        siblingParentReportAction: OnyxTypes.ReportAction | undefined,
        siblingParentReport: OnyxEntry<OnyxTypes.Report>,
        siblingThreadReport: OnyxEntry<OnyxTypes.Report>,
    ) => {
        e?.preventDefault();
        const backTo = getBackTo();
        const targetReportID = resolveSiblingReportID(siblingTransactionID, siblingTransaction, siblingParentReportAction, siblingParentReport, siblingThreadReport);

        // Report "0" is the unreported sentinel, not a report that can be opened. Navigating to it lands the user
        // on their self-DM (or a "not here" page), so stay put instead.
        if (!siblingTransactionID || !targetReportID || targetReportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return;
        }

        markReportRHPWidth(targetReportID, 'wide');
        // Wait for the next frame to ensure Onyx has processed any optimistic thread data before navigating
        requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, anchorTransactionID: siblingTransactionID, backTo})));
    };

    const onNext = (e: GestureResponderEvent | KeyboardEvent | undefined) =>
        navigateToSibling(e, nextTransactionID, nextTransaction, nextParentReportAction, nextTransactionParentReport, nextThreadReport);

    const onPrevious = (e: GestureResponderEvent | KeyboardEvent | undefined) =>
        navigateToSibling(e, prevTransactionID, prevTransaction, prevParentReportAction, prevTransactionParentReport, prevThreadReport);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            {!shouldDisplayNarrowVersion && (
                <Text style={[styles.mutedTextLabel, styles.textAlignRight, styles.mnw8]}>
                    {translate('common.currentOfTotal', {current: currentTransactionIndex + 1, total: transactionIDsList.length})}
                </Text>
            )}
            <PrevNextButtons
                isPrevButtonDisabled={!prevTransactionID}
                isNextButtonDisabled={!nextTransactionID}
                onNext={onNext}
                onPrevious={onPrevious}
            />
        </View>
    );
}

export default MoneyRequestReportTransactionsNavigation;
