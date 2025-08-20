import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type Beta from '@src/types/onyx/Beta';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type ReportNameValuePairs from '@src/types/onyx/ReportNameValuePairs';

type UpdateContext = {
    betas: OnyxEntry<Beta[]>;
    allReports: Record<string, Report>;
    allPolicies: Record<string, Policy>;
    allReportNameValuePairs: Record<string, ReportNameValuePairs>;
};

let betas: OnyxEntry<Beta[]>;
let allReports: Record<string, Report>;
let allPolicies: Record<string, Policy>;
let allReportNameValuePairs: Record<string, ReportNameValuePairs>;
let isInitialized = false;
let connectionsInitializedCount = 0;
const totalConnections = 4;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize persistent connections to Onyx data needed for OptimisticReportNames
 * This is called lazily when OptimisticReportNames functionality is first used
 * Returns a Promise that resolves when all connections have received their initial data
 *
 * We use Onyx.connectWithoutView because we do not use this in React components and this logic is not tied to the UI.
 * This is a centralized system that needs access to all objects of several types, so that when any updates affect
 * the computed report names, we can compute the new names according to the formula and add the necessary updates.
 * It wouldn't be possible to do this without connecting to all the data.
 *
 */
function initialize(): Promise<void> {
    if (isInitialized) {
        return Promise.resolve();
    }

    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = new Promise<void>((resolve) => {
        const checkAndMarkInitialized = () => {
            connectionsInitializedCount++;
            if (connectionsInitializedCount === totalConnections) {
                isInitialized = true;
                resolve();
            }
        };

        // Connect to BETAS
        Onyx.connectWithoutView({
            key: ONYXKEYS.BETAS,
            callback: (val) => {
                betas = val;
                checkAndMarkInitialized();
            },
        });

        // Connect to all REPORTS
        Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (val) => {
                allReports = (val as Record<string, Report>) ?? {};
                checkAndMarkInitialized();
            },
        });

        // Connect to all POLICIES
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
    });

    return initializationPromise;
}

/**
 * Get the current update context synchronously
 * Must be called after initialize() has completed
 */
function getUpdateContext(): UpdateContext {
    if (!isInitialized) {
        throw new Error('OptimisticReportNamesConnectionManager not initialized. Call initialize() first.');
    }

    return {
        betas,
        allReports: allReports ?? {},
        allPolicies: allPolicies ?? {},
        allReportNameValuePairs: allReportNameValuePairs ?? {},
    };
}

/**
 * Get the current update context as a promise for backward compatibility
 * Initializes connections lazily on first use
 */
function getUpdateContextAsync(): Promise<UpdateContext> {
    return initialize().then(() => getUpdateContext());
}

export {initialize, getUpdateContext, getUpdateContextAsync};
export type {UpdateContext};
