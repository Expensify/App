import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type SecurityGroup from '@src/types/onyx/SecurityGroup';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';

type UseUserSecurityGroupResult = {
    /** The resolved security group for the user's primary domain, if any */
    securityGroup: OnyxEntry<SecurityGroup>;

    /** Whether the Onyx values backing the security group are still loading */
    isLoadingSecurityGroup: boolean;
};

/**
 * Resolves the current user's domain security group.
 *
 * The security group is a sharedNVP owned by the domain account, so it lives under SHARED_NVP_SECURITY_GROUP keyed as
 * `<securityGroupID>_<ownerAccountID>`. The MY_DOMAIN_SECURITY_GROUPS map provides both IDs for the user's domain.
 */
function useUserSecurityGroup(): UseUserSecurityGroupResult {
    const [myDomainSecurityGroups, myDomainSecurityGroupsResult] = useOnyx(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS);
    const [securityGroups, securityGroupsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP);
    const [legacySecurityGroups, legacySecurityGroupsResult] = useOnyx(ONYXKEYS.COLLECTION.SECURITY_GROUP);
    const [session, sessionResult] = useOnyx(ONYXKEYS.SESSION);

    const userDomain = session?.email ? Str.extractEmailDomain(session.email) : undefined;
    const membership = userDomain ? myDomainSecurityGroups?.[userDomain] : undefined;

    // During the backend rollout the membership entry may still be the legacy `string` (the securityGroupID only).
    const securityGroupID = typeof membership === 'string' ? membership : membership?.securityGroupID;
    const ownerAccountID = typeof membership === 'string' ? undefined : membership?.ownerAccountID;

    // Prefer the sharedNVP key (needs the owner account ID); fall back to the legacy collection key until the backend is deployed.
    const sharedNVPSecurityGroup =
        securityGroupID && ownerAccountID !== undefined ? securityGroups?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${securityGroupID}_${ownerAccountID}`] : undefined;
    const legacySecurityGroup = securityGroupID ? legacySecurityGroups?.[`${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}`] : undefined;

    return {
        securityGroup: sharedNVPSecurityGroup ?? legacySecurityGroup,
        isLoadingSecurityGroup: isLoadingOnyxValue(myDomainSecurityGroupsResult, securityGroupsResult, legacySecurityGroupsResult, sessionResult),
    };
}

export default useUserSecurityGroup;
