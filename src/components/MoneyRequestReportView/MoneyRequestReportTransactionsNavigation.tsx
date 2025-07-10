import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect, useMemo} from 'react';
import PrevNextButtons from '@components/PrevNextButtons';
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

    parentReportID?: string;

    /** The route to navigate back to when the user clicks on the back button */
    backTo?: string;
};

function MoneyRequestReportTransactionsNavigation({currentReportID, parentReportID, backTo}: MoneyRequestReportRHPNavigationButtonsProps) {
    const [reportIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_REPORT_IDS, {
        canBeMissing: true,
    });
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
        canBeMissing: true,
        selector: (reportActions) => Object.values(reportActions ?? {}),
    });

    const {prevReportID, prevParentReportActionID, nextReportID, nextParentReportActionID} = useMemo(() => {
        if (!reportIDsList || reportIDsList.length < 2) {
            return {prevReportID: undefined, prevParentReportActionID: undefined, nextReportID: undefined, nextParentReportActionID: undefined};
        }

        const currentReportIndex = reportIDsList.findIndex((id) => id === currentReportID);

        const prevID = currentReportIndex > 0 ? reportIDsList.at(currentReportIndex - 1) : undefined;
        const nextID = currentReportIndex <= reportIDsList.length - 1 ? reportIDsList.at(currentReportIndex + 1) : undefined;
        const prevReportActionID = currentReportIndex > 0 ? parentReportActions?.find((action) => action.childReportID === prevID)?.reportActionID : undefined;
        const nextReportActionID = currentReportIndex <= reportIDsList.length - 1 ? parentReportActions?.find((action) => action.childReportID === nextID)?.reportActionID : undefined;

        return {prevReportID: prevID, prevParentReportActionID: prevReportActionID, nextReportID: nextID, nextParentReportActionID: nextReportActionID};
    }, [currentReportID, parentReportActions, reportIDsList]);

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
                Navigation.navigate(
                    ROUTES.SEARCH_REPORT.getRoute({reportID: nextReportID, parentReportActionID: nextParentReportActionID, parentReportID, backTo: backTo ?? Navigation.getActiveRoute()}),
                    {
                        forceReplace: true,
                    },
                );
            }}
            onPrevious={(e) => {
                e?.preventDefault();
                Navigation.navigate(
                    ROUTES.SEARCH_REPORT.getRoute({reportID: prevReportID, parentReportActionID: prevParentReportActionID, parentReportID, backTo: backTo ?? Navigation.getActiveRoute()}),
                    {
                        forceReplace: true,
                    },
                );
            }}
        />
    );
}

MoneyRequestReportTransactionsNavigation.displayName = 'MoneyRequestReportTransactionsNavigation';

export default MoneyRequestReportTransactionsNavigation;
