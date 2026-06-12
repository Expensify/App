import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('usePreferredPolicy', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('should return default values when no security groups are configured', () => {
        const {result} = renderHook(() => usePreferredPolicy());

        expect(result.current.isRestrictedToPreferredPolicy).toBe(false);
        expect(result.current.preferredPolicyID).toBeUndefined();
    });

    it('should return default values when domain has no security groups', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {
            email: 'user@example.com',
        });

        const {result} = renderHook(() => usePreferredPolicy());

        expect(result.current.isRestrictedToPreferredPolicy).toBe(false);
        expect(result.current.preferredPolicyID).toBeUndefined();
    });

    it('should return restricted workspace when security group has enableRestrictedPrimaryPolicy enabled', async () => {
        const securityGroupID = 'securityGroup123';
        const restrictedPolicyID = 'policy456';

        await Onyx.set(ONYXKEYS.SESSION, {
            email: 'user@example.com',
        });

        const domainSecurityGroups: Record<string, string> = {};
        domainSecurityGroups['example.com'] = securityGroupID;
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

        const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
        await Onyx.set(securityGroupKey, {
            enableRestrictedPrimaryPolicy: true,
            restrictedPrimaryPolicyID: restrictedPolicyID,
        });

        const {result} = renderHook(() => usePreferredPolicy());

        expect(result.current.isRestrictedToPreferredPolicy).toBe(true);
        expect(result.current.preferredPolicyID).toBe(restrictedPolicyID);
    });

    it('should return false when security group has enableRestrictedPrimaryPolicy disabled', async () => {
        const securityGroupID = 'securityGroup123';
        const restrictedPolicyID = 'policy456';

        await Onyx.set(ONYXKEYS.SESSION, {
            email: 'user@example.com',
        });

        const domainSecurityGroups: Record<string, string> = {};
        domainSecurityGroups['example.com'] = securityGroupID;
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

        const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
        await Onyx.set(securityGroupKey, {
            enableRestrictedPrimaryPolicy: false,
            restrictedPrimaryPolicyID: restrictedPolicyID,
        });

        const {result} = renderHook(() => usePreferredPolicy());

        expect(result.current.isRestrictedToPreferredPolicy).toBe(false);
        expect(result.current.preferredPolicyID).toBe(restrictedPolicyID);
    });

    it('should return default values when security group is not found', async () => {
        const securityGroupID = 'nonExistentGroup';

        await Onyx.set(ONYXKEYS.SESSION, {
            email: 'user@example.com',
        });

        const domainSecurityGroups: Record<string, string> = {};
        domainSecurityGroups['example.com'] = securityGroupID;
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

        const {result} = renderHook(() => usePreferredPolicy());

        expect(result.current.isRestrictedToPreferredPolicy).toBe(false);
        expect(result.current.preferredPolicyID).toBeUndefined();
    });

    describe('Edge cases', () => {
        it('should handle null enableRestrictedPrimaryPolicy', async () => {
            const securityGroupID = 'securityGroup123';
            const restrictedPolicyID = 'policy456';

            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'user@example.com',
            });

            const domainSecurityGroups: Record<string, string> = {};
            domainSecurityGroups['example.com'] = securityGroupID;
            await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

            const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
            await Onyx.set(securityGroupKey, {
                enableRestrictedPrimaryPolicy: null,
                restrictedPrimaryPolicyID: restrictedPolicyID,
            });

            const {result} = renderHook(() => usePreferredPolicy());

            expect(result.current.isRestrictedToPreferredPolicy).toBe(false);
            expect(result.current.preferredPolicyID).toBe(restrictedPolicyID);
        });

        it('should handle undefined enableRestrictedPrimaryPolicy', async () => {
            const securityGroupID = 'securityGroup123';
            const restrictedPolicyID = 'policy456';

            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'user@example.com',
            });

            const domainSecurityGroups: Record<string, string> = {};
            domainSecurityGroups['example.com'] = securityGroupID;
            await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

            const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
            await Onyx.set(securityGroupKey, {
                restrictedPrimaryPolicyID: restrictedPolicyID,
            });

            const {result} = renderHook(() => usePreferredPolicy());

            expect(result.current.isRestrictedToPreferredPolicy).toBe(false);
            expect(result.current.preferredPolicyID).toBe(restrictedPolicyID);
        });

        it('should handle missing restrictedPrimaryPolicyID when enableRestrictedPrimaryPolicy is true', async () => {
            const securityGroupID = 'securityGroup123';

            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'user@example.com',
            });

            const domainSecurityGroups: Record<string, string> = {};
            domainSecurityGroups['example.com'] = securityGroupID;
            await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

            const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
            await Onyx.set(securityGroupKey, {
                enableRestrictedPrimaryPolicy: true,
            });

            const {result} = renderHook(() => usePreferredPolicy());

            expect(result.current.isRestrictedToPreferredPolicy).toBe(false);
            expect(result.current.preferredPolicyID).toBeUndefined();
        });

        it('should handle null restrictedPrimaryPolicyID', async () => {
            const securityGroupID = 'securityGroup123';

            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'user@example.com',
            });

            const domainSecurityGroups: Record<string, string> = {};
            domainSecurityGroups['example.com'] = securityGroupID;
            await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

            const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
            await Onyx.set(securityGroupKey, {
                enableRestrictedPrimaryPolicy: true,
                restrictedPrimaryPolicyID: null,
            });

            const {result} = renderHook(() => usePreferredPolicy());

            expect(result.current.isRestrictedToPreferredPolicy).toBe(false);
            expect(result.current.preferredPolicyID).toBeUndefined();
        });

        it('should handle empty string restrictedPrimaryPolicyID', async () => {
            const securityGroupID = 'securityGroup123';

            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'user@example.com',
            });

            const domainSecurityGroups: Record<string, string> = {};
            domainSecurityGroups['example.com'] = securityGroupID;
            await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, domainSecurityGroups);

            const securityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}` as const;
            await Onyx.set(securityGroupKey, {
                enableRestrictedPrimaryPolicy: true,
                restrictedPrimaryPolicyID: '',
            });

            const {result} = renderHook(() => usePreferredPolicy());

            expect(result.current.isRestrictedToPreferredPolicy).toBe(false);
            expect(result.current.preferredPolicyID).toBe('');
        });
    });
});
