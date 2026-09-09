import useUserSecurityGroup from './useUserSecurityGroup';

type UseStrictPolicyRulesResult = {
    /** Whether the user's domain has strict policy rules enabled (strictly enforce workspace rules) */
    areStrictPolicyRulesEnabled: boolean;
};

/**
 * Hook to check if strict policy rules are enabled for the user's domain security group.
 * When enabled, users cannot submit reports that have policy violations.
 */
function useStrictPolicyRules(): UseStrictPolicyRulesResult {
    const {securityGroup} = useUserSecurityGroup();

    // Check if strict policy rules are enabled
    const areStrictPolicyRulesEnabled = securityGroup?.enableStrictPolicyRules === true;

    return {
        areStrictPolicyRulesEnabled,
    };
}

export default useStrictPolicyRules;
