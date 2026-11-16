import {canReassignAllReports, shouldAutoApplyApprover} from '@pages/Search/SearchChangeApproverPage';
import {APPROVER_TYPE} from '@pages/DynamicReportChangeApproverPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

describe('SearchChangeApproverPage', () => {
    describe('canReassignAllReports', () => {
        const nonDEWPolicy: Policy = {
            id: 'policy_1',
            name: 'Standard Workspace',
            role: CONST.POLICY.ROLE.ADMIN,
            approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            type: CONST.POLICY.TYPE.CORPORATE,
            outputCurrency: 'USD',
        } as Policy;

        const dewPolicy: Policy = {
            id: 'policy_2',
            name: 'DEW Workspace',
            role: CONST.POLICY.ROLE.ADMIN,
            approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            type: CONST.POLICY.TYPE.CORPORATE,
            outputCurrency: 'USD',
            connections: {
                intacct: {
                    config: {
                        dynamicExternalWorkflows: {
                            enabled: true,
                        },
                    },
                },
            },
        } as unknown as Policy;

        const validReport: Report = {
            reportID: 'report_1',
            policyID: 'policy_1',
            type: CONST.REPORT.TYPE.EXPENSE,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as Report;

        const dewReport: Report = {
            reportID: 'report_2',
            policyID: 'policy_2',
            type: CONST.REPORT.TYPE.EXPENSE,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as Report;

        it('returns true when all selected reports belong to non-DEW workspaces with admin permissions', () => {
            const allPolicies = {
                [`${ONYXKEYS.COLLECTION.POLICY}policy_1`]: nonDEWPolicy,
            };
            const onyxReports = {
                report_1: validReport,
            };
            const selectedReports = [{reportID: 'report_1', policyID: 'policy_1'}];

            expect(canReassignAllReports({selectedReports, onyxReports, allPolicies})).toBe(true);
        });

        it('returns false when any selected report belongs to a DEW workspace', () => {
            const allPolicies = {
                [`${ONYXKEYS.COLLECTION.POLICY}policy_1`]: nonDEWPolicy,
                [`${ONYXKEYS.COLLECTION.POLICY}policy_2`]: dewPolicy,
            };
            const onyxReports = {
                report_1: validReport,
                report_2: dewReport,
            };
            const selectedReports = [
                {reportID: 'report_1', policyID: 'policy_1'},
                {reportID: 'report_2', policyID: 'policy_2'},
            ];

            expect(canReassignAllReports({selectedReports, onyxReports, allPolicies})).toBe(false);
        });
    });

    describe('shouldAutoApplyApprover', () => {
        const selectedReports = [{reportID: 'report_1', policyID: 'policy_1'}];
        const onyxReports = {
            report_1: {reportID: 'report_1'} as Report,
        };

        it('does not auto-apply when the sole remaining option is BYPASS_APPROVER', () => {
            const approverTypes = [{keyForList: APPROVER_TYPE.BYPASS_APPROVER}];
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports,
                onyxReports,
                approverTypes,
                selectedApproverType: APPROVER_TYPE.BYPASS_APPROVER,
                areSelectedPoliciesLoaded: true,
            });

            expect(result).toBe(false);
        });

        it('auto-applies when the sole option is ADD_APPROVER and matches selectedApproverType', () => {
            const approverTypes = [{keyForList: APPROVER_TYPE.ADD_APPROVER}];
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports,
                onyxReports,
                approverTypes,
                selectedApproverType: APPROVER_TYPE.ADD_APPROVER,
                areSelectedPoliciesLoaded: true,
            });

            expect(result).toBe(true);
        });
    });
});
