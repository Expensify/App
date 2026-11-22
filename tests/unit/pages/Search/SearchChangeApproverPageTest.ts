import {APPROVER_TYPE, getSelectedApproverType} from '@pages/DynamicReportChangeApproverPage';
import type {ApproverType} from '@pages/DynamicReportChangeApproverPage';
import {areAllSelectedPoliciesLoaded, areAllSelectedReportsLoaded, canAddApproverToAllReports, canReassignAllReports, shouldAutoApplyApprover} from '@pages/Search/SearchChangeApproverPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import createMock from '../../../utils/createMock';

const ADD_APPROVER_OPTION: {keyForList: ApproverType} = {keyForList: APPROVER_TYPE.ADD_APPROVER};
const BYPASS_APPROVER_OPTION: {keyForList: ApproverType} = {keyForList: APPROVER_TYPE.BYPASS_APPROVER};
const REASSIGN_APPROVER_OPTION: {keyForList: ApproverType} = {keyForList: APPROVER_TYPE.REASSIGN_APPROVER};

function buildReport(reportID: string): Report {
    return {reportID} as Report;
}

describe('SearchChangeApproverPage', () => {
    describe('areAllSelectedPoliciesLoaded', () => {
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
            const result = areAllSelectedPoliciesLoaded(selectedReports, allPolicies);

            // Then wait for both policies so the page does not show stale approver actions
            expect(result).toBe(false);
        });

        it('should return true when every selected report has a loaded policy', () => {
            // Given a selection with loaded policies
            const selectedReports = [{reportID: 'reportA', policyID}];
            const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: policy} as OnyxCollection<Policy>;

            // When checking whether the policies for the selection are ready
            const result = areAllSelectedPoliciesLoaded(selectedReports, allPolicies);

            // Then allow the page to show the applicable approver actions
            expect(result).toBe(true);
        });
    });

    describe('getSelectedApproverType', () => {
        it('should keep the selected approver type when it remains available', () => {
            // Given the user picked Bypass from a menu that still offers it
            const approverTypes = [ADD_APPROVER_OPTION, BYPASS_APPROVER_OPTION];

            // When resolving the active approver type
            const result = getSelectedApproverType({approverTypes, selectedApproverType: APPROVER_TYPE.BYPASS_APPROVER});

            // Then the user's choice is kept so the confirm button applies what they picked
            expect(result).toBe(APPROVER_TYPE.BYPASS_APPROVER);
        });

        it('should clear the selection when the selected option is hidden and only Bypass is left', () => {
            // Given the user picked Reassign, then the workspace switched to a dynamic external workflow, which leaves only Bypass
            const approverTypes = [BYPASS_APPROVER_OPTION];

            // When resolving the active approver type
            const result = getSelectedApproverType({approverTypes, selectedApproverType: APPROVER_TYPE.REASSIGN_APPROVER});

            // Then nothing is selected, because confirming Bypass approves the report, so the user must pick it themselves
            expect(result).toBeUndefined();
        });

        it('should fall back to an option other than Bypass when the selected option is hidden', () => {
            // Given the default Add selection on a menu that offers Bypass and Reassign
            const approverTypes = [BYPASS_APPROVER_OPTION, REASSIGN_APPROVER_OPTION];

            // When resolving the active approver type
            const result = getSelectedApproverType({approverTypes, selectedApproverType: APPROVER_TYPE.ADD_APPROVER});

            // Then Reassign is selected, since it only opens the next page and is safe to preselect
            expect(result).toBe(APPROVER_TYPE.REASSIGN_APPROVER);
        });

        it('should select nothing when there are no available options', () => {
            // Given a menu with no options, such as while the selection is still loading
            const approverTypes: Array<{keyForList: ApproverType}> = [];

            // When resolving the active approver type
            const result = getSelectedApproverType({approverTypes, selectedApproverType: APPROVER_TYPE.REASSIGN_APPROVER});

            // Then nothing is selected, so the confirm button has nothing to apply
            expect(result).toBeUndefined();
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
            managerID: 123,
        });
        const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: policy} as OnyxCollection<Policy>;

        it('should return true when every selected report can be reassigned', () => {
            expect(
                canReassignAllReports({
                    selectedReports: [{reportID: report.reportID, policyID}],
                    onyxReports: {[report.reportID]: report},
                    allPolicies,
                    currentUserAccountID: 456,
                    areStrictPolicyRulesEnabled: true,
                    isLoadingSecurityGroup: false,
                }),
            ).toBe(true);
        });

        it('should return true when the current approver can reassign with strict policy rules disabled', () => {
            // Given a non-admin current approver and strict policy rules are disabled
            const memberPolicy = {...policy, role: CONST.POLICY.ROLE.USER};

            // When checking whether the selected report can be reassigned
            const canReassign = canReassignAllReports({
                selectedReports: [{reportID: report.reportID, policyID}],
                onyxReports: {[report.reportID]: report},
                allPolicies: {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: memberPolicy},
                currentUserAccountID: report.managerID ?? CONST.DEFAULT_NUMBER_ID,
                areStrictPolicyRulesEnabled: false,
                isLoadingSecurityGroup: false,
            });

            // Then the current approver can reassign the report
            expect(canReassign).toBe(true);
        });

        it('should return false when the current approver cannot reassign with strict policy rules enabled', () => {
            // Given a non-admin current approver and strict policy rules are enabled
            const memberPolicy = {...policy, role: CONST.POLICY.ROLE.USER};

            // When checking whether the selected report can be reassigned
            const canReassign = canReassignAllReports({
                selectedReports: [{reportID: report.reportID, policyID}],
                onyxReports: {[report.reportID]: report},
                allPolicies: {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: memberPolicy},
                currentUserAccountID: report.managerID ?? CONST.DEFAULT_NUMBER_ID,
                areStrictPolicyRulesEnabled: true,
                isLoadingSecurityGroup: false,
            });

            // Then reassignment is unavailable to non-admins
            expect(canReassign).toBe(false);
        });

        it('should return false when a report is no longer processing', () => {
            expect(
                canReassignAllReports({
                    selectedReports: [{reportID: report.reportID, policyID}],
                    onyxReports: {[report.reportID]: {...report, statusNum: CONST.REPORT.STATUS_NUM.APPROVED}},
                    allPolicies,
                    currentUserAccountID: 456,
                    areStrictPolicyRulesEnabled: true,
                    isLoadingSecurityGroup: false,
                }),
            ).toBe(false);
        });

        it.each([CONST.POLICY.ROLE.ADMIN, CONST.POLICY.ROLE.USER])('should return false for dynamic external workflow with role %s', (role) => {
            // Given a dynamic external workflow policy and its current approver
            const dewPolicy = createMock<Policy>({
                ...policy,
                role,
                approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
            });
            // When checking reassignment with strict policy rules disabled
            const canReassign = canReassignAllReports({
                selectedReports: [{reportID: report.reportID, policyID}],
                onyxReports: {[report.reportID]: report},
                allPolicies: {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: dewPolicy},
                currentUserAccountID: report.managerID ?? CONST.DEFAULT_NUMBER_ID,
                areStrictPolicyRulesEnabled: false,
                isLoadingSecurityGroup: false,
            });

            // Then the external workflow prevents reassignment for admins and members
            expect(canReassign).toBe(false);
        });

        it('should return false when the user is not an admin or current approver', () => {
            // Given a non-admin who is not the selected report's current approver
            const memberPolicy = {...policy, role: CONST.POLICY.ROLE.USER};

            // When checking whether the selected report can be reassigned
            const canReassign = canReassignAllReports({
                selectedReports: [{reportID: report.reportID, policyID}],
                onyxReports: {[report.reportID]: report},
                allPolicies: {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: memberPolicy},
                currentUserAccountID: 456,
                areStrictPolicyRulesEnabled: false,
                isLoadingSecurityGroup: false,
            });

            // Then reassignment is unavailable
            expect(canReassign).toBe(false);
        });

        it('should return false when a selected report is missing from Onyx', () => {
            expect(
                canReassignAllReports({
                    selectedReports: [{reportID: report.reportID, policyID}],
                    onyxReports: {},
                    allPolicies,
                    currentUserAccountID: 456,
                    areStrictPolicyRulesEnabled: true,
                    isLoadingSecurityGroup: false,
                }),
            ).toBe(false);
        });
    });

    describe('canAddApproverToAllReports', () => {
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
            managerID: 123,
        });
        const selectedReports = [{reportID: report.reportID, policyID}];

        it('should return true when an admin selects reports that await approval', () => {
            // Given an admin's workspace and a submitted report that awaits approval
            const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: policy};

            // When checking whether an approver can be added to the selection
            const canAdd = canAddApproverToAllReports({selectedReports, onyxReports: {[report.reportID]: report}, allPolicies});

            // Then Add approver is available
            expect(canAdd).toBe(true);
        });

        it('should return false when a selected report was approved while the picker is open', () => {
            // Given a selected report that another approver has approved
            const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: policy};
            const approvedReport = {...report, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};

            // When checking whether an approver can be added to the selection
            const canAdd = canAddApproverToAllReports({selectedReports, onyxReports: {[report.reportID]: approvedReport}, allPolicies});

            // Then Add approver is hidden, so the picker cannot fall back to it and open it on its own
            expect(canAdd).toBe(false);
        });

        it('should return false for a dynamic external workflow', () => {
            // Given an admin's workspace that uses a dynamic external workflow
            const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: {...policy, approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL}};

            // When checking whether an approver can be added to the selection
            const canAdd = canAddApproverToAllReports({selectedReports, onyxReports: {[report.reportID]: report}, allPolicies});

            // Then the external workflow keeps Add approver hidden
            expect(canAdd).toBe(false);
        });

        it('should return false when the user is not an admin', () => {
            // Given a member of the workspace
            const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: {...policy, role: CONST.POLICY.ROLE.USER}};

            // When checking whether an approver can be added to the selection
            const canAdd = canAddApproverToAllReports({selectedReports, onyxReports: {[report.reportID]: report}, allPolicies});

            // Then only admins can add approvers
            expect(canAdd).toBe(false);
        });

        it('should return false when a selected report is missing from Onyx', () => {
            // Given a selected report that has not loaded yet
            const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: policy};

            // When checking whether an approver can be added to the selection
            const canAdd = canAddApproverToAllReports({selectedReports, onyxReports: {}, allPolicies});

            // Then Add approver waits until the report's state is known
            expect(canAdd).toBe(false);
        });
    });

    describe('areAllSelectedReportsLoaded', () => {
        it('should return false until every selected report is in Onyx', () => {
            // Given two selected reports, but only one has been fetched
            const selectedReports = [{reportID: 'reportA'}, {reportID: 'reportB'}];

            // When checking whether the selection's reports are ready
            const result = areAllSelectedReportsLoaded(selectedReports, {reportA: buildReport('reportA')});

            // Then wait for both, because a missing report hides Bypass and would make the menu look empty
            expect(result).toBe(false);
        });

        it('should return true when every selected report is in Onyx', () => {
            // Given a selection whose reports have all been fetched
            const selectedReports = [{reportID: 'reportA'}];

            // When checking whether the selection's reports are ready
            const result = areAllSelectedReportsLoaded(selectedReports, {reportA: buildReport('reportA')});

            // Then the menu can be trusted to show every available action
            expect(result).toBe(true);
        });
    });

    describe('shouldAutoApplyApprover', () => {
        it('should return false when Bypass is the only available option', () => {
            // Given a dynamic external workflow selection where Bypass is the only option left
            const selectedReports = [{reportID: 'reportA'}];

            // When the page decides whether to apply the option without a confirmation
            const result = shouldAutoApplyApprover({
                isLoadingBulkChangeApproverPage: false,
                selectedReports,
                onyxReports: {reportA: buildReport('reportA')},
                approverTypes: [BYPASS_APPROVER_OPTION],
                selectedApproverType: APPROVER_TYPE.BYPASS_APPROVER,
            });

            // Then it waits for the confirm button, because Bypass approves every selected report
            expect(result).toBe(false);
        });

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
    });
});
