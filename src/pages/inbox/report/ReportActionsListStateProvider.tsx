/** Prepare visible actions without rerunning pagination when survey metadata changes. */
import useOnyx from '@hooks/useOnyx';
import type {ReportActionsListSourceState} from '@hooks/useReportActionsListModel';

import {shouldHidePayAction} from '@libs/ReportActionsUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportNameValuePairs} from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import filterHiddenSupportTicketSurveys from './ReportActionsList/filterHiddenSupportTicketSurveys';
import {ReportActionsListStateContext} from './ReportActionsListContext';

type ReportActionsListStateProviderProps = {
    state: ReportActionsListSourceState;
    children: ReactNode;
};

const reopenedAsReportIDSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) => reportNameValuePairs?.reopenedAsReportID;

function ReportActionsListStateProvider({state, children}: ReportActionsListStateProviderProps) {
    const {report, sortedReportActions, sortedVisibleReportActions, sortedAllReportActions} = state;
    const [reopenedAsReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {selector: reopenedAsReportIDSelector});

    const paymentFilteredReportActions = report?.isWaitingOnBankAccount ? sortedReportActions.filter((action) => !shouldHidePayAction(action, true)) : sortedReportActions;
    const paymentFilteredVisibleReportActions = report?.isWaitingOnBankAccount
        ? sortedVisibleReportActions.filter((action) => !shouldHidePayAction(action, true))
        : sortedVisibleReportActions;
    const surveyNameValuePairs = {reopenedAsReportID};
    const surveyFilteredReportActions = filterHiddenSupportTicketSurveys({
        reportActions: paymentFilteredReportActions,
        sortedAllReportActions,
        report,
        reportNameValuePairs: surveyNameValuePairs,
    });
    const surveyFilteredVisibleReportActions = filterHiddenSupportTicketSurveys({
        reportActions: paymentFilteredVisibleReportActions,
        sortedAllReportActions,
        report,
        reportNameValuePairs: surveyNameValuePairs,
    });

    const value = {
        ...state,
        sortedReportActions: surveyFilteredReportActions,
        sortedVisibleReportActions: surveyFilteredVisibleReportActions,
        scrollReportActions: paymentFilteredVisibleReportActions,
    };

    return <ReportActionsListStateContext.Provider value={value}>{children}</ReportActionsListStateContext.Provider>;
}

export default ReportActionsListStateProvider;
