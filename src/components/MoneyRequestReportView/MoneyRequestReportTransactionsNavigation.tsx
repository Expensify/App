import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import useCarouselTransactionIDs from '@hooks/useCarouselTransactionIDs';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setOptimisticTransactionThread} from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getExpenseCreationTransactionID} from '@libs/ReportActionsUtils';
import {isOneTransactionReport} from '@libs/ReportUtils';
import type {TransactionThreadNavigationDescriptor} from '@libs/TransactionThreadNavigationUtils';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {GestureResponderEvent} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {findFocusedRoute} from '@react-navigation/native';
import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
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
        const transactionID = getExpenseCreationTransactionID(action);
        if (!transactionID) {
            continue;
        }
        if (transactionID === prevTransactionID && !parentActions.prevParentReportAction) {
            // eslint-disable-next-line no-param-reassign -- intentionally mutates the shared accumulator so callers can resolve both actions in a single pass across multiple report-action sources
            parentActions.prevParentReportAction = action;
        }
        if (transactionID === nextTransactionID && !parentActions.nextParentReportAction) {
            // eslint-disable-next-line no-param-reassign -- intentionally mutates the shared accumulator so callers can resolve both actions in a single pass across multiple report-action sources
            parentActions.nextParentReportAction = action;
        }
    }
};

function MoneyRequestReportTransactionsNavigation({currentTransactionID, isFromReviewDuplicates, shouldDisplayNarrowVersion}: MoneyRequestReportRHPNavigationButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // Shared with the header, which uses the same filtered list to decide whether to render this carousel at all.
    const {transactionIDs: transactionIDsList, snapshot} = useCarouselTransactionIDs();
    // Snapshot-backed flows (e.g. Home "Recently added") seed a descriptor per sibling so the carousel can
    // resolve (and lazily create) each sibling's thread on demand even when the sibling isn't in the live collection.
    const [siblingDescriptorsByTransactionID] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS);
    const {markReportRHPWidth} = useWideRHPActions();
    // Values required to create a transaction thread on the fly when paging onto an expense that has no thread yet.
    const {accountID, email} = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const personalDetails = usePersonalDetails();

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
    // unreported (self-DM) sibling. Its IOU action lives in the self-DM's report actions, not under reportID "0".
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
    // older copy of the same IOU action, for example one still missing the childReportID of a thread that has since
    // been created. Letting that stale copy win would make prev/next believe the sibling has no thread and create a
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
    // means this expense doesn't belong to the active carousel at all. The list belongs to a screen the user has
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

    const resolveContext = {
        introSelected,
        conciergeChat,
        betas,
        currentUserEmail: email,
        currentUserAccountID: accountID,
        personalDetails,
        isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
        hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
    };

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
        // action lives in the self-DM rather than under report "0". Those used to fall through with no target at
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

        // Report "0" is the unreported placeholder, not a report that can be opened. Navigating to it lands the user
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
