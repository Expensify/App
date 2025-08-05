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
 */
function initialize(): void {
    if (isInitialized) {
        return;
    }

    // Connect to BETAS
    // eslint-disable-next-line react-compiler/react-compiler -- This is not a React component and needs to access Onyx data for OptimisticReportNames processing without being tied to a UI view
    Onyx.connectWithoutView({
        key: ONYXKEYS.BETAS,
        callback: (val) => {
            betas = val;
        },
    });

    // Connect to all REPORTS
    // eslint-disable-next-line react-compiler/react-compiler -- This is not a React component and needs to access Onyx data for OptimisticReportNames processing without being tied to a UI view
    Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.REPORT,
        waitForCollectionCallback: true,
        callback: (val) => {
            allReports = (val as Record<string, Report>) ?? {};
        },
    });

    // Connect to all POLICIES
    // eslint-disable-next-line react-compiler/react-compiler -- This is not a React component and needs to access Onyx data for OptimisticReportNames processing without being tied to a UI view
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
