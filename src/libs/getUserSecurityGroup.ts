import ONYXKEYS from '@src/ONYXKEYS';
import type SecurityGroup from '@src/types/onyx/SecurityGroup';
import type {DomainSecurityGroupMembership} from '@src/types/onyx/SecurityGroup';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

/**
 * Resolves the current user's domain security group from Onyx data.
 */
function getUserSecurityGroup(
    email: string | undefined,
    myDomainSecurityGroups: OnyxEntry<Record<string, DomainSecurityGroupMembership>>,
    securityGroups: OnyxCollection<SecurityGroup>,
    legacySecurityGroups: OnyxCollection<SecurityGroup>,
): OnyxEntry<SecurityGroup> {
    // Get the user's domain from their email
    const userDomain = email ? Str.extractEmailDomain(email) : undefined;

    // Get the security group details for the user's domain
    const groupMembership = userDomain ? myDomainSecurityGroups?.[userDomain] : undefined;

    // The membership form determines which collection holds the group.
    // Legacy string membership: the group only lives under the legacy SECURITY_GROUP collection.
    if (typeof groupMembership === 'string') {
        return groupMembership ? legacySecurityGroups?.[`${ONYXKEYS.COLLECTION.SECURITY_GROUP}${groupMembership}`] : undefined;
    }

    // Object membership: The security group is a sharedNVP owned by the domain account, keyed under SHARED_NVP_SECURITY_GROUP as  `<securityGroupID>_<ownerAccountID>`.
    // read the sharedNVP key only, no legacy fallback, so a moved or deleted group resolves to undefined rather than stale securityGroup_ data.
    const securityGroupID = groupMembership?.securityGroupID;
    const ownerAccountID = groupMembership?.ownerAccountID;

    return securityGroupID && ownerAccountID !== undefined ? securityGroups?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${securityGroupID}_${ownerAccountID}`] : undefined;
}

export default getUserSecurityGroup;
