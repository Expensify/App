import {findFocusedRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import PrevNextButtons from '@components/PrevNextButtons';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useOnyx from '@hooks/useOnyx';
import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentTransactionID: string;
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

function MoneyRequestReportTransactionsNavigation({currentTransactionID}: MoneyRequestReportRHPNavigationButtonsProps) {
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, {
        canBeMissing: true,
    });
    const [currentTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${currentTransactionID}`, {
        canBeMissing: true,
    });
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentTransaction?.reportID}`, {canBeMissing: true});

    const {markReportIDAsExpense} = useContext(WideRHPContext);

    const [parentReportActions = new Map<string, OnyxTypes.ReportAction>()] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`, {
        canBeMissing: true,
        selector: parentReportActionIDsSelector,
    });
    const {prevTransactionID, prevParentReportAction, nextTransactionID, nextParentReportAction} = useMemo(() => {
        if (!transactionIDsList || transactionIDsList.length < 2) {
            return {prevTransactionID: undefined, prevParentReportAction: undefined, nextTransactionID: undefined, nextParentReportAction: undefined};
        }

        const currentTransactionIndex = transactionIDsList.findIndex((id) => id === currentTransactionID);

        const prevID = currentTransactionIndex > 0 ? transactionIDsList.at(currentTransactionIndex - 1) : undefined;
        const nextID = transactionIDsList.at(currentTransactionIndex + 1);

        return {
            prevTransactionID: prevID,
            nextTransactionID: nextID,
            prevParentReportAction: prevID ? parentReportActions.get(prevID) : undefined,
            nextParentReportAction: nextID ? parentReportActions.get(nextID) : undefined,
        };
    }, [currentTransactionID, parentReportActions, transactionIDsList]);

    const [prevThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${prevParentReportAction?.childReportID}`, {canBeMissing: true});
    const [nextThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nextParentReportAction?.childReportID}`, {canBeMissing: true});

    /**
     * We clear the sibling transactionThreadIDs when unmounting this component
     * only when the mount actually goes to a different SCREEN (and not a different version of the same SCREEN)
     */
    useEffect(() => {
        return () => {
            const focusedRoute = findFocusedRoute(navigationRef.getRootState());
            if (focusedRoute?.name === SCREENS.SEARCH.REPORT_RHP) {
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

        const backTo = Navigation.getActiveRoute();
        const nextThreadReportID = nextParentReportAction?.childReportID;
        const navigationParams = {reportID: nextThreadReportID, backTo};

        if (nextThreadReportID) {
            markReportIDAsExpense(nextThreadReportID);
        }
        // We know that the next thread report exists, it just wasn't fetched to Onyx yet, so we set it optimistically.
        if (!nextThreadReport && nextThreadReportID) {
            setOptimisticTransactionThread(nextThreadReportID, parentReport?.reportID, nextParentReportAction?.reportActionID, parentReport?.policyID);
        }
        // The transaction thread doesn't exist yet, so we should create it
        if (!nextThreadReportID) {
            const transactionThreadReport = createTransactionThreadReport(parentReport, nextParentReportAction);
            navigationParams.reportID = transactionThreadReport?.reportID;
        }
        // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread or createTransactionThreadReport before navigating
        requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(navigationParams), {forceReplace: true}));
    };

    const onPrevious = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        e?.preventDefault();

        const backTo = Navigation.getActiveRoute();
        const prevThreadReportID = prevParentReportAction?.childReportID;
        const navigationParams = {reportID: prevThreadReportID, backTo};

        if (prevThreadReportID) {
            markReportIDAsExpense(prevThreadReportID);
        }
        // We know that the previous thread report exists, it just wasn't fetched to Onyx yet, so we set it optimistically.
        if (!prevThreadReport && prevThreadReportID) {
            setOptimisticTransactionThread(prevThreadReportID, parentReport?.reportID, prevParentReportAction?.reportActionID, parentReport?.policyID);
        }
        // The transaction thread doesn't exist yet, so we should create it
        if (!prevThreadReportID) {
            const transactionThreadReport = createTransactionThreadReport(parentReport, prevParentReportAction);
            navigationParams.reportID = transactionThreadReport?.reportID;
        }
        // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread or createTransactionThreadReport before navigating
        requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(navigationParams), {forceReplace: true}));
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

MoneyRequestReportTransactionsNavigation.displayName = 'MoneyRequestReportTransactionsNavigation';

export default MoneyRequestReportTransactionsNavigation;
