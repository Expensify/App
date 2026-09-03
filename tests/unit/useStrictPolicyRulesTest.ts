import {renderHook} from '@testing-library/react-native';

import useStrictPolicyRules from '@hooks/useStrictPolicyRules';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('useStrictPolicyRules', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('should return false when no security groups are configured', () => {
        const {result} = renderHook(() => useStrictPolicyRules());

        expect(result.current.areStrictPolicyRulesEnabled).toBe(false);
    });

    it('should return false when domain has no security groups', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {
            email: 'user@example.com',
        });

        const {result} = renderHook(() => useStrictPolicyRules());

        expect(result.current.areStrictPolicyRulesEnabled).toBe(false);
    });

    it('should return true when security group has enableStrictPolicyRules enabled', async () => {
        const securityGroupID = 'securityGroup123';

        await Onyx.set(ONYXKEYS.SESSION, {
            email: 'user@example.com',
        });

        const domainSecurityGroups: Record<string, string> = {};
        domainSecurityGroups['example.com'] = securityGroupID;
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

        const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
        await Onyx.set(securityGroupKey, {
            enableStrictPolicyRules: true,
        });

        const {result} = renderHook(() => useStrictPolicyRules());

        expect(result.current.areStrictPolicyRulesEnabled).toBe(true);
    });

    it('should return true when the security group is under the sharedNVP key and it has enableStrictPolicyRules enabled', async () => {
        const securityGroupID = 'securityGroup123';
        const ownerAccountID = 42;

        // Given a signed-in user with an object membership for their domain
        await Onyx.set(ONYXKEYS.SESSION, {
            email: 'user@example.com',
        });

        const domain = 'example.com';
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[domain]: {securityGroupID, ownerAccountID}});

        // Given the group enforces workspace rules strictly, stored under the sharedNVP key
        const securityGroupKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${securityGroupID}_${ownerAccountID}` as const;
        await Onyx.set(securityGroupKey, {
            enableStrictPolicyRules: true,
        });

        // When we render the hook
        const {result} = renderHook(() => useStrictPolicyRules());

        // Then it should report strict workspace rules as enabled
        expect(result.current.areStrictPolicyRulesEnabled).toBe(true);
    });

    it('should return false when security group has enableStrictPolicyRules disabled', async () => {
        const securityGroupID = 'securityGroup123';

        await Onyx.set(ONYXKEYS.SESSION, {
            email: 'user@example.com',
        });

        const domainSecurityGroups: Record<string, string> = {};
        domainSecurityGroups['example.com'] = securityGroupID;
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

        const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
        await Onyx.set(securityGroupKey, {
            enableStrictPolicyRules: false,
        });

        const {result} = renderHook(() => useStrictPolicyRules());

        expect(result.current.areStrictPolicyRulesEnabled).toBe(false);
    });

    it('should return false when security group is not found', async () => {
        const securityGroupID = 'nonExistentGroup';

        await Onyx.set(ONYXKEYS.SESSION, {
            email: 'user@example.com',
        });

        const domainSecurityGroups: Record<string, string> = {};
        domainSecurityGroups['example.com'] = securityGroupID;
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

        const {result} = renderHook(() => useStrictPolicyRules());

        expect(result.current.areStrictPolicyRulesEnabled).toBe(false);
    });

    describe('Edge cases', () => {
        it('should handle null enableStrictPolicyRules', async () => {
            const securityGroupID = 'securityGroup123';

            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'user@example.com',
            });

            const domainSecurityGroups: Record<string, string> = {};
            domainSecurityGroups['example.com'] = securityGroupID;
            await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

            const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
            await Onyx.set(securityGroupKey, {
                enableStrictPolicyRules: null,
            });

            const {result} = renderHook(() => useStrictPolicyRules());

            expect(result.current.areStrictPolicyRulesEnabled).toBe(false);
        });

        it('should handle undefined enableStrictPolicyRules', async () => {
            const securityGroupID = 'securityGroup123';

            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'user@example.com',
            });

            const domainSecurityGroups: Record<string, string> = {};
            domainSecurityGroups['example.com'] = securityGroupID;
            await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

            const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
            await Onyx.set(securityGroupKey, {});

            const {result} = renderHook(() => useStrictPolicyRules());

            expect(result.current.areStrictPolicyRulesEnabled).toBe(false);
        });

        it('should handle missing session email', async () => {
            const securityGroupID = 'securityGroup123';

            await Onyx.set(ONYXKEYS.SESSION, {});

            const domainSecurityGroups: Record<string, string> = {};
            domainSecurityGroups['example.com'] = securityGroupID;
            await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

            const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
            await Onyx.set(securityGroupKey, {
                enableStrictPolicyRules: true,
            });

            const {result} = renderHook(() => useStrictPolicyRules());

            expect(result.current.areStrictPolicyRulesEnabled).toBe(false);
        });

        it('should extract domain correctly from email and match security group', async () => {
            const securityGroupID = 'securityGroup123';

            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'john.doe@company.org',
            });

            const domainSecurityGroups: Record<string, string> = {};
            domainSecurityGroups['company.org'] = securityGroupID;
            await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

            const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
            await Onyx.set(securityGroupKey, {
                enableStrictPolicyRules: true,
            });

            const {result} = renderHook(() => useStrictPolicyRules());

            expect(result.current.areStrictPolicyRulesEnabled).toBe(true);
        });

        it('should return false when domain does not match any security group', async () => {
            const securityGroupID = 'securityGroup123';

            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'user@example.com',
            });

            const domainSecurityGroups: Record<string, string> = {};
            domainSecurityGroups['different-domain.com'] = securityGroupID;
            await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

            const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
            await Onyx.set(securityGroupKey, {
                enableStrictPolicyRules: true,
            });

            const {result} = renderHook(() => useStrictPolicyRules());

            expect(result.current.areStrictPolicyRulesEnabled).toBe(false);
        });
    });
});
