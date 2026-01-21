/* eslint-disable @typescript-eslint/naming-convention */
import CONST from '@src/CONST';
import {
    calculateApprovers,
    convertApprovalWorkflowToPolicyEmployees,
    convertPolicyEmployeesToApprovalWorkflows,
    getApprovalLimitDescription,
    getOpenConnectedToPolicyBusinessBankAccounts,
    updateWorkflowDataOnApproverRemoval,
} from '@src/libs/WorkflowUtils';
import type {Policy} from '@src/types/onyx';
import type {Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {BankAccountList} from '@src/types/onyx/BankAccount';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import createRandomPolicy from '../utils/collections/policies';
import {buildPersonalDetails, localeCompare} from '../utils/TestHelper';

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
            personalDetails[accountID] = buildPersonalDetails(email, accountID, email);
            personalDetailsByEmail[email] = personalDetails[accountID];
        }
    });

    describe('calculateApprovers', () => {
        it('Should return no approvers for empty employees object', () => {
            const employees: PolicyEmployeeList = {};
            const firstEmail = '1@example.com';
            const approvers = calculateApprovers({employees, firstEmail, personalDetailsByEmail});

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
            const approvers = calculateApprovers({employees, firstEmail, personalDetailsByEmail});

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
            const approvers = calculateApprovers({employees, firstEmail, personalDetailsByEmail});

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

            expect(calculateApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(1, {forwardsTo: '2@example.com'}),
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
            expect(calculateApprovers({employees, firstEmail: '2@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4),
            ]);
            expect(calculateApprovers({employees, firstEmail: '3@example.com', personalDetailsByEmail})).toEqual([buildApprover(3, {forwardsTo: '4@example.com'}), buildApprover(4)]);
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

            expect(calculateApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(1, {forwardsTo: '2@example.com'}),
                buildApprover(2, {forwardsTo: '3@example.com'}),
                buildApprover(3, {forwardsTo: '4@example.com'}),
                buildApprover(4, {forwardsTo: '5@example.com'}),
                buildApprover(5, {forwardsTo: '1@example.com'}),
                buildApprover(1, {forwardsTo: '2@example.com', isCircularReference: true}),
            ]);
            expect(calculateApprovers({employees, firstEmail: '2@example.com', personalDetailsByEmail})).toEqual([
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

            expect(calculateApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail})).toEqual([
                buildApprover(1, {forwardsTo: '1@example.com'}),
                buildApprover(1, {forwardsTo: '1@example.com', isCircularReference: true}),
            ]);
        });

        it('Should include approvalLimit and overLimitForwardsTo in approver objects', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '2@example.com',
                    approvalLimit: 50000,
                    overLimitForwardsTo: '3@example.com',
                },
                '2@example.com': {
                    email: '2@example.com',
                    forwardsTo: undefined,
                    approvalLimit: 100000,
                    overLimitForwardsTo: '3@example.com',
                },
                '3@example.com': {
                    email: '3@example.com',
                    forwardsTo: undefined,
                },
            };

            const approvers = calculateApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail});

            expect(approvers).toEqual([
                buildApprover(1, {forwardsTo: '2@example.com', approvalLimit: 50000, overLimitForwardsTo: '3@example.com'}),
                buildApprover(2, {approvalLimit: 100000, overLimitForwardsTo: '3@example.com'}),
            ]);
        });

        it('Should handle null approvalLimit correctly', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    approvalLimit: null,
                    overLimitForwardsTo: '',
                },
            };

            const approvers = calculateApprovers({employees, firstEmail: '1@example.com', personalDetailsByEmail});

            expect(approvers).toEqual([buildApprover(1, {approvalLimit: null, overLimitForwardsTo: ''})]);
        });
    });

    describe('convertPolicyEmployeesToApprovalWorkflows', () => {
        const createMockPolicy = (employees: PolicyEmployeeList, defaultApprover: string) => ({
            id: 'test-policy',
            name: 'Test Policy',
            role: 'admin' as const,
            type: 'team' as const,
            owner: 'owner@example.com',
            outputCurrency: 'USD',
            isPolicyExpenseChatEnabled: true,
            employeeList: employees,
            approver: defaultApprover,
        });

        it('Should return an empty list if there are no employees', () => {
            const employees: PolicyEmployeeList = {};
            const defaultApprover = '1@example.com';
            const policy = createMockPolicy(employees, defaultApprover);

            const {approvalWorkflows} = convertPolicyEmployeesToApprovalWorkflows({policy, personalDetails, localeCompare});

            expect(approvalWorkflows).toEqual([]);
        });

        it('Should not include users that submit to non-employee user', () => {
            const employees: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: undefined,
                    submitsTo: '2@example.com',
                },
            };
            const defaultApprover = '1@example.com';
            const policy = createMockPolicy(employees, defaultApprover);

            const {approvalWorkflows} = convertPolicyEmployeesToApprovalWorkflows({policy, personalDetails, localeCompare});

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
            const policy = createMockPolicy(employees, defaultApprover);

            const {approvalWorkflows} = convertPolicyEmployeesToApprovalWorkflows({policy, personalDetails, localeCompare});

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
            const policy = createMockPolicy(employees, defaultApprover);

            const {approvalWorkflows} = convertPolicyEmployeesToApprovalWorkflows({policy, personalDetails, localeCompare});

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
            const policy = createMockPolicy(employees, defaultApprover);

            const {approvalWorkflows} = convertPolicyEmployeesToApprovalWorkflows({policy, personalDetails, localeCompare});

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
            const policy = createMockPolicy(employees, defaultApprover);

            const {approvalWorkflows} = convertPolicyEmployeesToApprovalWorkflows({policy, personalDetails, localeCompare});

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
            const policy = createMockPolicy(employees, defaultApprover);

            const {approvalWorkflows} = convertPolicyEmployeesToApprovalWorkflows({policy, personalDetails, localeCompare});

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

            const convertedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList: {}, approvalWorkflow, type: 'create'});

            expect(convertedEmployees).toEqual({
                '1@example.com': buildPolicyEmployee(1, {forwardsTo: '', overLimitForwardsTo: '', submitsTo: '1@example.com', pendingFields: {submitsTo: 'add'}}),
                '2@example.com': buildPolicyEmployee(2, {submitsTo: '1@example.com', pendingFields: {submitsTo: 'add'}}),
            });
        });

        it('Should return an updated employee list for a complex workflow', () => {
            const approvalWorkflow: ApprovalWorkflow = {
                members: [buildMember(4), buildMember(5), buildMember(6)],
                approvers: [buildApprover(1, {forwardsTo: '2@example.com'}), buildApprover(2, {forwardsTo: '2@example.com'}), buildApprover(3)],
                isDefault: false,
            };

            const convertedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList: {}, approvalWorkflow, type: 'create'});

            expect(convertedEmployees).toEqual({
                '1@example.com': buildPolicyEmployee(1, {forwardsTo: '2@example.com', overLimitForwardsTo: '', pendingFields: {forwardsTo: 'add', overLimitForwardsTo: 'add'}}),
                '2@example.com': buildPolicyEmployee(2, {forwardsTo: '3@example.com', overLimitForwardsTo: '', pendingFields: {forwardsTo: 'add', overLimitForwardsTo: 'add'}}),
                '3@example.com': buildPolicyEmployee(3, {forwardsTo: '', overLimitForwardsTo: '', pendingFields: {forwardsTo: 'add', overLimitForwardsTo: 'add'}}),
                '4@example.com': buildPolicyEmployee(4, {submitsTo: '1@example.com', pendingFields: {submitsTo: 'add'}}),
                '5@example.com': buildPolicyEmployee(5, {submitsTo: '1@example.com', pendingFields: {submitsTo: 'add'}}),
                '6@example.com': buildPolicyEmployee(6, {submitsTo: '1@example.com', pendingFields: {submitsTo: 'add'}}),
            });
        });

        it('Should return an updated employee list for a complex workflow when removing', () => {
            const approvalWorkflow: ApprovalWorkflow = {
                members: [buildMember(4), buildMember(5), buildMember(6)],
                approvers: [buildApprover(1, {forwardsTo: '2@example.com'}), buildApprover(2, {forwardsTo: '2@example.com'}), buildApprover(3)],
                isDefault: false,
            };

            const convertedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList: {}, approvalWorkflow, type: 'remove'});

            expect(convertedEmployees).toEqual({
                '1@example.com': buildPolicyEmployee(1, {
                    forwardsTo: '',
                    approvalLimit: null,
                    overLimitForwardsTo: '',
                    pendingAction: 'update',
                    pendingFields: {forwardsTo: 'update', approvalLimit: 'update', overLimitForwardsTo: 'update'},
                }),
                '2@example.com': buildPolicyEmployee(2, {
                    forwardsTo: '',
                    approvalLimit: null,
                    overLimitForwardsTo: '',
                    pendingAction: 'update',
                    pendingFields: {forwardsTo: 'update', approvalLimit: 'update', overLimitForwardsTo: 'update'},
                }),
                '3@example.com': buildPolicyEmployee(3, {
                    forwardsTo: '',
                    approvalLimit: null,
                    overLimitForwardsTo: '',
                    pendingAction: 'update',
                    pendingFields: {forwardsTo: 'update', approvalLimit: 'update', overLimitForwardsTo: 'update'},
                }),
                '4@example.com': buildPolicyEmployee(4, {submitsTo: '', pendingAction: 'update', pendingFields: {submitsTo: 'update'}}),
                '5@example.com': buildPolicyEmployee(5, {submitsTo: '', pendingAction: 'update', pendingFields: {submitsTo: 'update'}}),
                '6@example.com': buildPolicyEmployee(6, {submitsTo: '', pendingAction: 'update', pendingFields: {submitsTo: 'update'}}),
            });
        });

        it('Should include approvalLimit and overLimitForwardsTo when creating workflow with limits', () => {
            const approvalWorkflow: ApprovalWorkflow = {
                members: [buildMember(2)],
                approvers: [buildApprover(1, {approvalLimit: 50000, overLimitForwardsTo: '3@example.com'})],
                isDefault: false,
            };

            const convertedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList: {}, approvalWorkflow, type: 'create'});

            expect(convertedEmployees).toEqual({
                '1@example.com': buildPolicyEmployee(1, {
                    forwardsTo: '',
                    approvalLimit: 50000,
                    overLimitForwardsTo: '3@example.com',
                    pendingFields: {forwardsTo: 'add', approvalLimit: 'add', overLimitForwardsTo: 'add'},
                }),
                '2@example.com': buildPolicyEmployee(2, {submitsTo: '1@example.com', pendingFields: {submitsTo: 'add'}}),
            });
        });

        it('Should set approvalLimit to null when removing workflow (not undefined)', () => {
            const previousEmployeeList: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '2@example.com',
                    approvalLimit: 50000,
                    overLimitForwardsTo: '3@example.com',
                },
            };
            const approvalWorkflow: ApprovalWorkflow = {
                members: [],
                approvers: [buildApprover(1, {forwardsTo: '2@example.com', approvalLimit: 50000, overLimitForwardsTo: '3@example.com'})],
                isDefault: false,
            };

            const convertedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList, approvalWorkflow, type: 'remove'});

            // approvalLimit should be null (not undefined) so it gets sent to the API and clears the field
            expect(convertedEmployees['1@example.com']?.approvalLimit).toBeNull();
            expect(convertedEmployees['1@example.com']?.overLimitForwardsTo).toBe('');
        });

        it('Should include pendingFields for approvalLimit and overLimitForwardsTo when they change', () => {
            const previousEmployeeList: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '',
                    approvalLimit: 50000,
                    overLimitForwardsTo: '3@example.com',
                },
            };
            const approvalWorkflow: ApprovalWorkflow = {
                members: [],
                approvers: [buildApprover(1, {approvalLimit: 100000, overLimitForwardsTo: '4@example.com'})],
                isDefault: false,
            };

            const convertedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList, approvalWorkflow, type: 'update'});

            // pendingFields should include the fields that changed (forwardsTo didn't change since it's '' -> '')
            expect(convertedEmployees['1@example.com']?.pendingFields).toEqual({
                approvalLimit: 'update',
                overLimitForwardsTo: 'update',
            });
            expect(convertedEmployees['1@example.com']?.approvalLimit).toBe(100000);
            expect(convertedEmployees['1@example.com']?.overLimitForwardsTo).toBe('4@example.com');
        });

        it('Should not include unchanged fields in pendingFields', () => {
            const previousEmployeeList: PolicyEmployeeList = {
                '1@example.com': {
                    email: '1@example.com',
                    forwardsTo: '',
                    approvalLimit: 50000,
                    overLimitForwardsTo: '3@example.com',
                },
            };
            const approvalWorkflow: ApprovalWorkflow = {
                members: [],
                approvers: [buildApprover(1, {approvalLimit: 50000, overLimitForwardsTo: '4@example.com'})],
                isDefault: false,
            };

            const convertedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList, approvalWorkflow, type: 'update'});

            // Only overLimitForwardsTo changed, so only that should be in pendingFields
            expect(convertedEmployees['1@example.com']?.pendingFields).toEqual({
                overLimitForwardsTo: 'update',
            });
        });
    });

    describe('updateWorkflowDataOnApproverRemoval', () => {
        it('Should remove Workflow 2 if its approvers are removed and it has no approvers, with Workspace (default) having the approver as the Workspace Owner.', () => {
            const approvalWorkflow1: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: true,
            };
            const approvalWorkflow2: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(2)],
                isDefault: false,
            };

            const ownerDetails = personalDetails[1];
            const removedApprover = personalDetails[2];

            if (!removedApprover || !ownerDetails) {
                return;
            }

            const updateWorkflowDataOnApproverRemovalResult = updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover,
                ownerDetails,
            });

            expect(updateWorkflowDataOnApproverRemovalResult).toEqual([approvalWorkflow1, {...approvalWorkflow2, removeApprovalWorkflow: true}]);
        });
        it('Should replace the approvers in Workflow 2 with the Workspace Owner if it has no approvers and the approver in Workspace (default) is different from the Workspace Owner', () => {
            const approvalWorkflow1: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(3)],
                isDefault: true,
            };
            const approvalWorkflow2: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(2)],
                isDefault: false,
            };

            const ownerDetails = personalDetails[1];
            const removedApprover = personalDetails[2];

            if (!removedApprover || !ownerDetails) {
                return;
            }

            const updateWorkflowDataOnApproverRemovalResult = updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover,
                ownerDetails,
            });

            expect(updateWorkflowDataOnApproverRemovalResult).toEqual([approvalWorkflow1, {...approvalWorkflow2, approvers: [buildApprover(1)]}]);
        });
        it('Should remove Workflow 2 if its approver is the Workspace Owner and the default Workspace approver is removed.', () => {
            const approvalWorkflow1: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(3)],
                isDefault: true,
            };
            const approvalWorkflow2: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: false,
            };

            const ownerDetails = personalDetails[1];
            const removedApprover = personalDetails[3];

            if (!removedApprover || !ownerDetails) {
                return;
            }

            const updateWorkflowDataOnApproverRemovalResult = updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover,
                ownerDetails,
            });

            expect(updateWorkflowDataOnApproverRemovalResult).toEqual([
                {...approvalWorkflow1, approvers: [buildApprover(1)]},
                {...approvalWorkflow2, removeApprovalWorkflow: true},
            ]);
        });
        it('Should replace the latest approver of Workflow 2 with the Workspace Owner if the latest approver of Workflow 2 is removed', () => {
            const approvalWorkflow1: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: true,
            };
            const approvalWorkflow2: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(2), buildApprover(3), buildApprover(4)],
                isDefault: false,
            };

            const ownerDetails = personalDetails[1];
            const removedApprover = personalDetails[4];

            if (!removedApprover || !ownerDetails) {
                return;
            }

            const updateWorkflowDataOnApproverRemovalResult = updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover,
                ownerDetails,
            });

            expect(updateWorkflowDataOnApproverRemovalResult).toEqual([approvalWorkflow1, {...approvalWorkflow2, approvers: [buildApprover(2), buildApprover(3), buildApprover(1)]}]);
        });
        it('Should remove the approvers that have submitsTo set to the removed approver, update the removed approver to the Workspace Owner, and ensure there was a previous approver before this one', () => {
            const approvalWorkflow1: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: true,
            };
            const approvalWorkflow2: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(2), buildApprover(3), buildApprover(4)],
                isDefault: false,
            };

            const ownerDetails = personalDetails[1];
            const removedApprover = personalDetails[3];

            if (!removedApprover || !ownerDetails) {
                return;
            }

            const updateWorkflowDataOnApproverRemovalResult = updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover,
                ownerDetails,
            });

            expect(updateWorkflowDataOnApproverRemovalResult).toEqual([approvalWorkflow1, {...approvalWorkflow2, approvers: [buildApprover(2), buildApprover(1)]}]);
        });
        it('Should remove Workflow 2 if it has no approvers and the default Workspace approver is the approve', () => {
            const approvalWorkflow1: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(1)],
                isDefault: true,
            };
            const approvalWorkflow2: ApprovalWorkflow = {
                members: [buildMember(1), buildMember(2)],
                approvers: [buildApprover(2), buildApprover(3), buildApprover(4)],
                isDefault: false,
            };

            const ownerDetails = personalDetails[1];
            const removedApprover = personalDetails[2];

            if (!removedApprover || !ownerDetails) {
                return;
            }

            const updateWorkflowDataOnApproverRemovalResult = updateWorkflowDataOnApproverRemoval({
                approvalWorkflows: [approvalWorkflow1, approvalWorkflow2],
                removedApprover,
                ownerDetails,
            });

            expect(updateWorkflowDataOnApproverRemovalResult).toEqual([approvalWorkflow1, {...approvalWorkflow2, removeApprovalWorkflow: true}]);
        });
    });

    describe('getApprovalLimitDescription', () => {
        const mockTranslate = jest.fn((key: string, params?: Record<string, string>) => {
            if (key === 'workflowsApprovalLimitPage.forwardLimitDescription') {
                return `Reports above ${params?.approvalLimit} forward to ${params?.approverName}`;
            }
            return key;
        });

        beforeEach(() => {
            mockTranslate.mockClear();
        });

        it('Should return undefined when approver is undefined', () => {
            const result = getApprovalLimitDescription({
                approver: undefined,
                currency: 'USD',
                translate: mockTranslate as unknown as Parameters<typeof getApprovalLimitDescription>[0]['translate'],
                personalDetailsByEmail: {},
            });

            expect(result).toBeUndefined();
        });

        it('Should return undefined when approvalLimit is null', () => {
            const approver = buildApprover(1, {approvalLimit: null, overLimitForwardsTo: '2@example.com'});

            const result = getApprovalLimitDescription({
                approver,
                currency: 'USD',
                translate: mockTranslate as unknown as Parameters<typeof getApprovalLimitDescription>[0]['translate'],
                personalDetailsByEmail: {},
            });

            expect(result).toBeUndefined();
        });

        it('Should return undefined when approvalLimit is undefined', () => {
            const approver = buildApprover(1, {approvalLimit: undefined, overLimitForwardsTo: '2@example.com'});

            const result = getApprovalLimitDescription({
                approver,
                currency: 'USD',
                translate: mockTranslate as unknown as Parameters<typeof getApprovalLimitDescription>[0]['translate'],
                personalDetailsByEmail: {},
            });

            expect(result).toBeUndefined();
        });

        it('Should return undefined when overLimitForwardsTo is missing', () => {
            const approver = buildApprover(1, {approvalLimit: 50000, overLimitForwardsTo: undefined});

            const result = getApprovalLimitDescription({
                approver,
                currency: 'USD',
                translate: mockTranslate as unknown as Parameters<typeof getApprovalLimitDescription>[0]['translate'],
                personalDetailsByEmail: {},
            });

            expect(result).toBeUndefined();
        });

        it('Should return description when approvalLimit and overLimitForwardsTo are set', () => {
            const approver = buildApprover(1, {approvalLimit: 50000, overLimitForwardsTo: '2@example.com'});

            const result = getApprovalLimitDescription({
                approver,
                currency: 'USD',
                translate: mockTranslate as unknown as Parameters<typeof getApprovalLimitDescription>[0]['translate'],
                personalDetailsByEmail: {},
            });

            expect(result).toBe('Reports above $500.00 forward to 2@example.com');
        });

        it('Should use display name from personalDetails when available', () => {
            const approver = buildApprover(1, {approvalLimit: 100000, overLimitForwardsTo: '2@example.com'});
            const personalDetailsWithEmail: PersonalDetailsList = {
                '2@example.com': {accountID: 2, displayName: 'John Doe'},
            };

            const result = getApprovalLimitDescription({
                approver,
                currency: 'USD',
                translate: mockTranslate as unknown as Parameters<typeof getApprovalLimitDescription>[0]['translate'],
                personalDetailsByEmail: personalDetailsWithEmail,
            });

            expect(result).toBe('Reports above $1,000.00 forward to John Doe');
        });
    });

    describe('getOpenConnectedToPolicyBusinessBankAccounts', () => {
        const matchingBankAccountID = 12345;

        const policyWithACH = {
            ...createRandomPolicy(1),
            outputCurrency: 'USD',
            achAccount: {
                bankAccountID: matchingBankAccountID,
            },
        } as Policy;

        const openBusinessBankAccount = {
            bankCurrency: 'USD',
            bankCountry: 'US',
            accountData: {
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
                type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                bankAccountID: matchingBankAccountID,
            },
        };

        it('should return empty array when bankAccountList is undefined', () => {
            const result = getOpenConnectedToPolicyBusinessBankAccounts(undefined, policyWithACH);

            expect(result).toEqual([]);
        });

        it('should return empty array when policy is undefined', () => {
            const bankAccountList: BankAccountList = {
                '1': openBusinessBankAccount,
            };

            const result = getOpenConnectedToPolicyBusinessBankAccounts(bankAccountList, undefined);

            expect(result).toEqual([]);
        });

        it('should return matching bank accounts that meet all criteria', () => {
            const bankAccountList: BankAccountList = {
                '1': openBusinessBankAccount,
            };

            const result = getOpenConnectedToPolicyBusinessBankAccounts(bankAccountList, policyWithACH);

            expect(result).toEqual([openBusinessBankAccount]);
        });

        it('should filter out accounts with non-matching currency', () => {
            const nonMatchingCurrencyAccount = {
                ...openBusinessBankAccount,
                bankCurrency: 'EUR',
            };
            const bankAccountList: BankAccountList = {
                '1': nonMatchingCurrencyAccount,
            };

            const result = getOpenConnectedToPolicyBusinessBankAccounts(bankAccountList, policyWithACH);

            expect(result).toEqual([]);
        });

        it('should filter out accounts that are not in OPEN state', () => {
            const pendingAccount = {
                ...openBusinessBankAccount,
                accountData: {
                    ...openBusinessBankAccount.accountData,
                    state: CONST.BANK_ACCOUNT.STATE.PENDING,
                },
            };
            const bankAccountList: BankAccountList = {
                '1': pendingAccount,
            };

            const result = getOpenConnectedToPolicyBusinessBankAccounts(bankAccountList, policyWithACH);

            expect(result).toEqual([]);
        });

        it('should filter out accounts that are not BUSINESS type', () => {
            const personalAccount = {
                ...openBusinessBankAccount,
                accountData: {
                    ...openBusinessBankAccount.accountData,
                    type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                },
            };
            const bankAccountList: BankAccountList = {
                '1': personalAccount,
            };

            const result = getOpenConnectedToPolicyBusinessBankAccounts(bankAccountList, policyWithACH);

            expect(result).toEqual([]);
        });

        it('should filter out accounts not linked to policy ACH account', () => {
            const unlinkedAccount = {
                ...openBusinessBankAccount,
                accountData: {
                    ...openBusinessBankAccount.accountData,
                    bankAccountID: 99999,
                },
            };
            const bankAccountList: BankAccountList = {
                '1': unlinkedAccount,
            };

            const result = getOpenConnectedToPolicyBusinessBankAccounts(bankAccountList, policyWithACH);

            expect(result).toEqual([]);
        });

        it('should return multiple matching accounts', () => {
            const secondMatchingAccount = {
                ...openBusinessBankAccount,
                accountData: {
                    ...openBusinessBankAccount.accountData,
                    bankAccountID: matchingBankAccountID,
                    accountNumber: '9999',
                },
            };
            const bankAccountList: BankAccountList = {
                '1': openBusinessBankAccount,
                '2': secondMatchingAccount,
            };

            const result = getOpenConnectedToPolicyBusinessBankAccounts(bankAccountList, policyWithACH);

            expect(result).toEqual([openBusinessBankAccount, secondMatchingAccount]);
        });
    });
});
