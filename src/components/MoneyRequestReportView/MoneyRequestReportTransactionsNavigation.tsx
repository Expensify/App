import {findFocusedRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import PrevNextButtons from '@components/PrevNextButtons';
import useOnyx from '@hooks/useOnyx';
import {clearActiveTransactionThreadIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentReportID: string;
};

function MoneyRequestReportTransactionsNavigation({currentReportID}: MoneyRequestReportRHPNavigationButtonsProps) {
    const [reportIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_REPORT_IDS, {
        canBeMissing: true,
    });

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

    const goToReportId = useCallback((e?: GestureResponderEvent | KeyboardEvent, reportId?: string) => {
        e?.preventDefault();

        if (!reportId) {
            return;
        }
        Navigation.setParams({
            reportID: reportId,
        });
    }, []);

    if (reportIDsList.length < 2) {
        return;
    }

    return (
        <PrevNextButtons
            isPrevButtonDisabled={!prevReportID}
            isNextButtonDisabled={!nextReportID}
            onNext={(e) => goToReportId(e, nextReportID)}
            onPrevious={(e) => goToReportId(e, prevReportID)}
        />
    );
}

MoneyRequestReportTransactionsNavigation.displayName = 'MoneyRequestReportTransactionsNavigation';

export default MoneyRequestReportTransactionsNavigation;
