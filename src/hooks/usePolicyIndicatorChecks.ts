import {isConnectionInProgress} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {hasDomainErrors} from '@libs/DomainUtils';
import {getUberConnectionErrorDirectlyFromPolicy, shouldShowCustomUnitsError, shouldShowEmployeeListError, shouldShowPolicyError, shouldShowSyncError} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type IndicatorStatus from '@src/types/utils/IndicatorStatus';
import useOnyx from './useOnyx';
import usePoliciesWithCardFeedErrors from './usePoliciesWithCardFeedErrors';

type PolicyIndicatorChecksResult = {
    policyStatus: IndicatorStatus | undefined;
    domainStatus: IndicatorStatus | undefined;
    policyIDWithErrors: string | undefined;
};

function usePolicyIndicatorChecks(): PolicyIndicatorChecksResult {
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);
    const [allDomainErrors] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ERRORS);

    const {cleanPolicies, policiesWithCardFeedErrors, isPolicyAdmin} = usePoliciesWithCardFeedErrors();

    const policyChecks: Partial<Record<IndicatorStatus, Policy | undefined>> = {
        [CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS]: cleanPolicies.find(shouldShowPolicyError),
        [CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR]: cleanPolicies.find(shouldShowCustomUnitsError),
        [CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR]: cleanPolicies.find(shouldShowEmployeeListError),
        [CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS]: cleanPolicies.find((cleanPolicy) =>
            shouldShowSyncError(
                cleanPolicy,
                isConnectionInProgress(allConnectionSyncProgresses?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${cleanPolicy?.id}`], cleanPolicy),
                CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES,
            ),
        ),
        [CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR]: cleanPolicies.find(shouldShowQBOReimbursableExportDestinationAccountError),
        [CONST.INDICATOR_STATUS.HAS_UBER_CREDENTIALS_ERROR]: cleanPolicies.find(getUberConnectionErrorDirectlyFromPolicy),
        [CONST.INDICATOR_STATUS.HAS_POLICY_ADMIN_CARD_FEED_ERRORS]: isPolicyAdmin ? policiesWithCardFeedErrors.at(0) : undefined,
    };

    const domainChecks: Partial<Record<IndicatorStatus, boolean>> = {
        [CONST.INDICATOR_STATUS.HAS_DOMAIN_ERRORS]: Object.values(allDomainErrors ?? {}).some((domainErrors) => hasDomainErrors(domainErrors)),
    };

    const [policyStatus] = Object.entries(policyChecks).find(([, value]) => value) ?? [];
    const [domainStatus] = Object.entries(domainChecks).find(([, value]) => value) ?? [];

    const policyIDWithErrors = Object.values(policyChecks).find(Boolean)?.id;

    return {
        policyStatus: policyStatus as IndicatorStatus | undefined,
        domainStatus: domainStatus as IndicatorStatus | undefined,
        policyIDWithErrors,
    };
}

export default usePolicyIndicatorChecks;
