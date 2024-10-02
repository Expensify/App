/* eslint-disable @typescript-eslint/naming-convention */
import * as WorkflowUtils from '@src/libs/WorkflowUtils';
import type {Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import * as TestHelper from '../utils/TestHelper';

const personalDetails: PersonalDetailsList = {};
const personalDetailsByEmail: PersonalDetailsList = {};

function buildPolicyEmployee(accountID: number, policyEmployee: Partial<PolicyEmployee> = {}): PolicyEmployee {
    return {
        email: `${accountID}@example.com`,
        pendingAction: 'add',
        ...policyEmployee,
    };
}

function buildMember(accountID: number): Member {
    return {
        email: `${accountID}@example.com`,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
        displayName: `${accountID}@example.com User`,
    };
}

function buildApprover(accountID: number, approver: Partial<Approver> = {}): Approver {
    return {
        email: `${accountID}@example.com`,
        forwardsTo: undefined,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
        displayName: `${accountID}@example.com User`,
        isCircularReference: false,
        ...approver,
    };
}

function buildWorkflow(memberIDs: number[], approverIDs: number[], workflow: Partial<ApprovalWorkflow> = {}): ApprovalWorkflow {
    return {
        members: memberIDs.map(buildMember),
        approvers: approverIDs.map((id) => buildApprover(id)),
        isDefault: false,
        ...workflow,
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

    describe('calculateApprovers', () => {
        it('Should return no approvers for empty employees object', () => {
            const employees: PolicyEmployeeList = {};
            const firstEmail = '1@example.com';
            const approvers = WorkflowUtils.calculateApprovers({employees, firstEmail, personalDetailsByEmail});

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
            const approvers = WorkflowUtils.calculateApprovers({employees, firstEmail, personalDetailsByEmail});

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
            const approvers = WorkflowUtils.calculateApprovers({employees, firstEmail, personalDetailsByEmail});

            expect(approvers).toEqual([buildApprover(1)]);
        });

        it('Should return a list of approvers when forwardsTo is defined', () => {
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

            expect(WorkflowUtils.calculateApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(1, {forwardsTo: '2@example.com'}),
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
            expect(WorkflowUtils.calculateApprovers({employees, firstEmail: '2@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
            expect(WorkflowUtils.calculateApprovers({employees, firstEmail: '3@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
        });

        it('Should return a list of approvers with circular references', () => {
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

            expect(WorkflowUtils.calculateApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(1, {forwardsTo: '2@example.com'}),
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4, {forwardsTo: '5@example.com'}),
                buildApprover(5, {forwardsTo: '1@example.com'}),
                buildApprover(1, {forwardsTo: '2@example.com', isCircularReference: true}),
            ]);
            expect(WorkflowUtils.calculateApprovers({employees, firstEmail: '2@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4, {forwardsTo: '5@example.com'}),
                buildApprover(5, {forwardsTo: '1@example.com'}),
                buildApprover(1, {forwardsTo: '2@example.com'}),
                buildApprover(2, {forwardsTo: '3@example.com', isCircularReference: true}),
            ]);
        });

        it('Should return a list of approvers with circular references', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '1@example.com',
                },
            };

            expect(WorkflowUtils.calculateApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(1, {forwardsTo: '1@example.com'}),
                buildApprover(1, {forwardsTo: '1@example.com', isCircularReference: true}),
            ]);
        });
    });

    describe('convertPolicyEmployeesToApprovalWorkflows', () => {
        it('Should return an empty list if there are no employees', () => {
            const employees: PolicyEmployeeList = {};
            const defaultApprover = '1@example.com';

            const {approvalWorkflows} = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({employees, defaultApprover, personalDetails});

            expect(approvalWorkflows).toEqual([]);
        });

        it('Should transform all users into one default workflow', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
            };
            const defaultApprover = '1@example.com';

            const {approvalWorkflows} = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({employees, defaultApprover, personalDetails});

            expect(approvalWorkflows).toEqual([buildWorkflow([1, 2], [1], {isDefault: true})]);
        });

        it('Should transform all users into two workflows', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
            };
            const defaultApprover = '1@example.com';

            const {approvalWorkflows} = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({employees, defaultApprover, personalDetails});

            expect(approvalWorkflows).toEqual([buildWorkflow([2, 3], [1], {isDefault: true}), buildWorkflow([1, 4], [4])]);
        });

        it('Should sort the workflows (first the default and then based on the first approver display name)', () => {
            const employees: PolicyEmployeeList = {
                '5@example.com': {
                    email: '5@example.com',
                    forwardsTo: undefined,
                    submitsTo: '3@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
            };
            const defaultApprover = '1@example.com';

            const {approvalWorkflows} = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({employees, defaultApprover, personalDetails});

            expect(approvalWorkflows).toEqual([buildWorkflow([3, 2], [1], {isDefault: true}), buildWorkflow([5], [3]), buildWorkflow([4, 1], [4])]);
        });

        it('Should mark approvers that are used in multiple workflows', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '3@example.com',
                    submitsTo: '2@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: '3@example.com',
                    submitsTo: '1@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: '4@example.com',
                    submitsTo: '1@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
            };
            const defaultApprover = '1@example.com';

            const {approvalWorkflows} = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({employees, defaultApprover, personalDetails});

            const defaultWorkflow = buildWorkflow([2, 3, 4], [1, 3, 4], {isDefault: true});
            let firstApprover = defaultWorkflow.approvers.at(0);
            let secondApprover = defaultWorkflow.approvers.at(1);
            if (firstApprover && secondApprover) {
                firstApprover.forwardsTo = '3@example.com';
                secondApprover.forwardsTo = '4@example.com';
            }
            const secondWorkflow = buildWorkflow([1], [2, 3, 4]);
            firstApprover = secondWorkflow.approvers.at(0);
            secondApprover = secondWorkflow.approvers.at(1);
            if (firstApprover && secondApprover) {
                firstApprover.forwardsTo = '3@example.com';
                secondApprover.forwardsTo = '4@example.com';
            }

            expect(approvalWorkflows).toEqual([defaultWorkflow, secondWorkflow]);
        });

        it('Should build multiple workflows with many approvers', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: undefined,
                    submitsTo: '4@example.com',
                },
                '4@example.com': {
                    email: '4@example.com',
                    forwardsTo: '5@example.com',
                    submitsTo: '1@example.com',
                },
                '5@example.com': {
                    email: '5@example.com',
                    forwardsTo: '6@example.com',
                    submitsTo: '1@example.com',
                },
                '6@example.com': {
                    email: '6@example.com',
                    forwardsTo: undefined,
                    submitsTo: '1@example.com',
                },
            };
            const defaultApprover = '1@example.com';

            const {approvalWorkflows} = WorkflowUtils.convertPolicyEmployeesToApprovalWorkflows({employees, defaultApprover, personalDetails});

            const defaultWorkflow = buildWorkflow([1, 4, 5, 6], [1], {isDefault: true});
            const secondWorkflow = buildWorkflow([2, 3], [4, 5, 6]);
            const firstApprover = secondWorkflow.approvers.at(0);
            const secondApprover = secondWorkflow.approvers.at(1);

            if (firstApprover && secondApprover) {
                firstApprover.forwardsTo = '5@example.com';
                secondApprover.forwardsTo = '6@example.com';
            }
            expect(approvalWorkflows).toEqual([defaultWorkflow, secondWorkflow]);
        });
    });

    describe('convertApprovalWorkflowToPolicyEmployees', () => {
        it('Should return an updated employee list for a simple default workflow', () => {
            const approvalWorkflow: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: true,
            };

            const convertedEmployees = WorkflowUtils.convertApprovalWorkflowToPolicyEmployees({previousEmployeeList: {}, approvalWorkflow, type: 'create'});

            expect(convertedEmployees).toEqual({
                '1@example.com': buildPolicyEmployee(1, {forwardsTo: '', submitsTo: '1@example.com'}),
                '2@example.com': buildPolicyEmployee(2, {submitsTo: '1@example.com'}),
            });
        });

        it('Should return an updated employee list for a complex workflow', () => {
            const approvalWorkflow: ApprovalWorkflow = {
                members: [buildMember(4), buildMember(5), buildMember(6)],
                approvers: [buildApprover(1, {forwardsTo: '2@example.com'}), buildApprover(2, {forwardsTo: '2@example.com'}), buildApprover(3)],
                isDefault: false,
            };

            const convertedEmployees = WorkflowUtils.convertApprovalWorkflowToPolicyEmployees({previousEmployeeList: {}, approvalWorkflow, type: 'create'});

            expect(convertedEmployees).toEqual({
                '1@example.com': buildPolicyEmployee(1, {forwardsTo: '2@example.com'}),
                '2@example.com': buildPolicyEmployee(2, {forwardsTo: '3@example.com'}),
                '3@example.com': buildPolicyEmployee(3, {forwardsTo: ''}),
                '4@example.com': buildPolicyEmployee(4, {submitsTo: '1@example.com'}),
                '5@example.com': buildPolicyEmployee(5, {submitsTo: '1@example.com'}),
                '6@example.com': buildPolicyEmployee(6, {submitsTo: '1@example.com'}),
            });
        });

        it('Should return an updated employee list for a complex workflow when removing', () => {
            const approvalWorkflow: ApprovalWorkflow = {
                members: [buildMember(4), buildMember(5), buildMember(6)],
                approvers: [buildApprover(1, {forwardsTo: '2@example.com'}), buildApprover(2, {forwardsTo: '2@example.com'}), buildApprover(3)],
                isDefault: false,
            };

            const convertedEmployees = WorkflowUtils.convertApprovalWorkflowToPolicyEmployees({previousEmployeeList: {}, approvalWorkflow, type: 'remove'});

            expect(convertedEmployees).toEqual({
                '1@example.com': buildPolicyEmployee(1, {forwardsTo: '', pendingAction: 'update'}),
                '2@example.com': buildPolicyEmployee(2, {forwardsTo: '', pendingAction: 'update'}),
                '3@example.com': buildPolicyEmployee(3, {forwardsTo: '', pendingAction: 'update'}),
                '4@example.com': buildPolicyEmployee(4, {submitsTo: '', pendingAction: 'update'}),
                '5@example.com': buildPolicyEmployee(5, {submitsTo: '', pendingAction: 'update'}),
                '6@example.com': buildPolicyEmployee(6, {submitsTo: '', pendingAction: 'update'}),
            });
        });
    });
});
