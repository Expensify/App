import {INITIAL_APPROVAL_WORKFLOW} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import {generatePolicyID} from '@src/libs/actions/Policy/Policy';
import * as Task from '@src/libs/actions/Task';
import {
    clearApprovalWorkflowApprover,
    createApprovalWorkflow,
    createApprovalWorkflowRules,
    removeApprovalWorkflow,
    removeApprovalWorkflowRules,
    setApprovalWorkflowApprover,
    updateApprovalWorkflow,
    updateApprovalWorkflowRules,
} from '@src/libs/actions/Workflow';
import {calculateApprovers, convertApprovalWorkflowRulesToWorkflows, extractSubmitterEmails, getApprovalWorkflowRulesForPolicy} from '@src/libs/WorkflowUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ApprovalWorkflowOnyx, PersonalDetailsList, Policy, Policy as PolicyType, Report} from '@src/types/onyx';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import {createGlobalFetchMock, getOnyxData} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/WorkflowUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@src/libs/WorkflowUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        calculateApprovers: jest.fn(),
    };
});

jest.mock('@src/libs/actions/Task', () => ({
    completeTask: jest.fn(),
}));

const calculateApproversMock = jest.mocked(calculateApprovers);
const completeTaskMock = jest.mocked(Task.completeTask);

OnyxUpdateManager();

const employee1Email = 'test1@gmail.com';
const employee2Email = 'test2@gmail.com';
const employee3Email = 'test3@gmail.com';
const ownerEmail = 'owner@gmail.com';

/**
 * Reads every rule in the `ONYXKEYS.COLLECTION.RULE` collection that belongs to the given policy and is
 * not optimistically pending deletion.
 */
async function getRulesCollection(): Promise<OnyxCollection<Rule>> {
    let collection: OnyxCollection<Rule> = {};
    await getOnyxData({
        key: ONYXKEYS.COLLECTION.RULE,
        callback: (value) => {
            collection = value ?? {};
        },
    });
    return collection;
}

async function getActivePolicyRules(policyID: string): Promise<Rule[]> {
    const collection = await getRulesCollection();
    return Object.values(collection ?? {}).filter(
        (rule): rule is Rule => !!rule && rule.scope === CONST.RULES.SCOPE.POLICY && rule.scopeID === policyID && rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
}

/** Build the index-keyed object shape the rules API uses for lists */
function indexMap<T>(...values: T[]): Record<string, T> {
    return Object.fromEntries(values.map((value, index) => [String(index), value]));
}

/**
 * Write the two rules (submit -> forward, approve -> finalize) that describe a `submitters -> approver` workflow.
 * Pass `isDefaultApprovalWorkflow` to make them part of the policy's default workflow, the way the builder does.
 */
async function createForwardApproveRules(policyID: string, submitters: string[], approver: string, keyPrefix = 'rule', isDefaultApprovalWorkflow = false) {
    const defaultMarker = isDefaultApprovalWorkflow ? {isDefaultApprovalWorkflow: true} : {};
    await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}${keyPrefix}1`, {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: policyID,
        triggers: indexMap(CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT),
        filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: submitters},
        actions: indexMap({name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO, approver}),
        ...defaultMarker,
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}${keyPrefix}2`, {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: policyID,
        triggers: indexMap(CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_APPROVE),
        filters: {
            operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
            left: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: submitters},
            right: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO, right: approver},
        },
        actions: indexMap({name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.APPROVE_REPORT}),
        ...defaultMarker,
    });
}

describe('actions/Workflow', () => {
    function getApprovalWorkflowState(): Promise<ApprovalWorkflowOnyx | null> {
        return new Promise((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.APPROVAL_WORKFLOW,
                callback: (workflow) => {
                    if (!workflow) {
                        return;
                    }
                    Onyx.disconnect(connection);
                    resolve(workflow);
                },
            });
        });
    }

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        mockFetch = createGlobalFetchMock();
        global.fetch = mockFetch;
        calculateApproversMock.mockClear();
        calculateApproversMock.mockImplementation(() => []);
        completeTaskMock.mockClear();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('clearApprovalWorkflowApprover', () => {
        it('should clear an approver', async () => {
            mockFetch.pause();

            const currentApprovalWorkflow: ApprovalWorkflowOnyx = {
                ...INITIAL_APPROVAL_WORKFLOW,
                approvers: [
                    {
                        email: 'approver1@example.com',
                        avatar: 'avatar1',
                        displayName: 'Approver 1',
                    },
                ],
            };
            Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, currentApprovalWorkflow);
            await waitForBatchedUpdates();

            clearApprovalWorkflowApprover({approverIndex: 0, currentApprovalWorkflow});
            await waitForBatchedUpdates();

            const approvalWorkflow = await getApprovalWorkflowState();
            expect(approvalWorkflow?.approvers).toEqual([]);
            expect(approvalWorkflow?.errors).toBeUndefined();

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });
    });

    describe('setApprovalWorkflowApprover', () => {
        it('should add an approver at an empty index', async () => {
            mockFetch.pause();

            const policyID = generatePolicyID();
            const newApprover: Approver = {
                email: 'newapprover@example.com',
                displayName: 'New Approver',
            };
            const approverIndex = 0;

            const currentApprovalWorkflow: ApprovalWorkflowOnyx = {
                ...INITIAL_APPROVAL_WORKFLOW,
                approvers: [],
                errors: undefined,
            };
            Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, currentApprovalWorkflow);

            const personalDetailsByEmail: PersonalDetailsList = {
                [newApprover.email]: {
                    login: newApprover.email,
                    displayName: newApprover.displayName,
                    avatar: newApprover.avatar,
                    accountID: 1,
                },
            };

            const fakePolicy: PolicyType = {
                ...createRandomPolicy(1),
                id: policyID,
                employeeList: {},
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            setApprovalWorkflowApprover({approver: newApprover, approverIndex, policy: fakePolicy, currentApprovalWorkflow, personalDetailsByEmail});
            await waitForBatchedUpdates();

            const approvalWorkflow = await getApprovalWorkflowState();
            expect(approvalWorkflow?.approvers).toEqual([{...newApprover, isCircularReference: false}]);
            expect(approvalWorkflow?.errors).toEqual({});
            expect(calculateApproversMock).not.toHaveBeenCalled();

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });
    });

    describe('createApprovalWorkflow', () => {
        it('should clear pendingFields when the API is success', async () => {
            mockFetch.pause();

            const policy = createMock<Policy>({
                id: '123456789',
                name: "Mkzie2+bnmsn@gmail.com's Workspace",
                role: 'admin',
                type: 'corporate',
                owner: ownerEmail,
                employeeList: {
                    [ownerEmail]: {
                        email: ownerEmail,
                        forwardsTo: '',
                        role: 'admin',
                        submitsTo: ownerEmail,
                    },
                    [employee1Email]: {
                        email: employee1Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                    [employee2Email]: {
                        email: employee2Email,
                        role: 'user',
                        submitsTo: ownerEmail,
                        forwardsTo: '',
                    },
                    [employee3Email]: {
                        email: employee3Email,
                        role: 'user',
                        submitsTo: ownerEmail,
                        forwardsTo: '',
                    },
                },
            });

            const approvalWorkflow = {
                members: [
                    {
                        displayName: employee1Email,
                        email: employee1Email,
                    },
                ],
                approvers: [
                    {
                        email: employee1Email,
                        displayName: employee1Email,
                        isCircularReference: false,
                    },
                    {
                        email: employee2Email,
                        displayName: employee2Email,
                        isCircularReference: false,
                    },
                ],
                availableMembers: [
                    {
                        email: ownerEmail,
                        displayName: ownerEmail,
                    },
                    {
                        email: employee1Email,
                        displayName: employee1Email,
                    },
                    {
                        email: employee2Email,
                        displayName: employee2Email,
                    },
                    {
                        email: employee3Email,
                        displayName: employee3Email,
                    },
                ],
                usedApproverEmails: [ownerEmail],
                isDefault: false,
                action: 'create',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            createApprovalWorkflow({approvalWorkflow, policy, addExpenseApprovalsTaskReport: undefined});
            await mockFetch.resume();

            let updatedPolicy: Policy | undefined;
            const policyKey: `${typeof ONYXKEYS.COLLECTION.POLICY}${string}` = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`;
            await getOnyxData({
                key: policyKey,
                callback: (val) => (updatedPolicy = val),
            });

            expect(updatedPolicy?.employeeList?.[employee1Email]?.pendingFields).toBeUndefined();
            expect(updatedPolicy?.employeeList?.[employee2Email]?.pendingFields).toBeUndefined();
        });

        it('should auto-complete the addExpenseApprovals task when creating an approval workflow', async () => {
            mockFetch.pause();

            const policy = createMock<Policy>({
                id: '123456789',
                name: 'Test Workspace',
                role: 'admin',
                type: 'corporate',
                owner: ownerEmail,
                employeeList: {
                    [ownerEmail]: {
                        email: ownerEmail,
                        forwardsTo: '',
                        role: 'admin',
                        submitsTo: ownerEmail,
                    },
                    [employee1Email]: {
                        email: employee1Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                },
            });

            const addExpenseApprovalsTaskReport: Report = {
                reportID: '999',
                type: CONST.REPORT.TYPE.TASK,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            const approvalWorkflow = {
                members: [
                    {
                        displayName: employee1Email,
                        email: employee1Email,
                    },
                ],
                approvers: [
                    {
                        email: employee1Email,
                        displayName: employee1Email,
                        isCircularReference: false,
                    },
                ],
                availableMembers: [],
                usedApproverEmails: [ownerEmail],
                isDefault: false,
                action: 'create',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            createApprovalWorkflow({approvalWorkflow, policy, addExpenseApprovalsTaskReport});
            await mockFetch.resume();
            await waitForBatchedUpdates();

            expect(completeTaskMock).toHaveBeenCalledWith(addExpenseApprovalsTaskReport, false, false, undefined, undefined, undefined, false);
        });

        it('should not auto-complete the task if it is already approved', async () => {
            mockFetch.pause();

            const policy = createMock<Policy>({
                id: '123456789',
                name: 'Test Workspace',
                role: 'admin',
                type: 'corporate',
                owner: ownerEmail,
                employeeList: {
                    [ownerEmail]: {
                        email: ownerEmail,
                        forwardsTo: '',
                        role: 'admin',
                        submitsTo: ownerEmail,
                    },
                    [employee1Email]: {
                        email: employee1Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                },
            });

            const addExpenseApprovalsTaskReport: Report = {
                reportID: '999',
                type: CONST.REPORT.TYPE.TASK,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            };

            const approvalWorkflow = {
                members: [
                    {
                        displayName: employee1Email,
                        email: employee1Email,
                    },
                ],
                approvers: [
                    {
                        email: employee1Email,
                        displayName: employee1Email,
                        isCircularReference: false,
                    },
                ],
                availableMembers: [],
                usedApproverEmails: [ownerEmail],
                isDefault: false,
                action: 'create',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            createApprovalWorkflow({approvalWorkflow, policy, addExpenseApprovalsTaskReport});
            await mockFetch.resume();
            await waitForBatchedUpdates();

            expect(completeTaskMock).not.toHaveBeenCalled();
        });

        it('should not auto-complete the task if addExpenseApprovalsTaskReport is undefined', async () => {
            mockFetch.pause();

            const policy = createMock<Policy>({
                id: '123456789',
                name: 'Test Workspace',
                role: 'admin',
                type: 'corporate',
                owner: ownerEmail,
                employeeList: {
                    [ownerEmail]: {
                        email: ownerEmail,
                        forwardsTo: '',
                        role: 'admin',
                        submitsTo: ownerEmail,
                    },
                    [employee1Email]: {
                        email: employee1Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                },
            });

            const approvalWorkflow = {
                members: [
                    {
                        displayName: employee1Email,
                        email: employee1Email,
                    },
                ],
                approvers: [
                    {
                        email: employee1Email,
                        displayName: employee1Email,
                        isCircularReference: false,
                    },
                ],
                availableMembers: [],
                usedApproverEmails: [ownerEmail],
                isDefault: false,
                action: 'create',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            createApprovalWorkflow({approvalWorkflow, policy, addExpenseApprovalsTaskReport: undefined});
            await mockFetch.resume();
            await waitForBatchedUpdates();

            expect(completeTaskMock).not.toHaveBeenCalled();
        });
    });

    describe('removeApprovalWorkflow', () => {
        it('should keep ADVANCED approval mode when default approver has forwardsTo chain', async () => {
            mockFetch.pause();

            // Given a policy with two workflows:
            // - Default workflow: employee1 submits to owner, owner forwards to employee2 (multi-level)
            // - Second workflow: employee3 submits to employee1
            const policy = createMock<Policy>({
                id: '123456789',
                name: 'Test Workspace',
                role: 'admin',
                type: 'corporate',
                owner: ownerEmail,
                approver: ownerEmail,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                employeeList: {
                    [ownerEmail]: {
                        email: ownerEmail,
                        forwardsTo: employee2Email,
                        role: 'admin',
                        submitsTo: ownerEmail,
                    },
                    [employee1Email]: {
                        email: employee1Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                    [employee2Email]: {
                        email: employee2Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                    [employee3Email]: {
                        email: employee3Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: employee1Email,
                    },
                },
            });

            // The second workflow to remove: employee3 submits to employee1
            const approvalWorkflow = {
                members: [{email: employee3Email, displayName: employee3Email}],
                approvers: [{email: employee1Email, displayName: employee1Email, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [ownerEmail],
                isDefault: false,
                action: 'remove',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            // When removing the second workflow
            removeApprovalWorkflow(approvalWorkflow, policy);
            await waitForBatchedUpdates();

            // Then approvalMode should stay ADVANCED because default approver has forwardsTo chain
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.ADVANCED);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('should keep ADVANCED approval mode when default approver has overLimitForwardsTo but no forwardsTo', async () => {
            mockFetch.pause();

            // Given a policy with two workflows:
            // - Default workflow: employee1 submits to owner (single-level, no forwardsTo but has overLimitForwardsTo)
            // - Second workflow: employee3 submits to employee2
            const policy = createMock<Policy>({
                id: '123456789',
                name: 'Test Workspace',
                role: 'admin',
                type: 'corporate',
                owner: ownerEmail,
                approver: ownerEmail,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                employeeList: {
                    [ownerEmail]: {
                        email: ownerEmail,
                        forwardsTo: '',
                        overLimitForwardsTo: employee1Email,
                        approvalLimit: 500000,
                        role: 'admin',
                        submitsTo: ownerEmail,
                    },
                    [employee1Email]: {
                        email: employee1Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                    [employee2Email]: {
                        email: employee2Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                    [employee3Email]: {
                        email: employee3Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: employee2Email,
                    },
                },
            });

            const approvalWorkflow = {
                members: [{email: employee3Email, displayName: employee3Email}],
                approvers: [{email: employee2Email, displayName: employee2Email, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [ownerEmail],
                isDefault: false,
                action: 'remove',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            removeApprovalWorkflow(approvalWorkflow, policy);
            await waitForBatchedUpdates();

            // Then approvalMode should stay ADVANCED because default approver has overLimitForwardsTo
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.ADVANCED);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('should set BASIC approval mode when no forwardsTo chain and only default workflow remains', async () => {
            mockFetch.pause();

            // Given a policy with two workflows:
            // - Default workflow: employee1 submits to owner (single-level, no forwardsTo)
            // - Second workflow: employee3 submits to employee2
            const policy = createMock<Policy>({
                id: '123456789',
                name: 'Test Workspace',
                role: 'admin',
                type: 'corporate',
                owner: ownerEmail,
                approver: ownerEmail,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                employeeList: {
                    [ownerEmail]: {
                        email: ownerEmail,
                        forwardsTo: '',
                        role: 'admin',
                        submitsTo: ownerEmail,
                    },
                    [employee1Email]: {
                        email: employee1Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                    [employee2Email]: {
                        email: employee2Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                    [employee3Email]: {
                        email: employee3Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: employee2Email,
                    },
                },
            });

            // The second workflow to remove: employee3 submits to employee2
            const approvalWorkflow = {
                members: [{email: employee3Email, displayName: employee3Email}],
                approvers: [{email: employee2Email, displayName: employee2Email, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [ownerEmail],
                isDefault: false,
                action: 'remove',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            // When removing the second workflow
            removeApprovalWorkflow(approvalWorkflow, policy);
            await waitForBatchedUpdates();

            // Then approvalMode should be BASIC because no forwardsTo chain and only default workflow remains
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });
    });

    describe('updateApprovalWorkflow', () => {
        it('should set BASIC approval mode when second approver is removed from default workflow', async () => {
            mockFetch.pause();

            // Given a policy with a default workflow that has two approvers:
            // owner forwards to employee2 (multi-level)
            const policy = createMock<Policy>({
                id: '123456789',
                name: 'Test Workspace',
                role: 'admin',
                type: 'corporate',
                owner: ownerEmail,
                approver: ownerEmail,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                employeeList: {
                    [ownerEmail]: {
                        email: ownerEmail,
                        forwardsTo: employee2Email,
                        role: 'admin',
                        submitsTo: ownerEmail,
                    },
                    [employee1Email]: {
                        email: employee1Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                    [employee2Email]: {
                        email: employee2Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                },
            });

            // The updated workflow: only one approver (owner), second approver removed
            const approvalWorkflow = {
                members: [
                    {email: employee1Email, displayName: employee1Email},
                    {email: employee2Email, displayName: employee2Email},
                ],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [ownerEmail],
                isDefault: true,
                action: 'update',
                originalApprovers: [{email: ownerEmail}, {email: employee2Email}],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            // When updating the workflow to remove the second approver
            updateApprovalWorkflow(approvalWorkflow, [], [{email: employee2Email, displayName: employee2Email}], policy);
            await waitForBatchedUpdates();

            // Then approvalMode should be BASIC because no forwardsTo chain remains
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('should keep ADVANCED approval mode when default approver has overLimitForwardsTo after removing second approver', async () => {
            mockFetch.pause();

            // Given a policy where default approver has both forwardsTo and overLimitForwardsTo
            const policy = createMock<Policy>({
                id: '123456789',
                name: 'Test Workspace',
                role: 'admin',
                type: 'corporate',
                owner: ownerEmail,
                approver: ownerEmail,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                employeeList: {
                    [ownerEmail]: {
                        email: ownerEmail,
                        forwardsTo: employee2Email,
                        overLimitForwardsTo: employee1Email,
                        approvalLimit: 500000,
                        role: 'admin',
                        submitsTo: ownerEmail,
                    },
                    [employee1Email]: {
                        email: employee1Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                    [employee2Email]: {
                        email: employee2Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                },
            });

            // Remove employee2 as second approver (forwardsTo will be cleared)
            // but overLimitForwardsTo to employee1 remains
            const approvalWorkflow = {
                members: [
                    {email: employee1Email, displayName: employee1Email},
                    {email: employee2Email, displayName: employee2Email},
                ],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false, overLimitForwardsTo: employee1Email, approvalLimit: 500000}],
                availableMembers: [],
                usedApproverEmails: [ownerEmail],
                isDefault: true,
                action: 'update',
                originalApprovers: [{email: ownerEmail}, {email: employee2Email}],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            updateApprovalWorkflow(approvalWorkflow, [], [{email: employee2Email, displayName: employee2Email}], policy);
            await waitForBatchedUpdates();

            // Then approvalMode should stay ADVANCED because overLimitForwardsTo still exists
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.ADVANCED);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('should keep ADVANCED approval mode when second approver remains in default workflow', async () => {
            mockFetch.pause();

            // Given a policy with a default workflow that has two approvers
            const policy = createMock<Policy>({
                id: '123456789',
                name: 'Test Workspace',
                role: 'admin',
                type: 'corporate',
                owner: ownerEmail,
                approver: ownerEmail,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                employeeList: {
                    [ownerEmail]: {
                        email: ownerEmail,
                        forwardsTo: employee2Email,
                        role: 'admin',
                        submitsTo: ownerEmail,
                    },
                    [employee1Email]: {
                        email: employee1Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                    [employee2Email]: {
                        email: employee2Email,
                        forwardsTo: '',
                        role: 'user',
                        submitsTo: ownerEmail,
                    },
                },
            });

            // The updated workflow: change second approver from employee2 to employee1
            const approvalWorkflow = {
                members: [{email: employee2Email, displayName: employee2Email}],
                approvers: [
                    {email: ownerEmail, displayName: ownerEmail, isCircularReference: false},
                    {email: employee1Email, displayName: employee1Email, isCircularReference: false},
                ],
                availableMembers: [],
                usedApproverEmails: [ownerEmail],
                isDefault: true,
                action: 'update',
                originalApprovers: [{email: ownerEmail}, {email: employee2Email}],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            // When updating the workflow (replacing second approver)
            updateApprovalWorkflow(approvalWorkflow, [], [{email: employee2Email, displayName: employee2Email}], policy);
            await waitForBatchedUpdates();

            // Then approvalMode should stay ADVANCED because forwardsTo chain still exists
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.ADVANCED);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });
    });

    describe('createApprovalWorkflowRules', () => {
        it('writes a new rule-based approval workflow to the rules collection', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                rules: {},
            };

            const approvalWorkflow = {
                members: [{email: employee1Email, displayName: employee1Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'create',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            createApprovalWorkflowRules({approvalWorkflow, policy, addExpenseApprovalsTaskReport: undefined, rules: await getRulesCollection()});
            await waitForBatchedUpdates();

            // A one-approver workflow produces a submit rule (forward to the approver) and a terminal approve rule.
            const rules = await getActivePolicyRules(policyID);
            expect(rules).toHaveLength(2);

            const submitRule = rules.find((rule) => Object.values(rule.triggers).includes(CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT));
            expect(submitRule?.scope).toBe(CONST.RULES.SCOPE.POLICY);
            expect(submitRule?.scopeID).toBe(policyID);
            expect(submitRule?.filters).toEqual({operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: [employee1Email]});
            expect(submitRule?.actions[0]).toEqual({name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO, approver: ownerEmail});

            const approveRule = rules.find((rule) => Object.values(rule.triggers).includes(CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_APPROVE));
            expect(approveRule?.actions[0]).toEqual({name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.APPROVE_REPORT});

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('folds a new submitter into the existing same-chain rules instead of creating a new pair', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                rules: {},
            };

            // Existing workflow: employee1 (A) and employee2 (B) submit to owner (C).
            await createForwardApproveRules(policyID, [employee1Email, employee2Email], ownerEmail);

            // New workflow: employee3 (D) submits to owner (C) — same chain as the existing workflow.
            const approvalWorkflow = {
                members: [{email: employee3Email, displayName: employee3Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'create',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            createApprovalWorkflowRules({approvalWorkflow, policy, addExpenseApprovalsTaskReport: undefined, rules: await getRulesCollection()});
            await waitForBatchedUpdates();

            const rules = await getActivePolicyRules(policyID);
            // D should be folded into the two existing rules, not create a third/fourth rule.
            expect(rules).toHaveLength(2);
            for (const rule of rules) {
                expect(extractSubmitterEmails(rule)).toEqual([employee1Email, employee2Email, employee3Email]);
            }

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('E2E: creating A,B→C then D→C via two successive create calls folds D into the same rules', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                rules: {},
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            // First: A and B submit to C.
            createApprovalWorkflowRules({
                approvalWorkflow: {
                    members: [
                        {email: employee1Email, displayName: employee1Email},
                        {email: employee2Email, displayName: employee2Email},
                    ],
                    approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                    isDefault: false,
                },
                policy,
                addExpenseApprovalsTaskReport: undefined,
                rules: await getRulesCollection(),
            });
            await waitForBatchedUpdates();

            const rulesAfterFirst = await getActivePolicyRules(policyID);
            expect(rulesAfterFirst).toHaveLength(2);

            // Second: D submits to C (same approver chain).
            createApprovalWorkflowRules({
                approvalWorkflow: {
                    members: [{email: employee3Email, displayName: employee3Email}],
                    approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                    isDefault: false,
                },
                policy,
                addExpenseApprovalsTaskReport: undefined,
                rules: await getRulesCollection(),
            });
            await waitForBatchedUpdates();

            const rulesAfterSecond = await getActivePolicyRules(policyID);
            // Still only two rules, each now listing all three submitters.
            expect(rulesAfterSecond).toHaveLength(2);
            for (const rule of rulesAfterSecond) {
                expect(extractSubmitterEmails(rule)).toEqual([employee1Email, employee2Email, employee3Email]);
            }

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('folds a workflow whose chain matches the rule-backed default workflow into it', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                approver: ownerEmail,
                rules: {},
            };

            // The default workflow is rule-backed and routes to the owner.
            await createForwardApproveRules(policyID, [employee1Email], ownerEmail, 'default', true);

            // A new workflow for employee2 whose only approver is the default approver. That is the same chain.
            const approvalWorkflow = {
                members: [{email: employee2Email, displayName: employee2Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'create',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            createApprovalWorkflowRules({approvalWorkflow, policy, addExpenseApprovalsTaskReport: undefined, rules: await getRulesCollection()});
            await waitForBatchedUpdates();

            // employee2 joins the default workflow's rules rather than getting a duplicate pair of their own.
            const rules = await getActivePolicyRules(policyID);
            expect(rules).toHaveLength(2);
            for (const rule of rules) {
                expect(rule.isDefaultApprovalWorkflow).toBe(true);
                expect(extractSubmitterEmails(rule)).toEqual([employee1Email, employee2Email]);
            }

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('writes no rules when the chain matches a default workflow that has no rules of its own', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                approver: ownerEmail,
                employeeList: {
                    [employee1Email]: {email: employee1Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [employee2Email]: {email: employee2Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [ownerEmail]: {email: ownerEmail, forwardsTo: '', role: CONST.POLICY.ROLE.ADMIN, submitsTo: ownerEmail},
                },
                rules: {},
            };

            const approvalWorkflow = {
                members: [{email: employee2Email, displayName: employee2Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'create',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            createApprovalWorkflowRules({approvalWorkflow, policy, addExpenseApprovalsTaskReport: undefined, rules: await getRulesCollection()});
            await waitForBatchedUpdates();

            // employee2 already reaches the default approver through employeeList, so writing rules here would
            // split them onto a workflow card of their own.
            expect(await getActivePolicyRules(policyID)).toHaveLength(0);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('persists the default route when a member matching an unbacked default workflow has a stale submitsTo', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                approver: ownerEmail,
                employeeList: {
                    // employee2 still submits to employee3 from a workflow that was saved through the rules
                    // backend, which never syncs employeeList.
                    [employee2Email]: {email: employee2Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: employee3Email},
                    [employee3Email]: {email: employee3Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [ownerEmail]: {email: ownerEmail, forwardsTo: '', role: CONST.POLICY.ROLE.ADMIN, submitsTo: ownerEmail},
                },
                rules: {},
            };

            // employee2's workflow routes to employee3, and the default workflow has no rules of its own.
            await createForwardApproveRules(policyID, [employee2Email], employee3Email);

            const initialApprovalWorkflow = {
                members: [{email: employee2Email, displayName: employee2Email}],
                approvers: [{email: employee3Email, displayName: employee3Email, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'update',
                originalApprovers: [],
            };

            // Edited so its chain matches the default workflow's.
            const approvalWorkflow = {
                ...initialApprovalWorkflow,
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            updateApprovalWorkflowRules({approvalWorkflow, initialApprovalWorkflow, policy, rules: await getRulesCollection()});
            await waitForBatchedUpdates();

            // Dropping employee2's rules would leave employeeList routing them to employee3, so the default
            // route has to be written out instead.
            const rules = await getActivePolicyRules(policyID);
            expect(rules.length).toBeGreaterThan(0);
            const forwardApprovers = rules
                .flatMap((rule) => Object.values(rule.actions))
                .filter((action) => action.name === CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO)
                .map((action) => action.approver);
            expect(forwardApprovers).toEqual([ownerEmail]);
            for (const rule of rules) {
                expect(extractSubmitterEmails(rule)).toEqual([employee2Email]);
                expect(rule.isDefaultApprovalWorkflow).toBe(true);
            }

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });
    });

    describe('updateApprovalWorkflowRules', () => {
        it('replaces the approver chain when the workflow approver changes', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                rules: {},
            };

            // Seed the existing [employee1] → [owner] workflow as rules in the collection.
            await createForwardApproveRules(policyID, [employee1Email], ownerEmail);

            const initialApprovalWorkflow = {
                members: [{email: employee1Email, displayName: employee1Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'update',
                originalApprovers: [],
            };
            const approvalWorkflow = {
                ...initialApprovalWorkflow,
                approvers: [{email: employee2Email, displayName: employee2Email, isCircularReference: false}],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            updateApprovalWorkflowRules({approvalWorkflow, initialApprovalWorkflow, policy, rules: await getRulesCollection()});
            await waitForBatchedUpdates();

            // The old rules (forwarding to the owner) are removed and new rules forwarding to employee2 are created.
            const rules = await getActivePolicyRules(policyID);
            const forwardApprovers = rules
                .flatMap((rule) => Object.values(rule.actions))
                .filter((action) => action.name === CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO)
                .map((action) => action.approver);
            expect(forwardApprovers).toContain(employee2Email);
            expect(forwardApprovers).not.toContain(ownerEmail);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('marks rewritten rules as pending update rather than pending add', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                rules: {},
            };

            // Seed the existing [employee1] → [owner] workflow as rules in the collection.
            await createForwardApproveRules(policyID, [employee1Email], ownerEmail);

            const initialApprovalWorkflow = {
                members: [{email: employee1Email, displayName: employee1Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'update',
                originalApprovers: [],
            };

            // Adding a member keeps the same approver chain, so the seeded rules are rewritten under their own IDs.
            const approvalWorkflow = {
                ...initialApprovalWorkflow,
                members: [
                    {email: employee1Email, displayName: employee1Email},
                    {email: employee2Email, displayName: employee2Email},
                ],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            updateApprovalWorkflowRules({approvalWorkflow, initialApprovalWorkflow, policy, rules: await getRulesCollection()});
            await waitForBatchedUpdates();

            const collection = await getRulesCollection();
            expect(collection?.[`${ONYXKEYS.COLLECTION.RULE}rule1`]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(collection?.[`${ONYXKEYS.COLLECTION.RULE}rule2`]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('promotes the new first approver to the policy default approver when the default workflow is edited', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                approver: ownerEmail,
                rules: {},
            };

            // Seed the default [employee1] → [owner] workflow as rules in the collection.
            await createForwardApproveRules(policyID, [employee1Email], ownerEmail);

            const initialApprovalWorkflow = {
                members: [{email: employee1Email, displayName: employee1Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: true,
                action: 'update',
                originalApprovers: [],
            };
            const approvalWorkflow = {
                ...initialApprovalWorkflow,
                approvers: [{email: employee2Email, displayName: employee2Email, isCircularReference: false}],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            updateApprovalWorkflowRules({approvalWorkflow, initialApprovalWorkflow, policy, rules: await getRulesCollection()});
            await waitForBatchedUpdates();

            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.approver).toBe(employee2Email);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('promotes the new first approver even when the default workflow has no members of its own', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                approver: ownerEmail,
                rules: {},
            };

            // Only employee1 → employee3 is covered by rules, so the default workflow around the owner has no members.
            await createForwardApproveRules(policyID, [employee1Email], employee3Email);

            const initialApprovalWorkflow = {
                members: [],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: true,
                action: 'update',
                originalApprovers: [],
            };
            const approvalWorkflow = {
                ...initialApprovalWorkflow,
                approvers: [{email: employee2Email, displayName: employee2Email, isCircularReference: false}],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            updateApprovalWorkflowRules({approvalWorkflow, initialApprovalWorkflow, policy, rules: await getRulesCollection()});
            await waitForBatchedUpdates();

            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.approver).toBe(employee2Email);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('leaves the policy default approver alone when a non-default workflow is edited', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                approver: ownerEmail,
                rules: {},
            };

            await createForwardApproveRules(policyID, [employee1Email], employee3Email);

            const initialApprovalWorkflow = {
                members: [{email: employee1Email, displayName: employee1Email}],
                approvers: [{email: employee3Email, displayName: employee3Email, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'update',
                originalApprovers: [],
            };
            const approvalWorkflow = {
                ...initialApprovalWorkflow,
                approvers: [{email: employee2Email, displayName: employee2Email, isCircularReference: false}],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            updateApprovalWorkflowRules({approvalWorkflow, initialApprovalWorkflow, policy, rules: await getRulesCollection()});
            await waitForBatchedUpdates();

            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.approver).toBe(ownerEmail);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });
    });

    describe('removeApprovalWorkflowRules', () => {
        it('E2E: editing the default workflow, then creating and deleting a workflow, returns the member to the edited default', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
            const basePolicy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                approver: ownerEmail,
                employeeList: {
                    [ownerEmail]: {email: ownerEmail, forwardsTo: '', role: CONST.POLICY.ROLE.ADMIN, submitsTo: ownerEmail},
                    [employee1Email]: {email: employee1Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [employee2Email]: {email: employee2Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [employee3Email]: {email: employee3Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                },
                rules: {},
            };

            await Onyx.set(policyKey, basePolicy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            const buildMember = (email: string) => ({email, displayName: email});
            const buildApprover = (email: string) => ({email, displayName: email, isCircularReference: false});

            // 1. Edit the default workflow so it approves through employee3 instead of the owner.
            const defaultMembers = [buildMember(employee1Email), buildMember(employee2Email), buildMember(employee3Email)];
            updateApprovalWorkflowRules({
                approvalWorkflow: {members: defaultMembers, approvers: [buildApprover(employee3Email)], isDefault: true},
                initialApprovalWorkflow: {members: defaultMembers, approvers: [buildApprover(ownerEmail)], isDefault: true},
                policy: await getOnyxValue(policyKey),
                rules: await getRulesCollection(),
            });
            await waitForBatchedUpdates();

            // 2. Move employee2 into a workflow of their own, approved by employee1.
            const customWorkflow = {members: [buildMember(employee2Email)], approvers: [buildApprover(employee1Email)], isDefault: false};
            createApprovalWorkflowRules({
                approvalWorkflow: customWorkflow,
                policy: await getOnyxValue(policyKey),
                addExpenseApprovalsTaskReport: undefined,
                rules: await getRulesCollection(),
            });
            await waitForBatchedUpdates();

            // 3. Delete it, the way the edit page does. That means passing the default workflow the converter
            // resolves.
            const policyAfterCreate = await getOnyxValue(policyKey);
            const {approvalWorkflows} = convertApprovalWorkflowRulesToWorkflows({
                policy: policyAfterCreate,
                personalDetails: {},
                localeCompare: (a: string, b: string) => a.localeCompare(b),
                rules: getApprovalWorkflowRulesForPolicy(await getRulesCollection(), policyID),
            });
            removeApprovalWorkflowRules(
                customWorkflow,
                policyAfterCreate,
                await getRulesCollection(),
                approvalWorkflows.find((workflow) => workflow.isDefault),
            );
            await waitForBatchedUpdates();

            // employee2 is back in the edited default workflow's rules, not stranded on the original approver.
            const rules = await getActivePolicyRules(policyID);
            const defaultRules = rules.filter((rule) => rule.isDefaultApprovalWorkflow);
            expect(rules).toHaveLength(defaultRules.length);
            for (const rule of defaultRules) {
                expect(extractSubmitterEmails(rule)).toContain(employee2Email);
            }
            const forwardApprovers = defaultRules
                .flatMap((rule) => Object.values(rule.actions))
                .filter((action) => action.name === CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO)
                .map((action) => action.approver);
            expect(forwardApprovers).toEqual([employee3Email]);
            expect(forwardApprovers).not.toContain(ownerEmail);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('removes the rules that belong only to the workflow members', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                rules: {},
            };

            // Seed the existing [employee1] → [owner] workflow as rules in the collection.
            await createForwardApproveRules(policyID, [employee1Email], ownerEmail);

            const approvalWorkflow = {
                members: [{email: employee1Email, displayName: employee1Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'remove',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            removeApprovalWorkflowRules(approvalWorkflow, policy, await getRulesCollection());
            await waitForBatchedUpdates();

            // Both rules belonged only to the removed member, so no live rules remain for the policy.
            const rules = await getActivePolicyRules(policyID);
            expect(rules).toHaveLength(0);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('returns false when the workflow only exists in the employee list so the caller can fall back', async () => {
            mockFetch.pause();

            const policyID = '987654321';
            const policy: Policy = {
                ...createRandomPolicy(2),
                id: policyID,
                owner: ownerEmail,
                approver: ownerEmail,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                employeeList: {
                    [employee1Email]: {email: employee1Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: employee2Email},
                    [employee2Email]: {email: employee2Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                },
                rules: {},
            };

            const approvalWorkflow = {
                members: [{email: employee1Email, displayName: employee1Email}],
                approvers: [{email: employee2Email, displayName: employee2Email, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'remove',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            expect(removeApprovalWorkflowRules(approvalWorkflow, policy, await getRulesCollection())).toBe(false);
            await waitForBatchedUpdates();

            // Falling back to the employee-list command detaches the member from the removed approver.
            removeApprovalWorkflow(approvalWorkflow, policy);
            await waitForBatchedUpdates();

            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.employeeList?.[employee1Email]?.submitsTo).not.toBe(employee2Email);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('folds the removed workflow members into a rule-backed default workflow', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                // The default workflow was edited to approve through employee3, but employeeList still names the
                // owner. That is the state a removed member would fall back to without any rule covering them.
                approver: employee3Email,
                employeeList: {
                    [employee1Email]: {email: employee1Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [employee2Email]: {email: employee2Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                },
                rules: {},
            };

            // Default workflow [employee1] → employee3 and a second workflow [employee2] → owner, both rule-backed.
            await createForwardApproveRules(policyID, [employee1Email], employee3Email, 'default', true);
            await createForwardApproveRules(policyID, [employee2Email], ownerEmail, 'second');

            const defaultApprovalWorkflow = {
                members: [{email: employee1Email, displayName: employee1Email}],
                approvers: [{email: employee3Email, displayName: employee3Email, isCircularReference: false}],
                isDefault: true,
            };
            const approvalWorkflow = {
                members: [{email: employee2Email, displayName: employee2Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'remove',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            removeApprovalWorkflowRules(approvalWorkflow, policy, await getRulesCollection(), defaultApprovalWorkflow);
            await waitForBatchedUpdates();

            // Only the default workflow's own two rules survive, and they now cover employee2 as well.
            const rules = await getActivePolicyRules(policyID);
            expect(rules).toHaveLength(2);
            for (const rule of rules) {
                expect(extractSubmitterEmails(rule)).toEqual([employee1Email, employee2Email]);
            }

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('folds the removed members into a rule-backed default workflow whose rules do not declare themselves default', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                approver: employee3Email,
                employeeList: {
                    [employee1Email]: {email: employee1Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [employee2Email]: {email: employee2Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                },
                rules: {},
            };

            // Rules written before `isDefaultApprovalWorkflow` existed, so the default pair does not set it.
            await createForwardApproveRules(policyID, [employee1Email], employee3Email, 'default');
            await createForwardApproveRules(policyID, [employee2Email], ownerEmail, 'second');

            const defaultApprovalWorkflow = {
                members: [{email: employee1Email, displayName: employee1Email}],
                approvers: [{email: employee3Email, displayName: employee3Email, isCircularReference: false}],
                isDefault: true,
            };
            const approvalWorkflow = {
                members: [{email: employee2Email, displayName: employee2Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'remove',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            removeApprovalWorkflowRules(approvalWorkflow, policy, await getRulesCollection(), defaultApprovalWorkflow);
            await waitForBatchedUpdates();

            const rules = await getActivePolicyRules(policyID);
            expect(rules).toHaveLength(2);
            for (const rule of rules) {
                expect(extractSubmitterEmails(rule)).toEqual([employee1Email, employee2Email]);
            }

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('leaves the removed members to the employee-list fallback when the default workflow has no rules', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                owner: ownerEmail,
                approver: ownerEmail,
                employeeList: {
                    [employee1Email]: {email: employee1Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [employee2Email]: {email: employee2Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [ownerEmail]: {email: ownerEmail, forwardsTo: '', role: CONST.POLICY.ROLE.ADMIN, submitsTo: ownerEmail},
                },
                rules: {},
            };

            // Only the workflow being removed is rule-backed. The default workflow still lives in employeeList,
            // and employee2 already submits to the default approver there.
            await createForwardApproveRules(policyID, [employee2Email], employee3Email);

            const defaultApprovalWorkflow = {
                members: [{email: employee1Email, displayName: employee1Email}],
                approvers: [{email: ownerEmail, displayName: ownerEmail, isCircularReference: false}],
                isDefault: true,
            };
            const approvalWorkflow = {
                members: [{email: employee2Email, displayName: employee2Email}],
                approvers: [{email: employee3Email, displayName: employee3Email, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'remove',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            removeApprovalWorkflowRules(approvalWorkflow, policy, await getRulesCollection(), defaultApprovalWorkflow);
            await waitForBatchedUpdates();

            // Writing rules for employee2 here would split them off from the employeeList-based default workflow.
            expect(await getActivePolicyRules(policyID)).toHaveLength(0);

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('re-establishes the edited default workflow when its rules were dropped with their last submitter', async () => {
            mockFetch.pause();

            const policyID = '123456789';
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                // The default workflow was edited to approve through employee3, so employeeList still names the
                // previous approver everywhere.
                approver: employee3Email,
                owner: ownerEmail,
                employeeList: {
                    [employee2Email]: {email: employee2Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [employee3Email]: {email: employee3Email, forwardsTo: '', role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                    [ownerEmail]: {email: ownerEmail, forwardsTo: '', role: CONST.POLICY.ROLE.ADMIN, submitsTo: ownerEmail},
                },
                rules: {},
            };

            // employee2 was the edited default workflow's last member, so moving them into a custom workflow
            // deleted the default's rules. Only the custom workflow's rules remain.
            await createForwardApproveRules(policyID, [employee2Email], employee1Email);

            const defaultApprovalWorkflow = {
                members: [],
                approvers: [{email: employee3Email, displayName: employee3Email, isCircularReference: false}],
                isDefault: true,
            };
            const approvalWorkflow = {
                members: [{email: employee2Email, displayName: employee2Email}],
                approvers: [{email: employee1Email, displayName: employee1Email, isCircularReference: false}],
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
                action: 'remove',
                originalApprovers: [],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: '123456789'});
            await waitForBatchedUpdates();

            removeApprovalWorkflowRules(approvalWorkflow, policy, await getRulesCollection(), defaultApprovalWorkflow);
            await waitForBatchedUpdates();

            // No default rules survived to fold into, but employeeList still routes employee2 to the owner, so
            // the default route has to be written rather than assumed.
            const rules = await getActivePolicyRules(policyID);
            expect(rules.length).toBeGreaterThan(0);
            const forwardApprovers = rules
                .flatMap((rule) => Object.values(rule.actions))
                .filter((action) => action.name === CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO)
                .map((action) => action.approver);
            expect(forwardApprovers).toEqual([employee3Email]);
            expect(forwardApprovers).not.toContain(ownerEmail);
            for (const rule of rules) {
                expect(extractSubmitterEmails(rule)).toEqual([employee2Email]);
                expect(rule.isDefaultApprovalWorkflow).toBe(true);
            }

            await mockFetch.resume();
            await waitForBatchedUpdates();
        });
    });
});
