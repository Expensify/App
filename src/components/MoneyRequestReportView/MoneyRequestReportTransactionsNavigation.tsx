import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isOneTransactionReport} from '@libs/ReportUtils';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {hasCompletedGuidedSetupFlowSelector, hasSeenTourSelector} from '@src/selectors/Onboarding';
import type * as OnyxTypes from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {GestureResponderEvent} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {findFocusedRoute} from '@react-navigation/native';
import React, {startTransition, useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentTransactionID: string;
    isFromReviewDuplicates?: boolean;
    shouldDisplayNarrowVersion?: boolean;
};

const collectParentReportActions = (reportActions: OnyxEntry<OnyxTypes.ReportActions>, parentActions: Record<string, OnyxTypes.ReportAction>) => {
    for (const action of Object.values(reportActions ?? {})) {
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
        if (!transactionID) {
            continue;
        }
        // eslint-disable-next-line no-param-reassign
        parentActions[transactionID] = action;
    }
};

function MoneyRequestReportTransactionsNavigation({currentTransactionID, isFromReviewDuplicates, shouldDisplayNarrowVersion}: MoneyRequestReportRHPNavigationButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    // When the carousel is opened from a search (e.g. the Spend page), the sibling transactions may only exist
    // in the search snapshot and not in the live collection yet. We keep the snapshot around to fall back to it
    // so prev/next navigation resolves the correct report instead of breaking.
    const [snapshotHash] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH);
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`);
    // Snapshot-backed flows (e.g. Home "Recently added") seed a descriptor per sibling so the carousel can
    // resolve (and lazily create) each sibling's thread on demand even when the sibling isn't in the live collection.
    const [siblingDescriptorsByTransactionID] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS);
    const {markReportRHPWidth} = useWideRHPActions();
    // Values required to create a transaction thread on the fly when paging onto a multi-transaction
    // (batched) parent report that has no existing thread yet (see onNext/onPrevious fallbacks).
    const {accountID, email} = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});

    const currentTransactionIndex = transactionIDsList.findIndex((id) => id === currentTransactionID);

    const {prevTransactionID, nextTransactionID} = useMemo(() => {
        if (!transactionIDsList || transactionIDsList.length < 2) {
            return {prevTransactionID: undefined, nextTransactionID: undefined};
        }

        const prevID = currentTransactionIndex > 0 ? transactionIDsList.at(currentTransactionIndex - 1) : undefined;
        const nextID = transactionIDsList.at(currentTransactionIndex + 1);

        return {
            prevTransactionID: prevID,
            nextTransactionID: nextID,
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

    const parentReportActionsSelector = useCallback(
        (allReportActions: OnyxCollection<OnyxTypes.ReportActions>) => {
            // Build the transactionID -> IOU action map in a single pass. We deliberately avoid merging the
            // report actions into one intermediate object (repeated spreads are O(n²) and, with a snapshot,
            // would copy every report's actions), since this selector re-runs on any report-action change.
            // We return a plain object (not a Map) because useOnyx's deepEqual is very slow for Maps.
            const parentActions: Record<string, OnyxTypes.ReportAction> = {};
            // Reported transactions keep their IOU action on their own report (reportActions_<reportID>).
            for (const transaction of [currentTransaction, prevTransaction, nextTransaction]) {
                const key = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}` as const;
                collectParentReportActions(allReportActions?.[key] ?? (snapshot?.data?.[key] as OnyxTypes.ReportActions | undefined), parentActions);
            }
            // Unreported transactions (reportID '0') keep their IOU action on a different report (e.g. a self-DM),
            // so it isn't under reportActions_0. Scan every report's actions from the search snapshot so the action
            // (and its childReportID thread) can still be located by IOUTransactionID.
            if (snapshot?.data) {
                for (const [key, reportActionsForReport] of Object.entries(snapshot.data)) {
                    if (key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS)) {
                        collectParentReportActions(reportActionsForReport as OnyxTypes.ReportActions, parentActions);
                    }
                }
            }
            return parentActions;
        },
        [currentTransaction, nextTransaction, prevTransaction, snapshot],
    );

    const [parentReportActions = getEmptyObject<Record<string, OnyxTypes.ReportAction>>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: parentReportActionsSelector,
    });

    const {prevParentReportAction, nextParentReportAction} = useMemo(() => {
        if (!transactionIDsList || transactionIDsList.length < 2) {
            return {prevParentReportAction: undefined, nextParentReportAction: undefined};
        }

        return {
            prevParentReportAction: prevTransactionID ? parentReportActions[prevTransactionID] : undefined,
            nextParentReportAction: nextTransactionID ? parentReportActions[nextTransactionID] : undefined,
        };
    }, [nextTransactionID, parentReportActions, prevTransactionID, transactionIDsList]);

    // The "parent report" is where the transaction's IOU action lives: the expense report for reported transactions,
    // or a self-DM for unreported ones (whose transaction.reportID is '0'). Derive it from the action so unreported
    // transactions resolve to the correct parent instead of report '0'. Fall back to the transaction's reportID.
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
            if (focusedRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || focusedRoute?.name === SCREENS.TRANSACTION_DUPLICATE.REVIEW) {
                return;
            }
            clearActiveTransactionIDs();
        };
    }, []);

    if (transactionIDsList.length < 2) {
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

    const onNext = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        e?.preventDefault();
        const backTo = getBackTo();

        // If the next expense's parent is a one-transaction report, navigate to the parent report instead of the
        // thread. This keeps the view at the same level (parent) so report-level primary actions (Approve, etc.)
        // are preserved when navigating back. Mirrors the open-from-list logic in Search/index.tsx#onSelectRow.
        // Skip for unreported transactions (reportID '0'): they have no parent report to land on, so they must open
        // their transaction thread (handled below).
        if (isOneTransactionReport(nextTransactionParentReport) && nextTransaction?.reportID && nextTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID) {
            const targetReportID = nextTransaction.reportID;
            markReportRHPWidth(targetReportID, 'wide');
            requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, backTo})));
            return;
        }

        // Snapshot-backed flows (e.g. Home "Recently added") seed a descriptor per sibling because the sibling
        // transactions may be absent from the main Onyx collections. Resolve the target sibling lazily here so
        // we only ever create a thread for the expense the user actually navigates to, then let OpenReport
        // hydrate it on arrival.
        const nextDescriptor = nextTransactionID ? siblingDescriptorsByTransactionID?.[nextTransactionID] : undefined;
        if (nextDescriptor) {
            const nextReportID = getReportIDToOpenForExpense(nextDescriptor, {introSelected, betas, currentUserEmail: email, currentUserAccountID: accountID});
            markReportRHPWidth(nextReportID, 'wide');
            requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: nextReportID, reportActionID: undefined, backTo})));
            return;
        }

        const nextThreadReportID = nextParentReportAction?.childReportID;
        const navigationParams = {reportID: nextThreadReportID, reportActionID: undefined, backTo};

        // No existing transaction thread for this IOU action. We reach here only after the
        // one-transaction-report branch above, so the parent is a MULTI-transaction (batched) report.
        // Navigating to that parent reportID would render the whole report (several expenses) instead of a
        // single expense. Create the transaction thread (the same way Search/index.tsx#onSelectRow does on
        // first open) so we land on a single-expense view, then navigate to the new thread report.
        // createTransactionThreadReport issues a real OpenReport with a server-recognized generated reportID,
        // so it doesn't hit the optimistic-reportID race that setOptimisticTransactionThread + setParams does.
        if (!nextThreadReportID && nextTransaction?.reportID && nextTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID) {
            const optimisticThread = createTransactionThreadReport({
                introSelected,
                currentUserLogin: email ?? '',
                currentUserAccountID: accountID,
                betas,
                iouReport: nextTransactionParentReport,
                iouReportAction: nextParentReportAction,
                transaction: nextTransaction,
                isSelfTourViewed,
                hasCompletedGuidedSetupFlow,
            });
            const targetReportID = optimisticThread?.reportID ?? nextTransaction.reportID;
            markReportRHPWidth(targetReportID, 'wide');
            requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, anchorTransactionID: nextTransactionID, backTo})));
            return;
        }

        if (nextThreadReportID) {
            markReportRHPWidth(nextThreadReportID, 'wide');
        }
        // We know that the next thread report exists, it just wasn't fetched to Onyx yet, so we set it optimistically.
        // Important: use nextTransactionParentReport (the NEXT transaction's own parent), NOT parentReport
        // (the CURRENT transaction's parent). Passing wrong linkage causes the OpenReport response to wipe
        // the optimistic data, which trips useReportWasDeleted → ReportNavigateAwayHandler → Inbox/parent redirect.
        if (!nextThreadReport && nextThreadReportID) {
            setOptimisticTransactionThread(nextThreadReportID, nextTransactionParentReport?.reportID, nextParentReportAction?.reportActionID, nextTransactionParentReport?.policyID);
        }
        // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread before navigating
        requestAnimationFrame(() => startTransition(() => Navigation.setParams(navigationParams)));
    };

    const onPrevious = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        e?.preventDefault();
        const backTo = getBackTo();

        // See onNext for the rationale behind the one-transaction-parent branch (and the unreported skip).
        if (isOneTransactionReport(prevTransactionParentReport) && prevTransaction?.reportID && prevTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID) {
            const targetReportID = prevTransaction.reportID;
            markReportRHPWidth(targetReportID, 'wide');
            requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, backTo})));
            return;
        }

        // See onNext: resolve the target sibling lazily from its descriptor when present.
        const prevDescriptor = prevTransactionID ? siblingDescriptorsByTransactionID?.[prevTransactionID] : undefined;
        if (prevDescriptor) {
            const prevReportID = getReportIDToOpenForExpense(prevDescriptor, {introSelected, betas, currentUserEmail: email, currentUserAccountID: accountID});
            markReportRHPWidth(prevReportID, 'wide');
            requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: prevReportID, reportActionID: undefined, backTo})));
            return;
        }

        const prevThreadReportID = prevParentReportAction?.childReportID;
        const navigationParams = {reportID: prevThreadReportID, reportActionID: undefined, backTo};

        // See onNext for the rationale: the parent here is a MULTI-transaction (batched) report, so create the
        // transaction thread to land on a single-expense view instead of navigating to the whole parent report.
        if (!prevThreadReportID && prevTransaction?.reportID && prevTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID) {
            const optimisticThread = createTransactionThreadReport({
                introSelected,
                currentUserLogin: email ?? '',
                currentUserAccountID: accountID,
                betas,
                iouReport: prevTransactionParentReport,
                iouReportAction: prevParentReportAction,
                transaction: prevTransaction,
                isSelfTourViewed,
                hasCompletedGuidedSetupFlow,
            });
            const targetReportID = optimisticThread?.reportID ?? prevTransaction.reportID;
            markReportRHPWidth(targetReportID, 'wide');
            requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, anchorTransactionID: prevTransactionID, backTo})));
            return;
        }

        if (prevThreadReportID) {
            markReportRHPWidth(prevThreadReportID, 'wide');
        }
        // See onNext for the rationale: use prevTransactionParentReport (the PREV transaction's own parent)
        // instead of parentReport (the CURRENT transaction's parent) so the optimistic linkage matches the server.
        if (!prevThreadReport && prevThreadReportID) {
            setOptimisticTransactionThread(prevThreadReportID, prevTransactionParentReport?.reportID, prevParentReportAction?.reportActionID, prevTransactionParentReport?.policyID);
        }
        // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread before navigating
        requestAnimationFrame(() => startTransition(() => Navigation.setParams(navigationParams)));
    };

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            {!shouldDisplayNarrowVersion && currentTransactionIndex !== -1 && (
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
