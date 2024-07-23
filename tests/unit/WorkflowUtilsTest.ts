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
            personalDetailsByEmail[email] = personalDetails[email];
        }
    });

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
});
