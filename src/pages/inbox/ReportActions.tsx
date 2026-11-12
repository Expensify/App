import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import type ReportScreenNavigationProps from './types';

import ChatReportActions from './ChatReportActions';
import MoneyRequestReportActions from './MoneyRequestReportActions';
import ReportActionsLoadingSkeleton from './report/ReportActionsLoadingSkeleton';

/** Choose the report surface without mounting transaction-based layout selection for ordinary chats. */
function ReportActions() {
    const route = useRoute<ReportScreenNavigationProps['route']>();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);

    if (!report) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={reportIDFromRoute}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.REPORT_ACTIONS_REPORT_DATA_LOADING}
            />
        );
    }

    if (isMoneyRequestReport(report) || isInvoiceReport(report)) {
        return <MoneyRequestReportActions report={report} />;
    }

    return <ChatReportActions report={report} />;
}

export default ReportActions;
