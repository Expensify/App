import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import type {OnyxDerivedValueConfig} from './types';

import accountIDToNameMapConfig from './configs/accountIDToNameMap';
import cardFeedErrorsConfig from './configs/cardFeedErrors';
import loginToAccountIDMapConfig from './configs/loginToAccountIDMap';
import nonPersonalAndWorkspaceCardListConfig from './configs/nonPersonalAndWorkspaceCardList';
import outstandingReportsByPolicyIDConfig from './configs/outstandingReportsByPolicyID';
import personalAndWorkspaceCardListConfig from './configs/personalAndWorkspaceCardList';
import reportAttributesConfig from './configs/reportAttributes';
import reportTransactionsAndViolationsConfig from './configs/reportTransactionsAndViolations';
import sortedReportActionsConfig from './configs/sortedReportActions';
import visibleReportActionsConfig from './configs/visibleReportActions';

/**
 * Global map of derived configs.
 * This object holds our derived value configurations.
 */
const ONYX_DERIVED_VALUES = {
    [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: reportAttributesConfig,
    [ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS]: reportTransactionsAndViolationsConfig,
    [ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID]: outstandingReportsByPolicyIDConfig,
    [ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS]: visibleReportActionsConfig,
    [ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST]: nonPersonalAndWorkspaceCardListConfig,
    [ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST]: personalAndWorkspaceCardListConfig,
    [ONYXKEYS.DERIVED.CARD_FEED_ERRORS]: cardFeedErrorsConfig,
    [ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS]: sortedReportActionsConfig,
    [ONYXKEYS.DERIVED.ACCOUNT_ID_TO_NAME_MAP]: accountIDToNameMapConfig,
    [ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP]: loginToAccountIDMapConfig,
} as const satisfies {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Key in ValueOf<typeof ONYXKEYS.DERIVED>]: OnyxDerivedValueConfig<Key, any>;
};

export default ONYX_DERIVED_VALUES;
