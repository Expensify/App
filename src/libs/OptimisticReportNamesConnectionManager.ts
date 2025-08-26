import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type Beta from '@src/types/onyx/Beta';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type ReportNameValuePairs from '@src/types/onyx/ReportNameValuePairs';

type UpdateContext = {
    betas: OnyxEntry<Beta[]>;
    allReports: Record<string, Report>;
    allPolicies: Record<string, Policy>;
    allReportNameValuePairs: Record<string, ReportNameValuePairs>;
    allTransactions: Record<string, Transaction>;
};

let betas: OnyxEntry<Beta[]>;
let allReports: Record<string, Report>;
let allPolicies: Record<string, Policy>;
let allReportNameValuePairs: Record<string, ReportNameValuePairs>;
let allTransactions: Record<string, Transaction>;
let isInitialized = false;
let connectionsInitializedCount = 0;
const totalConnections = 5;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize the context data
 * We use connectWithoutView to prevent the connection manager from affecting React rendering performance
 * This is a one-time setup that happens when the module is first loaded
 */
function initialize(): Promise<void> {
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = new Promise((resolve) => {
        function checkAndMarkInitialized() {
            connectionsInitializedCount++;
            if (connectionsInitializedCount === totalConnections && !isInitialized) {
                isInitialized = true;
                resolve();
            }
        }

        // Connect to user session betas
        Onyx.connectWithoutView({
            key: ONYXKEYS.BETAS,
            callback: (val) => {
                betas = val;
                checkAndMarkInitialized();
            },
        });

        // Connect to all reports
        Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (val) => {
                allReports = (val as Record<string, Report>) ?? {};
                checkAndMarkInitialized();
            },
        });

        // Connect to all policies
        Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.POLICY,
            waitForCollectionCallback: true,
            callback: (val) => {
                allPolicies = (val as Record<string, Policy>) ?? {};
                checkAndMarkInitialized();
            },
        });

        // Connect to all REPORT_NAME_VALUE_PAIRS
        Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
            waitForCollectionCallback: true,
            callback: (val) => {
                allReportNameValuePairs = (val as Record<string, ReportNameValuePairs>) ?? {};
                checkAndMarkInitialized();
            },
        });

        // Connect to all TRANSACTIONS
        Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.TRANSACTION,
            waitForCollectionCallback: true,
            callback: (val) => {
                allTransactions = (val as Record<string, Transaction>) ?? {};
                checkAndMarkInitialized();
            },
        });
    });

    return initializationPromise;
}

/**
 * Get the current update context synchronously
 * Should only be called after initialization is complete
 */
function getUpdateContext(): UpdateContext {
    return {
        betas: betas ?? [],
        allReports: allReports ?? {},
        allPolicies: allPolicies ?? {},
        allReportNameValuePairs: allReportNameValuePairs ?? {},
        allTransactions: allTransactions ?? {},
    };
}

export type {UpdateContext};
export {initialize, getUpdateContext};
