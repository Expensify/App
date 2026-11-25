import {saveMemberApprovalWorkflow, selectMemberApprovalWorkflowDestination} from '@libs/actions/Workflow';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getApprovalWorkflowRulesForPolicy} from '@libs/RuleUtils';
import {buildApprovalWorkflowRules, convertApprovalWorkflowRulesToWorkflows, INITIAL_APPROVAL_WORKFLOW} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {ApprovalWorkflowOnyx} from '@src/types/onyx/ApprovalWorkflow';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import {localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({write: jest.fn()}));

const policyID = 'member-workflow-test';
const member = {email: 'member@example.com', displayName: 'Member'};
const peer = {email: 'peer@example.com', displayName: 'Peer'};
const destinationMember = {email: 'destination@example.com', displayName: 'Destination member'};
const sourceApprover = {email: 'source@example.com', displayName: 'Source'};
const destinationApprover = {email: 'approver@example.com', displayName: 'Approver'};
const finalApprover = {email: 'final@example.com', displayName: 'Final', overLimitAmount: 10000};
const source: ApprovalWorkflow = {members: [member, peer], approvers: [sourceApprover, finalApprover], isDefault: false};
const destination: ApprovalWorkflow = {members: [destinationMember], approvers: [destinationApprover, finalApprover], isDefault: false};

function buildPreview(): ApprovalWorkflowOnyx {
    return {
        ...INITIAL_APPROVAL_WORKFLOW,
        action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
        members: [member],
        approvers: source.approvers,
        originalApprovers: source.approvers,
        memberWorkflow: {policyID, member, isConfirmed: false},
    };
}

function buildPolicy(): Policy {
    return createMock<Policy>({
        id: policyID,
        approver: sourceApprover.email,
        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        employeeList: {
            [member.email]: {email: member.email, submitsTo: sourceApprover.email},
            [peer.email]: {email: peer.email, submitsTo: sourceApprover.email},
            [destinationMember.email]: {email: destinationMember.email, submitsTo: destinationApprover.email},
            [sourceApprover.email]: {email: sourceApprover.email, forwardsTo: finalApprover.email},
            [destinationApprover.email]: {email: destinationApprover.email, forwardsTo: finalApprover.email},
            [finalApprover.email]: {email: finalApprover.email},
        },
    });
}

async function getDraft() {
    const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
    if (!draft) {
        throw new Error('Expected a workflow draft');
    }
    return draft;
}

describe('Members approval workflow', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        jest.mocked(write).mockClear();
        await Onyx.clear();
    });

    it('does not write opening edits even when secondary approvers or limits changed', () => {
        // Given edits made before the destination scope was confirmed
        const draft = {...buildPreview(), approvers: [sourceApprover, {...finalApprover, overLimitAmount: 50000}]};
        // When saving is attempted outside the UI guard
        saveMemberApprovalWorkflow({approvalWorkflow: draft, policy: buildPolicy(), rules: {}, shouldUseApprovalWorkflowRules: false});
        // Then no request can persist the opening edits
        expect(write).not.toHaveBeenCalled();
    });

    it('discards previous secondary approvers and limits on create, without persisting on Confirm', async () => {
        // Given an opening chain with secondary approvers and limits
        const draft = buildPreview();
        // When a new first approver is confirmed
        selectMemberApprovalWorkflowDestination(draft, destinationApprover);
        await waitForBatchedUpdates();
        // Then the new draft starts from scratch for this member only
        expect((await getDraft()).approvers).toEqual([destinationApprover]);
        expect((await getDraft()).members).toEqual([member]);
        expect((await getDraft()).memberWorkflow?.isConfirmed).toBe(true);
        expect(write).not.toHaveBeenCalled();
    });

    it('loads all target members and conditions without duplicating a member already there', async () => {
        // Given a destination that already includes this member
        const target = {...destination, members: [destinationMember, member]};
        // When that destination is confirmed
        selectMemberApprovalWorkflowDestination(buildPreview(), destinationApprover, target);
        await waitForBatchedUpdates();
        // Then the draft reflects the full shared save scope, without a write
        expect((await getDraft()).members).toEqual(target.members);
        expect((await getDraft()).approvers).toEqual(target.approvers);
        expect(write).not.toHaveBeenCalled();
    });

    it('rolls back routing that was absent before a failed save', async () => {
        // Given a member without routing and an approver without an onward step
        const policy = buildPolicy();
        policy.employeeList = {...policy.employeeList, [member.email]: {email: member.email}, [destinationApprover.email]: {email: destinationApprover.email}};
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
        selectMemberApprovalWorkflowDestination(buildPreview(), destinationApprover, {...destination, approvers: [destinationApprover]});
        await waitForBatchedUpdates();
        // When a newly added forwarding step is saved and the request fails
        saveMemberApprovalWorkflow({
            approvalWorkflow: {...(await getDraft()), approvers: [destinationApprover, {...finalApprover, overLimitAmount: undefined}]},
            policy,
            rules: {},
            shouldUseApprovalWorkflowRules: false,
        });
        const data = jest.mocked(write).mock.lastCall?.[2];
        await Onyx.update(data?.optimisticData ?? []);
        expect((await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`))?.employeeList?.[destinationApprover.email]?.forwardsTo).toBe(finalApprover.email);
        await Onyx.update(data?.failureData ?? []);
        // Then omission in the old employee record must clear the optimistic values too
        const restored = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
        expect(restored?.employeeList?.[destinationApprover.email]?.forwardsTo).toBeUndefined();
        expect(restored?.employeeList?.[member.email]?.submitsTo).toBeUndefined();
    });

    it.each([false, true])('edits the shared destination while preserving source peers, with rollback feedback (rules=%s)', async (shouldUseApprovalWorkflowRules) => {
        // Given two groups of submitters on different chains
        const policy = buildPolicy();
        const rules: OnyxCollection<Rule> = {};
        for (const [index, workflow] of [source, destination].entries()) {
            for (const [ruleIndex, rule] of buildApprovalWorkflowRules(workflow).entries()) {
                const key = `${ONYXKEYS.COLLECTION.RULE}${index}-${ruleIndex}` as const;
                const scopedRule = {...rule, scope: CONST.RULES.SCOPE.POLICY, scopeID: policyID};
                rules[key] = scopedRule;
                if (shouldUseApprovalWorkflowRules) {
                    await Onyx.set(key, scopedRule);
                }
            }
        }
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
        selectMemberApprovalWorkflowDestination(buildPreview(), destinationApprover, destination);
        await waitForBatchedUpdates();
        // When the destination's secondary approver is removed and Save is pressed
        saveMemberApprovalWorkflow({approvalWorkflow: {...(await getDraft()), approvers: [destinationApprover]}, policy, rules, shouldUseApprovalWorkflowRules});
        const call = jest.mocked(write).mock.lastCall;
        expect(call?.[0]).toBe(shouldUseApprovalWorkflowRules ? WRITE_COMMANDS.SET_APPROVAL_WORKFLOW : WRITE_COMMANDS.UPDATE_WORKSPACE_APPROVAL);
        await Onyx.update(call?.[2]?.optimisticData ?? []);
        // Then the destination members share that edit, but source peers retain their original chain
        if (shouldUseApprovalWorkflowRules) {
            const updatedRules = (await getOnyxValue(ONYXKEYS.COLLECTION.RULE)) ?? {};
            const {approvalWorkflows} = convertApprovalWorkflowRulesToWorkflows({
                policy,
                personalDetails: {},
                rules: getApprovalWorkflowRulesForPolicy(updatedRules, policyID),
                localeCompare,
                currentUserLogin: '',
            });
            expect(approvalWorkflows.find((workflow) => workflow.members.some((entry) => entry.email === peer.email))?.approvers.map((approver) => approver.email)).toEqual(
                source.approvers.map((approver) => approver.email),
            );
            const joined = approvalWorkflows.find((workflow) => workflow.members.some((entry) => entry.email === member.email));
            expect(joined?.members.map((entry) => entry.email).sort()).toEqual([member.email, destinationMember.email].sort());
            expect(joined?.approvers.map((approver) => approver.email)).toEqual([destinationApprover.email]);
        } else {
            const params = call?.[1];
            if (!params || !('employees' in params)) {
                throw new Error('Expected employee routing changes');
            }
            expect(params.employees).not.toContain(`"email":"${peer.email}"`);
            expect(params.employees).not.toContain(`"email":"${sourceApprover.email}"`);
            expect((await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`))?.employeeList?.[member.email]?.submitsTo).toBe(destinationApprover.email);
        }
        // When the request fails, the old configuration and visible member error are restored together
        await Onyx.update(call?.[2]?.failureData ?? []);
        const restored = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
        expect(restored?.employeeList?.[member.email]?.submitsTo).toBe(sourceApprover.email);
        expect(restored?.employeeList?.[member.email]?.pendingFields?.submitsTo).toBeFalsy();
        expect(Object.values(restored?.employeeList?.[member.email]?.errorFields?.submitsTo ?? {})).toEqual([translateLocal('workflowsApproverPage.genericErrorMessage')]);
    });
});
