import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useApprovalWorkflows from '@hooks/useApprovalWorkflows';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

import React from 'react';
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

/** The default workflow, plus an "Approves to" user above an approval limit on the default approver. */
const OVER_LIMIT_APPROVER_EMPLOYEES: PolicyEmployeeList = {
    ...DEFAULT_WORKFLOW_EMPLOYEES,
    [OWNER_EMAIL]: {email: OWNER_EMAIL, role: CONST.POLICY.ROLE.ADMIN, approvalLimit: 10000, overLimitForwardsTo: APPROVER_EMAIL},
};

const buildPolicy = (policy: Partial<Policy>): Policy => ({
    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
    id: POLICY_ID,
    owner: OWNER_EMAIL,
    approver: OWNER_EMAIL,
    role: CONST.POLICY.ROLE.ADMIN,
    areWorkflowsEnabled: true,
    ...policy,
});

/** Build the index-keyed object shape the rules API uses for lists */
const indexMap = <T,>(...values: T[]): Record<string, T> => Object.fromEntries(values.map((value, index) => [String(index), value]));

/**
 * Write the pair of rules (submit -> forward, approve -> finalize) that describes a `submitters -> approver`
 * workflow, the way the `MULTIPLE_APPROVERS` builder does. Nothing is written to `employeeList`, which is exactly
 * why `approvalMode` stays stale for these workspaces.
 */
const createApprovalWorkflowRules = async (submitters: string[], approver: string) => {
    await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}rule1`, {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: POLICY_ID,
        triggers: indexMap(CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT),
        filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: submitters},
        actions: indexMap({name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO, approver}),
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}rule2`, {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: POLICY_ID,
        triggers: indexMap(CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_APPROVE),
        filters: {
            operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
            left: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: submitters},
            right: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO, right: approver},
        },
        actions: indexMap({name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.APPROVE_REPORT}),
    });
};

function Wrapper({children}: {children: React.ReactNode}) {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
}

const renderApprovalWorkflows = async (policy: Policy) => {
    const hook = renderHook(() => useApprovalWorkflows(policy, POLICY_ID), {wrapper: Wrapper});
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
        await Onyx.set(ONYXKEYS.BETAS, []);
        await waitForBatchedUpdates();
    });

    it('reports an advanced approval for a beta workspace whose custom workflow only exists in the rules, even though approvalMode is stale', async () => {
        // The reported bug: under `MULTIPLE_APPROVERS` the workflow is written only to the `RULE` collection, so
        // `approvalMode` is never promoted to ADVANCED and the old flag-based gate hid the Approver row.
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.MULTIPLE_APPROVERS]);
        await createApprovalWorkflowRules([SUBMITTER_EMAIL], APPROVER_EMAIL);
        const policy = buildPolicy({employeeList: DEFAULT_WORKFLOW_EMPLOYEES, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});

        const {result} = await renderApprovalWorkflows(policy);

        expect(result.current.filteredApprovalWorkflows.length).toBeGreaterThan(1);
        expect(result.current.isAdvanceApproval).toBe(true);
    });

    it('reports no advanced approval when a Control workspace only has the default workflow, even if approvalMode says ADVANCED', async () => {
        // This is the freshly-upgraded-workspace case: `approvalMode` is ADVANCED but no custom workflow was ever created.
        const policy = buildPolicy({employeeList: DEFAULT_WORKFLOW_EMPLOYEES, approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED});

        const {result} = await renderApprovalWorkflows(policy);

        expect(result.current.filteredApprovalWorkflows).toHaveLength(1);
        expect(result.current.isAdvanceApproval).toBe(false);
    });

    it('reports an advanced approval for a non-beta Control workspace whose employee list describes a custom workflow', async () => {
        const policy = buildPolicy({employeeList: CUSTOM_WORKFLOW_EMPLOYEES, approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED});

        const {result} = await renderApprovalWorkflows(policy);

        expect(result.current.filteredApprovalWorkflows.length).toBeGreaterThan(1);
        expect(result.current.isAdvanceApproval).toBe(true);
    });

    it('ignores extra non-beta workflows the workspace has not opted into, so it agrees with the Workflows tab', async () => {
        // Without the beta and without ADVANCED mode the Workflows tab only displays the default workflow, so the
        // invite page must not offer an approver for a workflow that surface refuses to show.
        const policy = buildPolicy({employeeList: CUSTOM_WORKFLOW_EMPLOYEES, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});

        const {result} = await renderApprovalWorkflows(policy);

        expect(result.current.approvalWorkflows.length).toBeGreaterThan(1);
        expect(result.current.filteredApprovalWorkflows).toHaveLength(1);
        expect(result.current.isAdvanceApproval).toBe(false);
    });

    it('reports an advanced approval when the default approver forwards above an approval limit', async () => {
        // `overLimitForwardsTo` does not extend the approver chain, so counting workflows and approvers misses it.
        const policy = buildPolicy({employeeList: OVER_LIMIT_APPROVER_EMPLOYEES, approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED});

        const {result} = await renderApprovalWorkflows(policy);

        expect(result.current.filteredApprovalWorkflows).toHaveLength(1);
        expect(result.current.isAdvanceApproval).toBe(true);
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
