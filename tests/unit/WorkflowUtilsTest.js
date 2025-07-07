"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var WorkflowUtils = require("@src/libs/WorkflowUtils");
var TestHelper = require("../utils/TestHelper");
var personalDetails = {};
var personalDetailsByEmail = {};
function buildPolicyEmployee(accountID, policyEmployee) {
    if (policyEmployee === void 0) { policyEmployee = {}; }
    return __assign({ email: "".concat(accountID, "@example.com"), pendingAction: 'add' }, policyEmployee);
}
function buildMember(accountID) {
    return {
        email: "".concat(accountID, "@example.com"),
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
        displayName: "".concat(accountID, "@example.com User"),
    };
}
function buildApprover(accountID, approver) {
    if (approver === void 0) { approver = {}; }
    return __assign({ email: "".concat(accountID, "@example.com"), forwardsTo: undefined, avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png', displayName: "".concat(accountID, "@example.com User"), isCircularReference: false }, approver);
}
function buildWorkflow(memberIDs, approverIDs, workflow) {
    if (workflow === void 0) { workflow = {}; }
    return __assign({ members: memberIDs.map(buildMember), approvers: approverIDs.map(function (id) { return buildApprover(id); }), isDefault: false }, workflow);
}
describe('WorkflowUtils', function () {
    beforeAll(function () {
        for (var accountID = 0; accountID < 10; accountID++) {
            var email = "".concat(accountID, "@example.com");
            personalDetails[accountID] = TestHelper.buildPersonalDetails(email, accountID, email);
            personalDetailsByEmail[email] = personalDetails[accountID];
        }
    });
    describe('calculateApprovers', function () {
        it('Should return no approvers for empty employees object', function () {
            var employees = {};
            var firstEmail = '1@example.com';
            var approvers = WorkflowUtils.calculateApprovers({ employees: employees, firstEmail: firstEmail, personalDetailsByEmail: personalDetailsByEmail });
            expect(approvers).toEqual([]);
        });
        it('Should return just one approver if there is no forwardsTo', function () {
            var employees = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                },
            };
            var firstEmail = '1@example.com';
            var approvers = WorkflowUtils.calculateApprovers({ employees: employees, firstEmail: firstEmail, personalDetailsByEmail: personalDetailsByEmail });
            expect(approvers).toEqual([buildApprover(1)]);
        });
        it('Should return just one approver if there is no forwardsTo', function () {
            var employees = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                },
            };
            var firstEmail = '1@example.com';
            var approvers = WorkflowUtils.calculateApprovers({ employees: employees, firstEmail: firstEmail, personalDetailsByEmail: personalDetailsByEmail });
            expect(approvers).toEqual([buildApprover(1)]);
        });
        it('Should return a list of approvers when forwardsTo is defined', function () {
            var employees = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '2@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: '3@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: '4@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: undefined,
                },
                '5@example.com': {
                    email: '5@example.com',
                    forwardsTo: undefined,
                },
            };
            expect(WorkflowUtils.calculateApprovers({ employees: employees, firstEmail: '1@example.com', personalDetailsByEmail: personalDetailsByEmail })).toEqual([
                buildApprover(1, { forwardsTo: '2@example.com' }),
                buildApprover(2, { forwardsTo: '3@example.com' }),
                buildApprover(3, { forwardsTo: '4@example.com' }),
                buildApprover(4),
            ]);
            expect(WorkflowUtils.calculateApprovers({ employees: employees, firstEmail: '2@example.com', personalDetailsByEmail: personalDetailsByEmail })).toEqual([
                buildApprover(2, { forwardsTo: '3@example.com' }),
                buildApprover(3, { forwardsTo: '4@example.com' }),
                buildApprover(4),
            ]);
            expect(WorkflowUtils.calculateApprovers({ employees: employees, firstEmail: '3@example.com', personalDetailsByEmail: personalDetailsByEmail })).toEqual([
                buildApprover(3, { forwardsTo: '4@example.com' }),
                buildApprover(4),
            ]);
        });
        it('Should return a list of approvers with circular references', function () {
            var employees = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '2@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: '3@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: '4@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: '5@example.com',
                },
                '5@example.com': {
                    email: '5@example.com',
                    forwardsTo: '1@example.com',
                },
            };
            expect(WorkflowUtils.calculateApprovers({ employees: employees, firstEmail: '1@example.com', personalDetailsByEmail: personalDetailsByEmail })).toEqual([
                buildApprover(1, { forwardsTo: '2@example.com' }),
                buildApprover(2, { forwardsTo: '3@example.com' }),
                buildApprover(3, { forwardsTo: '4@example.com' }),
                buildApprover(4, { forwardsTo: '5@example.com' }),
                buildApprover(5, { forwardsTo: '1@example.com' }),
                buildApprover(1, { forwardsTo: '2@example.com', isCircularReference: true }),
            ]);
            expect(WorkflowUtils.calculateApprovers({ employees: employees, firstEmail: '2@example.com', personalDetailsByEmail: personalDetailsByEmail })).toEqual([
                buildApprover(2, { forwardsTo: '3@example.com' }),
                buildApprover(3, { forwardsTo: '4@example.com' }),
                buildApprover(4, { forwardsTo: '5@example.com' }),
                buildApprover(5, { forwardsTo: '1@example.com' }),
                buildApprover(1, { forwardsTo: '2@example.com' }),
                buildApprover(2, { forwardsTo: '3@example.com', isCircularReference: true }),
            ]);
        });
        it('Should return a list of approvers with circular references', function () {
            var employees = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '1@example.com',
                },
            };
            expect(WorkflowUtils.calculateApprovers({ employees: employees, firstEmail: '1@example.com', personalDetailsByEmail: personalDetailsByEmail })).toEqual([
                buildApprover(1, { forwardsTo: '1@example.com' }),
                buildApprover(1, { forwardsTo: '1@example.com', isCircularReference: true }),
            ]);
        });
    });
    describe('convertPolicyEmployeesToApprovalWorkflows', function () {
        it('Should return an empty list if there are no employees', function () {
            var employees = {};
            var defaultApprover = '1@example.com';
            var approvalWorkflows = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({ employees: employees, defaultApprover: defaultApprover, personalDetails: personalDetails }).approvalWorkflows;
            expect(approvalWorkflows).toEqual([]);
        });
        it('Should not include users that submit to non-employee user', function () {
            var employees = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    submitsTo: '2@example.com',
                },
            };
            var defaultApprover = '1@example.com';
            var approvalWorkflows = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({ employees: employees, defaultApprover: defaultApprover, personalDetails: personalDetails }).approvalWorkflows;
            expect(approvalWorkflows).toEqual([]);
        });
        it('Should transform all users into one default workflow', function () {
            var employees = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
            };
            var defaultApprover = '1@example.com';
            var approvalWorkflows = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({ employees: employees, defaultApprover: defaultApprover, personalDetails: personalDetails }).approvalWorkflows;
            expect(approvalWorkflows).toEqual([buildWorkflow([1, 2], [1], { isDefault: true })]);
        });
        it('Should transform all users into two workflows', function () {
            var employees = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
            };
            var defaultApprover = '1@example.com';
            var approvalWorkflows = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({ employees: employees, defaultApprover: defaultApprover, personalDetails: personalDetails }).approvalWorkflows;
            expect(approvalWorkflows).toEqual([buildWorkflow([2, 3], [1], { isDefault: true }), buildWorkflow([1, 4], [4])]);
        });
        it('Should sort the workflows (first the default and then based on the first approver display name)', function () {
            var employees = {
                '5@example.com': {
                    email: '5@example.com',
                    forwardsTo: undefined,
                    submitsTo: '3@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
            };
            var defaultApprover = '1@example.com';
            var approvalWorkflows = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({ employees: employees, defaultApprover: defaultApprover, personalDetails: personalDetails }).approvalWorkflows;
            expect(approvalWorkflows).toEqual([buildWorkflow([3, 2], [1], { isDefault: true }), buildWorkflow([5], [3]), buildWorkflow([4, 1], [4])]);
        });
        it('Should mark approvers that are used in multiple workflows', function () {
            var employees = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '3@example.com',
                    submitsTo: '2@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: '3@example.com',
                    submitsTo: '1@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: '4@example.com',
                    submitsTo: '1@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
            };
            var defaultApprover = '1@example.com';
            var approvalWorkflows = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({ employees: employees, defaultApprover: defaultApprover, personalDetails: personalDetails }).approvalWorkflows;
            var defaultWorkflow = buildWorkflow([2, 3, 4], [1, 3, 4], { isDefault: true });
            var firstApprover = defaultWorkflow.approvers.at(0);
            var secondApprover = defaultWorkflow.approvers.at(1);
            if (firstApprover && secondApprover) {
                firstApprover.forwardsTo = '3@example.com';
                secondApprover.forwardsTo = '4@example.com';
            }
            var secondWorkflow = buildWorkflow([1], [2, 3, 4]);
            firstApprover = secondWorkflow.approvers.at(0);
            secondApprover = secondWorkflow.approvers.at(1);
            if (firstApprover && secondApprover) {
                firstApprover.forwardsTo = '3@example.com';
                secondApprover.forwardsTo = '4@example.com';
            }
            expect(approvalWorkflows).toEqual([defaultWorkflow, secondWorkflow]);
        });
        it('Should build multiple workflows with many approvers', function () {
            var employees = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: '5@example.com',
                    submitsTo: '1@example.com',
                },
                '5@example.com': {
                    email: '5@example.com',
                    forwardsTo: '6@example.com',
                    submitsTo: '1@example.com',
                },
                '6@example.com': {
                    email: '6@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
            };
            var defaultApprover = '1@example.com';
            var approvalWorkflows = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({ employees: employees, defaultApprover: defaultApprover, personalDetails: personalDetails }).approvalWorkflows;
            var defaultWorkflow = buildWorkflow([1, 4, 5, 6], [1], { isDefault: true });
            var secondWorkflow = buildWorkflow([2, 3], [4, 5, 6]);
            var firstApprover = secondWorkflow.approvers.at(0);
            var secondApprover = secondWorkflow.approvers.at(1);
            if (firstApprover && secondApprover) {
                firstApprover.forwardsTo = '5@example.com';
                secondApprover.forwardsTo = '6@example.com';
            }
            expect(approvalWorkflows).toEqual([defaultWorkflow, secondWorkflow]);
        });
    });
    describe('convertApprovalWorkflowToPolicyEmployees', function () {
        it('Should return an updated employee list for a simple default workflow', function () {
            var approvalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: true,
            };
            var convertedEmployees = WorkflowUtils.convertApprovalWorkflowToPolicyEmployees({ previousEmployeeList: {}, approvalWorkflow: approvalWorkflow, type: 'create' });
            expect(convertedEmployees).toEqual({
                '1@example.com': buildPolicyEmployee(1, { forwardsTo: '', submitsTo: '1@example.com', pendingFields: { submitsTo: 'add' } }),
                '2@example.com': buildPolicyEmployee(2, { submitsTo: '1@example.com', pendingFields: { submitsTo: 'add' } }),
            });
        });
        it('Should return an updated employee list for a complex workflow', function () {
            var approvalWorkflow = {
                members: [buildMember(4), buildMember(5), buildMember(6)],
                approvers: [buildApprover(1, { forwardsTo: '2@example.com' }), buildApprover(2, { forwardsTo: '2@example.com' }), buildApprover(3)],
                isDefault: false,
            };
            var convertedEmployees = WorkflowUtils.convertApprovalWorkflowToPolicyEmployees({ previousEmployeeList: {}, approvalWorkflow: approvalWorkflow, type: 'create' });
            expect(convertedEmployees).toEqual({
                '1@example.com': buildPolicyEmployee(1, { forwardsTo: '2@example.com', pendingFields: { forwardsTo: 'add' } }),
                '2@example.com': buildPolicyEmployee(2, { forwardsTo: '3@example.com', pendingFields: { forwardsTo: 'add' } }),
                '3@example.com': buildPolicyEmployee(3, { forwardsTo: '', pendingFields: { forwardsTo: 'add' } }),
                '4@example.com': buildPolicyEmployee(4, { submitsTo: '1@example.com', pendingFields: { submitsTo: 'add' } }),
                '5@example.com': buildPolicyEmployee(5, { submitsTo: '1@example.com', pendingFields: { submitsTo: 'add' } }),
                '6@example.com': buildPolicyEmployee(6, { submitsTo: '1@example.com', pendingFields: { submitsTo: 'add' } }),
            });
        });
        it('Should return an updated employee list for a complex workflow when removing', function () {
            var approvalWorkflow = {
                members: [buildMember(4), buildMember(5), buildMember(6)],
                approvers: [buildApprover(1, { forwardsTo: '2@example.com' }), buildApprover(2, { forwardsTo: '2@example.com' }), buildApprover(3)],
                isDefault: false,
            };
            var convertedEmployees = WorkflowUtils.convertApprovalWorkflowToPolicyEmployees({ previousEmployeeList: {}, approvalWorkflow: approvalWorkflow, type: 'remove' });
            expect(convertedEmployees).toEqual({
                '1@example.com': buildPolicyEmployee(1, { forwardsTo: '', pendingAction: 'update', pendingFields: { forwardsTo: 'update' } }),
                '2@example.com': buildPolicyEmployee(2, { forwardsTo: '', pendingAction: 'update', pendingFields: { forwardsTo: 'update' } }),
                '3@example.com': buildPolicyEmployee(3, { forwardsTo: '', pendingAction: 'update', pendingFields: { forwardsTo: 'update' } }),
                '4@example.com': buildPolicyEmployee(4, { submitsTo: '', pendingAction: 'update', pendingFields: { submitsTo: 'update' } }),
                '5@example.com': buildPolicyEmployee(5, { submitsTo: '', pendingAction: 'update', pendingFields: { submitsTo: 'update' } }),
                '6@example.com': buildPolicyEmployee(6, { submitsTo: '', pendingAction: 'update', pendingFields: { submitsTo: 'update' } }),
            });
        });
    });
    describe('updateWorkflowDataOnApproverRemoval', function () {
        it('Should remove Workflow 2 if its approvers are removed and it has no approvers, with Workspace (default) having the approver as the Workspace Owner.', function () {
            var approvalWorkflow1 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: true,
            };
            var approvalWorkflow2 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(2)],
                isDefault: false,
            };
            var ownerDetails = personalDetails[1];
            var removedApprover = personalDetails[2];
            if (!removedApprover || !ownerDetails) {
                return;
            }
            var updateWorkflowDataOnApproverRemoval = WorkflowUtils.updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover: removedApprover,
                ownerDetails: ownerDetails,
            });
            expect(updateWorkflowDataOnApproverRemoval).toEqual([approvalWorkflow1, __assign(__assign({}, approvalWorkflow2), { removeApprovalWorkflow: true })]);
        });
        it('Should replace the approvers in Workflow 2 with the Workspace Owner if it has no approvers and the approver in Workspace (default) is different from the Workspace Owner', function () {
            var approvalWorkflow1 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(3)],
                isDefault: true,
            };
            var approvalWorkflow2 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(2)],
                isDefault: false,
            };
            var ownerDetails = personalDetails[1];
            var removedApprover = personalDetails[2];
            if (!removedApprover || !ownerDetails) {
                return;
            }
            var updateWorkflowDataOnApproverRemoval = WorkflowUtils.updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover: removedApprover,
                ownerDetails: ownerDetails,
            });
            expect(updateWorkflowDataOnApproverRemoval).toEqual([approvalWorkflow1, __assign(__assign({}, approvalWorkflow2), { approvers: [buildApprover(1)] })]);
        });
        it('Should remove Workflow 2 if its approver is the Workspace Owner and the default Workspace approver is removed.', function () {
            var approvalWorkflow1 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(3)],
                isDefault: true,
            };
            var approvalWorkflow2 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: false,
            };
            var ownerDetails = personalDetails[1];
            var removedApprover = personalDetails[3];
            if (!removedApprover || !ownerDetails) {
                return;
            }
            var updateWorkflowDataOnApproverRemoval = WorkflowUtils.updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover: removedApprover,
                ownerDetails: ownerDetails,
            });
            expect(updateWorkflowDataOnApproverRemoval).toEqual([
                __assign(__assign({}, approvalWorkflow1), { approvers: [buildApprover(1)] }),
                __assign(__assign({}, approvalWorkflow2), { removeApprovalWorkflow: true }),
            ]);
        });
        it('Should replace the latest approver of Workflow 2 with the Workspace Owner if the latest approver of Workflow 2 is removed', function () {
            var approvalWorkflow1 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: true,
            };
            var approvalWorkflow2 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(2), buildApprover(3), buildApprover(4)],
                isDefault: false,
            };
            var ownerDetails = personalDetails[1];
            var removedApprover = personalDetails[4];
            if (!removedApprover || !ownerDetails) {
                return;
            }
            var updateWorkflowDataOnApproverRemoval = WorkflowUtils.updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover: removedApprover,
                ownerDetails: ownerDetails,
            });
            expect(updateWorkflowDataOnApproverRemoval).toEqual([approvalWorkflow1, __assign(__assign({}, approvalWorkflow2), { approvers: [buildApprover(2), buildApprover(3), buildApprover(1)] })]);
        });
        it('Should remove the approvers that have submitsTo set to the removed approver, update the removed approver to the Workspace Owner, and ensure there was a previous approver before this one', function () {
            var approvalWorkflow1 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: true,
            };
            var approvalWorkflow2 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(2), buildApprover(3), buildApprover(4)],
                isDefault: false,
            };
            var ownerDetails = personalDetails[1];
            var removedApprover = personalDetails[3];
            if (!removedApprover || !ownerDetails) {
                return;
            }
            var updateWorkflowDataOnApproverRemoval = WorkflowUtils.updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover: removedApprover,
                ownerDetails: ownerDetails,
            });
            expect(updateWorkflowDataOnApproverRemoval).toEqual([approvalWorkflow1, __assign(__assign({}, approvalWorkflow2), { approvers: [buildApprover(2), buildApprover(1)] })]);
        });
        it('Should remove Workflow 2 if it has no approvers and the default Workspace approver is the approve', function () {
            var approvalWorkflow1 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: true,
            };
            var approvalWorkflow2 = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(2), buildApprover(3), buildApprover(4)],
                isDefault: false,
            };
            var ownerDetails = personalDetails[1];
            var removedApprover = personalDetails[2];
            if (!removedApprover || !ownerDetails) {
                return;
            }
            var updateWorkflowDataOnApproverRemoval = WorkflowUtils.updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover: removedApprover,
                ownerDetails: ownerDetails,
            });
            expect(updateWorkflowDataOnApproverRemoval).toEqual([approvalWorkflow1, __assign(__assign({}, approvalWorkflow2), { removeApprovalWorkflow: true })]);
        });
    });
});
