import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import PrevNextButtons from '@components/PrevNextButtons';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {clearActiveTransactionThreadIDs, getActiveTransactionThreadIDs} from './TransactionThreadReportIDRepository';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentReportID: string;
};

function MoneyRequestReportTransactionsNavigation({currentReportID}: MoneyRequestReportRHPNavigationButtonsProps) {
    const reportIDsList = getActiveTransactionThreadIDs();
    const {prevReportID, nextReportID} = (() => {
        if (!reportIDsList) {
            return {prevReportID: undefined, nextReportID: undefined};
        }

        const currentReportIndex = reportIDsList.findIndex((id) => id === currentReportID);

        const prevID = currentReportIndex > 0 ? reportIDsList.at(currentReportIndex - 1) : undefined;
        const nextID = currentReportIndex <= reportIDsList.length - 1 ? reportIDsList.at(currentReportIndex + 1) : undefined;

        return {prevReportID: prevID, nextReportID: nextID};
    })();

    const backTo = Navigation.getActiveRoute();

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
                e?.preventDefault();
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: nextReportID, backTo}), {forceReplace: true});
            }}
            onPrevious={(e) => {
                e?.preventDefault();
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: prevReportID, backTo}), {forceReplace: true});
            }}
        />
    );
}

MoneyRequestReportTransactionsNavigation.displayName = 'MoneyRequestReportTransactionsNavigation';

export default MoneyRequestReportTransactionsNavigation;
