import {Str} from 'expensify-common';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type UseStrictPolicyRulesResult = {
    /** Whether the user's domain has strict policy rules enabled (strictly enforce workspace rules) */
    areStrictPolicyRulesEnabled: boolean;
};

/**
 * Hook to check if strict policy rules are enabled for the user's domain security group.
 * When enabled, users cannot submit reports that have policy violations.
 */
function useStrictPolicyRules(): UseStrictPolicyRulesResult {
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

    // Check if strict policy rules are enabled
    const areStrictPolicyRulesEnabled = securityGroup?.enableStrictPolicyRules === true;

    return {
        areStrictPolicyRulesEnabled,
    };
}

export default useStrictPolicyRules;
