import useUserSecurityGroup from './useUserSecurityGroup';

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
    const {securityGroup} = useUserSecurityGroup();

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
