import {getExportFailedTime, getFailedExportReportsByPolicyID, getFailedExportsToRetry, getRetryWindow} from '@libs/FailedExportRetryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {ConnectionLastSync} from '@src/types/onyx/Policy';

import createMock from '../utils/createMock';

const POLICY_ID = 'ABC123';
const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-10-15T12:00:00Z');

function buildPolicy(lastSync: Partial<ConnectionLastSync>): Policy {
    return createMock<Policy>({
        id: POLICY_ID,
        name: 'Acme',
        connections: {
            quickbooksOnline: {
                config: {},
                data: {},
                lastSync: {isSuccessful: true, isAuthenticationError: false, isConnected: true, source: 'AUTOSYNC', ...lastSync},
            },
        },
    });
}

function buildFailedReport(reportID: string, failedTime: number, overrides: Partial<Report> = {}): Report {
    return {
        reportID,
        policyID: POLICY_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        reportName: `Report ${reportID}`,
        total: -1000,
        currency: 'USD',
        errorFields: {export: {[String(failedTime * 1000)]: 'export failed'}},
        ...overrides,
    };
}

describe('FailedExportRetryUtils', () => {
    describe('getExportFailedTime', () => {
        it('converts the newest microsecond key to milliseconds', () => {
            // Given a report that failed twice, and the server keys each failure by epoch microseconds
            const clearedFailureKey = String(NOW.getTime() * 1000);
            const report = buildFailedReport('1', NOW.getTime() - 2 * DAY);
            report.errorFields = {export: {[String((NOW.getTime() - 2 * DAY) * 1000)]: 'export failed', [String((NOW.getTime() - DAY) * 1000)]: 'export failed', [clearedFailureKey]: null}};

            // When we read the failure time
            const failedTime = getExportFailedTime(report);

            // Then we get the newest failure in milliseconds, and the cleared key is ignored
            expect(failedTime).toBe(NOW.getTime() - DAY);
        });
    });

    describe('getRetryWindow', () => {
        it('returns no window while the connection has an authentication error', () => {
            // Given a QBO connection whose last sync failed to authenticate
            const policy = buildPolicy({isSuccessful: false, isAuthenticationError: true, errorDate: NOW.toISOString()});

            // When we ask for a retry window
            // Then there is none, because the export would fail again
            expect(getRetryWindow(policy, 30, NOW)).toBeUndefined();
        });

        it('ends the window at the latest successful sync', () => {
            // Given a QBO connection that synced successfully one hour ago
            const successfulDate = new Date(NOW.getTime() - 60 * 60 * 1000).toISOString();
            const policy = buildPolicy({successfulDate});

            // When we ask for a 30-day window
            const retryWindow = getRetryWindow(policy, 30, NOW);

            // Then the window ends at that sync, so failures after it are not offered
            expect(retryWindow?.connectionName).toBe(CONST.POLICY.CONNECTIONS.NAME.QBO);
            expect(retryWindow?.toTime).toBe(Date.parse(successfulDate));
        });
    });

    describe('getFailedExportsToRetry', () => {
        it('keeps only the failures inside the lookback and before the successful sync', () => {
            // Given failures 2, 45 and 0 days ago, and a successful sync one hour ago
            const policy = buildPolicy({successfulDate: new Date(NOW.getTime() - 60 * 60 * 1000).toISOString()});
            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: buildFailedReport('1', NOW.getTime() - 2 * DAY),
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: buildFailedReport('2', NOW.getTime() - 45 * DAY),
                [`${ONYXKEYS.COLLECTION.REPORT}3`]: buildFailedReport('3', NOW.getTime() - 60 * 1000),
                [`${ONYXKEYS.COLLECTION.REPORT}4`]: buildFailedReport('4', NOW.getTime() - DAY, {isExportedToIntegration: true}),
            };

            // When we filter them with a 30-day lookback
            const failedReports = getFailedExportReportsByPolicyID(reports)[POLICY_ID];
            const reportsToRetry = getFailedExportsToRetry(failedReports, getRetryWindow(policy, 30, NOW));

            // Then only the report that failed 2 days ago is offered. The 45-day failure is too old, the newest
            // failure happened after the sync, and the exported report is excluded.
            expect(reportsToRetry.map((report) => report.reportID)).toEqual(['1']);
        });
    });
});
