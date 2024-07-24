/* eslint-disable @typescript-eslint/naming-convention */
import * as WorkflowUtils from '@src/libs/WorkflowUtils';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';
import * as TestHelper from '../utils/TestHelper';

const personalDetails: PersonalDetailsList = {};
const personalDetailsByEmail: PersonalDetailsList = {};

function buildApprover(accountID: number, approver: Partial<Approver> = {}): Approver {
    return {
        email: `${accountID}@example.com`,
        forwardsTo: undefined,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
        displayName: `${accountID}@example.com User`,
        isInMultipleWorkflows: false,
        isCircularReference: false,
        ...approver,
    };
}

describe('WorkflowUtils', () => {
    beforeAll(() => {
        for (let accountID = 0; accountID < 10; accountID++) {
            const email = `${accountID}@example.com`;
            personalDetails[accountID] = TestHelper.buildPersonalDetails(email, accountID, email);
            personalDetailsByEmail[email] = personalDetails[accountID];
        }
    });

    describe('getApprovalWorkflowApprovers', () => {
        it('Should return no approvers for empty employees object', () => {
            const employees: PolicyEmployeeList = {};
            const firstEmail = '1@example.com';
            const approvers = WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail, personalDetailsByEmail});

            expect(approvers).toEqual([]);
        });

        it('Should return just one approver if there is no forwardsTo', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                },
            };
            const firstEmail = '1@example.com';
            const approvers = WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail, personalDetailsByEmail});

            expect(approvers).toEqual([buildApprover(1)]);
        });

        it('Should return just one approver if there is no forwardsTo', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                },
            };
            const firstEmail = '1@example.com';
            const approvers = WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail, personalDetailsByEmail});

            expect(approvers).toEqual([buildApprover(1)]);
        });

        it('Should return a list of approver when there are forwardsTo', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '2@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: '3@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: '4@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: undefined,
                },
                '5@example.com': {
                    email: '5@example.com',
                    forwardsTo: undefined,
                },
            };

            expect(WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(1, {forwardsTo: '2@example.com'}),
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
            expect(WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail: '2@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
            expect(WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail: '3@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
        });

        it('Should return a list of approver when there are forwardsTo', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '2@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: '3@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: '4@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: undefined,
                },
                '5@example.com': {
                    email: '5@example.com',
                    forwardsTo: undefined,
                },
            };

            expect(WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(1, {forwardsTo: '2@example.com'}),
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
            expect(WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail: '2@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
            expect(WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail: '3@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
        });

        it('Should return a list of approver with circular references', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '2@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: '3@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: '4@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: '5@example.com',
                },
                '5@example.com': {
                    email: '5@example.com',
                    forwardsTo: '1@example.com',
                },
            };

            expect(WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(1, {forwardsTo: '2@example.com'}),
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4, {forwardsTo: '5@example.com'}),
                buildApprover(5, {forwardsTo: '1@example.com'}),
                buildApprover(1, {forwardsTo: '2@example.com', isCircularReference: true}),
            ]);
            expect(WorkflowUtils.getApprovalWorkflowApprovers({employees, firstEmail: '2@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4, {forwardsTo: '5@example.com'}),
                buildApprover(5, {forwardsTo: '1@example.com'}),
                buildApprover(1, {forwardsTo: '2@example.com'}),
                buildApprover(2, {forwardsTo: '3@example.com', isCircularReference: true}),
            ]);
        });
    });
});
