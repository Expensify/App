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
        // Given a signed-in user with an object membership for their domain
        await Onyx.set(ONYXKEYS.SESSION, {
            email: `user@${domain}`,
        });

        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[domain]: {securityGroupID, ownerAccountID}});

        // Given the group restricts the primary login, stored under the sharedNVP key
        const securityGroupKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${securityGroupID}_${ownerAccountID}` as const;
        await Onyx.set(securityGroupKey, {
            enableRestrictedPrimaryLogin: true,
        });

        // When we render the hook
        const {result} = renderHook(() => useUserSecurityGroup());

        // Then it should return the group stored under the sharedNVP key
        expect(result.current.securityGroup?.enableRestrictedPrimaryLogin).toBe(true);
    });

    it('should fall back to the legacy key for enableRestrictedPrimaryLogin', async () => {
        // Given a signed-in user with an object membership for their domain
        await Onyx.set(ONYXKEYS.SESSION, {
            email: `user@${domain}`,
        });

        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[domain]: {securityGroupID, ownerAccountID}});

        // Given the group is stored only under the legacy key
        const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
        await Onyx.set(securityGroupKey, {
            enableRestrictedPrimaryLogin: true,
        });

        // When we render the hook
        const {result} = renderHook(() => useUserSecurityGroup());

        // Then it should fall back to the legacy key
        expect(result.current.securityGroup?.enableRestrictedPrimaryLogin).toBe(true);
    });

    it('should resolve enableRestrictedPrimaryLogin for a legacy string membership', async () => {
        // Given a signed-in user with a legacy string membership for their domain
        await Onyx.set(ONYXKEYS.SESSION, {
            email: `user@${domain}`,
        });

        const domainSecurityGroups: Record<string, string> = {};
        domainSecurityGroups[domain] = securityGroupID;
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

        // Given the group restricts the primary login, stored under the legacy key
        const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
        await Onyx.set(securityGroupKey, {
            enableRestrictedPrimaryLogin: true,
        });

        // When we render the hook
        const {result} = renderHook(() => useUserSecurityGroup());

        // Then it should still resolve the group
        expect(result.current.securityGroup?.enableRestrictedPrimaryLogin).toBe(true);
    });

    it('should return false for enableRestrictedPrimaryLogin when the group does not restrict it', async () => {
        // Given a signed-in user with an object membership for their domain
        await Onyx.set(ONYXKEYS.SESSION, {
            email: `user@${domain}`,
        });

        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[domain]: {securityGroupID, ownerAccountID}});

        // Given the group leaves the primary login unrestricted
        const securityGroupKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${securityGroupID}_${ownerAccountID}` as const;
        await Onyx.set(securityGroupKey, {
            enableRestrictedPrimaryLogin: false,
        });

        // When we render the hook
        const {result} = renderHook(() => useUserSecurityGroup());

        // Then it should return the group with the restriction switched off
        expect(result.current.securityGroup?.enableRestrictedPrimaryLogin).toBe(false);
    });

    it('should return no security group when the user has no membership for their domain', async () => {
        // Given a signed-in user with no membership for their domain
        await Onyx.set(ONYXKEYS.SESSION, {
            email: `user@${domain}`,
        });

        // When we render the hook
        const {result} = renderHook(() => useUserSecurityGroup());

        // Then it should return no group
        expect(result.current.securityGroup).toBeUndefined();
    });
});
