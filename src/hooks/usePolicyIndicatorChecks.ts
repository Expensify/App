import {isConnectionInProgress} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {hasDomainErrors} from '@libs/DomainUtils';
import {isMergeHRCompleteSetupNeeded} from '@libs/HRUtils';
import {
    getUberConnectionErrorDirectlyFromPolicy,
    isPolicyAdmin,
    shouldShowCustomUnitsError,
    shouldShowEmployeeListError,
    shouldShowPolicyError,
    shouldShowSyncError,
} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type IndicatorStatus from '@src/types/utils/IndicatorStatus';
import useOnyx from './useOnyx';
import usePoliciesWithCardFeedErrors from './usePoliciesWithCardFeedErrors';

type PolicyIndicatorChecksResult = {
    /** The policy error indicator status. */
    policyErrorStatus: IndicatorStatus | undefined;

    /** The policy info indicator status. */
    policyInfoStatus: IndicatorStatus | undefined;

    /** The domain error indicator status. */
    domainStatus: IndicatorStatus | undefined;

    /** The policy ID associated with the active policy error or info indicator. */
    indicatorPolicyID: string | undefined;
};

function usePolicyIndicatorChecks(): PolicyIndicatorChecksResult {
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);
    const [allDomainErrors] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ERRORS);

    const {cleanPolicies, policiesWithCardFeedErrors, isPolicyAdmin: isAdminOfPolicyWithCardFeedErrors} = usePoliciesWithCardFeedErrors();

    const policyErrorChecks: Array<[IndicatorStatus, Policy | undefined]> = [
        [CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS, cleanPolicies.find(shouldShowPolicyError)],
        [CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR, cleanPolicies.find(shouldShowCustomUnitsError)],
        [CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR, cleanPolicies.find(shouldShowEmployeeListError)],
        [
            CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS,
            cleanPolicies.find((cleanPolicy) =>
                shouldShowSyncError(
                    cleanPolicy,
                    isConnectionInProgress(allConnectionSyncProgresses?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${cleanPolicy?.id}`], cleanPolicy),
                    CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES,
                ),
            ),
        ],
        [CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR, cleanPolicies.find(shouldShowQBOReimbursableExportDestinationAccountError)],
        [CONST.INDICATOR_STATUS.HAS_UBER_CREDENTIALS_ERROR, cleanPolicies.find(getUberConnectionErrorDirectlyFromPolicy)],
        [CONST.INDICATOR_STATUS.HAS_POLICY_ADMIN_CARD_FEED_ERRORS, isAdminOfPolicyWithCardFeedErrors ? policiesWithCardFeedErrors.at(0) : undefined],
    ];
    const policyInfoChecks: Array<[IndicatorStatus, Policy | undefined]> = [
        [CONST.INDICATOR_STATUS.HAS_MERGE_HR_SETUP_NEEDED, cleanPolicies.find((policy) => isPolicyAdmin(policy) && isMergeHRCompleteSetupNeeded(policy))],
    ];
    const domainChecks: Array<[IndicatorStatus, boolean]> = [
        [CONST.INDICATOR_STATUS.HAS_DOMAIN_ERRORS, Object.values(allDomainErrors ?? {}).some((domainErrors) => hasDomainErrors(domainErrors))],
    ];

    const activePolicyErrorCheck = policyErrorChecks.find(([, value]) => value);
    const activePolicyInfoCheck = policyInfoChecks.find(([, value]) => value);
    const activeDomainCheck = domainChecks.find(([, value]) => value);

    const [policyErrorStatus] = activePolicyErrorCheck ?? [];
    const [policyInfoStatus] = activePolicyInfoCheck ?? [];
    const [domainStatus] = activeDomainCheck ?? [];

    const indicatorPolicyID = activePolicyErrorCheck?.[1]?.id ?? activePolicyInfoCheck?.[1]?.id;

    return {
        policyErrorStatus,
        policyInfoStatus,
        domainStatus,
        indicatorPolicyID,
    };
}

export default usePolicyIndicatorChecks;
