import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import useCarouselTransactionIDs from '@hooks/useCarouselTransactionIDs';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {openReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getExpenseCreationTransactionID} from '@libs/ReportActionsUtils';
import {findSelfDMReportID, isOneTransactionReport} from '@libs/ReportUtils';
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

import {findFocusedRoute, useIsFocused} from '@react-navigation/native';
import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import React, {startTransition, useCallback, useEffect, useMemo, useRef} from 'react';
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

    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();

    const currentTransactionIndex = transactionIDsList.findIndex((id) => id === currentTransactionID);

    // A press made before the sibling's parent action has loaded is parked here and replayed once it arrives.
    const pendingSiblingRef = useRef<{transactionID: string; originRoute: string} | null>(null);

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

    const prevTransactionReportID = prevTransaction?.reportID;
    const nextTransactionReportID = nextTransaction?.reportID;

    // Only the prev/next parent actions are ever read, so resolve them inside the selector instead of returning
    // a Map of every money request action on the three parent reports (fast-equals compares Maps in O(n^2)).
    const parentReportActionsSelector = useCallback(
        (allReportActions: OnyxCollection<OnyxTypes.ReportActions>) => {
            // An unreported (self-DM) sibling's IOU action lives in the self-DM, since report "0" holds no actions
            // of its own. Looking it up there is the only way such a sibling resolves from live data at all.
            const isPrevUnreported = prevTransactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID;
            const isNextUnreported = nextTransactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID;
            const selfDMReportID = isPrevUnreported || isNextUnreported ? findSelfDMReportID() : undefined;
            const prevActionsReportID = isPrevUnreported ? selfDMReportID : prevTransactionReportID;
            const nextActionsReportID = isNextUnreported ? selfDMReportID : nextTransactionReportID;
            // Whether the sibling's parent report has any actions at all, which is what separates "not fetched yet"
            // from "fetched, but this expense has no creation action". Only the former is worth waiting for.
            const hasPrevParentReportActions = !!Object.keys(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${prevActionsReportID}`] ?? {}).length;
            const hasNextParentReportActions = !!Object.keys(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${nextActionsReportID}`] ?? {}).length;
            const parentActions: PrevNextParentReportActions = {prevParentReportAction: undefined, nextParentReportAction: undefined};
            if (!prevTransactionID && !nextTransactionID) {
                return {...parentActions, hasPrevParentReportActions, hasNextParentReportActions};
            }
            const parentReportIDs = new Set([currentTransaction?.reportID, prevActionsReportID, nextActionsReportID]);
            for (const parentReportID of parentReportIDs) {
                const key = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}` as const;
                collectParentReportActions(allReportActions?.[key], prevTransactionID, nextTransactionID, parentActions);
            }
            return {...parentActions, hasPrevParentReportActions, hasNextParentReportActions};
        },
        [currentTransaction?.reportID, nextTransactionReportID, nextTransactionID, prevTransactionReportID, prevTransactionID],
    );

    const [reportedParentReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: parentReportActionsSelector,
    });

    // The live pass above resolves a sibling from its parent report's actions (the self-DM's, for an unreported
    // one), so it only finds what has already been fetched into Onyx. Scanning the snapshot's report actions is
    // what resolves a sibling whose parent actions were never loaded in this session.
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

    const stageSiblingPress = (transactionID: string | undefined, parentReportID: string | undefined) => {
        // Offline there is no fetch to wait for, so the caller resolves the sibling with what it already has.
        // Report "0" isn't a report that can be fetched either, so an unreported sibling never waits.
        if (!transactionID || !parentReportID || parentReportID === CONST.REPORT.UNREPORTED_REPORT_ID || isOffline) {
            return false;
        }
        pendingSiblingRef.current = {transactionID, originRoute: Navigation.getActiveRoute()};
        // Always true here: we are fetching this report's actions, so it must not overwrite its cached name.
        openReport({reportID: parentReportID, introSelected, conciergeChat, betas, currentUserAccountID: accountID, hasReportActions: true});
        return true;
    };

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

    /**
     * Whether a press on a sibling's arrow can land anywhere, without the side effects `resolveSiblingReportID`
     * has (it creates threads). Every resolution path there needs the sibling to be known from at least one of
     * a descriptor, an existing thread on its parent action, or its transaction.
     *
     * The arrows used to be disabled from list *position* alone, with resolvability consulted only inside the
     * handler, which bailed silently - an enabled arrow whose press did nothing, with no spinner and no error.
     */
    const canResolveSibling = (
        siblingTransactionID: string | undefined,
        siblingTransaction: OnyxTypes.Transaction | undefined,
        siblingParentReportAction: OnyxTypes.ReportAction | undefined,
    ) => {
        if (!siblingTransactionID) {
            return false;
        }
        // An existing thread or a descriptor resolves on its own, with nothing else needed.
        if (!!siblingParentReportAction?.childReportID || !!siblingDescriptorsByTransactionID?.[siblingTransactionID]) {
            return true;
        }
        // Everything else is resolved from the transaction: it is what a thread gets created from.
        if (!siblingTransaction) {
            return false;
        }
        // A reported expense can always fall back on its own report, and its parent's actions can still be fetched
        // to find (or create) its thread. An unreported one has neither: report "0" isn't a report to open or to
        // fetch actions from, and its IOU action lives in the self-DM. Unless that action is already resolved -
        // from the self-DM, the search snapshot or a descriptor - a press would have nowhere to go, so don't offer
        // an arrow that can't move.
        return siblingTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID || !!siblingParentReportAction;
    };

    const navigateToSibling = (
        e: GestureResponderEvent | KeyboardEvent | undefined,
        siblingTransactionID: string | undefined,
        siblingTransaction: OnyxTypes.Transaction | undefined,
        siblingParentReportAction: OnyxTypes.ReportAction | undefined,
        siblingParentReport: OnyxEntry<OnyxTypes.Report>,
        siblingThreadReport: OnyxEntry<OnyxTypes.Report>,
        hasSiblingParentReportActions: boolean,
    ) => {
        e?.preventDefault();
        const backTo = getBackTo();

        // A thread created before the parent action loads would have no parent, so wait for the fetch - but only
        // when there is a fetch that could produce it. A parent report whose actions are already loaded won't grow
        // a creation action by being re-fetched, a descriptor-backed sibling carries its own resolution, and a
        // one-transaction report is opened directly; all three fall through to the resolver instead of waiting.
        const hasDescriptor = !!siblingTransactionID && !!siblingDescriptorsByTransactionID?.[siblingTransactionID];
        const isSingleExpenseReport = !!siblingTransaction?.reportID && siblingTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID && isOneTransactionReport(siblingParentReport);
        if (
            !siblingParentReportAction &&
            !hasSiblingParentReportActions &&
            !hasDescriptor &&
            !isSingleExpenseReport &&
            stageSiblingPress(siblingTransactionID, siblingTransaction?.reportID)
        ) {
            return;
        }

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
        navigateToSibling(
            e,
            nextTransactionID,
            nextTransaction,
            nextParentReportAction,
            nextTransactionParentReport,
            nextThreadReport,
            !!reportedParentReportActions?.hasNextParentReportActions,
        );

    const onPrevious = (e: GestureResponderEvent | KeyboardEvent | undefined) =>
        navigateToSibling(
            e,
            prevTransactionID,
            prevTransaction,
            prevParentReportAction,
            prevTransactionParentReport,
            prevThreadReport,
            !!reportedParentReportActions?.hasPrevParentReportActions,
        );

    // Replays a staged press once its parent action arrives, but only if the user is still where they pressed -
    // this screen stays mounted under a pushed RHP, and resuming from there would yank them out with a stale backTo.
    useEffect(() => {
        const pending = pendingSiblingRef.current;
        if (!pending) {
            return;
        }
        if (!isFocused || Navigation.getActiveRoute() !== pending.originRoute) {
            pendingSiblingRef.current = null;
            return;
        }
        if (pending.transactionID === nextTransactionID && nextParentReportAction) {
            pendingSiblingRef.current = null;
            onNext(undefined);
            return;
        }
        if (pending.transactionID === prevTransactionID && prevParentReportAction) {
            pendingSiblingRef.current = null;
            onPrevious(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- onNext/onPrevious are rebuilt every render, so listing them would defeat the dependency list
    }, [isFocused, nextTransactionID, nextParentReportAction, prevTransactionID, prevParentReportAction]);

    // Two entries are the minimum for there to be anything to page between, and an anchor that isn't in the list
    // means this expense doesn't belong to the active carousel at all. The list belongs to a screen the user has
    // since left. Showing arrows then would step to an unrelated expense.
    if (transactionIDsList.length < 2 || currentTransactionIndex === -1) {
        return;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            {!shouldDisplayNarrowVersion && (
                <Text style={[styles.mutedTextLabel, styles.textAlignRight, styles.tabularNums]}>
                    {translate('common.currentOfTotal', {current: currentTransactionIndex + 1, total: transactionIDsList.length})}
                </Text>
            )}
            <PrevNextButtons
                isPrevButtonDisabled={!canResolveSibling(prevTransactionID, prevTransaction, prevParentReportAction)}
                isNextButtonDisabled={!canResolveSibling(nextTransactionID, nextTransaction, nextParentReportAction)}
                onNext={onNext}
                onPrevious={onPrevious}
            />
        </View>
    );
}

export default MoneyRequestReportTransactionsNavigation;
