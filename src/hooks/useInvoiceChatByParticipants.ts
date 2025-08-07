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

function useInvoiceChatByParticipants(receiverID: string | number | undefined, receiverType: InvoiceReceiverType, policyID?: string): OnyxEntry<Report> {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [allReportNameValuePair] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true, selector: (c) => mapOnyxCollectionItems(c, reportNameValuePairsSelector)});

    const invoiceReport = useMemo(() => {
        return Object.values(allReports ?? {}).find((report) => {
            const reportNameValuePairs = allReportNameValuePair?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
            const isReportArchived = isArchivedReport(reportNameValuePairs);
            if (!report || !isInvoiceRoom(report) || isArchivedNonExpenseReport(report, isReportArchived)) {
                return false;
            }

            const isSameReceiver =
                report.invoiceReceiver &&
                report.invoiceReceiver.type === receiverType &&
                (('accountID' in report.invoiceReceiver && report.invoiceReceiver.accountID === receiverID) ||
                    ('policyID' in report.invoiceReceiver && report.invoiceReceiver.policyID === receiverID));

            return report.policyID === policyID && isSameReceiver;
        });
    }, [receiverID, receiverType, policyID, allReports, allReportNameValuePair]);

    return invoiceReport;
}

export default useInvoiceChatByParticipants;
