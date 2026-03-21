import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import * as ReportUtils from '@libs/ReportUtils';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReport from '../utils/collections/reports';
import createRandomUser from '../utils/collections/users';

const POLICY_TYPES = CONST.POLICY.TYPE;
const ACCESS_VARIANTS = CONST.POLICY.ACCESS_VARIANTS;

describe('ReportUtils', () => {
    describe('canUserAccessWorkspaceReports', () => {
        let mockPolicy: ReturnType<typeof createRandomPolicy>;
        let mockUser: ReturnType<typeof createRandomUser>;
        let mockReport: ReturnType<typeof createRandomReport>;

        beforeEach(() => {
            mockPolicy = createRandomPolicy();
            mockUser = createRandomUser();
            mockReport = createRandomReport();
        });

        it('should return true when user is policy admin', () => {
            mockPolicy.role = CONST.POLICY.ROLE.ADMIN;
            mockPolicy.employeeList = {
                [mockUser.email]: {
                    role: CONST.POLICY.ROLE.ADMIN,
                },
            };

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(result).toBe(true);
        });

        it('should return true when user is policy owner', () => {
            mockPolicy.role = CONST.POLICY.ROLE.ADMIN;
            mockPolicy.owner = mockUser.email;

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(result).toBe(true);
        });

        it('should return false when user is not policy member', () => {
            mockPolicy.role = CONST.POLICY.ROLE.USER;
            mockPolicy.employeeList = {};

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(result).toBe(false);
        });

        it('should return false when user is regular member without admin access', () => {
            mockPolicy.role = CONST.POLICY.ROLE.USER;
            mockPolicy.employeeList = {
                [mockUser.email]: {
                    role: CONST.POLICY.ROLE.USER,
                },
            };

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(result).toBe(false);
        });

        it('should return true when policy has public access', () => {
            mockPolicy.accessVariants = ACCESS_VARIANTS.PUBLIC;
            mockPolicy.role = CONST.POLICY.ROLE.USER;

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(result).toBe(true);
        });

        it('should return false when policy has private access and user is not member', () => {
            mockPolicy.accessVariants = ACCESS_VARIANTS.PRIVATE;
            mockPolicy.role = CONST.POLICY.ROLE.USER;
            mockPolicy.employeeList = {};

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(result).toBe(false);
        });

        it('should handle undefined policy gracefully', () => {
            const result = ReportUtils.canUserAccessWorkspaceReports(undefined, mockUser.email);

            expect(result).toBe(false);
        });

        it('should handle empty userEmail gracefully', () => {
            mockPolicy.role = CONST.POLICY.ROLE.ADMIN;

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, '');

            expect(result).toBe(false);
        });

        it('should handle null userEmail gracefully', () => {
            mockPolicy.role = CONST.POLICY.ROLE.ADMIN;

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, null as any);

            expect(result).toBe(false);
        });

        it('should return true for workspace reports when user has workspace permissions', () => {
            mockPolicy.role = CONST.POLICY.ROLE.ADMIN;
            mockPolicy.type = POLICY_TYPES.CORPORATE;
            mockReport.policyID = mockPolicy.id;

            const hasAccess = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(hasAccess).toBe(true);
        });

        it('should work with personal workspace type', () => {
            mockPolicy.role = CONST.POLICY.ROLE.ADMIN;
            mockPolicy.type = POLICY_TYPES.PERSONAL;
            mockPolicy.owner = mockUser.email;

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(result).toBe(true);
        });

        it('should work with team workspace type', () => {
            mockPolicy.role = CONST.POLICY.ROLE.ADMIN;
            mockPolicy.type = POLICY_TYPES.TEAM;
            mockPolicy.employeeList = {
                [mockUser.email]: {
                    role: CONST.POLICY.ROLE.ADMIN,
                },
            };

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(result).toBe(true);
        });

        it('should correctly identify non-admin users in team workspace', () => {
            mockPolicy.role = CONST.POLICY.ROLE.USER;
            mockPolicy.type = POLICY_TYPES.TEAM;
            mockPolicy.employeeList = {
                [mockUser.email]: {
                    role: CONST.POLICY.ROLE.USER,
                },
            };

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(result).toBe(false);
        });

        it('should handle missing employeeList property', () => {
            mockPolicy.role = CONST.POLICY.ROLE.USER;
            delete mockPolicy.employeeList;

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email);

            expect(result).toBe(false);
        });

        it('should be case-sensitive for email matching', () => {
            mockPolicy.role = CONST.POLICY.ROLE.ADMIN;
            mockPolicy.employeeList = {
                [mockUser.email.toLowerCase()]: {
                    role: CONST.POLICY.ROLE.ADMIN,
                },
            };

            const result = ReportUtils.canUserAccessWorkspaceReports(mockPolicy, mockUser.email.toUpperCase());

            expect(result).toBe(false);
        });
    });
});
