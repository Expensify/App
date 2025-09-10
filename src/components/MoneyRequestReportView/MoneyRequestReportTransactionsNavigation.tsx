import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect, useMemo} from 'react';
import PrevNextButtons from '@components/PrevNextButtons';
import useOnyx from '@hooks/useOnyx';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import {createTransactionThreadReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentTransactionID: string;
};

function MoneyRequestReportTransactionsNavigation({currentTransactionID}: MoneyRequestReportRHPNavigationButtonsProps) {
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, {
        canBeMissing: true,
    });
    const [currentTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${currentTransactionID}`, {
        canBeMissing: true,
    });
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentTransaction?.reportID}`, {canBeMissing: true});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTransaction?.reportID}`, {canBeMissing: true});

    const {prevTransactionID, nextTransactionID} = useMemo(() => {
        if (!transactionIDsList || transactionIDsList.length < 2) {
            return {prevReportID: undefined, nextReportID: undefined};
        }

        const currentReportIndex = transactionIDsList.findIndex((id) => id === currentTransactionID);

        const prevID = currentReportIndex > 0 ? transactionIDsList.at(currentReportIndex - 1) : undefined;
        const nextID = currentReportIndex <= transactionIDsList.length - 1 ? transactionIDsList.at(currentReportIndex + 1) : undefined;

        return {prevTransactionID: prevID, nextTransactionID: nextID};
    }, [currentTransactionID, transactionIDsList]);

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

    const navigateToReportByTransactionID = (transactionID: string | undefined) => {
        if (!transactionID) {
            return;
        }

        const backTo = Navigation.getActiveRoute();
        const iouAction = getIOUActionForTransactionID(Object.values(reportActions ?? {}), transactionID);
        if (iouAction?.childReportID) {
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: iouAction.childReportID, backTo}), {forceReplace: true});
        } else {
            const transactionThreadReport = createTransactionThreadReport(iouReport, iouAction);
            Navigation.navigate(
                ROUTES.SEARCH_REPORT.getRoute({
                    reportID: transactionThreadReport?.reportID,
                    backTo,
                }),
            );
        }
    };

    return (
        <PrevNextButtons
            isPrevButtonDisabled={!prevTransactionID}
            isNextButtonDisabled={!nextTransactionID}
            onNext={(e) => {
                e?.preventDefault();
                navigateToReportByTransactionID(nextTransactionID);
            }}
            onPrevious={(e) => {
                e?.preventDefault();
                navigateToReportByTransactionID(prevTransactionID);
            }}
        />
    );
}

MoneyRequestReportTransactionsNavigation.displayName = 'MoneyRequestReportTransactionsNavigation';

export default MoneyRequestReportTransactionsNavigation;
