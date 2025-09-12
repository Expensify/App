import {findFocusedRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useMemo} from 'react';
import PrevNextButtons from '@components/PrevNextButtons';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useOnyx from '@hooks/useOnyx';
import {clearActiveTransactionThreadIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentReportID: string;
};

function MoneyRequestReportTransactionsNavigation({currentReportID}: MoneyRequestReportRHPNavigationButtonsProps) {
    const [reportIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_REPORT_IDS, {
        canBeMissing: true,
    });

    const {markReportIDAsExpense} = useContext(WideRHPContext);

    const {prevReportID, nextReportID} = useMemo(() => {
        if (!reportIDsList || reportIDsList.length < 2) {
            return {prevReportID: undefined, nextReportID: undefined};
        }

        const currentReportIndex = reportIDsList.findIndex((id) => id === currentReportID);

        const prevID = currentReportIndex > 0 ? reportIDsList.at(currentReportIndex - 1) : undefined;
        const nextID = currentReportIndex <= reportIDsList.length - 1 ? reportIDsList.at(currentReportIndex + 1) : undefined;

        return {prevReportID: prevID, nextReportID: nextID};
    }, [currentReportID, reportIDsList]);

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
            clearActiveTransactionThreadIDs();
        };
    }, []);

    if (reportIDsList.length < 2) {
        return;
    }

    return (
        <PrevNextButtons
            isPrevButtonDisabled={!prevReportID}
            isNextButtonDisabled={!nextReportID}
            onNext={(e) => {
                const backTo = Navigation.getActiveRoute();
                e?.preventDefault();
                if (nextReportID) {
                    markReportIDAsExpense(nextReportID);
                }
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: nextReportID, backTo}), {forceReplace: true});
            }}
            onPrevious={(e) => {
                const backTo = Navigation.getActiveRoute();
                e?.preventDefault();
                if (prevReportID) {
                    markReportIDAsExpense(prevReportID);
                }
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: prevReportID, backTo}), {forceReplace: true});
            }}
        />
    );
}

MoneyRequestReportTransactionsNavigation.displayName = 'MoneyRequestReportTransactionsNavigation';

export default MoneyRequestReportTransactionsNavigation;
