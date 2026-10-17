import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useDocumentTitle from '@hooks/useDocumentTitle';
import useOnyx from '@hooks/useOnyx';
import {useDerivedReportNameByReportID} from '@hooks/useReportAttributes';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportName} from '@libs/ReportNameUtils';
import {getReportOfflinePendingActionAndErrors, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import HeaderView from './HeaderView';
import useReportBackButtonPress from './useReportBackButtonPress';

/**
 * Owns header variant selection and the OfflineWithFeedback wrapper; back button logic lives in
 * useReportBackButtonPress, which the floating back button shares.
 * Subscribes to report type internally — ReportScreen passes nothing.
 */
function ReportHeader() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const onBackButtonPress = useReportBackButtonPress();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const reportID = report?.reportID;

    const derivedReportName = useDerivedReportNameByReportID(reportID);
    useDocumentTitle(getReportName(report, derivedReportName));

    const isTransactionThreadView = isReportTransactionThread(report);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);
    const pendingAction = reportPendingAction ?? report?.pendingFields?.reimbursed;

    if (isTransactionThreadView) {
        return (
            <OfflineWithFeedback
                pendingAction={pendingAction}
                errors={reportErrors}
                shouldShowErrorMessages={false}
                needsOffscreenAlphaCompositing
            >
                <MoneyRequestHeader
                    reportID={reportIDFromRoute}
                    onBackButtonPress={onBackButtonPress}
                />
            </OfflineWithFeedback>
        );
    }

    if (isMoneyRequestOrInvoiceReport) {
        return (
            <OfflineWithFeedback
                pendingAction={pendingAction}
                errors={reportErrors}
                shouldShowErrorMessages={false}
                needsOffscreenAlphaCompositing
            >
                <MoneyReportHeader
                    reportID={reportIDFromRoute}
                    onBackButtonPress={onBackButtonPress}
                />
            </OfflineWithFeedback>
        );
    }

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={reportErrors}
            shouldShowErrorMessages={false}
            needsOffscreenAlphaCompositing
        >
            <HeaderView
                reportID={reportIDFromRoute}
                onNavigationMenuButtonClicked={onBackButtonPress}
            />
        </OfflineWithFeedback>
    );
}

export default ReportHeader;
