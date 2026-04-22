import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {isArchivedNonExpenseReport, isArchivedReport, isInvoiceRoom} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {InvoiceReceiverType} from '@src/types/onyx/Report';
import useOnyx from './useOnyx';

function useParticipantsInvoiceReport(receiverID: string | number | undefined, receiverType: InvoiceReceiverType, policyID?: string): OnyxEntry<Report> {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

    const invoiceReport = useMemo(() => {
        if (!allReports || !reportNameValuePairs) {
            return undefined;
        }

        const existingInvoiceReport = Object.values(allReports).find((report) => {
            if (!report || !isInvoiceRoom(report)) {
                return false;
            }

            const isReportArchived = isArchivedReport(reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]);
            if (isArchivedNonExpenseReport(report, isReportArchived)) {
                return false;
            }

            const isSameReceiver =
                report.invoiceReceiver?.type === receiverType &&
                (('accountID' in report.invoiceReceiver && report.invoiceReceiver.accountID === receiverID) ||
                    ('policyID' in report.invoiceReceiver && report.invoiceReceiver.policyID === receiverID));

            return report.policyID === policyID && isSameReceiver;
        });

        return existingInvoiceReport;
    }, [allReports, reportNameValuePairs, receiverID, receiverType, policyID]);

    return invoiceReport;
}

export default useParticipantsInvoiceReport;
