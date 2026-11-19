/**
 * Checks whether a given account is the submitter or the manager of a report. This file never imports ReportUtils, so modules
 * whose graph reaches ReportUtils (like TransactionUtils/violations) can use them without an import cycle. ReportUtils keeps
 * wrapper functions with the same names that fall back to the session account.
 */
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Checks if the given user is the submitter of the report.
 */
function isCurrentUserSubmitter(report: OnyxEntry<Report>, currentUserAccountID: number | undefined): boolean {
    return !!report && report.ownerAccountID === currentUserAccountID;
}

/**
 * Checks if the given user is the manager of the supplied report.
 */
function isReportManager(report: OnyxEntry<Report>, currentUserAccountID: number | undefined): boolean {
    return !!(report && report.managerID === currentUserAccountID);
}

export {isCurrentUserSubmitter, isReportManager};
