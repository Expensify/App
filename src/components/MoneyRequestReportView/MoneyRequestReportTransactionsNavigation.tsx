import PrevNextButtons from '@components/PrevNextButtons';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {GestureResponderEvent} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {findFocusedRoute} from '@react-navigation/native';
import React, {startTransition, useCallback, useEffect, useMemo} from 'react';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentTransactionID: string;
    isFromReviewDuplicates?: boolean;
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

function MoneyRequestReportTransactionsNavigation({currentTransactionID, isFromReviewDuplicates}: MoneyRequestReportRHPNavigationButtonsProps) {
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    const [siblingDescriptorsByTransactionID] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {markReportIDAsExpense} = useWideRHPActions();

    const {prevTransactionID, nextTransactionID} = useMemo(() => {
        if (!transactionIDsList || transactionIDsList.length < 2) {
            return {prevTransactionID: undefined, nextTransactionID: undefined};
        }

        const currentTransactionIndex = transactionIDsList.findIndex((id) => id === currentTransactionID);

        const prevID = currentTransactionIndex > 0 ? transactionIDsList.at(currentTransactionIndex - 1) : undefined;
        const nextID = transactionIDsList.at(currentTransactionIndex + 1);

        return {
            prevTransactionID: prevID,
            nextTransactionID: nextID,
        };
    }, [currentTransactionID, transactionIDsList]);

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

    const [prevParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${prevTransaction?.reportID}`);
    const [nextParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nextTransaction?.reportID}`);
    const [prevThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${prevParentReportAction?.childReportID}`);
    const [nextThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nextParentReportAction?.childReportID}`);

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

    const onNext = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        e?.preventDefault();

        let backTo = Navigation.getActiveRoute();
        if (isFromReviewDuplicates) {
            const currentRoute = navigationRef.getCurrentRoute();
            const params = currentRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT] | undefined;
            backTo = params?.backTo ?? backTo;
        }

        // Snapshot-backed flows (e.g. Home "Recently added") seed a descriptor per sibling because the sibling
        // transactions may be absent from the main Onyx collections. Resolve the target sibling lazily here so
        // we only ever create a thread for the expense the user actually navigates to, then let OpenReport
        // hydrate it on arrival.
        const nextDescriptor = nextTransactionID ? siblingDescriptorsByTransactionID?.[nextTransactionID] : undefined;
        if (nextDescriptor) {
            // Defer the thread resolution off the press frame so the button paints its pressed state first,
            // then commit the destination swap as a non-urgent transition one frame later.
            requestAnimationFrame(() => {
                const nextReportID = getReportIDToOpenForExpense(nextDescriptor, {introSelected, betas, currentUserEmail, currentUserAccountID});
                markReportIDAsExpense(nextReportID);
                requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: nextReportID, reportActionID: undefined, backTo})));
            });
            return;
        }

        const nextThreadReportID = nextParentReportAction?.childReportID;
        const navigationParams = {reportID: nextThreadReportID, reportActionID: undefined, backTo};

        // Defer the optimistic-thread prep off the press frame so the button paints its pressed state
        // before the createTransactionThreadReport/openReport work runs.
        requestAnimationFrame(() => {
            if (nextThreadReportID) {
                markReportIDAsExpense(nextThreadReportID);
            }
            // We know that the next thread report exists, it just wasn't fetched to Onyx yet, so we set it optimistically.
            if (!nextThreadReport && nextThreadReportID) {
                setOptimisticTransactionThread(nextThreadReportID, nextParentReport?.reportID, nextParentReportAction?.reportActionID, nextParentReport?.policyID);
            }
            // The transaction thread doesn't exist yet, so we should create it
            if (!nextThreadReportID) {
                const transactionThreadReport = createTransactionThreadReport({
                    introSelected,
                    currentUserLogin: currentUserEmail ?? '',
                    currentUserAccountID,
                    betas,
                    iouReport: nextParentReport,
                    iouReportAction: nextParentReportAction,
                    transaction: nextTransaction,
                });
                navigationParams.reportID = transactionThreadReport?.reportID;
            }
            // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread or createTransactionThreadReport before navigating,
            // and mark the destination render as a transition so the heavy destination tree commits off the interaction's paint.
            requestAnimationFrame(() => startTransition(() => Navigation.setParams(navigationParams)));
        });
    };

    const onPrevious = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        e?.preventDefault();

        let backTo = Navigation.getActiveRoute();
        if (isFromReviewDuplicates) {
            const currentRoute = navigationRef.getCurrentRoute();
            const params = currentRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT] | undefined;
            backTo = params?.backTo ?? backTo;
        }

        // See onNext: resolve the target sibling lazily from its descriptor when present.
        const prevDescriptor = prevTransactionID ? siblingDescriptorsByTransactionID?.[prevTransactionID] : undefined;
        if (prevDescriptor) {
            // Defer the thread resolution off the press frame so the button paints its pressed state first,
            // then commit the destination swap as a non-urgent transition one frame later.
            requestAnimationFrame(() => {
                const prevReportID = getReportIDToOpenForExpense(prevDescriptor, {introSelected, betas, currentUserEmail, currentUserAccountID});
                markReportIDAsExpense(prevReportID);
                requestAnimationFrame(() => startTransition(() => Navigation.setParams({reportID: prevReportID, reportActionID: undefined, backTo})));
            });
            return;
        }

        const prevThreadReportID = prevParentReportAction?.childReportID;
        const navigationParams = {reportID: prevThreadReportID, reportActionID: undefined, backTo};

        // Defer the optimistic-thread prep off the press frame so the button paints its pressed state
        // before the createTransactionThreadReport/openReport work runs.
        requestAnimationFrame(() => {
            if (prevThreadReportID) {
                markReportIDAsExpense(prevThreadReportID);
            }
            // We know that the previous thread report exists, it just wasn't fetched to Onyx yet, so we set it optimistically.
            if (!prevThreadReport && prevThreadReportID) {
                setOptimisticTransactionThread(prevThreadReportID, prevParentReport?.reportID, prevParentReportAction?.reportActionID, prevParentReport?.policyID);
            }
            // The transaction thread doesn't exist yet, so we should create it
            if (!prevThreadReportID) {
                const transactionThreadReport = createTransactionThreadReport({
                    introSelected,
                    currentUserLogin: currentUserEmail ?? '',
                    currentUserAccountID,
                    betas,
                    iouReport: prevParentReport,
                    iouReportAction: prevParentReportAction,
                    transaction: prevTransaction,
                });
                navigationParams.reportID = transactionThreadReport?.reportID;
            }
            // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread or createTransactionThreadReport before navigating,
            // and mark the destination render as a transition so the heavy destination tree commits off the interaction's paint.
            requestAnimationFrame(() => startTransition(() => Navigation.setParams(navigationParams)));
        });
    };

    return (
        <PrevNextButtons
            isPrevButtonDisabled={!prevTransactionID}
            isNextButtonDisabled={!nextTransactionID}
            onNext={onNext}
            onPrevious={onPrevious}
        />
    );
}

export default MoneyRequestReportTransactionsNavigation;
