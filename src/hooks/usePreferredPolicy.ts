import {Str} from 'expensify-common';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type UsePreferredPolicyResult = {
    /** Whether the user is restricted to use only the preferred policy */
    isRestrictedToPreferredPolicy: boolean;

    /** The ID of the preferred policy */
    preferredPolicyID: string | undefined;

    /** Whether the user is restricted from creating policies */
    isRestrictedPolicyCreation: boolean;
};

/**
 * Hook to get the preferred policy settings from the user's domain security group
 */
function usePreferredPolicy(): UsePreferredPolicyResult {
    const [myDomainSecurityGroups] = useOnyx(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {canBeMissing: true});
    const [securityGroups] = useOnyx(ONYXKEYS.COLLECTION.SECURITY_GROUP, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});

    // Get the user's domain from their email
    const userDomain = session?.email ? Str.extractEmailDomain(session.email) : undefined;

    // Get the security group ID for the user's domain
    const securityGroupID = userDomain && myDomainSecurityGroups?.[userDomain];

    // Get the security group details
    const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}`;
    const securityGroup = securityGroupID ? securityGroups?.[securityGroupKey] : null;

    // Only restrict if both enableRestrictedPrimaryPolicy is true AND we have a valid policy ID
    const restrictedPolicyID = securityGroup?.restrictedPrimaryPolicyID;
    const hasValidPolicyID = !!restrictedPolicyID && typeof restrictedPolicyID === 'string' && restrictedPolicyID.trim() !== '';
    const isRestrictionEnabled = securityGroup?.enableRestrictedPrimaryPolicy === true;

    return {
        isRestrictedToPreferredPolicy: isRestrictionEnabled && hasValidPolicyID,
        preferredPolicyID: restrictedPolicyID,
        isRestrictedPolicyCreation: securityGroup?.enableRestrictedPolicyCreation === true,
    };
}

export default usePreferredPolicy;
export type {UsePreferredPolicyResult};
