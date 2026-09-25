/* eslint-disable rulesdir/no-unsafe-onyx-read -- dev-console-only reads: every read runs from a window getter, never from a component, and the body is skipped on production builds */
import {isProduction as isProductionLib} from '@libs/Environment/Environment';
import navigationRef from '@libs/Navigation/navigationRef';

import {setSupportAuthToken} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';

import type {CollectionKeyBase} from 'react-native-onyx/dist/types';

import Onyx from 'react-native-onyx';

/**
 * This is used to inject development/debugging utilities into the window object on web.
 * We do this only on non-production builds - these should not be used in any application code.
 */
export default async function addUtilsToWindow() {
    if (!window) {
        return;
    }

    if (await isProductionLib()) {
        return;
    }

    window.Onyx = Onyx as typeof Onyx & {
        log: (key: CollectionKeyBase) => Promise<void>;
    };

    window.Onyx.log = async function (key: CollectionKeyBase) {
        const value = await Onyx.get(key);

        /* eslint-disable-next-line no-console */
        console.log(value);
    };

    window.setSupportToken = setSupportAuthToken;

    const getRouteParams = () => {
        return navigationRef.current?.getCurrentRoute()?.params as Record<string, string> | undefined;
    };

    const getIOUTransactionID = (action: unknown) => (action as {originalMessage?: {IOUTransactionID?: string}} | undefined)?.originalMessage?.IOUTransactionID;

    const getReportID = async (params: Record<string, string> | undefined) => {
        if (params?.reportID) {
            return params.reportID;
        }
        if (params?.transactionID) {
            const transaction = await Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`);
            return transaction?.reportID;
        }
        return undefined;
    };

    const getTransactionIDFromReport = async (reportID: string) => {
        const report = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

        if (report?.parentReportID && report?.parentReportActionID) {
            const parentReportActions = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`);
            const parentAction = parentReportActions?.[report.parentReportActionID];
            const parentTransactionID = getIOUTransactionID(parentAction);
            if (parentTransactionID) {
                return parentTransactionID;
            }
        }

        const reportActions = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
        for (const action of Object.values(reportActions ?? {})) {
            const transactionID = getIOUTransactionID(action);
            if (transactionID) {
                return transactionID;
            }
        }

        return undefined;
    };

    const getPolicyIDFromReport = async (reportID: string) => {
        const report = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

        if (report?.policyID) {
            return report.policyID;
        }

        if (report?.parentReportID) {
            const parentReport = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);
            return parentReport?.policyID;
        }

        return undefined;
    };

    Object.defineProperties(window, {
        policy: {
            configurable: true,
            get: async () => {
                const params = getRouteParams();

                if (params?.policyID) {
                    return Onyx.get(`${ONYXKEYS.COLLECTION.POLICY}${params.policyID}`);
                }

                const reportID = await getReportID(params);
                if (reportID) {
                    const policyID = await getPolicyIDFromReport(reportID);
                    if (policyID) {
                        return Onyx.get(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
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
                    return Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
                }

                return undefined;
            },
        },
        transaction: {
            configurable: true,
            get: async () => {
                const params = getRouteParams();

                if (params?.transactionID) {
                    return Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`);
                }

                if (params?.reportID) {
                    const transactionID = await getTransactionIDFromReport(params.reportID);
                    if (transactionID) {
                        return Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
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
}
