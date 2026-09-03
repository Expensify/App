import {act, renderHook} from '@testing-library/react-native';

import useApprovalWorkflows from '@hooks/useApprovalWorkflows';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = 'policy123';
const OWNER_EMAIL = 'owner@mail.com';
const SUBMITTER_EMAIL = 'submitter@mail.com';
const APPROVER_EMAIL = 'approver@mail.com';

const buildEmployee = (email: string, submitsTo: string) => ({email, submitsTo, role: CONST.POLICY.ROLE.USER});

/** The default workflow only: everyone submits to the owner, who is the final approver. */
const DEFAULT_WORKFLOW_EMPLOYEES: PolicyEmployeeList = {
    [OWNER_EMAIL]: {email: OWNER_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
    [SUBMITTER_EMAIL]: buildEmployee(SUBMITTER_EMAIL, OWNER_EMAIL),
    [APPROVER_EMAIL]: buildEmployee(APPROVER_EMAIL, OWNER_EMAIL),
};

/** A custom workflow on top of the default one: one member submits to a non-owner approver. */
const CUSTOM_WORKFLOW_EMPLOYEES: PolicyEmployeeList = {
    ...DEFAULT_WORKFLOW_EMPLOYEES,
    [SUBMITTER_EMAIL]: buildEmployee(SUBMITTER_EMAIL, APPROVER_EMAIL),
};

const buildPolicy = (policy: Partial<Policy>): Policy => ({
    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
    id: POLICY_ID,
    owner: OWNER_EMAIL,
    role: CONST.POLICY.ROLE.ADMIN,
    areWorkflowsEnabled: true,
    ...policy,
});

const renderApprovalWorkflows = async (policy: Policy) => {
    const hook = renderHook(() => useApprovalWorkflows(policy, POLICY_ID));
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

describe('useApprovalWorkflows', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {email: OWNER_EMAIL, accountID: 1});
        await waitForBatchedUpdates();
    });

    it('reports an advanced approval when a Control workspace has a custom workflow, even if approvalMode is stale', async () => {
        const policy = buildPolicy({employeeList: CUSTOM_WORKFLOW_EMPLOYEES, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});

        const {result} = await renderApprovalWorkflows(policy);

        expect(result.current.approvalWorkflows.length).toBeGreaterThan(1);
        expect(result.current.isAdvanceApproval).toBe(true);
    });

    it('reports no advanced approval when a Control workspace only has the default workflow, even if approvalMode says ADVANCED', async () => {
        // This is the freshly-upgraded-workspace case: `approvalMode` is ADVANCED but no custom workflow was ever created.
        const policy = buildPolicy({employeeList: DEFAULT_WORKFLOW_EMPLOYEES, approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED});

        const {result} = await renderApprovalWorkflows(policy);

        expect(result.current.approvalWorkflows).toHaveLength(1);
        expect(result.current.isAdvanceApproval).toBe(false);
    });

    it('reports no advanced approval for a non-Control workspace with a custom workflow', async () => {
        const policy = buildPolicy({
            type: CONST.POLICY.TYPE.TEAM,
            employeeList: CUSTOM_WORKFLOW_EMPLOYEES,
            approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        });

        const {result} = await renderApprovalWorkflows(policy);

        expect(result.current.isAdvanceApproval).toBe(false);
    });
});
