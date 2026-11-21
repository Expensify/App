import {buildApprovalWorkflowRules, convertApprovalWorkflowRulesToWorkflows} from '@libs/WorkflowUtils';

import type {Policy, PolicyEmployeeList} from '@src/types/onyx';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {ApprovalWorkflowRule} from '@src/types/onyx/ApprovalWorkflowRules';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

import {measureFunction} from 'reassure';

import createRandomPolicy from '../utils/collections/policies';
import {localeCompare} from '../utils/TestHelper';

const MEMBERS_PER_WORKFLOW = 10;
const APPROVERS_PER_WORKFLOW = 3;

function getEmail(index: number): string {
    return `${index}@example.com`;
}

/**
 * Build a policy whose employees are split into workflows of 10 members, each routed through 3 approvers by rules.
 */
function buildPolicyWithRules(employeeCount: number): {policy: Policy; personalDetails: PersonalDetailsList; rules: Record<string, ApprovalWorkflowRule>} {
    const employeeList: PolicyEmployeeList = {};
    const personalDetails: PersonalDetailsList = {};
    const rules: Record<string, ApprovalWorkflowRule> = {};

    for (let index = 0; index < employeeCount; index++) {
        const email = getEmail(index);
        employeeList[email] = {email};
        personalDetails[index] = {accountID: index, login: email, displayName: email};
    }

    let ruleIndex = 0;
    for (let start = 0; start < employeeCount; start += MEMBERS_PER_WORKFLOW) {
        const memberIndexes = Array.from({length: Math.min(MEMBERS_PER_WORKFLOW, employeeCount - start)}, (_, offset) => start + offset);
        const approverIndexes = Array.from({length: APPROVERS_PER_WORKFLOW}, (_, offset) => (start + MEMBERS_PER_WORKFLOW + offset) % employeeCount);
        const workflow: ApprovalWorkflow = {
            members: memberIndexes.map((index) => ({email: getEmail(index), displayName: getEmail(index)})),
            approvers: approverIndexes.map((index) => ({email: getEmail(index), displayName: getEmail(index), isCircularReference: false})),
            isDefault: start === 0,
        };
        for (const rule of buildApprovalWorkflowRules(workflow)) {
            rules[`rule${ruleIndex++}`] = rule;
        }
    }

    const policy: Policy = {
        ...createRandomPolicy(1),
        owner: getEmail(0),
        approver: getEmail(MEMBERS_PER_WORKFLOW),
        employeeList,
    };

    return {policy, personalDetails, rules};
}

describe('WorkflowUtils', () => {
    describe('convertApprovalWorkflowRulesToWorkflows', () => {
        test.each([100, 1000, 5000])('%i employees', async (employeeCount) => {
            // Given a workspace with many employees routed by approval rules, because the members and workflows pages convert them on every render
            const {policy, personalDetails, rules} = buildPolicyWithRules(employeeCount);

            // When converting the rules to workflows
            // Then the time should grow linearly with the number of employees, since each submitter's rules are looked up in a Map
            await measureFunction(() => convertApprovalWorkflowRulesToWorkflows({policy, personalDetails, localeCompare, rules}));
        });
    });
});
