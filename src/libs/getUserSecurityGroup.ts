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
    const userDomain = email ? Str.extractEmailDomain(email) : undefined;

    const groupMembership = userDomain ? myDomainSecurityGroups?.[userDomain] : undefined;

    // TODO: Remove the legacy string membership and the legacy collection fallback below once the minimum app version is bumped and the backend stops sending the legacy key (https://github.com/Expensify/Expensify/issues/587357)
    // Read the object membership first, since it carries the owner account ID (domainAccountID), and fall back to the legacy string membership that only carries the security group ID.
    const securityGroupID = typeof groupMembership === 'object' ? groupMembership.securityGroupID : groupMembership;
    const ownerAccountID = typeof groupMembership === 'object' ? groupMembership.ownerAccountID : undefined;

    if (!securityGroupID) {
        return undefined;
    }

    // The security group is a sharedNVP owned by the domain account, keyed under SHARED_NVP_SECURITY_GROUP as `<securityGroupID>_<ownerAccountID>`.
    // A legacy string membership has no owner account ID, so there is no sharedNVP key to read.
    const sharedNVPSecurityGroup = ownerAccountID === undefined ? undefined : securityGroups?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${securityGroupID}_${ownerAccountID}`];

    // The backend writes both keys throughout the rollout, so fall back to the legacy collection.
    return sharedNVPSecurityGroup ?? legacySecurityGroups?.[`${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}`];
}

export default getUserSecurityGroup;
