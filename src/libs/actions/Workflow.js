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
exports.createApprovalWorkflow = createApprovalWorkflow;
exports.updateApprovalWorkflow = updateApprovalWorkflow;
exports.removeApprovalWorkflow = removeApprovalWorkflow;
exports.setApprovalWorkflowMembers = setApprovalWorkflowMembers;
exports.setApprovalWorkflowApprover = setApprovalWorkflowApprover;
exports.setApprovalWorkflow = setApprovalWorkflow;
exports.clearApprovalWorkflowApprover = clearApprovalWorkflowApprover;
exports.clearApprovalWorkflowApprovers = clearApprovalWorkflowApprovers;
exports.clearApprovalWorkflow = clearApprovalWorkflow;
exports.validateApprovalWorkflow = validateApprovalWorkflow;
var dropRightWhile_1 = require("lodash/dropRightWhile");
var mapKeys_1 = require("lodash/mapKeys");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var WorkflowUtils_1 = require("@libs/WorkflowUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var currentApprovalWorkflow;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.APPROVAL_WORKFLOW,
    callback: function (approvalWorkflow) {
        currentApprovalWorkflow = approvalWorkflow;
    },
});
var allPolicies;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (value) { return (allPolicies = value); },
});
var authToken;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        authToken = value === null || value === void 0 ? void 0 : value.authToken;
    },
});
var personalDetailsByEmail = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (personalDetails) {
        personalDetailsByEmail = (0, mapKeys_1.default)(personalDetails, function (value, key) { var _a; return (_a = value === null || value === void 0 ? void 0 : value.login) !== null && _a !== void 0 ? _a : key; });
    },
});
function createApprovalWorkflow(policyID, approvalWorkflow) {
    var _a;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    if (!authToken || !policy) {
        return;
    }
    var previousEmployeeList = Object.fromEntries(Object.entries((_a = policy.employeeList) !== null && _a !== void 0 ? _a : {}).map(function (_a) {
        var key = _a[0], value = _a[1];
        return [key, __assign(__assign({}, value), { pendingAction: null })];
    }));
    var previousApprovalMode = policy.approvalMode;
    var updatedEmployees = (0, WorkflowUtils_1.convertApprovalWorkflowToPolicyEmployees)({ previousEmployeeList: previousEmployeeList, approvalWorkflow: approvalWorkflow, type: CONST_1.default.APPROVAL_WORKFLOW.TYPE.CREATE });
    // If there are no changes to the employees list, we can exit early
    if ((0, EmptyObject_1.isEmptyObject)(updatedEmployees)) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                employeeList: updatedEmployees,
                approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                employeeList: previousEmployeeList,
                approvalMode: previousApprovalMode,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map(function (key) { return [key, { pendingAction: null }]; })),
            },
        },
    ];
    var parameters = { policyID: policyID, authToken: authToken, employees: JSON.stringify(Object.values(updatedEmployees)) };
    API.write(types_1.WRITE_COMMANDS.CREATE_WORKSPACE_APPROVAL, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateApprovalWorkflow(policyID, approvalWorkflow, membersToRemove, approversToRemove) {
    var _a, _b, _c;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    if (!authToken || !policy) {
        return;
    }
    var previousDefaultApprover = (_a = policy.approver) !== null && _a !== void 0 ? _a : policy.owner;
    var newDefaultApprover = approvalWorkflow.isDefault ? (_b = approvalWorkflow.approvers.at(0)) === null || _b === void 0 ? void 0 : _b.email : undefined;
    var previousEmployeeList = Object.fromEntries(Object.entries((_c = policy.employeeList) !== null && _c !== void 0 ? _c : {}).map(function (_a) {
        var key = _a[0], value = _a[1];
        return [key, __assign(__assign({}, value), { pendingAction: null })];
    }));
    var updatedEmployees = (0, WorkflowUtils_1.convertApprovalWorkflowToPolicyEmployees)({
        previousEmployeeList: previousEmployeeList,
        approvalWorkflow: approvalWorkflow,
        type: CONST_1.default.APPROVAL_WORKFLOW.TYPE.UPDATE,
        membersToRemove: membersToRemove,
        approversToRemove: approversToRemove,
    });
    // If there are no changes to the employees list, we can exit early
    if ((0, EmptyObject_1.isEmptyObject)(updatedEmployees) && !newDefaultApprover) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign({ employeeList: updatedEmployees }, (newDefaultApprover ? { approver: newDefaultApprover } : {})),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign({ employeeList: previousEmployeeList, pendingFields: { employeeList: null } }, (newDefaultApprover ? { approver: previousDefaultApprover } : {})),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map(function (key) { return [key, { pendingAction: null, pendingFields: null }]; })),
            },
        },
    ];
    var parameters = {
        policyID: policyID,
        authToken: authToken,
        employees: JSON.stringify(Object.values(updatedEmployees)),
        defaultApprover: newDefaultApprover,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_APPROVAL, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function removeApprovalWorkflow(policyID, approvalWorkflow) {
    var _a, _b;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    if (!authToken || !policy) {
        return;
    }
    var previousEmployeeList = Object.fromEntries(Object.entries((_a = policy.employeeList) !== null && _a !== void 0 ? _a : {}).map(function (_a) {
        var key = _a[0], value = _a[1];
        return [key, __assign(__assign({}, value), { pendingAction: null })];
    }));
    var updatedEmployees = (0, WorkflowUtils_1.convertApprovalWorkflowToPolicyEmployees)({ previousEmployeeList: previousEmployeeList, approvalWorkflow: approvalWorkflow, type: CONST_1.default.APPROVAL_WORKFLOW.TYPE.REMOVE });
    var updatedEmployeeList = __assign(__assign({}, previousEmployeeList), updatedEmployees);
    var defaultApprover = (_b = policy.approver) !== null && _b !== void 0 ? _b : policy.owner;
    // If there is more than one workflow, we need to keep the advanced approval mode (first workflow is the default)
    var hasMoreThanOneWorkflow = Object.values(updatedEmployeeList).some(function (employee) { return !!employee.submitsTo && employee.submitsTo !== defaultApprover; });
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                employeeList: updatedEmployees,
                approvalMode: hasMoreThanOneWorkflow ? CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED : CONST_1.default.POLICY.APPROVAL_MODE.BASIC,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                employeeList: previousEmployeeList,
                approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map(function (key) { return [key, { pendingAction: null }]; })),
            },
        },
    ];
    var parameters = { policyID: policyID, authToken: authToken, employees: JSON.stringify(Object.values(updatedEmployees)) };
    API.write(types_1.WRITE_COMMANDS.REMOVE_WORKSPACE_APPROVAL, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
/** Set the members of the approval workflow that is currently edited */
function setApprovalWorkflowMembers(members) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.APPROVAL_WORKFLOW, { members: members, errors: null });
}
/**
 * Set the approver at the specified index in the approval workflow that is currently edited
 * @param approver - The new approver to set
 * @param approverIndex - The index of the approver to set
 * @param policyID - The ID of the policy
 */
function setApprovalWorkflowApprover(approver, approverIndex, policyID) {
    var _a;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    if (!currentApprovalWorkflow || !(policy === null || policy === void 0 ? void 0 : policy.employeeList)) {
        return;
    }
    var approvers = __spreadArray([], currentApprovalWorkflow.approvers, true);
    approvers[approverIndex] = approver;
    // Check if the approver forwards to other approvers and add them to the list
    if ((_a = policy.employeeList[approver.email]) === null || _a === void 0 ? void 0 : _a.forwardsTo) {
        var additionalApprovers = (0, WorkflowUtils_1.calculateApprovers)({ employees: policy.employeeList, firstEmail: approver.email, personalDetailsByEmail: personalDetailsByEmail });
        approvers.splice.apply(approvers, __spreadArray([approverIndex, approvers.length], additionalApprovers, false));
    }
    // Always clear the additional approver error when an approver is added
    var errors = { additionalApprover: null };
    // Check for circular references (approver forwards to themselves) and reset other errors
    var updatedApprovers = approvers.map(function (existingApprover, index) {
        if (!existingApprover) {
            return;
        }
        var hasCircularReference = approvers.slice(0, index).some(function (previousApprover) { return existingApprover.email === (previousApprover === null || previousApprover === void 0 ? void 0 : previousApprover.email); });
        if (hasCircularReference) {
            errors["approver-".concat(index)] = 'workflowsPage.approverCircularReference';
        }
        else {
            errors["approver-".concat(index)] = null;
        }
        return __assign(__assign({}, existingApprover), { isCircularReference: hasCircularReference });
    });
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.APPROVAL_WORKFLOW, { approvers: updatedApprovers, errors: errors });
}
/** Clear one approver at the specified index in the approval workflow that is currently edited */
function clearApprovalWorkflowApprover(approverIndex) {
    if (!currentApprovalWorkflow) {
        return;
    }
    var approvers = __spreadArray([], currentApprovalWorkflow.approvers, true);
    approvers[approverIndex] = undefined;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.APPROVAL_WORKFLOW, { approvers: (0, dropRightWhile_1.default)(approvers, function (approver) { return !approver; }), errors: null });
}
/** Clear all approvers of the approval workflow that is currently edited */
function clearApprovalWorkflowApprovers() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.APPROVAL_WORKFLOW, { approvers: [] });
}
function setApprovalWorkflow(approvalWorkflow) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.APPROVAL_WORKFLOW, approvalWorkflow);
}
function clearApprovalWorkflow() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.APPROVAL_WORKFLOW, null);
}
/**
 * Validates the approval workflow and sets the errors on the approval workflow
 * @param approvalWorkflow the approval workflow to validate
 * @returns true if the approval workflow is valid, false otherwise
 */
function validateApprovalWorkflow(approvalWorkflow) {
    var errors = {};
    approvalWorkflow.approvers.forEach(function (approver, approverIndex) {
        if (!approver) {
            errors["approver-".concat(approverIndex)] = 'common.error.fieldRequired';
        }
        if (approver === null || approver === void 0 ? void 0 : approver.isCircularReference) {
            errors["approver-".concat(approverIndex)] = 'workflowsPage.approverCircularReference';
        }
    });
    if (!approvalWorkflow.members.length && !approvalWorkflow.isDefault) {
        errors.members = 'common.error.fieldRequired';
    }
    if (!approvalWorkflow.approvers.length) {
        errors.additionalApprover = 'common.error.fieldRequired';
    }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.APPROVAL_WORKFLOW, { errors: errors });
    return (0, EmptyObject_1.isEmptyObject)(errors);
}
