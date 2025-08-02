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

    // Extract domain from email
    const domain = userEmail.split('@').at(1);
    if (!domain) {
        return false;
    }

    // Get the security group ID for this domain
    const domainSecurityGroupID = myDomainSecurityGroups[domain];
    if (!domainSecurityGroupID) {
        return false;
    }

    // Get the security group data using the collection key format
    const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${domainSecurityGroupID}`;
    const securityGroup = securityGroups[securityGroupKey];

    // Check if this security group has workspace creation restrictions
    return securityGroup?.hasRestrictedWorkspaceCreation ?? false;
}

export default hasWorkspaceCreationRestriction;
