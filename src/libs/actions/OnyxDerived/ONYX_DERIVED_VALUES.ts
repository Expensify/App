import type {ValueOf} from 'type-fest';
import ONYXKEYS from '@src/ONYXKEYS';
import outstandingReportsByPolicyIDConfig from './configs/outstandingReportsByPolicyID';
import reportAttributesConfig from './configs/reportAttributes';
import reportTransactionsAndViolationsConfig from './configs/reportTransactionsAndViolations';
import type {OnyxDerivedValueConfig} from './types';

/**
 * Global map of derived configs.
 * This object holds our derived value configurations.
 */
const ONYX_DERIVED_VALUES = {
    [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: reportAttributesConfig,
    [ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS]: reportTransactionsAndViolationsConfig,
    [ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID]: outstandingReportsByPolicyIDConfig,
} as const satisfies {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Key in ValueOf<typeof ONYXKEYS.DERIVED>]: OnyxDerivedValueConfig<Key, any>;
};

export default ONYX_DERIVED_VALUES;
