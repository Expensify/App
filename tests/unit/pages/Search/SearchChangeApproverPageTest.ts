import {APPROVER_TYPE, getSelectedApproverType} from '@pages/DynamicReportChangeApproverPage';
import type {ApproverType} from '@pages/DynamicReportChangeApproverPage';
import {areSelectedPoliciesLoaded, canReassignAllReports, shouldAutoApplyApprover} from '@pages/Search/SearchChangeApproverPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import createMock from '../../../utils/createMock';

const ADD_APPROVER_OPTION: {keyForList: ApproverType} = {keyForList: APPROVER_TYPE.ADD_APPROVER};
const BYPASS_APPROVER_OPTION: {keyForList: ApproverType} = {keyForList: APPROVER_TYPE.BYPASS_APPROVER};

function buildReport(reportID: string): Report {
    return {reportID} as Report;
}

describe('SearchChangeApproverPage', () => {
    describe('areSelectedPoliciesLoaded', () => {
        const policyID = 'policyA';
        const policy = createMock<Policy>({id: policyID});

        it('should return false until every selected report has a loaded policy', () => {
            // Given a selection containing two reports, but only one of their policies is loaded
            const selectedReports = [
                {reportID: 'reportA', policyID},
                {reportID: 'reportB', policyID: 'policyB'},
            ];
            const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: policy} as OnyxCollection<Policy>;

            // When checking whether the policies for the selection are ready
            const result = areSelectedPoliciesLoaded(selectedReports, allPolicies);

            // Then wait for both policies so the page does not show stale approver actions
            expect(result).toBe(false);
        });

        it('should return true when every selected report has a loaded policy', () => {
            // Given a selection with loaded policies
            const selectedReports = [{reportID: 'reportA', policyID}];
            const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: policy} as OnyxCollection<Policy>;

            // When checking whether the policies for the selection are ready
            const result = areSelectedPoliciesLoaded(selectedReports, allPolicies);

            // Then allow the page to show the applicable approver actions
            expect(result).toBe(true);
        });
    });

    describe('getSelectedApproverType', () => {
        it('should keep the selected approver type when it remains available', () => {
            expect(
                getSelectedApproverType({
                    approverTypes: [ADD_APPROVER_OPTION, BYPASS_APPROVER_OPTION],
                    selectedApproverType: APPROVER_TYPE.BYPASS_APPROVER,
                }),
            ).toBe(APPROVER_TYPE.BYPASS_APPROVER);
        });

        it('should fall back to the first available option when the selected option is hidden', () => {
            expect(
                getSelectedApproverType({
                    approverTypes: [BYPASS_APPROVER_OPTION],
                    selectedApproverType: APPROVER_TYPE.ADD_APPROVER,
                }),
            ).toBe(APPROVER_TYPE.BYPASS_APPROVER);
        });

        it('should fall back to add approver when there are no available options', () => {
            expect(
                getSelectedApproverType({
                    approverTypes: [],
                    selectedApproverType: APPROVER_TYPE.REASSIGN_APPROVER,
                }),
            ).toBe(APPROVER_TYPE.ADD_APPROVER);
        });
    });

    describe('canReassignAllReports', () => {
        const policyID = 'policyA';
        const policy = createMock<Policy>({
            id: policyID,
            role: CONST.POLICY.ROLE.ADMIN,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        });
        const report = createMock<Report>({
            reportID: 'reportA',
            policyID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });
        const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: policy} as OnyxCollection<Policy>;

        it('should return true when every selected report can be reassigned', () => {
            expect(
                canReassignAllReports({
                    selectedReports: [{reportID: report.reportID, policyID}],
                    onyxReports: {[report.reportID]: report},
                    allPolicies,
                }),
            ).toBe(true);
        });

        it('should return false when a report is no longer processing', () => {
            expect(
                canReassignAllReports({
                    selectedReports: [{reportID: report.reportID, policyID}],
                    onyxReports: {[report.reportID]: {...report, statusNum: CONST.REPORT.STATUS_NUM.APPROVED}},
                    allPolicies,
                }),
            ).toBe(false);
        });

        it('should return false when a selected policy uses dynamic external workflow', () => {
            const dewPolicy = createMock<Policy>({
                ...policy,
                approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
            });
            expect(
                canReassignAllReports({
                    selectedReports: [{reportID: report.reportID, policyID}],
                    onyxReports: {[report.reportID]: report},
                    allPolicies: {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: dewPolicy},
                }),
            ).toBe(false);
        });

        it('should return false when a selected report is missing from Onyx', () => {
            expect(
                canReassignAllReports({
                    selectedReports: [{reportID: report.reportID, policyID}],
                    onyxReports: {},
                    allPolicies,
                }),
            ).toBe(false);
        });
    });

    describe('shouldAutoApplyApprover', () => {
        it('should return false when no reports are selected', () => {
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports: [],
                onyxReports: {},
                approverTypes: [ADD_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.ADD_APPROVER,
            });

            expect(result).toBe(false);
        });

        it('should return false while the bulk change approver page is still loading', () => {
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: true,
                selectedReports: [{reportID: 'reportA'}],
                onyxReports: {reportA: buildReport('reportA')},
                approverTypes: [ADD_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.ADD_APPROVER,
            });

            expect(result).toBe(false);
        });

        it('should return false when some selected reports are missing from Onyx', () => {
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports: [{reportID: 'reportA'}, {reportID: 'reportB'}],
                onyxReports: {reportA: buildReport('reportA')},
                approverTypes: [ADD_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.ADD_APPROVER,
            });

            expect(result).toBe(false);
        });

        it('should return false when some selected policies are missing from Onyx', () => {
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports: [{reportID: 'reportA'}],
                onyxReports: {reportA: buildReport('reportA')},
                approverTypes: [ADD_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.ADD_APPROVER,
                areSelectedPoliciesLoaded: false,
            });

            expect(result).toBe(false);
        });

        it('should return false when onyxReports is undefined', () => {
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports: [{reportID: 'reportA'}],
                onyxReports: undefined,
                approverTypes: [ADD_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.ADD_APPROVER,
            });

            expect(result).toBe(false);
        });

        it('should return false when a selected report has no reportID', () => {
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports: [{reportID: undefined}],
                onyxReports: {},
                approverTypes: [ADD_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.ADD_APPROVER,
            });

            expect(result).toBe(false);
        });

        it('should return false when more than one approver option is available', () => {
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports: [{reportID: 'reportA'}],
                onyxReports: {reportA: buildReport('reportA')},
                approverTypes: [ADD_APPROVER_OPTION, BYPASS_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.ADD_APPROVER,
            });

            expect(result).toBe(false);
        });

        it('should return false when the selected approver type does not match the only available option', () => {
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports: [{reportID: 'reportA'}],
                onyxReports: {reportA: buildReport('reportA')},
                approverTypes: [ADD_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.BYPASS_APPROVER,
            });

            expect(result).toBe(false);
        });

        it('should return true when all reports are loaded and only the add-approver option is available', () => {
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports: [{reportID: 'reportA'}, {reportID: 'reportB'}],
                onyxReports: {reportA: buildReport('reportA'), reportB: buildReport('reportB')},
                approverTypes: [ADD_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.ADD_APPROVER,
            });

            expect(result).toBe(true);
        });

        it('should return true when the only available option is bypass-approver and it matches', () => {
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports: [{reportID: 'reportA'}],
                onyxReports: {reportA: buildReport('reportA')},
                approverTypes: [BYPASS_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.BYPASS_APPROVER,
            });

            expect(result).toBe(true);
        });
    });
});
