import Onyx from 'react-native-onyx';
import {INITIAL_APPROVAL_WORKFLOW} from '@libs/WorkflowUtils';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import {generatePolicyID} from '@src/libs/actions/Policy/Policy';
import * as Task from '@src/libs/actions/Task';
import {clearApprovalWorkflowApprover, createApprovalWorkflow, removeApprovalWorkflow, setApprovalWorkflowApprover, updateApprovalWorkflow} from '@src/libs/actions/Workflow';
import {calculateApprovers} from '@src/libs/WorkflowUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ApprovalWorkflowOnyx, PersonalDetailsList, Policy, Policy as PolicyType, Report} from '@src/types/onyx';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';
import createRandomPolicy from '../utils/collections/policies';
import getOnyxValue from '../utils/getOnyxValue';
import {getGlobalFetchMock, getOnyxData} from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/WorkflowUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@src/libs/WorkflowUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ...actual,
        calculateApprovers: jest.fn(),
    };
});

jest.mock('@src/libs/actions/Task', () => ({
    completeTask: jest.fn(),
}));

const calculateApproversMock = calculateApprovers as jest.Mock;
const completeTaskMock = Task.completeTask as jest.Mock;

OnyxUpdateManager();

const employee1Email = 'test1@gmail.com';
const employee2Email = 'test2@gmail.com';
const employee3Email = 'test3@gmail.com';
const ownerEmail = 'owner@gmail.com';

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
        global.fetch = getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
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

            const policy = {
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
            } as unknown as Policy;

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
            await getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                callback: (val) => (updatedPolicy = val),
            });

            expect(updatedPolicy?.employeeList?.[employee1Email]?.pendingFields).toBeUndefined();
            expect(updatedPolicy?.employeeList?.[employee2Email]?.pendingFields).toBeUndefined();
        });

        it('should auto-complete the addExpenseApprovals task when creating an approval workflow', async () => {
            mockFetch.pause();

            const policy = {
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
            } as unknown as Policy;

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

            expect(completeTaskMock).toHaveBeenCalledWith(addExpenseApprovalsTaskReport, false, false, undefined, undefined);
        });

        it('should not auto-complete the task if it is already approved', async () => {
            mockFetch.pause();

            const policy = {
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
            } as unknown as Policy;

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

            const policy = {
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
            } as unknown as Policy;

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
            const policy = {
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
            } as unknown as Policy;

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
            const policy = {
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
            } as unknown as Policy;

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
            const policy = {
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
            } as unknown as Policy;

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
            const policy = {
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
            } as unknown as Policy;

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
            const policy = {
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
            } as unknown as Policy;

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
            const policy = {
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
            } as unknown as Policy;

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
});
