import {isProduction as isProductionLib} from '@libs/Environment/Environment';
import navigationRef from '@libs/Navigation/navigationRef';
import {isRecord} from '@libs/ObjectUtils';
import {getLinkedTransactionID} from '@libs/ReportActionsUtils';

import {setSupportAuthToken} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * This is used to inject development/debugging utilities into the window object on web.
 * We do this only on non-production builds - these should not be used in any application code.
 */
export default function addUtilsToWindow() {
    if (!window) {
        return;
    }

    isProductionLib().then((isProduction) => {
        if (isProduction) {
            return;
        }

        function log(key: OnyxKey): void {
            window.Onyx.get(key).then((value) => {
                /* eslint-disable-next-line no-console */
                console.log(value);
            });
        }

        window.Onyx = Onyx;
        window.Onyx.log = log;

        window.setSupportToken = setSupportAuthToken;

        // Helper to get current route params
        function getRouteParams() {
            return navigationRef.current?.getCurrentRoute()?.params;
        }

        function getStringRouteParam(params: unknown, key: 'reportID' | 'transactionID' | 'policyID'): string | undefined {
            if (!isRecord(params)) {
                return undefined;
            }
            const value = params[key];
            return typeof value === 'string' && value ? value : undefined;
        }

        // Helper to get reportID from various sources
        async function getReportID(params: ReturnType<typeof getRouteParams>): Promise<string | undefined> {
            const reportID = getStringRouteParam(params, 'reportID');
            if (reportID) {
                return reportID;
            }
            const transactionID = getStringRouteParam(params, 'transactionID');
            if (transactionID) {
                const transaction = await window.Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                return transaction?.reportID;
            }
            return undefined;
        }

        // Helper to get transactionID from one expense report
        async function getTransactionIDFromReport(reportID: string): Promise<string | undefined> {
            const report = await window.Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

            // First try: Get from parent report action (for transaction thread reports)
            if (report?.parentReportID && report?.parentReportActionID) {
                const parentReportActions = await window.Onyx.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`);
                const parentTransactionID = getLinkedTransactionID(parentReportActions?.[report.parentReportActionID]);
                if (parentTransactionID) {
                    return parentTransactionID;
                }
            }

            // Fallback: Search the report's own report actions (for expense reports with one transaction)
            const reportActions = await window.Onyx.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
            for (const action of Object.values(reportActions ?? {})) {
                const transactionID = getLinkedTransactionID(action);
                if (transactionID) {
                    return transactionID;
                }
            }

            return undefined;
        }

        // Helper to get policyID from report (checks parent report for one expense reports)
        async function getPolicyIDFromReport(reportID: string): Promise<string | undefined> {
            const report = await window.Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

            if (report?.policyID) {
                return report.policyID;
            }

            if (report?.parentReportID) {
                const parentReport = await window.Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);
                return parentReport?.policyID;
            }

            return undefined;
        }

        // Define lazy getters for debug data
        Object.defineProperties(window, {
            policy: {
                configurable: true,
                get: async () => {
                    const params = getRouteParams();

                    const routePolicyID = getStringRouteParam(params, 'policyID');
                    if (routePolicyID) {
                        return window.Onyx.get(`${ONYXKEYS.COLLECTION.POLICY}${routePolicyID}`);
                    }

                    const reportID = await getReportID(params);
                    if (reportID) {
                        const policyID = await getPolicyIDFromReport(reportID);
                        if (policyID) {
                            return window.Onyx.get(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
                        }
                    }

                    return undefined;
                },
            },
            report: {
                configurable: true,
                get: async () => {
                    const params = getRouteParams();
                    const reportID = await getReportID(params);

                    if (reportID) {
                        return window.Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
                    }

                    return undefined;
                },
            },
            transaction: {
                configurable: true,
                get: async () => {
                    const params = getRouteParams();

                    const routeTransactionID = getStringRouteParam(params, 'transactionID');
                    if (routeTransactionID) {
                        return window.Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${routeTransactionID}`);
                    }

                    const reportID = getStringRouteParam(params, 'reportID');
                    if (reportID) {
                        const transactionID = await getTransactionIDFromReport(reportID);
                        if (transactionID) {
                            return window.Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                        }
                    }

                    return undefined;
                },
            },
            receipt: {
                configurable: true,
                get: async () => {
                    const transaction = await window.transaction;
                    return transaction?.receipt;
                },
            },
        });
    });
}
