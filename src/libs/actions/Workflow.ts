import lodashDropRightWhile from 'lodash/dropRightWhile';
import lodashMapKeys from 'lodash/mapKeys';
import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {CreateWorkspaceApprovalParams, RemoveWorkspaceApprovalParams, UpdateWorkspaceApprovalParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {convertApprovalWorkflowToPolicyEmployees, getApprovalWorkflowApprovers} from '@libs/WorkflowUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ApprovalWorkflowOnyx, PersonalDetailsList, Policy} from '@src/types/onyx';
import type {Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';

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

let personalDetails: PersonalDetailsList | undefined;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        personalDetails = value;
    },
});

function createApprovalWorkflow(policyID: string, approvalWorkflow: ApprovalWorkflow) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    if (!authToken || !policy) {
        return;
    }

    const previousEmployeeList = {...policy.employeeList};
    const previousApprovalMode = policy.approvalMode;
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({approvalWorkflow, employeeList: previousEmployeeList, mode: 'create'});

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
    ];

    const parameters: CreateWorkspaceApprovalParams = {policyID, authToken, employees: JSON.stringify(Object.values(updatedEmployees))};
    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});
}

function updateApprovalWorkflow(policyID: string, approvalWorkflow: ApprovalWorkflow) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    if (!authToken || !policy) {
        return;
    }

    const previousEmployeeList = {...policy.employeeList};
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({approvalWorkflow, employeeList: previousEmployeeList, mode: 'update'});

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
            value: {employeeList: updatedEmployees},
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
            value: {employeeList: previousEmployeeList},
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: null,
        },
    ];

    const parameters: UpdateWorkspaceApprovalParams = {policyID, authToken, employees: JSON.stringify(Object.values(updatedEmployees))};
    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});
}

function removeApprovalWorkflow(policyID: string, approvalWorkflow: ApprovalWorkflow) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    if (!authToken || !policy) {
        return;
    }

    const previousEmployeeList = {...policy.employeeList};
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({approvalWorkflow, employeeList: previousEmployeeList, mode: 'remove'});
    const updatedEmployeeList = {...previousEmployeeList, ...updatedEmployees};

    // If there is more than one workflow, we need to keep the advanced approval mode (first workflow is the default)
    const hasMoreThanOneWorkflow = Object.values(updatedEmployeeList).some((employee) => !!employee.submitsTo && employee.submitsTo !== policy.approver);

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
    ];

    const parameters: RemoveWorkspaceApprovalParams = {policyID, authToken, employees: JSON.stringify(Object.values(updatedEmployees))};
    API.write(WRITE_COMMANDS.REMOVE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});
}

function setApprovalWorkflowMembers(members: Member[]) {
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {members});
}

/**
 * Set the approver at the specified index in the current approval workflow
 * @param approver - The new approver to set
 * @param approverIndex - The index of the approver to set
 * @param policyID - The ID of the policy
 */
function setApprovalWorkflowApprover(approver: Approver, approverIndex: number, policyID: string) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    if (!currentApprovalWorkflow || !policy?.employeeList) {
        return;
    }

    const updatedApprovers: Array<Approver | undefined> = currentApprovalWorkflow.approvers.map((newApprover) => (newApprover ? {...newApprover, isInMultipleWorkflows: false} : undefined));
    updatedApprovers[approverIndex] = approver;

    // Check if the approver forwards to other approvers and add them to the list
    if (policy.employeeList[approver.email]?.forwardsTo) {
        const personalDetailsByEmail = lodashMapKeys(personalDetails, (value, key) => value?.login ?? key);
        const additionalApprovers = getApprovalWorkflowApprovers({employees: policy.employeeList, firstEmail: approver.email, personalDetailsByEmail});
        updatedApprovers.splice(approverIndex, updatedApprovers.length, ...additionalApprovers.map((newApprover) => ({...newApprover, isInMultipleWorkflows: true})));
    }

    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {approvers: updatedApprovers});
}

function clearApprovalWorkflowApprover(approverIndex: number) {
    if (!currentApprovalWorkflow) {
        return;
    }

    const updatedApprovers: Array<Approver | undefined> = [...currentApprovalWorkflow.approvers];
    updatedApprovers[approverIndex] = undefined;
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {approvers: lodashDropRightWhile(updatedApprovers, (approver) => !approver)});
}

function clearApprovalWorkflowApprovers() {
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {approvers: []});
}

function setApprovalWorkflow(approvalWorkflow: ApprovalWorkflowOnyx) {
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, approvalWorkflow);
}

function clearApprovalWorkflow() {
    Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, null);
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
};
