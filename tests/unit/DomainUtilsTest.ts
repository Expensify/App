import hasWorkspaceCreationRestriction from '@libs/hasWorkspaceCreationRestriction';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SecurityGroup} from '@src/types/onyx';

describe('DomainUtils', () => {
    describe('hasWorkspaceCreationRestriction', () => {
        const mockEmail = 'user@example.com';
        const mockDomain = 'example.com';
        const mockSecurityGroupID = 'securityGroup123';
        const mockSecurityGroupKey = `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${mockSecurityGroupID}`;

        const mockMyDomainSecurityGroups = {
            [mockDomain]: mockSecurityGroupID,
        };

        const mockSecurityGroupWithRestriction: SecurityGroup = {
            hasRestrictedPrimaryLogin: false,
            hasRestrictedPolicyCreation: true,
        };

        const mockSecurityGroupWithoutRestriction: SecurityGroup = {
            hasRestrictedPrimaryLogin: false,
            hasRestrictedPolicyCreation: false,
        };

        const mockSecurityGroupsWithRestriction = {
            [mockSecurityGroupKey]: mockSecurityGroupWithRestriction,
        };

        const mockSecurityGroupsWithoutRestriction = {
            [mockSecurityGroupKey]: mockSecurityGroupWithoutRestriction,
        };

        it('should return false when required parameters are missing', () => {
            expect(hasWorkspaceCreationRestriction(undefined, mockMyDomainSecurityGroups, mockSecurityGroupsWithRestriction)).toBe(false);
            expect(hasWorkspaceCreationRestriction(mockEmail, undefined, mockSecurityGroupsWithRestriction)).toBe(false);
            expect(hasWorkspaceCreationRestriction(mockEmail, mockMyDomainSecurityGroups, undefined)).toBe(false);
        });

        it('should return false when email format is invalid or domain not found', () => {
            expect(hasWorkspaceCreationRestriction('invalidemail', mockMyDomainSecurityGroups, mockSecurityGroupsWithRestriction)).toBe(false);
            expect(hasWorkspaceCreationRestriction('user@otherdomain.com', mockMyDomainSecurityGroups, mockSecurityGroupsWithRestriction)).toBe(false);
        });

        it('should return false when security group is not found or has no restrictions', () => {
            const emptySecurityGroups = {};
            expect(hasWorkspaceCreationRestriction(mockEmail, mockMyDomainSecurityGroups, emptySecurityGroups)).toBe(false);
            expect(hasWorkspaceCreationRestriction(mockEmail, mockMyDomainSecurityGroups, mockSecurityGroupsWithoutRestriction)).toBe(false);
        });

        it('should return true when security group has workspace creation restriction', () => {
            const result = hasWorkspaceCreationRestriction(mockEmail, mockMyDomainSecurityGroups, mockSecurityGroupsWithRestriction);

            expect(result).toBe(true);
        });
    });
});
