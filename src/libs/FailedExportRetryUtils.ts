/**
 * Finds the expense reports whose export to the accounting integration failed before the latest successful sync.
 * An admin can then export these reports again.
 */
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportActions} from '@src/types/onyx';
import type {ConnectionLastSync, ConnectionName} from '@src/types/onyx/Policy';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {startOfDay, subDays} from 'date-fns';

import {isAuthenticationError} from './actions/connections';
import {getValidConnectedIntegration} from './PolicyUtils';
import {getOriginalMessage, isIntegrationMessageAction} from './ReportActionsUtils';

type RetryWindow = {
    /** The connection that the reports can export to now */
    connectionName: ConnectionName;

    /** The earliest failure time to offer, in epoch milliseconds */
    fromTime: number;

    /** The time of the latest successful sync, in epoch milliseconds. The offer ignores failures after this time. */
    toTime: number;
};

type FailedExportReport = {
    reportID: string;
    reportName: string;
    total: number;
    currency: string | undefined;

    /** The time of the latest failed export, in epoch milliseconds */
    failedTime: number;
};

/**
 * Returns the time of the latest failed export of the report, in epoch milliseconds.
 * The server keys `errorFields.export` by the failure time in epoch microseconds.
 */
function getExportFailedTime(report: OnyxEntry<Report>): number | undefined {
    let latestFailedTime: number | undefined;
    for (const [key, value] of Object.entries(report?.errorFields?.export ?? {})) {
        const failedTime = Number(key) / CONST.MICROSECONDS_PER_MS;
        if (value === null || Number.isNaN(failedTime)) {
            continue;
        }
        latestFailedTime = Math.max(latestFailedTime ?? failedTime, failedTime);
    }
    return latestFailedTime;
}

/**
 * Parses a sync date from the integration into epoch milliseconds. The date can be an ISO 8601 (International
 * Organization for Standardization) string with an offset. It can also be a database time in UTC (Coordinated
 * Universal Time) without a zone, therefore the parse tries the UTC form first.
 */
function getConnectionSyncTime(date: string | undefined): number | undefined {
    if (!date) {
        return undefined;
    }
    const utcTime = Date.parse(`${date}Z`);
    if (!Number.isNaN(utcTime)) {
        return utcTime;
    }
    const time = Date.parse(date);
    return Number.isNaN(time) ? undefined : time;
}

/**
 * Returns the period in which the app offers a failed export again, or undefined when the connection does not work now.
 */
function getRetryWindow(policy: OnyxEntry<Policy>, lookbackDays: number, now = new Date()): RetryWindow | undefined {
    const connectionName = getValidConnectedIntegration(policy);
    if (!connectionName || isAuthenticationError(policy, connectionName)) {
        return undefined;
    }

    const connection = policy?.connections?.[connectionName];
    const lastSync: ConnectionLastSync | undefined = connection && 'lastSync' in connection ? connection.lastSync : undefined;
    if (lastSync?.isSuccessful === false) {
        return undefined;
    }

    // NetSuite records its latest successful sync in `lastSyncDate`.
    const netSuiteSyncDate = connection && 'lastSyncDate' in connection ? connection.lastSyncDate : undefined;
    const toTime = getConnectionSyncTime(lastSync?.successfulDate ?? netSuiteSyncDate);
    if (!toTime) {
        return undefined;
    }

    return {connectionName, fromTime: startOfDay(subDays(now, lookbackDays)).getTime(), toTime};
}

/**
 * Returns the failed export of the report when the report can export again, or undefined.
 */
function getFailedExportReport(report: OnyxEntry<Report>): FailedExportReport | undefined {
    if (!report?.policyID || report.type !== CONST.REPORT.TYPE.EXPENSE || report.isExportedToIntegration || report.pendingFields?.export || report.isWaitingOnBankAccount) {
        return undefined;
    }
    const failedTime = getExportFailedTime(report);
    if (failedTime === undefined) {
        return undefined;
    }
    return {
        reportID: report.reportID,
        reportName: report.reportName ?? '',
        total: Math.abs(report.total ?? 0),
        currency: report.currency,
        failedTime,
    };
}

/**
 * Groups the expense reports that have a failed export by policyID. Only the preferred exporter, or the policy owner
 * as a fallback, gets `errorFields.export` from the server. Therefore other members get an empty result.
 */
function getFailedExportReportsByPolicyID(reports: OnyxCollection<Report>): Record<string, FailedExportReport[]> {
    const failedReportsByPolicyID: Record<string, FailedExportReport[]> = {};
    for (const report of Object.values(reports ?? {})) {
        const failedExportReport = getFailedExportReport(report);
        if (report?.policyID && failedExportReport) {
            (failedReportsByPolicyID[report.policyID] ??= []).push(failedExportReport);
        }
    }
    return failedReportsByPolicyID;
}

/**
 * Returns true when the policy has a failed export inside the retry window. It reads only the reports of that policy.
 */
function hasFailedExportToRetryForPolicy(reports: OnyxCollection<Report>, policyID: string, retryWindow: RetryWindow | undefined): boolean {
    if (!retryWindow) {
        return false;
    }
    return Object.values(reports ?? {}).some((report) => report?.policyID === policyID && isFailedExportToRetry(report, retryWindow));
}

/**
 * Returns the reports that failed to export inside the retry window, newest failure first.
 */
function getFailedExportsToRetry(failedReports: FailedExportReport[] | undefined, retryWindow: RetryWindow | undefined): FailedExportReport[] {
    if (!failedReports || !retryWindow) {
        return [];
    }
    return failedReports
        .filter((report) => report.failedTime >= retryWindow.fromTime && report.failedTime < retryWindow.toTime)
        .sort((first, second) => second.failedTime - first.failedTime);
}

/**
 * Returns true when the report has a failed export inside the retry window.
 */
function isFailedExportToRetry(report: OnyxEntry<Report>, retryWindow: RetryWindow | undefined): boolean {
    const failedExportReport = getFailedExportReport(report);
    return !!failedExportReport && getFailedExportsToRetry([failedExportReport], retryWindow).length > 0;
}

/**
 * Returns the error text of the latest failed export of each report, keyed by reportID.
 */
function getExportFailureMessages(allReportActions: OnyxCollection<ReportActions>, reportIDs: string[]): Record<string, string> {
    const messages: Record<string, string> = {};
    for (const reportID of reportIDs) {
        let latestAction;
        for (const action of Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? {})) {
            if (!isIntegrationMessageAction(action) || getOriginalMessage(action)?.result?.reconciled) {
                continue;
            }
            if (!latestAction || action.created > latestAction.created) {
                latestAction = action;
            }
        }
        const message = latestAction ? getOriginalMessage(latestAction)?.result?.messages?.join(', ') : undefined;
        if (message) {
            messages[reportID] = message;
        }
    }
    return messages;
}

export {getExportFailedTime, getRetryWindow, getFailedExportReportsByPolicyID, getFailedExportsToRetry, hasFailedExportToRetryForPolicy, isFailedExportToRetry, getExportFailureMessages};
export type {RetryWindow};
