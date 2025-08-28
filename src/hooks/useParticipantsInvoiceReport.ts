import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {isArchivedNonExpenseReport, isArchivedReport, isInvoiceRoom} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportNameValuePairs} from '@src/types/onyx';
import type {InvoiceReceiverType} from '@src/types/onyx/Report';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useOnyx from './useOnyx';

type ReportNameValuePairsSelector = Pick<ReportNameValuePairs, 'private_isArchived'>;

const reportNameValuePairsSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>): ReportNameValuePairsSelector =>
    (reportNameValuePairs && {
        private_isArchived: reportNameValuePairs.private_isArchived,
    }) as ReportNameValuePairsSelector;

function useParticipantsInvoiceReport(receiverID: string | number | undefined, receiverType: InvoiceReceiverType, policyID?: string): OnyxEntry<Report> {
    const reportSelector = (report: OnyxEntry<Report>): Report | undefined => {
        if (!report || !isInvoiceRoom(report)) {
            return;
        }

        const isSameReceiver =
            report.invoiceReceiver &&
            report.invoiceReceiver.type === receiverType &&
            (('accountID' in report.invoiceReceiver && report.invoiceReceiver.accountID === receiverID) ||
                ('policyID' in report.invoiceReceiver && report.invoiceReceiver.policyID === receiverID));

        const isSameInvoiceRoom = report.policyID === policyID && isSameReceiver;
        if (isSameInvoiceRoom) {
            return report;
        }
    };

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true, selector: (c) => mapOnyxCollectionItems(c, reportSelector)}, [receiverID, receiverType, policyID]);
    const existingInvoiceReport = Object.values(allReports ?? {}).find((report) => !!report);
    const [reportNameValuePair] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${existingInvoiceReport?.reportID}`, {
        canBeMissing: true,
        selector: reportNameValuePairsSelector,
    });

    const invoiceReport = useMemo(() => {
        const isReportArchived = isArchivedReport(reportNameValuePair);

        if (isArchivedNonExpenseReport(existingInvoiceReport, isReportArchived)) {
            return;
        }

        return existingInvoiceReport;
    }, [reportNameValuePair, existingInvoiceReport]);

    return invoiceReport;
}

export default useParticipantsInvoiceReport;
