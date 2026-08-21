import {isProduction as isProductionLib} from '@libs/Environment/Environment';
import navigationRef from '@libs/Navigation/navigationRef';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';

import {setSupportAuthToken} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type {OnyxKey} from 'react-native-onyx/dist/types';

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

        window.Onyx = Onyx as typeof Onyx & {
            log: (key: OnyxKey) => void;
        };

        // `Onyx.get` reads the cache synchronously, so this only logs keys that are already hydrated.
        window.Onyx.log = function (key: OnyxKey) {
            /* eslint-disable-next-line no-console */
            console.log(Onyx.get(key));
        };

        window.setSupportToken = setSupportAuthToken;

        // Helper to get current route params
        const getRouteParams = () => {
            return navigationRef.current?.getCurrentRoute()?.params as Record<string, string> | undefined;
        };

        const getIOUTransactionID = (action: ReportAction | undefined) => (isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined);

        // Helper to get reportID from various sources
        const getReportID = (params: Record<string, string> | undefined) => {
            if (params?.reportID) {
                return params.reportID;
            }
            if (params?.transactionID) {
                return Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`)?.reportID;
            }
            return undefined;
        };

        // Helper to get transactionID from one expense report
        const getTransactionIDFromReport = (reportID: string) => {
            const report = Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

            // First try: Get from parent report action (for transaction thread reports)
            if (report?.parentReportID && report?.parentReportActionID) {
                const parentReportActions = Onyx.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`);
                const parentAction = parentReportActions?.[report.parentReportActionID];
                const parentTransactionID = getIOUTransactionID(parentAction);
                if (parentTransactionID) {
                    return parentTransactionID;
                }
            }

            // Fallback: Search the report's own report actions (for expense reports with one transaction)
            const reportActions = Onyx.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
            for (const action of Object.values(reportActions ?? {})) {
                const transactionID = getIOUTransactionID(action);
                if (transactionID) {
                    return transactionID;
                }
            }

            return undefined;
        };

        // Helper to get policyID from report (checks parent report for one expense reports)
        const getPolicyIDFromReport = (reportID: string) => {
            const report = Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

            if (report?.policyID) {
                return report.policyID;
            }

            if (report?.parentReportID) {
                return Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`)?.policyID;
            }

            return undefined;
        };

        // Helper to get the transaction for the current route
        const getTransaction = () => {
            const params = getRouteParams();

            if (params?.transactionID) {
                return Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`);
            }

            if (params?.reportID) {
                const transactionID = getTransactionIDFromReport(params.reportID);
                if (transactionID) {
                    return Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                }
            }

            return undefined;
        };

        // Define lazy getters for debug data
        Object.defineProperties(window, {
            policy: {
                configurable: true,
                get: () => {
                    const params = getRouteParams();

                    if (params?.policyID) {
                        return Onyx.get(`${ONYXKEYS.COLLECTION.POLICY}${params.policyID}`);
                    }

                    const reportID = getReportID(params);
                    if (reportID) {
                        const policyID = getPolicyIDFromReport(reportID);
                        if (policyID) {
                            return Onyx.get(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
                        }
                    }

                    return undefined;
                },
            },
            report: {
                configurable: true,
                get: () => {
                    const params = getRouteParams();
                    const reportID = getReportID(params);

                    if (reportID) {
                        return Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
                    }

                    return undefined;
                },
            },
            transaction: {
                configurable: true,
                get: getTransaction,
            },
            receipt: {
                configurable: true,
                get: () => getTransaction()?.receipt,
            },
        });
    });
}
