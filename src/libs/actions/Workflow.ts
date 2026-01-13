import lodashDropRightWhile from 'lodash/dropRightWhile';
import type {NullishDeep, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {CreateWorkspaceApprovalParams, RemoveWorkspaceApprovalParams, UpdateWorkspaceApprovalParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getDefaultApprover} from '@libs/PolicyUtils';
import {calculateApprovers, convertApprovalWorkflowToPolicyEmployees} from '@libs/WorkflowUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ApprovalWorkflowOnyx, PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import type {Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {completeTask} from './Task';

type CreateApprovalWorkflowParams = {
    approvalWorkflow: ApprovalWorkflow;
    policy: OnyxEntry<Policy>;
    addExpenseApprovalsTaskReport: OnyxEntry<Report>;
};

type SetApprovalWorkflowApproverParams = {
    approver: Approver;
    approverIndex: number;
    currentApprovalWorkflow: ApprovalWorkflowOnyx | undefined;
    policy: OnyxEntry<Policy>;
    personalDetailsByEmail: OnyxEntry<PersonalDetailsList>;
};

type ClearApprovalWorkflowApproverParams = {
    approverIndex: number;
    currentApprovalWorkflow: ApprovalWorkflowOnyx | undefined;
};

function createApprovalWorkflow({approvalWorkflow, policy, addExpenseApprovalsTaskReport}: CreateApprovalWorkflowParams) {
    if (!policy) {
        return;
    }

    const previousEmployeeList = Object.fromEntries(Object.entries(policy.employeeList ?? {}).map(([key, value]) => [key, {...value, pendingAction: null}]));
    const previousApprovalMode = policy.approvalMode;
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList, approvalWorkflow, type: CONST.APPROVAL_WORKFLOW.TYPE.CREATE});

    // If there are no changes to the employees list, we can exit early
    if (isEmptyObject(updatedEmployees)) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.APPROVAL_WORKFLOW | typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: updatedEmployees,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: previousEmployeeList,
                approvalMode: previousApprovalMode,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map((key) => [key, {pendingAction: null, pendingFields: null}])),
            },
        },
    ];

    const parameters: CreateWorkspaceApprovalParams = {policyID: policy.id, employees: JSON.stringify(Object.values(updatedEmployees))};
    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});

    if (
        addExpenseApprovalsTaskReport &&
        (addExpenseApprovalsTaskReport.stateNum !== CONST.REPORT.STATE_NUM.APPROVED || addExpenseApprovalsTaskReport.statusNum !== CONST.REPORT.STATUS_NUM.APPROVED)
    ) {
        completeTask(addExpenseApprovalsTaskReport, false, false, undefined);
    }
}

function updateApprovalWorkflow(approvalWorkflow: ApprovalWorkflow, membersToRemove: Member[], approversToRemove: Approver[], policy: OnyxEntry<Policy>) {
    if (!policy) {
        return;
    }

    const previousDefaultApprover = getDefaultApprover(policy);
    const newDefaultApprover = approvalWorkflow.isDefault ? approvalWorkflow.approvers.at(0)?.email : undefined;
    const previousEmployeeList = Object.fromEntries(Object.entries(policy.employeeList ?? {}).map(([key, value]) => [key, {...value, pendingAction: null}]));
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({
        previousEmployeeList,
        approvalWorkflow,
        type: CONST.APPROVAL_WORKFLOW.TYPE.UPDATE,
        membersToRemove,
        approversToRemove,
        defaultApprover: newDefaultApprover ?? previousDefaultApprover ?? '',
    });

    // If there are no changes to the employees list, we can exit early
    if (isEmptyObject(updatedEmployees) && !newDefaultApprover) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.APPROVAL_WORKFLOW | typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: updatedEmployees,
                ...(newDefaultApprover ? {approver: newDefaultApprover} : {}),
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: previousEmployeeList,
                pendingFields: {employeeList: null},
                ...(newDefaultApprover ? {approver: previousDefaultApprover} : {}),
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map((key) => [key, {pendingAction: null, pendingFields: null}])),
            },
        },
    ];

    const parameters: UpdateWorkspaceApprovalParams = {
        policyID: policy.id,
        employees: JSON.stringify(Object.values(updatedEmployees)),
        defaultApprover: newDefaultApprover,
    };
    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});
}

function removeApprovalWorkflow(approvalWorkflow: ApprovalWorkflow, policy: OnyxEntry<Policy>) {
    if (!policy) {
        return;
    }

    const previousEmployeeList = Object.fromEntries(Object.entries(policy.employeeList ?? {}).map(([key, value]) => [key, {...value, pendingAction: null}]));
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList, approvalWorkflow, type: CONST.APPROVAL_WORKFLOW.TYPE.REMOVE});
    const updatedEmployeeList = {...previousEmployeeList, ...updatedEmployees};

    const defaultApprover = getDefaultApprover(policy);
    // If there is more than one workflow, we need to keep the advanced approval mode (first workflow is the default)
    const hasMoreThanOneWorkflow = Object.values(updatedEmployeeList).some((employee) => !!employee.submitsTo && employee.submitsTo !== defaultApprover);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.APPROVAL_WORKFLOW | typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: updatedEmployees,
                approvalMode: hasMoreThanOneWorkflow ? CONST.POLICY.APPROVAL_MODE.ADVANCED : CONST.POLICY.APPROVAL_MODE.BASIC,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: previousEmployeeList,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map((key) => [key, {pendingAction: null}])),
            },
        },
    ];

    const parameters: RemoveWorkspaceApprovalParams = {policyID: policy.id, employees: JSON.stringify(Object.values(updatedEmployees))};
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
 * @param policy - The policy to set the approver for
 */
function setApprovalWorkflowApprover({approver, approverIndex, currentApprovalWorkflow, policy, personalDetailsByEmail}: SetApprovalWorkflowApproverParams) {
    if (!currentApprovalWorkflow || !policy?.employeeList || !personalDetailsByEmail) {
        return;
    }

    const approvers: Array<Approver | undefined> = [...currentApprovalWorkflow.approvers];
    approvers[approverIndex] = approver;

    // Check if the approver forwards to other approvers and add them to the list
    if (policy.employeeList[approver.email]?.forwardsTo) {
        const additionalApprovers = calculateApprovers({employees: policy.employeeList, firstEmail: approver.email, personalDetailsByEmail});

        approvers.splice(approverIndex, approvers.length, ...additionalApprovers);

        // Preserve the new approvalLimit and overLimitForwardsTo values that were passed in,
        // since calculateApprovers reads from stale policy data
        const existingApprover = approvers.at(approverIndex);
        if (existingApprover) {
            approvers[approverIndex] = {
                ...existingApprover,
                approvalLimit: approver.approvalLimit,
                overLimitForwardsTo: approver.overLimitForwardsTo,
            };
        }
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
function clearApprovalWorkflowApprover({approverIndex, currentApprovalWorkflow}: ClearApprovalWorkflowApproverParams) {
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

/** Set whether the user is in the initial creation flow */
function setApprovalWorkflowIsInitialFlow(isInitialFlow: boolean) {
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {isInitialFlow});
}

function setApprovalWorkflow(approvalWorkflow: NullishDeep<ApprovalWorkflowOnyx>) {
    Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, approvalWorkflow);
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

    for (const [approverIndex, approver] of approvalWorkflow.approvers.entries()) {
        if (!approver) {
            errors[`approver-${approverIndex}`] = 'common.error.fieldRequired';
        }

        if (approver?.isCircularReference) {
            errors[`approver-${approverIndex}`] = 'workflowsPage.approverCircularReference';
        }

        // Validate that if overLimitForwardsTo is set, approvalLimit must also be set
        if (approver?.overLimitForwardsTo && (!approver?.approvalLimit || approver.approvalLimit <= 0)) {
            errors[`approver-${approverIndex}`] = 'workflowsApprovalLimitPage.enterAmountError';
        }

        // Validate that if approvalLimit is set, overLimitForwardsTo must also be set
        if (approver?.approvalLimit && approver.approvalLimit > 0 && !approver?.overLimitForwardsTo) {
            errors[`approver-${approverIndex}`] = 'workflowsApprovalLimitPage.enterApproverError';
        }
    }

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
    setApprovalWorkflowIsInitialFlow,
};
