import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SecurityGroup} from '@src/types/onyx';

/**
 * Check if the current user's domain has workspace creation restrictions
 */
function hasWorkspaceCreationRestriction(
    userEmail: string | undefined,
    myDomainSecurityGroups: OnyxEntry<Record<string, string>>,
    securityGroups?: Record<string, SecurityGroup | undefined>,
): boolean {
    if (!userEmail || !myDomainSecurityGroups || !securityGroups) {
        return false;
    }

    const domain = userEmail.split('@').at(1);

    if (!domain) {
        return false;
    }

    const domainSecurityGroupID = myDomainSecurityGroups[domain];

    if (!domainSecurityGroupID) {
        return false;
    }
    const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${domainSecurityGroupID}`;
    const securityGroup = securityGroups[securityGroupKey];

    return securityGroup?.hasRestrictedPolicyCreation ?? false;
}

export default hasWorkspaceCreationRestriction;
