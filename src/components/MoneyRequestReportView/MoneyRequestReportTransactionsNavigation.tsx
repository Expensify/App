import {usePersonalDetails} from '@components/OnyxListItemProvider';
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
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
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
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
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
    // Values required to create a transaction thread on the fly when paging onto a multi-transaction
    // (batched) parent report that has no existing thread yet (see onNext/onPrevious fallbacks).
    const {accountID, email} = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const personalDetails = usePersonalDetails();

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

        if (isOneTransactionReport(nextTransactionParentReport) && nextTransaction?.reportID && nextTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID) {
            const targetReportID = nextTransaction.reportID;
            markReportRHPWidth(targetReportID, 'wide');
            requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, anchorTransactionID: nextTransactionID, backTo})));
            return;
        }

        // Snapshot-backed flows (e.g. Home "Recently added") seed a descriptor per sibling because the sibling
        // transactions may be absent from the main Onyx collections. Resolve the target sibling lazily here so
        // we only ever create a thread for the expense the user actually navigates to, then let OpenReport
        // hydrate it on arrival.
        const nextDescriptor = nextTransactionID ? siblingDescriptorsByTransactionID?.[nextTransactionID] : undefined;
        if (nextDescriptor) {
            const nextReportID = getReportIDToOpenForExpense(nextDescriptor, {
                introSelected,
                conciergeChat,
                betas,
                currentUserEmail: email,
                currentUserAccountID: accountID,
                personalDetails,
            });
            markReportRHPWidth(nextReportID, 'wide');
            requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: nextReportID, reportActionID: undefined, anchorTransactionID: nextTransactionID, backTo})));
            return;
        }

        // Until the report's actions load there is no parent action to hang a thread off, so a press here
        // would mint one with no parent. Do nothing and let the in-flight fetch settle instead.
        if (!nextParentReportAction) {
            return;
        }

        const nextThreadReportID = nextParentReportAction?.childReportID;
        const navigationParams = {reportID: nextThreadReportID, reportActionID: undefined, anchorTransactionID: nextTransactionID, backTo};

        if (!nextThreadReportID && nextTransaction?.reportID && nextTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID) {
            const optimisticThread = createTransactionThreadReport({
                introSelected,
                conciergeChat,
                currentUserLogin: email ?? '',
                currentUserAccountID: accountID,
                betas,
                iouReport: nextTransactionParentReport,
                iouReportAction: nextParentReportAction,
                transaction: nextTransaction,
                personalDetails,
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
            requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, anchorTransactionID: prevTransactionID, backTo})));
            return;
        }

        // See onNext: resolve the target sibling lazily from its descriptor when present.
        const prevDescriptor = prevTransactionID ? siblingDescriptorsByTransactionID?.[prevTransactionID] : undefined;
        if (prevDescriptor) {
            const prevReportID = getReportIDToOpenForExpense(prevDescriptor, {
                introSelected,
                conciergeChat,
                betas,
                currentUserEmail: email,
                currentUserAccountID: accountID,
                personalDetails,
            });
            markReportRHPWidth(prevReportID, 'wide');
            requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: prevReportID, reportActionID: undefined, anchorTransactionID: prevTransactionID, backTo})));
            return;
        }

        // Until the report's actions load there is no parent action to hang a thread off, so a press here
        // would mint one with no parent. Do nothing and let the in-flight fetch settle instead.
        if (!prevParentReportAction) {
            return;
        }

        const prevThreadReportID = prevParentReportAction?.childReportID;
        const navigationParams = {reportID: prevThreadReportID, reportActionID: undefined, anchorTransactionID: prevTransactionID, backTo};

        // See onNext for the rationale: the parent here is a MULTI-transaction (batched) report, so create the
        // transaction thread to land on a single-expense view instead of navigating to the whole parent report.
        if (!prevThreadReportID && prevTransaction?.reportID && prevTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID) {
            const optimisticThread = createTransactionThreadReport({
                introSelected,
                conciergeChat,
                currentUserLogin: email ?? '',
                currentUserAccountID: accountID,
                betas,
                iouReport: prevTransactionParentReport,
                iouReportAction: prevParentReportAction,
                transaction: prevTransaction,
                isSelfTourViewed,
                hasCompletedGuidedSetupFlow,
                personalDetails,
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
