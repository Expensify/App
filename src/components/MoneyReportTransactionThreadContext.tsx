import React, {createContext, useContext} from 'react';
import type {ReactNode} from 'react';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type MoneyReportTransactionThreadContextValue = {
    iouTransactionID: string | undefined;
    requestParentReportAction: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> | null;
    transactionThreadReportID: string | undefined;
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
    reportID: string | undefined;
    children: ReactNode;
};

function MoneyReportTransactionThreadProvider({reportID, children}: MoneyReportTransactionThreadProviderProps) {
    const {transactionThreadReportID, transactionThreadReport, reportActions} = useTransactionThreadReport(reportID);

    const requestParentReportAction =
        reportActions?.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport?.parentReportActionID) ??
        null;

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
