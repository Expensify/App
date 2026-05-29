import React, {createContext, useContext} from 'react';
import type {ReactNode} from 'react';
import useOnyx from '@hooks/useOnyx';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type MoneyReportTransactionThreadContextValue = {
    /** The transaction ID from the parent IOU report action */
    iouTransactionID: string | undefined;
    /** The parent IOU report action for the transaction thread */
    requestParentReportAction: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> | null;
    /** The transaction thread report ID */
    transactionThreadReportID: string | undefined;
    /** Filtered report actions for the transaction thread */
    reportActions: OnyxTypes.ReportAction[];
};

const defaultValue: MoneyReportTransactionThreadContextValue = {
    iouTransactionID: undefined,
    requestParentReportAction: null,
    transactionThreadReportID: undefined,
    reportActions: [],
};

const MoneyReportTransactionThreadContext = createContext<MoneyReportTransactionThreadContextValue>(defaultValue);

type MoneyReportTransactionThreadProviderProps = {
    /** The money request report ID */
    reportID: string | undefined;
    /** The children */
    children: ReactNode;
};

function MoneyReportTransactionThreadProvider({reportID, children}: MoneyReportTransactionThreadProviderProps) {
    const {transactionThreadReportID, transactionThreadReport, reportActions} = useTransactionThreadReport(reportID);
    const [reportActionsForParent] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`);

    // Parent lookup uses the raw Onyx collection so Hold/Unhold still work when the parent IOU is
    // filtered from the report view (e.g. deleted money request) or outside the paginated window.
    const parentReportAction = transactionThreadReport?.parentReportActionID ? reportActionsForParent?.[transactionThreadReport.parentReportActionID] : undefined;
    const requestParentReportAction = isMoneyRequestAction(parentReportAction) ? parentReportAction : null;

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;

    const value: MoneyReportTransactionThreadContextValue = {
        iouTransactionID,
        requestParentReportAction: requestParentReportAction ?? null,
        transactionThreadReportID,
        reportActions: reportActions ?? [],
    };

    return <MoneyReportTransactionThreadContext.Provider value={value}>{children}</MoneyReportTransactionThreadContext.Provider>;
}

function useMoneyReportTransactionThread() {
    return useContext(MoneyReportTransactionThreadContext);
}

export default MoneyReportTransactionThreadContext;
export {MoneyReportTransactionThreadProvider, useMoneyReportTransactionThread};
