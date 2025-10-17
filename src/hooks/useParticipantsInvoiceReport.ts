import {createReportNameValuePairsSelector} from '@selectors/ReportNameValuePairs';
import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {isArchivedNonExpenseReport, isArchivedReport, isInvoiceRoom} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportNameValuePairs} from '@src/types/onyx';
import type {InvoiceReceiverType} from '@src/types/onyx/Report';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useOnyx from './useOnyx';

type ReportNameValuePairsSelector = Pick<ReportNameValuePairs, 'private_isArchived'>;

/*
 Since invoice chat rooms have `type === CONST.REPORT.TYPE.CHAT`,
 we filter on that value to minimize the number of rNVPs being subscribed to.
*/
const reportNameValuePairSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>): ReportNameValuePairsSelector | undefined => {
    if (reportNameValuePairs && 'type' in reportNameValuePairs && reportNameValuePairs?.type !== CONST.REPORT.TYPE.CHAT) {
        return;
    }
    return (
        reportNameValuePairs &&
        ({
            private_isArchived: reportNameValuePairs.private_isArchived,
        } as ReportNameValuePairsSelector)
    );
};

const reportNameValuePairsSelector = (reportNameValuePairs: OnyxCollection<ReportNameValuePairs>) => createReportNameValuePairsSelector(reportNameValuePairs, reportNameValuePairSelector);

const reportSelector = (report: OnyxEntry<Report>): Report | undefined => {
    if (!report || !isInvoiceRoom(report)) {
        return;
    }

    return report;
};

const allInvoiceReportsSelector = (reports: OnyxCollection<Report>) => mapOnyxCollectionItems(reports, reportSelector);

function useParticipantsInvoiceReport(receiverID: string | number | undefined, receiverType: InvoiceReceiverType, policyID?: string): OnyxEntry<Report> {
    const [allInvoiceReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true, selector: allInvoiceReportsSelector});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}`, {
        canBeMissing: true,
        selector: reportNameValuePairsSelector,
    });

    const invoiceReport = useMemo(() => {
        const existingInvoiceReport = Object.values(allInvoiceReports ?? {}).find((report) => {
            if (!report || !reportNameValuePairs) {
                return false;
            }
            const isReportArchived = isArchivedReport(reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`]);
            if (isArchivedNonExpenseReport(report, isReportArchived)) {
                return false;
            }
            const isSameReceiver =
                report.invoiceReceiver &&
                report.invoiceReceiver.type === receiverType &&
                (('accountID' in report.invoiceReceiver && report.invoiceReceiver.accountID === receiverID) ||
                    ('policyID' in report.invoiceReceiver && report.invoiceReceiver.policyID === receiverID));

            return report.policyID === policyID && isSameReceiver;
        });
        return existingInvoiceReport;
    }, [allInvoiceReports, reportNameValuePairs, receiverID, receiverType, policyID]);
    return invoiceReport;
}

export default useParticipantsInvoiceReport;
