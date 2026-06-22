import {Str} from 'expensify-common';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SecurityGroup} from '@src/types/onyx';
import useOnyx from './useOnyx';

type PreferredPolicyResult = {
    /** Whether the user is restricted to use only the preferred policy */
    isRestrictedToPreferredPolicy: boolean;

    /** The ID of the preferred policy */
    preferredPolicyID: string | undefined;

    /** Whether the user is restricted from creating policies */
    isRestrictedPolicyCreation: boolean;
};

type ComputeInput = {
    sessionEmail: string | undefined;
    myDomainSecurityGroups: Record<string, string> | undefined;
    securityGroups: OnyxCollection<SecurityGroup>;
};

function computePreferredPolicy({sessionEmail, myDomainSecurityGroups, securityGroups}: ComputeInput): PreferredPolicyResult {
    const userDomain = sessionEmail ? Str.extractEmailDomain(sessionEmail) : undefined;
    const securityGroupID = userDomain ? myDomainSecurityGroups?.[userDomain] : undefined;
    const securityGroupKey = securityGroupID ? `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` : undefined;
    const securityGroup = securityGroupKey ? securityGroups?.[securityGroupKey] : undefined;

    const restrictedPolicyID = securityGroup?.restrictedPrimaryPolicyID;
    const hasValidPolicyID = !!restrictedPolicyID && typeof restrictedPolicyID === 'string' && restrictedPolicyID.trim() !== '';
    const isRestrictionEnabled = securityGroup?.enableRestrictedPrimaryPolicy === true;

    return {
        isRestrictedToPreferredPolicy: isRestrictionEnabled && hasValidPolicyID,
        preferredPolicyID: restrictedPolicyID,
        isRestrictedPolicyCreation: securityGroup?.enableRestrictedPolicyCreation === true,
    };
}

/**
 * Hook to get the preferred policy settings from the user's domain security group
 */
function usePreferredPolicy(): PreferredPolicyResult {
    const [myDomainSecurityGroups] = useOnyx(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS);
    const [securityGroups] = useOnyx(ONYXKEYS.COLLECTION.SECURITY_GROUP);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    return computePreferredPolicy({sessionEmail: session?.email, myDomainSecurityGroups, securityGroups});
}

export default usePreferredPolicy;
export {computePreferredPolicy};
export type {PreferredPolicyResult};
