import lodashDropRightWhile from 'lodash/dropRightWhile';
import lodashMapKeys from 'lodash/mapKeys';
import type {NullishDeep, OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {CreateWorkspaceApprovalParams, RemoveWorkspaceApprovalParams, UpdateWorkspaceApprovalParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {calculateApprovers, convertApprovalWorkflowToPolicyEmployees} from '@libs/WorkflowUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ApprovalWorkflowOnyx, PersonalDetailsList, Policy} from '@src/types/onyx';
import type {Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

let currentApprovalWorkflow: ApprovalWorkflowOnyx | undefined;
Onyx.connect({
    key: ONYXKEYS.APPROVAL_WORKFLOW,
    callback: (approvalWorkflow) => {
        currentApprovalWorkflow = approvalWorkflow;
    },
});

let allPolicies: OnyxCollection<Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

let authToken: string | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        authToken = value?.authToken;
    },
});

let personalDetailsByEmail: PersonalDetailsList = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (personalDetails) => {
        personalDetailsByEmail = lodashMapKeys(personalDetails, (value, key) => value?.login ?? key);
    },
});

function createApprovalWorkflow(policyID: string, approvalWorkflow: ApprovalWorkflow) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    if (!authToken || !policy) {
        return;
    }

    const previousEmployeeList = Object.fromEntries(Object.entries(policy.employeeList ?? {}).map(([key, value]) => [key, {...value, pendingAction: null}]));
    const previousApprovalMode = policy.approvalMode;
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList, approvalWorkflow, type: CONST.APPROVAL_WORKFLOW.TYPE.CREATE});

    // If there are no changes to the employees list, we can exit early
    if (isEmptyObject(updatedEmployees)) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: {
                isLoading: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: updatedEmployees,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: {...approvalWorkflow, isLoading: false},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: previousEmployeeList,
                approvalMode: previousApprovalMode,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map((key) => [key, {pendingAction: null}])),
            },
        },
    ];

    const parameters: CreateWorkspaceApprovalParams = {policyID, authToken, employees: JSON.stringify(Object.values(updatedEmployees))};
    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});
}

function updateApprovalWorkflow(policyID: string, approvalWorkflow: ApprovalWorkflow, membersToRemove: Member[], approversToRemove: Approver[]) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    if (!authToken || !policy) {
        return;
    }

    const previousDefaultApprover = policy.approver ?? policy.owner;
    const newDefaultApprover = approvalWorkflow.isDefault ? approvalWorkflow.approvers.at(0)?.email : undefined;
    const previousEmployeeList = Object.fromEntries(Object.entries(policy.employeeList ?? {}).map(([key, value]) => [key, {...value, pendingAction: null}]));
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({
        previousEmployeeList,
        approvalWorkflow,
        type: CONST.APPROVAL_WORKFLOW.TYPE.UPDATE,
        membersToRemove,
        approversToRemove,
    });

    // If there are no changes to the employees list, we can exit early
    if (isEmptyObject(updatedEmployees) && !newDefaultApprover) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: {
                isLoading: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: updatedEmployees,
                ...(newDefaultApprover ? {approver: newDefaultApprover} : {}),
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: {...approvalWorkflow, isLoading: false},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: previousEmployeeList,
                pendingFields: {employeeList: null},
                ...(newDefaultApprover ? {approver: previousDefaultApprover} : {}),
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map((key) => [key, {pendingAction: null}])),
            },
        },
    ];

    const parameters: UpdateWorkspaceApprovalParams = {
        policyID,
        authToken,
        employees: JSON.stringify(Object.values(updatedEmployees)),
        defaultApprover: newDefaultApprover,
    };
    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});
}

function removeApprovalWorkflow(policyID: string, approvalWorkflow: ApprovalWorkflow) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    if (!authToken || !policy) {
        return;
    }

    const previousEmployeeList = Object.fromEntries(Object.entries(policy.employeeList ?? {}).map(([key, value]) => [key, {...value, pendingAction: null}]));
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList, approvalWorkflow, type: CONST.APPROVAL_WORKFLOW.TYPE.REMOVE});
    const updatedEmployeeList = {...previousEmployeeList, ...updatedEmployees};

    const defaultApprover = policy.approver ?? policy.owner;
    // If there is more than one workflow, we need to keep the advanced approval mode (first workflow is the default)
    const hasMoreThanOneWorkflow = Object.values(updatedEmployeeList).some((employee) => !!employee.submitsTo && employee.submitsTo !== defaultApprover);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: {
                isLoading: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: updatedEmployees,
                approvalMode: hasMoreThanOneWorkflow ? CONST.POLICY.APPROVAL_MODE.ADVANCED : CONST.POLICY.APPROVAL_MODE.BASIC,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: {...approvalWorkflow, isLoading: false},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: previousEmployeeList,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map((key) => [key, {pendingAction: null}])),
            },
        },
    ];

    const parameters: RemoveWorkspaceApprovalParams = {policyID, authToken, employees: JSON.stringify(Object.values(updatedEmployees))};
    API.write(WRITE_COMMANDS.REMOVE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});
}

/** Set the members of the approval workflow that is currently edited */
function setApprovalWorkflowMembers(members: Member[]) {
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {members, errors: null});
}

/**
 * Set the approver at the specified index in the approval workflow that is currently edited
 * @param approver - The new approver to set
 * @param approverIndex - The index of the approver to set
 * @param policyID - The ID of the policy
 */
function setApprovalWorkflowApprover(approver: Approver, approverIndex: number, policyID: string) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    if (!currentApprovalWorkflow || !policy?.employeeList) {
        return;
    }

    const approvers: Array<Approver | undefined> = [...currentApprovalWorkflow.approvers];
    approvers[approverIndex] = approver;

    // Check if the approver forwards to other approvers and add them to the list
    if (policy.employeeList[approver.email]?.forwardsTo) {
        const additionalApprovers = calculateApprovers({employees: policy.employeeList, firstEmail: approver.email, personalDetailsByEmail});
        approvers.splice(approverIndex, approvers.length, ...additionalApprovers);
    }

    // Always clear the additional approver error when an approver is added
    const errors: Record<string, TranslationPaths | null> = {additionalApprover: null};

    // Check for circular references (approver forwards to themselves) and reset other errors
    const updatedApprovers = approvers.map((existingApprover, index) => {
        if (!existingApprover) {
            return;
        }

        const hasCircularReference = approvers.slice(0, index).some((previousApprover) => existingApprover.email === previousApprover?.email);
        if (hasCircularReference) {
            errors[`approver-${index}`] = 'workflowsPage.approverCircularReference';
        } else {
            errors[`approver-${index}`] = null;
        }

        return {
            ...existingApprover,
            isCircularReference: hasCircularReference,
        };
    });

    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {approvers: updatedApprovers, errors});
}

/** Clear one approver at the specified index in the approval workflow that is currently edited */
function clearApprovalWorkflowApprover(approverIndex: number) {
    if (!currentApprovalWorkflow) {
        return;
    }

    const approvers: Array<Approver | undefined> = [...currentApprovalWorkflow.approvers];
    approvers[approverIndex] = undefined;

    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {approvers: lodashDropRightWhile(approvers, (approver) => !approver), errors: null});
}

/** Clear all approvers of the approval workflow that is currently edited */
function clearApprovalWorkflowApprovers() {
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {approvers: []});
}

function setApprovalWorkflow(approvalWorkflow: NullishDeep<ApprovalWorkflowOnyx>) {
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, approvalWorkflow);
}

function clearApprovalWorkflow() {
    Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, null);
}

type ApprovalWorkflowOnyxValidated = Omit<ApprovalWorkflowOnyx, 'approvers'> & {approvers: Approver[]};

/**
 * Validates the approval workflow and sets the errors on the approval workflow
 * @param approvalWorkflow the approval workflow to validate
 * @returns true if the approval workflow is valid, false otherwise
 */
function validateApprovalWorkflow(approvalWorkflow: ApprovalWorkflowOnyx): approvalWorkflow is ApprovalWorkflowOnyxValidated {
    const errors: Record<string, TranslationPaths> = {};

    approvalWorkflow.approvers.forEach((approver, approverIndex) => {
        if (!approver) {
            errors[`approver-${approverIndex}`] = 'common.error.fieldRequired';
        }

        if (approver?.isCircularReference) {
            errors[`approver-${approverIndex}`] = 'workflowsPage.approverCircularReference';
        }
    });

    if (!approvalWorkflow.members.length && !approvalWorkflow.isDefault) {
        errors.members = 'common.error.fieldRequired';
    }

    if (!approvalWorkflow.approvers.length) {
        errors.additionalApprover = 'common.error.fieldRequired';
    }

    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {errors});
    return isEmptyObject(errors);
}

export {
    createApprovalWorkflow,
    updateApprovalWorkflow,
    removeApprovalWorkflow,
    setApprovalWorkflowMembers,
    setApprovalWorkflowApprover,
    setApprovalWorkflow,
    clearApprovalWorkflowApprover,
    clearApprovalWorkflowApprovers,
    clearApprovalWorkflow,
    validateApprovalWorkflow,
};
