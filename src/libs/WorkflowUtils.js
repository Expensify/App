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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_APPROVAL_WORKFLOW = void 0;
exports.calculateApprovers = calculateApprovers;
exports.convertPolicyEmployeesToApprovalWorkflows = convertPolicyEmployeesToApprovalWorkflows;
exports.convertApprovalWorkflowToPolicyEmployees = convertApprovalWorkflowToPolicyEmployees;
exports.updateWorkflowDataOnApproverRemoval = updateWorkflowDataOnApproverRemoval;
var mapKeys_1 = require("lodash/mapKeys");
var CONST_1 = require("@src/CONST");
var INITIAL_APPROVAL_WORKFLOW = {
    members: [],
    approvers: [],
    availableMembers: [],
    usedApproverEmails: [],
    isDefault: false,
    action: CONST_1.default.APPROVAL_WORKFLOW.ACTION.CREATE,
};
exports.INITIAL_APPROVAL_WORKFLOW = INITIAL_APPROVAL_WORKFLOW;
/** Get the list of approvers for a given email */
function calculateApprovers(_a) {
    var _b, _c, _d;
    var employees = _a.employees, firstEmail = _a.firstEmail, personalDetailsByEmail = _a.personalDetailsByEmail;
    var approvers = [];
    // Keep track of approver emails to detect circular references
    var currentApproverEmails = new Set();
    var nextEmail = firstEmail;
    while (nextEmail) {
        if (!employees[nextEmail]) {
            break;
        }
        var isCircularReference = currentApproverEmails.has(nextEmail);
        approvers.push({
            email: nextEmail,
            forwardsTo: employees[nextEmail].forwardsTo,
            avatar: (_b = personalDetailsByEmail[nextEmail]) === null || _b === void 0 ? void 0 : _b.avatar,
            displayName: (_d = (_c = personalDetailsByEmail[nextEmail]) === null || _c === void 0 ? void 0 : _c.displayName) !== null && _d !== void 0 ? _d : nextEmail,
            isCircularReference: isCircularReference,
        });
        // If we've already seen this approver, break to prevent infinite loop
        if (isCircularReference) {
            break;
        }
        currentApproverEmails.add(nextEmail);
        // If there is a forwardsTo, set the next approver to the forwardsTo
        nextEmail = employees[nextEmail].forwardsTo;
    }
    return approvers;
}
/** Convert a list of policy employees to a list of approval workflows */
function convertPolicyEmployeesToApprovalWorkflows(_a) {
    var _b, _c;
    var employees = _a.employees, defaultApprover = _a.defaultApprover, personalDetails = _a.personalDetails, firstApprover = _a.firstApprover;
    var approvalWorkflows = {};
    // Keep track of used approver emails to display hints in the UI
    var usedApproverEmails = new Set();
    var personalDetailsByEmail = (0, mapKeys_1.default)(personalDetails, function (value, key) { var _a; return (_a = value === null || value === void 0 ? void 0 : value.login) !== null && _a !== void 0 ? _a : key; });
    // Add each employee to the appropriate workflow
    Object.values(employees).forEach(function (employee) {
        var _a, _b, _c;
        var email = employee.email, submitsTo = employee.submitsTo, pendingAction = employee.pendingAction;
        if (!email || !submitsTo || !employees[submitsTo]) {
            return;
        }
        var member = {
            email: email,
            avatar: (_a = personalDetailsByEmail[email]) === null || _a === void 0 ? void 0 : _a.avatar,
            displayName: (_c = (_b = personalDetailsByEmail[email]) === null || _b === void 0 ? void 0 : _b.displayName) !== null && _c !== void 0 ? _c : email,
            pendingFields: employee.pendingFields,
        };
        if (!approvalWorkflows[submitsTo]) {
            var approvers = calculateApprovers({ employees: employees, firstEmail: submitsTo, personalDetailsByEmail: personalDetailsByEmail });
            if (submitsTo !== firstApprover) {
                approvers.forEach(function (approver) { return usedApproverEmails.add(approver.email); });
            }
            approvalWorkflows[submitsTo] = {
                members: [],
                approvers: approvers,
                isDefault: defaultApprover === submitsTo,
                pendingAction: pendingAction,
            };
        }
        approvalWorkflows[submitsTo].members.push(member);
        if (pendingAction) {
            approvalWorkflows[submitsTo].pendingAction = pendingAction;
        }
    });
    // Sort the workflows by the first approver's name (default workflow has priority)
    var sortedApprovalWorkflows = Object.values(approvalWorkflows).sort(function (a, b) {
        var _a, _b, _c, _d;
        if (a.isDefault) {
            return -1;
        }
        if (b.isDefault) {
            return 1;
        }
        return ((_b = (_a = a.approvers.at(0)) === null || _a === void 0 ? void 0 : _a.displayName) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID).toString().localeCompare(((_d = (_c = b.approvers.at(0)) === null || _c === void 0 ? void 0 : _c.displayName) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID).toString());
    });
    // Add a default workflow if one doesn't exist (no employees submit to the default approver)
    var firstWorkflow = sortedApprovalWorkflows.at(0);
    if (firstWorkflow && !firstWorkflow.isDefault) {
        sortedApprovalWorkflows.unshift({
            members: [],
            approvers: calculateApprovers({ employees: employees, firstEmail: defaultApprover, personalDetailsByEmail: personalDetailsByEmail }),
            isDefault: true,
        });
    }
    return { approvalWorkflows: sortedApprovalWorkflows, usedApproverEmails: __spreadArray([], usedApproverEmails, true), availableMembers: (_c = (_b = sortedApprovalWorkflows.at(0)) === null || _b === void 0 ? void 0 : _b.members) !== null && _c !== void 0 ? _c : [] };
}
/**
 * This function converts an approval workflow into a list of policy employees.
 * An optimized list is created that contains only the updated employees to maintain minimal data changes.
 */
function convertApprovalWorkflowToPolicyEmployees(_a) {
    var approvalWorkflow = _a.approvalWorkflow, previousEmployeeList = _a.previousEmployeeList, membersToRemove = _a.membersToRemove, approversToRemove = _a.approversToRemove, type = _a.type;
    var updatedEmployeeList = {};
    var firstApprover = approvalWorkflow.approvers.at(0);
    if (!firstApprover) {
        throw new Error('Approval workflow must have at least one approver');
    }
    var pendingAction = type === CONST_1.default.APPROVAL_WORKFLOW.TYPE.CREATE ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD : CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
    approvalWorkflow.approvers.forEach(function (approver, index) {
        var _a, _b;
        var nextApprover = approvalWorkflow.approvers.at(index + 1);
        var forwardsTo = type === CONST_1.default.APPROVAL_WORKFLOW.TYPE.REMOVE ? '' : ((_a = nextApprover === null || nextApprover === void 0 ? void 0 : nextApprover.email) !== null && _a !== void 0 ? _a : '');
        // For every approver, we check if the forwardsTo field has changed.
        // If it has, we update the employee list with the new forwardsTo value.
        if (((_b = previousEmployeeList[approver.email]) === null || _b === void 0 ? void 0 : _b.forwardsTo) === forwardsTo) {
            return;
        }
        updatedEmployeeList[approver.email] = {
            email: approver.email,
            forwardsTo: forwardsTo,
            pendingAction: pendingAction,
            pendingFields: {
                forwardsTo: pendingAction,
            },
        };
    });
    approvalWorkflow.members.forEach(function (_a) {
        var _b, _c;
        var email = _a.email;
        var submitsTo = type === CONST_1.default.APPROVAL_WORKFLOW.TYPE.REMOVE ? '' : ((_b = firstApprover.email) !== null && _b !== void 0 ? _b : '');
        // For every member, we check if the submitsTo field has changed.
        // If it has, we update the employee list with the new submitsTo value.
        if (((_c = previousEmployeeList[email]) === null || _c === void 0 ? void 0 : _c.submitsTo) === submitsTo) {
            return;
        }
        updatedEmployeeList[email] = __assign(__assign({}, (updatedEmployeeList[email] ? updatedEmployeeList[email] : { email: email })), { submitsTo: submitsTo, pendingAction: pendingAction, pendingFields: {
                submitsTo: pendingAction,
            } });
    });
    // For each member to remove, we update the employee list with submitsTo set to ''
    // which will set the submitsTo field to the default approver email on backend.
    membersToRemove === null || membersToRemove === void 0 ? void 0 : membersToRemove.forEach(function (_a) {
        var email = _a.email;
        updatedEmployeeList[email] = __assign(__assign({}, (updatedEmployeeList[email] ? updatedEmployeeList[email] : { email: email })), { submitsTo: '', pendingAction: pendingAction });
    });
    // For each approver to remove, we update the employee list with forwardsTo set to ''
    // which will reset the forwardsTo on the backend.
    approversToRemove === null || approversToRemove === void 0 ? void 0 : approversToRemove.forEach(function (_a) {
        var email = _a.email;
        updatedEmployeeList[email] = __assign(__assign({}, (updatedEmployeeList[email] ? updatedEmployeeList[email] : { email: email })), { forwardsTo: '', pendingAction: pendingAction });
    });
    return updatedEmployeeList;
}
function updateWorkflowDataOnApproverRemoval(_a) {
    var _b, _c;
    var approvalWorkflows = _a.approvalWorkflows, removedApprover = _a.removedApprover, ownerDetails = _a.ownerDetails;
    var defaultWorkflow = approvalWorkflows.find(function (workflow) { return workflow.isDefault; });
    var removedApproverEmail = removedApprover.login;
    var ownerEmail = ownerDetails.login;
    var ownerAvatar = (_b = ownerDetails.avatar) !== null && _b !== void 0 ? _b : '';
    var ownerDisplayName = (_c = ownerDetails.displayName) !== null && _c !== void 0 ? _c : '';
    return approvalWorkflows.flatMap(function (workflow) {
        var _a, _b, _c;
        var currentApprover = workflow.approvers[0];
        var isSingleApprover = workflow.approvers.length === 1;
        var isMultipleApprovers = workflow.approvers.length > 1;
        var isApproverToRemove = (currentApprover === null || currentApprover === void 0 ? void 0 : currentApprover.email) === removedApproverEmail;
        var defaultHasOwner = defaultWorkflow === null || defaultWorkflow === void 0 ? void 0 : defaultWorkflow.approvers.some(function (approver) { return approver.email === ownerEmail; });
        if (workflow.isDefault) {
            // Handle default workflow
            if (isSingleApprover && isApproverToRemove && (currentApprover === null || currentApprover === void 0 ? void 0 : currentApprover.email) !== ownerEmail) {
                return __assign(__assign({}, workflow), { approvers: [
                        __assign(__assign({}, currentApprover), { avatar: ownerAvatar, displayName: ownerDisplayName, email: ownerEmail !== null && ownerEmail !== void 0 ? ownerEmail : '' }),
                    ] });
            }
            return workflow;
        }
        if (isSingleApprover) {
            // Remove workflows with a single approver when owner is the approver
            if ((currentApprover === null || currentApprover === void 0 ? void 0 : currentApprover.email) === ownerEmail) {
                return __assign(__assign({}, workflow), { removeApprovalWorkflow: true });
            }
            // Handle case where the approver is to be removed
            if (isApproverToRemove) {
                // Remove workflow if the default workflow includes the owner or approver is to be replaced
                if (defaultHasOwner) {
                    return __assign(__assign({}, workflow), { removeApprovalWorkflow: true });
                }
                // Replace the approver with owner details
                return __assign(__assign({}, workflow), { approvers: [
                        __assign(__assign({}, currentApprover), { avatar: ownerAvatar, displayName: ownerDisplayName, email: ownerEmail !== null && ownerEmail !== void 0 ? ownerEmail : '' }),
                    ] });
            }
        }
        if (isMultipleApprovers && workflow.approvers.some(function (item) { return item.email === removedApproverEmail; })) {
            var removedApproverIndex = workflow.approvers.findIndex(function (item) { return item.email === removedApproverEmail; });
            // If the removed approver is the first in the list, return an empty array
            if (removedApproverIndex === 0) {
                return __assign(__assign({}, workflow), { removeApprovalWorkflow: true });
            }
            var updateApprovers = workflow.approvers.slice(0, removedApproverIndex);
            var updateApproversHasOwner = updateApprovers.some(function (approver) { return approver.email === ownerEmail; });
            // If the owner is already in the approvers list, return the workflow with the updated approvers
            if (updateApproversHasOwner) {
                return __assign(__assign({}, workflow), { approvers: updateApprovers });
            }
            // Update forwardsTo if necessary and prepare the new approver object
            var updatedApprovers = updateApprovers.flatMap(function (item) { return (item.forwardsTo === removedApproverEmail ? __assign(__assign({}, item), { forwardsTo: ownerEmail }) : item); });
            var newApprover = {
                email: ownerEmail !== null && ownerEmail !== void 0 ? ownerEmail : '',
                forwardsTo: undefined,
                avatar: (_a = ownerDetails === null || ownerDetails === void 0 ? void 0 : ownerDetails.avatar) !== null && _a !== void 0 ? _a : '',
                displayName: (_b = ownerDetails === null || ownerDetails === void 0 ? void 0 : ownerDetails.displayName) !== null && _b !== void 0 ? _b : '',
                isCircularReference: (_c = workflow.approvers.at(removedApproverIndex)) === null || _c === void 0 ? void 0 : _c.isCircularReference,
            };
            return __assign(__assign({}, workflow), { approvers: __spreadArray(__spreadArray([], updatedApprovers, true), [newApprover], false) });
        }
        // Return the unchanged workflow in other cases
        return workflow;
    });
}
