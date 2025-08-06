import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type Beta from '@src/types/onyx/Beta';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';

type UpdateContext = {
    betas: OnyxEntry<Beta[]>;
    allReports: Record<string, Report>;
    allPolicies: Record<string, Policy>;
};

let betas: OnyxEntry<Beta[]>;
let allReports: Record<string, Report>;
let allPolicies: Record<string, Policy>;
let isInitialized = false;

/**
 * Initialize persistent connections to Onyx data needed for OptimisticReportNames
 * This is called lazily when OptimisticReportNames functionality is first used
 *
 * We use Onyx.connectWithoutView because we do not use this in React components and this logic is not tied to the UI.
 * This is a centralized system that needs access to all objects of several types, so that when any updates affect
 * the computed report names, we can compute the new names according to the formula and add the necessary updates.
 * It wouldn't be possible to do this without connecting to all the data.
 *
 */
function initialize(): void {
    if (isInitialized) {
        return;
    }

    // Connect to BETAS
    Onyx.connectWithoutView({
        key: ONYXKEYS.BETAS,
        callback: (val) => {
            betas = val;
        },
    });

    // Connect to all REPORTS
    Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.REPORT,
        waitForCollectionCallback: true,
        callback: (val) => {
            allReports = (val as Record<string, Report>) ?? {};
        },
    });

    // Connect to all POLICIES
    Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.POLICY,
        waitForCollectionCallback: true,
        callback: (val) => {
            allPolicies = (val as Record<string, Policy>) ?? {};
        },
    });

    isInitialized = true;
}

/**
 * Get the current update context for OptimisticReportNames
 * This provides access to the cached Onyx data without creating new connections
 * Initializes connections lazily on first use
 */
function getUpdateContext(): UpdateContext {
    initialize();
    return {
        betas,
        allReports: allReports ?? {},
        allPolicies: allPolicies ?? {},
    };
}

/**
 * Get the current update context as a promise for backward compatibility
 * Initializes connections lazily on first use
 */
function getUpdateContextAsync(): Promise<UpdateContext> {
    initialize();
    return Promise.resolve(getUpdateContext());
}

export {getUpdateContext, getUpdateContextAsync};
export type {UpdateContext};
