import {beforeEach, describe, expect, jest, test} from '@jest/globals';
import CONST from '../../src/CONST';
import * as SearchUtils from '../../src/libs/SearchUtils';
import type {SearchQueryString} from '../../src/types/onyx/SearchResults';
import type Policy from '../../src/types/onyx/Policy';
import type Report from '../../src/types/onyx/Report';

describe('SearchUtils', () => {
    const mockPolicy: Policy = {
        id: 'workspace123',
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: 'admin@company.com',
        outputCurrency: 'USD',
        isPolicyExpenseChatEnabled: true,
        autoReporting: true,
        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY,
    };

    const mockUserPolicy: Policy = {
        ...mockPolicy,
        role: CONST.POLICY.ROLE.USER,
    };

    const mockAdminReport: Report = {
        reportID: 'report1',
        reportName: 'Admin Expense Report',
        policyID: 'workspace123',
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerAccountID: 1001,
        managerID: 1001,
        isOwnPolicyExpenseChat: true,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        stateNum: CONST.REPORT.STATE_NUM.PROCESSING,
        total: 15000,
        currency: 'USD',
    };

    const mockTeamMemberReport: Report = {
        reportID: 'report2',
        reportName: 'Team Member Expense Report',
        policyID: 'workspace123',
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerAccountID: 1002,
        managerID: 1001,
        isOwnPolicyExpenseChat: false,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        total: 8500,
        currency: 'USD',
    };

    const mockPersonalReport: Report = {
        reportID: 'report3',
        reportName: 'Personal Expense Report',
        policyID: '',
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerAccountID: 1001,
        managerID: 1001,
        isOwnPolicyExpenseChat: true,
        statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
        total: 2500,
        currency: 'USD',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('buildSearchQueryString', () => {
        test('should build basic query for expense reports', () => {
            const result = SearchUtils.buildSearchQueryString({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                sortBy: CONST.SEARCH.SORT_BY.DATE,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            });

            expect(result).toContain('type:expense');
            expect(result).toContain('status:all');
        });

        test('should include workspace filter when policyID provided', () => {
            const result = SearchUtils.buildSearchQueryString({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                policyID: 'workspace123',
                sortBy: CONST.SEARCH.SORT_BY.DATE,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            });

            expect(result).toContain('policyID:workspace123');
        });

        test('should handle complex queries with multiple filters', () => {
            const result = SearchUtils.buildSearchQueryString({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.PAID,
                policyID: 'workspace123',
                from: 'user@company.com',
                amount: [100, 1000],
                sortBy: CONST.SEARCH.SORT_BY.AMOUNT,
                sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
            });

            expect(result).toContain('type:expense');
            expect(result).toContain('status:paid');
            expect(result).toContain('policyID:workspace123');
            expect(result).toContain('from:user@company.com');
        });
    });

    describe('parseSearchQuery', () => {
        test('should parse basic search query', () => {
            const query: SearchQueryString = 'type:expense status:all';
            const result = SearchUtils.parseSearchQuery(query);

            expect(result.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
            expect(result.status).toBe(CONST.SEARCH.STATUS.EXPENSE.ALL);
        });

        test('should parse workspace-specific query', () => {
            const query: SearchQueryString = 'type:expense policyID:workspace123 status:paid';
            const result = SearchUtils.parseSearchQuery(query);

            expect(result.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
            expect(result.policyID).toBe('workspace123');
            expect(result.status).toBe(CONST.SEARCH.STATUS.EXPENSE.PAID);
        });

        test('should handle malformed queries gracefully', () => {
            const query: SearchQueryString = 'invalid:query syntax';
            const result = SearchUtils.parseSearchQuery(query);

            expect(result).toBeDefined();
            expect(result.type).toBeUndefined();
        });
    });

    describe('shouldShowWorkspaceReports', () => {
        test('should return true for workspace admin', () => {
            const result = SearchUtils.shouldShowWorkspaceReports(mockPolicy);
            expect(result).toBe(true);
        });

        test('should return true for workspace admin with paid reports filter', () => {
            const query: SearchQueryString = 'type:expense status:paid policyID:workspace123';
            const result = SearchUtils.shouldShowWorkspaceReports(mockPolicy, query);
            expect(result).toBe(true);
        });

        test('should return false for regular user with paid reports filter', () => {
            const query: SearchQueryString = 'type:expense status:paid policyID:workspace123';
            const result = SearchUtils.shouldShowWorkspaceReports(mockUserPolicy, query);
            expect(result).toBe(false);
        });

        test('should return true for regular user with non-paid status', () => {
            const query: SearchQueryString = 'type:expense status:open policyID:workspace123';
            const result = SearchUtils.shouldShowWorkspaceReports(mockUserPolicy, query);
            expect(result).toBe(true);
        });
    });

    describe('filterReportsByUserPermissions', () => {
        const mockReports = [mockAdminReport, mockTeamMemberReport, mockPersonalReport];

        test('admin should see all workspace reports for paid status', () => {
            const query: SearchQueryString = 'type:expense status:paid policyID:workspace123';
            const result = SearchUtils.filterReportsByUserPermissions(mockReports, mockPolicy, query);

            expect(result).toHaveLength(2);
            expect(result).toContain(mockAdminReport);
            expect(result).toContain(mockTeamMemberReport);
            expect(result).not.toContain(mockPersonalReport);
        });

        test('regular user should see only own reports for paid status', () => {
            const query: SearchQueryString = 'type:expense status:paid policyID:workspace123';
            const modifiedReports = [
                {...mockAdminReport, ownerAccountID: 1002},
                mockTeamMemberReport,
                mockPersonalReport,
            ];

            const result = SearchUtils.filterReportsByUserPermissions(modifiedReports, mockUserPolicy, query, 1002);

            expect(result).toHaveLength(1);
            expect(result[0].reportID).toBe('report1');
        });

        test('should include personal reports regardless of workspace permissions', () => {
            const query: SearchQueryString = 'type:expense status:all';
            const result = SearchUtils.filterReportsByUserPermissions(mockReports, mockUserPolicy, query, 1001);

            expect(result).toContain(mockPersonalReport);
        });

        test('should handle empty reports array', () => {
            const query: SearchQueryString = 'type:expense status:all';
            const result = SearchUtils.filterReportsByUserPermissions([], mockPolicy, query);

            expect(result).toHaveLength(0);
        });

        test('should filter out reports from different workspaces', () => {
            const otherWorkspaceReport: Report = {
                ...mockTeamMemberReport,
                reportID: 'report4',
                policyID: 'otherworkspace456',
            };
            const reports = [...mockReports, otherWorkspaceReport];

            const query: SearchQueryString = 'type:expense status:all policyID:workspace123';
            const result = SearchUtils.filterReportsByUserPermissions(reports, mockPolicy, query);

            expect(result).not.toContain(otherWorkspaceReport);
            expect(result.every(report => report.policyID === 'workspace123' || !report.policyID)).toBe(true);
        });
    });

    describe('getUserAccessLevel', () => {
        test('should return admin for workspace admin', () => {
            const result = SearchUtils.getUserAccessLevel(mockPolicy);
            expect(result).toBe(CONST.POLICY.ROLE.ADMIN);
        });

        test('should return user for regular workspace member', () => {
            const result = SearchUtils.getUserAccessLevel(mockUserPolicy);
            expect(result).toBe(CONST.POLICY.ROLE.USER);
        });

        test('should handle undefined policy', () => {
            const result = SearchUtils.getUserAccessLevel(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('isPaidReportsQuery', () => {
        test('should return true for paid status query', () => {
            const query: SearchQueryString = 'type:expense status:paid';
            const result = SearchUtils.isPaidReportsQuery(query);
            expect(result).toBe(true);
        });

        test('should return false for non-paid status query', () => {
            const query: SearchQueryString = 'type:expense status:open';
            const result = SearchUtils.isPaidReportsQuery(query);
            expect(result).toBe(false);
        });

        test('should return false for all status query', () => {
            const query: SearchQueryString = 'type:expense status:all';
            const result = SearchUtils.isPaidReportsQuery(query);
            expect(result).toBe(false);
        });

        test('should handle query without status', () => {
            const query: SearchQueryString = 'type:expense';
            const result = SearchUtils.isPaidReportsQuery(query);
            expect(result).toBe(false);
        });
    });

    describe('canViewAllWorkspaceReports', () => {
        test('should return true for admin regardless of query', () => {
            const paidQuery: SearchQueryString = 'type:expense status:paid policyID:workspace123';
            const openQuery: SearchQueryString = 'type:expense status:open policyID:workspace123';

            expect(SearchUtils.canViewAllWorkspaceReports(mockPolicy, paidQuery)).toBe(true);
            expect(SearchUtils.canViewAllWorkspaceReports(mockPolicy, openQuery)).toBe(true);
        });

        test('should return false for user with paid reports query', () => {
            const query: SearchQueryString = 'type:expense status:paid policyID:workspace123';
            const result = SearchUtils.canViewAllWorkspaceReports(mockUserPolicy, query);
            expect(result).toBe(false);
        });

        test('should return true for user with non-paid reports query', () => {
            const query: SearchQueryString = 'type:expense status:submitted policyID:workspace123';
            const result = SearchUtils.canViewAllWorkspaceReports(mockUserPolicy, query);
            expect(result).toBe(true);
        });
    });
});
