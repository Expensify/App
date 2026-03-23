import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {useCurrentReportIDState} from './useCurrentReportID';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useMappedPolicies from './useMappedPolicies';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useResponsiveLayout from './useResponsiveLayout';

type PartialPolicyForSidebar = Pick<OnyxTypes.Policy, 'type' | 'name' | 'avatarURL' | 'employeeList'>;

const policyMapper = (policy: OnyxEntry<OnyxTypes.Policy>): PartialPolicyForSidebar =>
    (policy && {
        type: policy.type,
        name: policy.name,
        avatarURL: policy.avatarURL,
        employeeList: policy.employeeList,
    }) as PartialPolicyForSidebar;

function useSidebarData(currentReportIDForTests?: string) {
    const [priorityMode = CONST.PRIORITY_MODE.DEFAULT] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
    const [chatReports, {sourceValue: reportUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policies, {sourceValue: policiesUpdates}] = useMappedPolicies(policyMapper);
    const [transactions, {sourceValue: transactionsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [transactionViolations, {sourceValue: transactionViolationsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [reportNameValuePairs, {sourceValue: reportNameValuePairsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [reportsDrafts, {sourceValue: reportsDraftsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {accountID} = useCurrentUserPersonalDetails();
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue;
    const prevDerivedCurrentReportID = usePrevious(derivedCurrentReportID);
    const prevBetas = usePrevious(betas);
    const prevPriorityMode = usePrevious(priorityMode);

    return {
        priorityMode,
        chatReports,
        reportUpdates,
        policies,
        policiesUpdates,
        transactions,
        transactionsUpdates,
        transactionViolations,
        transactionViolationsUpdates,
        reportNameValuePairs,
        reportNameValuePairsUpdates,
        reportsDrafts,
        reportsDraftsUpdates,
        betas,
        prevBetas,
        conciergeReportID,
        shouldUseNarrowLayout,
        accountID,
        derivedCurrentReportID,
        prevDerivedCurrentReportID,
        prevPriorityMode,
    };
}

export default useSidebarData;
export type {PartialPolicyForSidebar};
export {policyMapper};
