import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {findLastAccessedReport} from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportMetadata, ReportNameValuePairs} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useOnyx from './useOnyx';

// Optimized selectors based on complete field usage analysis in findLastAccessedReport
type ReportSelector = Pick<Report, 'reportID' | 'lastReadTime' | 'chatType' | 'type' | 'participants' | 'invoiceReceiver' | 'ownerAccountID' | 'parentReportActionID' | 'policyID'>;

type PolicySelector = Pick<Policy, 'id' | 'employeeList'>;

type ReportMetadataSelector = Pick<ReportMetadata, 'lastVisitTime'>;

type ReportNameValuePairsSelector = Pick<ReportNameValuePairs, 'private_isArchived'>;

const reportSelector = (report: OnyxEntry<Report>): ReportSelector =>
    (report && {
        reportID: report.reportID,
        lastReadTime: report.lastReadTime,
        chatType: report.chatType,
        type: report.type,
        participants: report.participants,
        invoiceReceiver: report.invoiceReceiver,
        ownerAccountID: report.ownerAccountID,
        parentReportActionID: report.parentReportActionID,
        policyID: report.policyID,
    }) as ReportSelector;

const policySelector = (policy: OnyxEntry<Policy>): PolicySelector =>
    (policy && {
        id: policy.id,
        employeeList: policy.employeeList,
    }) as PolicySelector;

const reportNameValuePairsSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>): ReportNameValuePairsSelector =>
    (reportNameValuePairs && {
        private_isArchived: reportNameValuePairs.private_isArchived,
    }) as ReportNameValuePairsSelector;

const reportMetadataSelector = (reportMetadata: OnyxEntry<ReportMetadata>): ReportMetadataSelector =>
    (reportMetadata && {
        lastVisitTime: reportMetadata.lastVisitTime,
    }) as ReportMetadataSelector;

function useLastAccessedReport(ignoreDomainRooms: boolean, openOnAdminRoom = false, policyID?: string, excludeReportID?: string) {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: (c) => mapOnyxCollectionItems(c, reportSelector),
    });

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
        selector: (c) => mapOnyxCollectionItems(c, policySelector),
    });

    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
        selector: (c) => mapOnyxCollectionItems(c, reportNameValuePairsSelector),
    });

    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA, {
        canBeMissing: true,
        selector: (c) => mapOnyxCollectionItems(c, reportMetadataSelector),
    });

    const lastAccessReport = useMemo(() => {
        return findLastAccessedReport(
            allReports,
            allPolicies as OnyxCollection<OnyxEntry<Policy>>,
            allReportMetadata,
            allReportNameValuePairs,
            ignoreDomainRooms,
            openOnAdminRoom,
            policyID,
            excludeReportID,
        );
    }, [allReports, allPolicies, allReportMetadata, allReportNameValuePairs, ignoreDomainRooms, openOnAdminRoom, policyID, excludeReportID]);

    return {lastAccessReport, lastAccessReportID: lastAccessReport?.reportID};
}

export default useLastAccessedReport;
