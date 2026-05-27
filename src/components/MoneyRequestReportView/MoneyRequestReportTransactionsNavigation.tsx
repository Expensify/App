import {findFocusedRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import {useWideRHPActions} from '@components/WideRHPContextProvider';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setOptimisticTransactionThread} from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isOneTransactionReport} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentTransactionID: string;
    isFromReviewDuplicates?: boolean;
    shouldDisplayNarrowVersion?: boolean;
};

const parentReportActionIDsSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>) => {
    const parentActions = new Map<string, OnyxTypes.ReportAction>();
    for (const action of Object.values(reportActions ?? {})) {
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
        if (!transactionID) {
            continue;
        }
        parentActions.set(transactionID, action);
    }
    return parentActions;
};

function MoneyRequestReportTransactionsNavigation({currentTransactionID, isFromReviewDuplicates, shouldDisplayNarrowVersion}: MoneyRequestReportRHPNavigationButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    const {markReportIDAsExpense} = useWideRHPActions();

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
            [currentTransactionID, prevTransactionID, nextTransactionID].map((transactionID) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]),
        [currentTransactionID, nextTransactionID, prevTransactionID],
    );

    const [[currentTransaction, prevTransaction, nextTransaction] = getEmptyArray<OnyxTypes.Transaction>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: prevNextTransactionsSelector,
    });

    const parentReportActionsSelector = useCallback(
        (allReportActions: OnyxCollection<OnyxTypes.ReportActions>) => {
            let reportActions = {};
            for (const transaction of [currentTransaction, prevTransaction, nextTransaction]) {
                reportActions = {...reportActions, ...allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`]};
            }
            return parentReportActionIDsSelector(reportActions);
        },
        [currentTransaction, nextTransaction, prevTransaction],
    );

    const [parentReportActions = new Map<string, OnyxTypes.ReportAction>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: parentReportActionsSelector,
    });

    const {prevParentReportAction, nextParentReportAction} = useMemo(() => {
        if (!transactionIDsList || transactionIDsList.length < 2) {
            return {prevParentReportAction: undefined, nextParentReportAction: undefined};
        }

        return {
            prevParentReportAction: prevTransactionID ? parentReportActions.get(prevTransactionID) : undefined,
            nextParentReportAction: nextTransactionID ? parentReportActions.get(nextTransactionID) : undefined,
        };
    }, [nextTransactionID, parentReportActions, prevTransactionID, transactionIDsList]);

    const [prevThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${prevParentReportAction?.childReportID}`);
    const [nextThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nextParentReportAction?.childReportID}`);
    const [prevTransactionParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${prevTransaction?.reportID}`);
    const [nextTransactionParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nextTransaction?.reportID}`);

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
        if (isOneTransactionReport(nextTransactionParentReport) && nextTransaction?.reportID) {
            const targetReportID = nextTransaction.reportID;
            markReportIDAsExpense(targetReportID);
            requestAnimationFrame(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, backTo}));
            return;
        }

        const nextThreadReportID = nextParentReportAction?.childReportID;
        const navigationParams = {reportID: nextThreadReportID, reportActionID: undefined, backTo};

        // No existing transaction thread for this IOU action. Do NOT create one optimistically here:
        // the carousel uses Navigation.setParams (mutating the modal's params + remounting via key),
        // which races with the in-flight OpenReport call. The server doesn't recognize the synthetic
        // optimistic reportID, the local report is wiped, and ReportNavigateAwayHandler bounces the
        // user to ROUTES.REPORT_WITH_ID (Inbox/parent). Instead, fall back to navigating to the next
        // transaction's parent report. We pass anchorTransactionID so MoneyReportHeader can keep the
        // transaction carousel anchored on the user's intended next transaction.
        if (!nextThreadReportID && nextTransaction?.reportID) {
            const targetReportID = nextTransaction.reportID;
            markReportIDAsExpense(targetReportID);
            requestAnimationFrame(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, anchorTransactionID: nextTransactionID, backTo}));
            return;
        }

        if (nextThreadReportID) {
            markReportIDAsExpense(nextThreadReportID);
        }
        // We know that the next thread report exists, it just wasn't fetched to Onyx yet, so we set it optimistically.
        // Important: use nextTransactionParentReport (the NEXT transaction's own parent), NOT parentReport
        // (the CURRENT transaction's parent). Passing wrong linkage causes the OpenReport response to wipe
        // the optimistic data, which trips useReportWasDeleted → ReportNavigateAwayHandler → Inbox/parent redirect.
        if (!nextThreadReport && nextThreadReportID) {
            setOptimisticTransactionThread(nextThreadReportID, nextTransactionParentReport?.reportID, nextParentReportAction?.reportActionID, nextTransactionParentReport?.policyID);
        }
        // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread before navigating
        requestAnimationFrame(() => {
            Navigation.setParams(navigationParams);
        });
    };

    const onPrevious = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        e?.preventDefault();
        const backTo = getBackTo();

        // See onNext for the rationale behind the one-transaction-parent branch.
        if (isOneTransactionReport(prevTransactionParentReport) && prevTransaction?.reportID) {
            const targetReportID = prevTransaction.reportID;
            markReportIDAsExpense(targetReportID);
            requestAnimationFrame(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, backTo}));
            return;
        }

        const prevThreadReportID = prevParentReportAction?.childReportID;
        const navigationParams = {reportID: prevThreadReportID, reportActionID: undefined, backTo};

        // See onNext for the rationale behind this fallback.
        if (!prevThreadReportID && prevTransaction?.reportID) {
            const targetReportID = prevTransaction.reportID;
            markReportIDAsExpense(targetReportID);
            requestAnimationFrame(() => Navigation.setParams({reportID: targetReportID, reportActionID: undefined, anchorTransactionID: prevTransactionID, backTo}));
            return;
        }

        if (prevThreadReportID) {
            markReportIDAsExpense(prevThreadReportID);
        }
        // See onNext for the rationale: use prevTransactionParentReport (the PREV transaction's own parent)
        // instead of parentReport (the CURRENT transaction's parent) so the optimistic linkage matches the server.
        if (!prevThreadReport && prevThreadReportID) {
            setOptimisticTransactionThread(prevThreadReportID, prevTransactionParentReport?.reportID, prevParentReportAction?.reportActionID, prevTransactionParentReport?.policyID);
        }
        // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread before navigating
        requestAnimationFrame(() => Navigation.setParams(navigationParams));
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
