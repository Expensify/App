import {renderHook} from '@testing-library/react-native';

import useUserSecurityGroup from '@hooks/useUserSecurityGroup';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const domain = 'example.com';
const securityGroupID = '123456';
const ownerAccountID = 42;

describe('useUserSecurityGroup', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('should resolve enableRestrictedPrimaryLogin from the sharedNVP key', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {
            email: `user@${domain}`,
        });

        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[domain]: {securityGroupID, ownerAccountID}});

        const securityGroupKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${securityGroupID}_${ownerAccountID}` as const;
        await Onyx.set(securityGroupKey, {
            enableRestrictedPrimaryLogin: true,
        });

        const {result} = renderHook(() => useUserSecurityGroup());

        expect(result.current.securityGroup?.enableRestrictedPrimaryLogin).toBe(true);
    });

    it('should fall back to the legacy key for enableRestrictedPrimaryLogin', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {
            email: `user@${domain}`,
        });

        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[domain]: {securityGroupID, ownerAccountID}});

        const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
        await Onyx.set(securityGroupKey, {
            enableRestrictedPrimaryLogin: true,
        });

        const {result} = renderHook(() => useUserSecurityGroup());

        expect(result.current.securityGroup?.enableRestrictedPrimaryLogin).toBe(true);
    });

    it('should resolve enableRestrictedPrimaryLogin for a legacy string membership', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {
            email: `user@${domain}`,
        });

        const domainSecurityGroups: Record<string, string> = {};
        domainSecurityGroups[domain] = securityGroupID;
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

        const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
        await Onyx.set(securityGroupKey, {
            enableRestrictedPrimaryLogin: true,
        });

        const {result} = renderHook(() => useUserSecurityGroup());

        expect(result.current.securityGroup?.enableRestrictedPrimaryLogin).toBe(true);
    });

    it('should return false for enableRestrictedPrimaryLogin when the group does not restrict it', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {
            email: `user@${domain}`,
        });

        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[domain]: {securityGroupID, ownerAccountID}});

        const securityGroupKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${securityGroupID}_${ownerAccountID}` as const;
        await Onyx.set(securityGroupKey, {
            enableRestrictedPrimaryLogin: false,
        });

        const {result} = renderHook(() => useUserSecurityGroup());

        expect(result.current.securityGroup?.enableRestrictedPrimaryLogin).toBe(false);
    });

    it('should return no security group when the user has no membership for their domain', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {
            email: `user@${domain}`,
        });

        const {result} = renderHook(() => useUserSecurityGroup());

        expect(result.current.securityGroup).toBeUndefined();
    });
});
