import hasWorkspaceCreationRestriction from '@src/libs/DomainUtils';
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
            hasRestrictedWorkspaceCreation: true,
        };

        const mockSecurityGroupWithoutRestriction: SecurityGroup = {
            hasRestrictedPrimaryLogin: false,
            hasRestrictedWorkspaceCreation: false,
        };

        const mockSecurityGroupsWithRestriction = {
            [mockSecurityGroupKey]: mockSecurityGroupWithRestriction,
        };

        const mockSecurityGroupsWithoutRestriction = {
            [mockSecurityGroupKey]: mockSecurityGroupWithoutRestriction,
        };

        it('should return false when required parameters are missing', () => {
            // Test undefined email
            expect(hasWorkspaceCreationRestriction(undefined, mockMyDomainSecurityGroups, mockSecurityGroupsWithRestriction)).toBe(false);

            // Test undefined myDomainSecurityGroups
            expect(hasWorkspaceCreationRestriction(mockEmail, undefined, mockSecurityGroupsWithRestriction)).toBe(false);

            // Test undefined securityGroups
            expect(hasWorkspaceCreationRestriction(mockEmail, mockMyDomainSecurityGroups, undefined)).toBe(false);
        });

        it('should return false when email format is invalid or domain not found', () => {
            // Test invalid email format
            expect(hasWorkspaceCreationRestriction('invalidemail', mockMyDomainSecurityGroups, mockSecurityGroupsWithRestriction)).toBe(false);

            // Test domain not in security groups
            expect(hasWorkspaceCreationRestriction('user@otherdomain.com', mockMyDomainSecurityGroups, mockSecurityGroupsWithRestriction)).toBe(false);
        });

        it('should return false when security group is not found or has no restrictions', () => {
            // Test security group not found
            const emptySecurityGroups = {};
            expect(hasWorkspaceCreationRestriction(mockEmail, mockMyDomainSecurityGroups, emptySecurityGroups)).toBe(false);

            // Test security group without workspace creation restriction
            expect(hasWorkspaceCreationRestriction(mockEmail, mockMyDomainSecurityGroups, mockSecurityGroupsWithoutRestriction)).toBe(false);
        });

        it('should return true when security group has workspace creation restriction', () => {
            const result = hasWorkspaceCreationRestriction(mockEmail, mockMyDomainSecurityGroups, mockSecurityGroupsWithRestriction);

            expect(result).toBe(true);
        });
    });
});
