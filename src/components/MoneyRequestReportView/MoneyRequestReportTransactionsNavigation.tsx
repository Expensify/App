import {findFocusedRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import PrevNextButtons from '@components/PrevNextButtons';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useOnyx from '@hooks/useOnyx';
import {setOptimisticTransactionThread} from '@libs/actions/Report';
import {clearActiveTransactionThreadIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentReportID: string;
    parentReportID?: string;
    policyID?: string;
};

const parentReportActionIDsSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>) => {
    const parentActions = new Map<string, string>();
    for (const action of Object.values(reportActions ?? {})) {
        if (!action?.childReportID) {
            continue;
        }
        parentActions.set(action.childReportID, action.reportActionID);
    }
    return parentActions;
};

function MoneyRequestReportTransactionsNavigation({currentReportID, parentReportID, policyID}: MoneyRequestReportRHPNavigationButtonsProps) {
    const [reportIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_REPORT_IDS, {
        canBeMissing: true,
    });

    const {markReportIDAsExpense} = useContext(WideRHPContext);

    const [parentReportActionIDs = new Map<string, string>()] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
        canBeMissing: true,
        selector: parentReportActionIDsSelector,
    });

    const {prevReportID, prevParentReportActionID, nextReportID, nextParentReportActionID} = useMemo(() => {
        if (!reportIDsList || reportIDsList.length < 2) {
            return {prevReportID: undefined, prevParentReportActionID: undefined, nextReportID: undefined, nextParentReportActionID: undefined};
        }

        const currentReportIndex = reportIDsList.findIndex((id) => id === currentReportID);

        const prevID = currentReportIndex > 0 ? reportIDsList.at(currentReportIndex - 1) : undefined;
        const nextID = reportIDsList.at(currentReportIndex + 1);

        return {
            prevReportID: prevID,
            nextReportID: nextID,
            prevParentReportActionID: prevID ? parentReportActionIDs.get(prevID) : undefined,
            nextParentReportActionID: nextID ? parentReportActionIDs.get(nextID) : undefined,
        };
    }, [currentReportID, parentReportActionIDs, reportIDsList]);

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
                setOptimisticTransactionThread(nextReportID, parentReportID, nextParentReportActionID, policyID);
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: nextReportID, backTo}), {forceReplace: true});
            }}
            onPrevious={(e) => {
                const backTo = Navigation.getActiveRoute();
                e?.preventDefault();
                if (prevReportID) {
                    markReportIDAsExpense(prevReportID);
                }
                setOptimisticTransactionThread(prevReportID, parentReportID, prevParentReportActionID, policyID);
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: prevReportID, backTo}), {forceReplace: true});
            }}
        />
    );
}

MoneyRequestReportTransactionsNavigation.displayName = 'MoneyRequestReportTransactionsNavigation';

export default MoneyRequestReportTransactionsNavigation;
