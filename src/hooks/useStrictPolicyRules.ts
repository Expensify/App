import useUserSecurityGroup from './useUserSecurityGroup';

type UseStrictPolicyRulesResult = {
    /** Whether the user's domain has strict policy rules enabled (strictly enforce workspace rules) */
    areStrictPolicyRulesEnabled: boolean;

    /** Whether the domain security-group data is still loading. Permission checks must wait until this is false. */
    isLoadingSecurityGroup: boolean;
};

/**
 * Hook to check if strict policy rules are enabled for the user's domain security group.
 * When enabled, users cannot submit reports that have policy violations.
 */
function useStrictPolicyRules(): UseStrictPolicyRulesResult {
    const {securityGroup, isLoadingSecurityGroup} = useUserSecurityGroup();

    // Check if strict policy rules are enabled
    const areStrictPolicyRulesEnabled = securityGroup?.enableStrictPolicyRules === true;

    return {
        areStrictPolicyRulesEnabled,
        isLoadingSecurityGroup,
    };
}

export default useStrictPolicyRules;
