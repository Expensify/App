import {isProduction as isProductionLib} from '@libs/Environment/Environment';
import navigationRef from '@libs/Navigation/navigationRef';
import {getOriginalMessage} from '@libs/ReportActionsUtils';

import {setSupportAuthToken} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxValue} from 'react-native-onyx';

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

        // We intentionally do not offer an Onyx.get API because we believe it will lead to code patterns we don't want to use in this repo, but we can offer a workaround for the sake of debugging
        function get<TKey extends OnyxKey>(key: TKey): Promise<OnyxValue<TKey>> {
            return new Promise((resolve) => {
                const connectionReference: {current?: ReturnType<typeof Onyx.connectWithoutView>} = {};
                let isResolved = false;
                // We have opted for `connectWithoutView` here as this is a debugging utility and does not relate to any view.
                const connection = Onyx.connectWithoutView({
                    key,
                    callback: (value) => {
                        if (isResolved) {
                            return;
                        }
                        isResolved = true;
                        if (connectionReference.current) {
                            Onyx.disconnect(connectionReference.current);
                        }
                        resolve(value);
                    },
                });
                if (isResolved) {
                    Onyx.disconnect(connection);
                } else {
                    connectionReference.current = connection;
                }
            });
        }

        function log(key: OnyxKey): void {
            get(key).then((value) => {
                /* eslint-disable-next-line no-console */
                console.log(value);
            });
        }

        const onyxWithDebugUtils = Object.assign(Onyx, {get, log});
        window.Onyx = onyxWithDebugUtils;

        window.setSupportToken = setSupportAuthToken;

        // Helper to get current route params
        function getRouteParams() {
            return navigationRef.current?.getCurrentRoute()?.params;
        }

        // Helper to get reportID from various sources
        async function getReportID(params: ReturnType<typeof getRouteParams>): Promise<string | undefined> {
            if (params && typeof params === 'object' && 'reportID' in params && typeof params.reportID === 'string' && params.reportID) {
                return params.reportID;
            }
            if (params && typeof params === 'object' && 'transactionID' in params && typeof params.transactionID === 'string' && params.transactionID) {
                const transaction = await onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`);
                return transaction?.reportID;
            }
            return undefined;
        }

        // Helper to get transactionID from one expense report
        async function getTransactionIDFromReport(reportID: string): Promise<string | undefined> {
            const report = await onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

            // First try: Get from parent report action (for transaction thread reports)
            if (report?.parentReportID && report?.parentReportActionID) {
                const parentReportActions = await onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`);
                const parentAction = parentReportActions?.[report.parentReportActionID];
                // Debug lookups intentionally prefer the legacy message even when a modern message exists.
                const parentMessage = parentAction ? getOriginalMessage({...parentAction, message: undefined}) : undefined;
                if (parentMessage && 'IOUTransactionID' in parentMessage && parentMessage.IOUTransactionID) {
                    return parentMessage.IOUTransactionID;
                }
            }

            // Fallback: Search the report's own report actions (for expense reports with one transaction)
            const reportActions = await onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
            if (reportActions) {
                for (const action of Object.values(reportActions)) {
                    const originalMessage = action ? getOriginalMessage({...action, message: undefined}) : undefined;
                    if (originalMessage && 'IOUTransactionID' in originalMessage && originalMessage.IOUTransactionID) {
                        return originalMessage.IOUTransactionID;
                    }
                }
            }

            return undefined;
        }

        // Helper to get policyID from report (checks parent report for one expense reports)
        async function getPolicyIDFromReport(reportID: string): Promise<string | undefined> {
            const report = await onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

            if (report?.policyID) {
                return report.policyID;
            }

            if (report?.parentReportID) {
                const parentReport = await onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);
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

                    if (params && typeof params === 'object' && 'policyID' in params && typeof params.policyID === 'string' && params.policyID) {
                        return onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.POLICY}${params.policyID}`);
                    }

                    const reportID = await getReportID(params);
                    if (reportID) {
                        const policyID = await getPolicyIDFromReport(reportID);
                        if (policyID) {
                            return onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
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
                        return onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
                    }

                    return undefined;
                },
            },
            transaction: {
                configurable: true,
                get: async () => {
                    const params = getRouteParams();

                    if (params && typeof params === 'object' && 'transactionID' in params && typeof params.transactionID === 'string' && params.transactionID) {
                        return onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`);
                    }

                    if (params && typeof params === 'object' && 'reportID' in params && typeof params.reportID === 'string' && params.reportID) {
                        const transactionID = await getTransactionIDFromReport(params.reportID);
                        if (transactionID) {
                            return onyxWithDebugUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
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
