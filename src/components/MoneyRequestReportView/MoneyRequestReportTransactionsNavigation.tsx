import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import PrevNextButtons from '@components/PrevNextButtons';
import useOnyx from '@hooks/useOnyx';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {generateReportID} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentTransactionID: string;
    parentReport: OnyxEntry<Report>;
};

function MoneyRequestReportTransactionsNavigation({currentTransactionID, parentReport}: MoneyRequestReportRHPNavigationButtonsProps) {
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, {
        canBeMissing: true,
    });
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`, {canEvict: false, canBeMissing: true});
    const reportActionsArray = Object.values(reportActions ?? {});

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
        const action = getIOUActionForTransactionID(Object.values(reportActionsArray), transactionID);

        if (action?.childReportID) {
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: action.childReportID, backTo}), {forceReplace: true});
        } else {
            const transactionThreadReportID = generateReportID();
            Navigation.navigate(
                ROUTES.SEARCH_REPORT.getRoute({
                    reportID: transactionThreadReportID,
                    backTo,
                    moneyRequestReportActionID: action?.reportActionID,
                    transactionID,
                    iouReportID: parentReport?.reportID,
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
