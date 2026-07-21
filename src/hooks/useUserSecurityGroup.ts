import getUserSecurityGroup from '@libs/getUserSecurityGroup';

import ONYXKEYS from '@src/ONYXKEYS';
import type SecurityGroup from '@src/types/onyx/SecurityGroup';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

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

    return {
        securityGroup: getUserSecurityGroup(session?.email, myDomainSecurityGroups, securityGroups, legacySecurityGroups),
        isLoadingSecurityGroup: isLoadingOnyxValue(myDomainSecurityGroupsResult, securityGroupsResult, legacySecurityGroupsResult, sessionResult),
    };
}

export default useUserSecurityGroup;
