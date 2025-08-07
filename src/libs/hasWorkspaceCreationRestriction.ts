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
    console.log('****** userEmail ******', userEmail);
    console.log('****** myDomainSecurityGroups ******', myDomainSecurityGroups);
    console.log('****** securityGroups ******', securityGroups);

    if (!userEmail || !myDomainSecurityGroups || !securityGroups) {
        return false;
    }

    // Extract domain from email
    const domain = userEmail.split('@').at(1);

    console.log('****** domain ******', domain);

    if (!domain) {
        return false;
    }

    // Get the security group ID for this domain
    const domainSecurityGroupID = myDomainSecurityGroups[domain];

    console.log('****** domainSecurityGroupID ******', domainSecurityGroupID);

    if (!domainSecurityGroupID) {
        return false;
    }

    console.log('****** domainSecurityGroupID ******', domainSecurityGroupID);

    // Get the security group data using the collection key format
    const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${domainSecurityGroupID}`;
    const securityGroup = securityGroups[securityGroupKey];

    console.log('****** securityGroupKey ******', securityGroupKey);

    console.log('****** securityGroup ******', securityGroup);

    // Check if this security group has workspace creation restrictions
    return securityGroup?.hasRestrictedPolicyCreation ?? false;
}

export default hasWorkspaceCreationRestriction;
