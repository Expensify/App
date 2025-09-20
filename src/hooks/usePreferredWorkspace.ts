import {Str} from 'expensify-common';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type UsePreferredWorkspaceResult = {
    /** Whether the user is restricted to use only the preferred workspace */
    isRestrictedToPreferredWorkspace: boolean;

    /** The ID of the preferred workspace/policy */
    preferredWorkspaceID: string | undefined;
};

/**
 * Hook to get the preferred workspace settings from the user's domain security group
 */
function usePreferredWorkspace(): UsePreferredWorkspaceResult {
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

    // Only restrict if both enableRestrictedPrimaryPolicy is true AND we have a valid workspace ID
    const restrictedPolicyID = securityGroup?.restrictedPrimaryPolicyID;
    const hasValidWorkspaceID = !!restrictedPolicyID && typeof restrictedPolicyID === 'string' && restrictedPolicyID.trim() !== '';
    const isRestrictionEnabled = securityGroup?.enableRestrictedPrimaryPolicy === true;

    return {
        isRestrictedToPreferredWorkspace: isRestrictionEnabled && hasValidWorkspaceID,
        preferredWorkspaceID: restrictedPolicyID,
    };
}

export default usePreferredWorkspace;
export type {UsePreferredWorkspaceResult};
