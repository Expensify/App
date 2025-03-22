/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {
    getActivePolicies,
    getManagerAccountID,
    getPolicyNameByID,
    getRateDisplayValue,
    getSubmitToAccountID,
    getUnitRateValue,
    isWorkspaceEligibleForReportChange,
    shouldShowPolicy,
} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyEmployeeList, Report, Transaction} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReport from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
function toLocaleDigitMock(dot: string): string {
    return dot;
}
const GENERATED_ACCOUNT_ID = '555555';

jest.mock('@libs/UserUtils', () => ({
    // generateAccountID: () => GENERATED_ACCOUNT_ID,
    generateAccountID: jest.fn().mockReturnValue(GENERATED_ACCOUNT_ID),
}));

const testDate = DateUtils.getDBTime();
const employeeList: PolicyEmployeeList = {
    'owner@test.com': {
        email: 'owner@test.com',
        role: 'admin',
        submitsTo: '',
    },
    'admin@test.com': {
        email: 'admin@test.com',
        role: 'admin',
        submitsTo: '',
    },
    'employee@test.com': {
        email: 'employee@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'categoryapprover1@test.com': {
        email: 'categoryapprover1@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'categoryapprover2@test.com': {
        email: 'categoryapprover2@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'tagapprover1@test.com': {
        email: 'tagapprover1@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'tagapprover2@test.com': {
        email: 'tagapprover2@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
};

const adminAccountID = 1;
const employeeAccountID = 2;
const categoryapprover1AccountID = 3;
const categoryapprover2AccountID = 4;
const tagapprover1AccountID = 5;
const tagapprover2AccountID = 6;
const ownerAccountID = 7;
const approverAccountID = 8;
const employeeEmail = 'employee@test.com';
const adminEmail = 'admin@test.com';
const categoryApprover1Email = 'categoryapprover1@test.com';
const approverEmail = 'approver@test.com';

const personalDetails: PersonalDetailsList = {
    '1': {
        accountID: adminAccountID,
        login: adminEmail,
    },
    '2': {
        accountID: employeeAccountID,
        login: employeeEmail,
    },
    '3': {
        accountID: categoryapprover1AccountID,
        login: categoryApprover1Email,
    },
    '4': {
        accountID: categoryapprover2AccountID,
        login: 'categoryapprover2@test.com',
    },
    '5': {
        accountID: tagapprover1AccountID,
        login: 'tagapprover1@test.com',
    },
    '6': {
        accountID: tagapprover2AccountID,
        login: 'tagapprover2@test.com',
    },
    '7': {
        accountID: ownerAccountID,
        login: 'owner@test.com',
    },
    '8': {
        accountID: approverAccountID,
        login: approverEmail,
    },
};

const rules = {
    approvalRules: [
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'category',
                    value: 'cat1',
                },
            ],
            approver: 'categoryapprover1@test.com',
            id: '1',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'tag',
                    value: 'tag1',
                },
            ],
            approver: 'tagapprover1@test.com',
            id: '2',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'category',
                    value: 'cat2',
                },
            ],
            approver: 'categoryapprover2@test.com',
            id: '3',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'tag',
                    value: 'tag2',
                },
            ],
            approver: 'tagapprover2@test.com',
            id: '4',
        },
    ],
};

describe('PolicyUtils', () => {
    describe('getActivePolicies', () => {
        it("getActivePolicies should filter out policies that the current user doesn't belong to", () => {
            const policies = createCollection<Policy>(
                (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
                (index) => ({...createRandomPolicy(index + 1), name: 'workspace', pendingAction: null, ...(!index && {role: null})} as Policy),
                2,
            );
            expect(getActivePolicies(policies, undefined)).toHaveLength(1);
        });
    });
    describe('getRateDisplayValue', () => {
        it('should return an empty string for NaN', () => {
            const rate = getRateDisplayValue('invalid' as unknown as number, toLocaleDigitMock);
            expect(rate).toEqual('');
        });

        describe('withDecimals = false', () => {
            it('should return integer value as is', () => {
                const rate = getRateDisplayValue(100, toLocaleDigitMock);
                expect(rate).toEqual('100');
            });

            it('should return non-integer value as is', () => {
                const rate = getRateDisplayValue(10.5, toLocaleDigitMock);
                expect(rate).toEqual('10.5');
            });
        });

        describe('withDecimals = true', () => {
            it('should return integer value with 2 trailing zeros', () => {
                const rate = getRateDisplayValue(10, toLocaleDigitMock, true);
                expect(rate).toEqual('10.00');
            });

            it('should return non-integer value with up to 2 trailing zeros', () => {
                const rate = getRateDisplayValue(10.5, toLocaleDigitMock, true);
                expect(rate).toEqual('10.50');
            });

            it('should return non-integer value with 4 decimals as is', () => {
                const rate = getRateDisplayValue(10.5312, toLocaleDigitMock, true);
                expect(rate).toEqual('10.5312');
            });

            it('should return non-integer value with 3 decimals as is', () => {
                const rate = getRateDisplayValue(10.531, toLocaleDigitMock, true);
                expect(rate).toEqual('10.531');
            });

            it('should return non-integer value with 4+ decimals cut to 4', () => {
                const rate = getRateDisplayValue(10.53135, toLocaleDigitMock, true);
                expect(rate).toEqual('10.5313');
            });
        });
    });

    describe('getUnitRateValue', () => {
        it('should return an empty string for NaN', () => {
            const rate = getUnitRateValue(toLocaleDigitMock, {rate: 'invalid' as unknown as number});
            expect(rate).toEqual('');
        });

        describe('withDecimals = false', () => {
            it('should return value divisible by 100 with no decimal places', () => {
                const rate = getUnitRateValue(toLocaleDigitMock, {rate: 100});
                expect(rate).toEqual('1');
            });

            it('should return non-integer value as is divided by 100', () => {
                const rate = getUnitRateValue(toLocaleDigitMock, {rate: 11.11});
                expect(rate).toEqual('0.1111');
            });
        });

        describe('withDecimals = true', () => {
            it('should return value divisible by 100 with 2 decimal places', () => {
                const rate = getUnitRateValue(toLocaleDigitMock, {rate: 100}, true);
                expect(rate).toEqual('1.00');
            });

            it('should return non-integer value as is divided by 100', () => {
                const rate = getUnitRateValue(toLocaleDigitMock, {rate: 11.11}, true);
                expect(rate).toEqual('0.1111');
            });
        });
    });

    describe('getSubmitToAccountID', () => {
        beforeEach(() => {
            wrapOnyxWithWaitForBatchedUpdates(Onyx);
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
        describe('Has no rule approver', () => {
            it('should return the policy approver/owner if the policy use the basic workflow', () => {
                const policy: Policy = {
                    ...createRandomPolicy(0),
                    approver: 'owner@test.com',
                    owner: 'owner@test.com',
                    type: CONST.POLICY.TYPE.TEAM,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                };
                const expenseReport: Report = {
                    ...createRandomReport(0),
                    ownerAccountID: employeeAccountID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                expect(getSubmitToAccountID(policy, expenseReport)).toBe(ownerAccountID);
            });
            it('should return the policy approver/owner if the policy use the optional workflow', () => {
                const policy: Policy = {
                    ...createRandomPolicy(0),
                    approver: 'owner@test.com',
                    owner: 'owner@test.com',
                    type: CONST.POLICY.TYPE.TEAM,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                };
                const expenseReport: Report = {
                    ...createRandomReport(0),
                    ownerAccountID: employeeAccountID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                expect(getSubmitToAccountID(policy, expenseReport)).toBe(ownerAccountID);
            });
            it('should return the employee submitsTo if the policy use the advance workflow', () => {
                const policy: Policy = {
                    ...createRandomPolicy(0),
                    approver: 'owner@test.com',
                    owner: 'owner@test.com',
                    employeeList,
                    type: CONST.POLICY.TYPE.CORPORATE,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                };
                const expenseReport: Report = {
                    ...createRandomReport(0),
                    ownerAccountID: employeeAccountID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                expect(getSubmitToAccountID(policy, expenseReport)).toBe(adminAccountID);
            });
        });
        describe('Has category/tag approver', () => {
            it('should return the first category approver if has any transaction category match with category approver rule', async () => {
                const policy: Policy = {
                    ...createRandomPolicy(0),
                    approver: 'owner@test.com',
                    owner: 'owner@test.com',
                    type: CONST.POLICY.TYPE.CORPORATE,
                    employeeList,
                    rules,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                };
                const expenseReport: Report = {
                    ...createRandomReport(0),
                    ownerAccountID: employeeAccountID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const transaction1: Transaction = {
                    ...createRandomTransaction(0),
                    category: 'cat1',
                    reportID: expenseReport.reportID,
                };
                const transaction2: Transaction = {
                    ...createRandomTransaction(1),
                    category: '',
                    reportID: expenseReport.reportID,
                };
                await Onyx.set(ONYXKEYS.COLLECTION.TRANSACTION, {
                    [transaction1.transactionID]: transaction1,
                    [transaction2.transactionID]: transaction2,
                });
                expect(getSubmitToAccountID(policy, expenseReport)).toBe(categoryapprover1AccountID);
            });
            it('should return the category approver of the first transaction sorted by created if we have many transaction categories match with the category approver rule', async () => {
                const policy: Policy = {
                    ...createRandomPolicy(0),
                    approver: 'owner@test.com',
                    owner: 'owner@test.com',
                    type: CONST.POLICY.TYPE.CORPORATE,
                    employeeList,
                    rules,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                };
                const expenseReport: Report = {
                    ...createRandomReport(0),
                    ownerAccountID: employeeAccountID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const transaction1: Transaction = {
                    ...createRandomTransaction(0),
                    category: 'cat1',
                    created: testDate,
                    reportID: expenseReport.reportID,
                };
                const transaction2: Transaction = {
                    ...createRandomTransaction(1),
                    category: 'cat2',
                    created: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                    reportID: expenseReport.reportID,
                };
                await Onyx.set(ONYXKEYS.COLLECTION.TRANSACTION, {
                    [transaction1.transactionID]: transaction1,
                    [transaction2.transactionID]: transaction2,
                });
                expect(getSubmitToAccountID(policy, expenseReport)).toBe(categoryapprover2AccountID);
            });
            describe('Has no transaction match with the category approver rule', () => {
                it('should return the first tag approver if has any transaction tag match with with the tag approver rule ', async () => {
                    const policy: Policy = {
                        ...createRandomPolicy(0),
                        approver: 'owner@test.com',
                        owner: 'owner@test.com',
                        type: CONST.POLICY.TYPE.CORPORATE,
                        employeeList,
                        rules,
                        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                    };
                    const expenseReport: Report = {
                        ...createRandomReport(0),
                        ownerAccountID: employeeAccountID,
                        type: CONST.REPORT.TYPE.EXPENSE,
                    };
                    const transaction1: Transaction = {
                        ...createRandomTransaction(0),
                        category: '',
                        tag: 'tag1',
                        created: testDate,
                        reportID: expenseReport.reportID,
                    };
                    const transaction2: Transaction = {
                        ...createRandomTransaction(1),
                        category: '',
                        tag: '',
                        created: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                        reportID: expenseReport.reportID,
                    };
                    await Onyx.set(ONYXKEYS.COLLECTION.TRANSACTION, {
                        [transaction1.transactionID]: transaction1,
                        [transaction2.transactionID]: transaction2,
                    });
                    expect(getSubmitToAccountID(policy, expenseReport)).toBe(tagapprover1AccountID);
                });
                it('should return the tag approver of the first transaction sorted by created if we have many transaction tags match with the tag approver rule', async () => {
                    const policy: Policy = {
                        ...createRandomPolicy(0),
                        approver: 'owner@test.com',
                        owner: 'owner@test.com',
                        type: CONST.POLICY.TYPE.CORPORATE,
                        employeeList,
                        rules,
                        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                    };
                    const expenseReport: Report = {
                        ...createRandomReport(0),
                        ownerAccountID: employeeAccountID,
                        type: CONST.REPORT.TYPE.EXPENSE,
                    };
                    const transaction1: Transaction = {
                        ...createRandomTransaction(0),
                        category: '',
                        tag: 'tag1',
                        created: testDate,
                        reportID: expenseReport.reportID,
                    };
                    const transaction2: Transaction = {
                        ...createRandomTransaction(1),
                        category: '',
                        tag: 'tag2',
                        created: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                        reportID: expenseReport.reportID,
                    };
                    await Onyx.set(ONYXKEYS.COLLECTION.TRANSACTION, {
                        [transaction1.transactionID]: transaction1,
                        [transaction2.transactionID]: transaction2,
                    });
                    expect(getSubmitToAccountID(policy, expenseReport)).toBe(tagapprover2AccountID);
                });
            });
        });
    });
    describe('shouldShowPolicy', () => {
        beforeAll(() => {
            Onyx.init({
                keys: ONYXKEYS,
                initialKeyStates: {
                    [ONYXKEYS.SESSION]: {accountID: CARLOS_ACCOUNT_ID, email: CARLOS_EMAIL},
                },
            });
        });

        beforeEach(() => {
            global.fetch = TestHelper.getGlobalFetchMock();
            return Onyx.clear().then(waitForBatchedUpdates);
        });
        it('should return false', () => {
            // Given an archived paid policy.
            const policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                role: '',
            };
            const result = shouldShowPolicy(policy as OnyxEntry<Policy>, false, CARLOS_EMAIL);
            // The result should be false since it is an archived paid policy.
            expect(result).toBe(false);
        });
        it('should return true', () => {
            // Given a paid policy.
            const policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), pendingAction: null};
            const result = shouldShowPolicy(policy as OnyxEntry<Policy>, false, CARLOS_EMAIL);
            // The result should be true, since it is an active paid policy.
            expect(result).toBe(true);
        });
        it('should returnfalse', () => {
            // Given a control workspace which is pending delete.
            const policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };
            const result = shouldShowPolicy(policy as OnyxEntry<Policy>, false, CARLOS_EMAIL);
            // The result should be false since it is a policy which is pending deletion.
            expect(result).toEqual(false);
        });
    });

    describe('getPolicyNameByID', () => {
        it('should return the policy name for a given policyID', async () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                name: 'testName',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            expect(getPolicyNameByID('1')).toBe('testName');
        });

        it('should return the policyID if the name is not set', async () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                name: null!,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            expect(getPolicyNameByID('1')).toBe('1');
        });
    });

    describe('getManagerAccountID', () => {
        beforeEach(() => {
            wrapOnyxWithWaitForBatchedUpdates(Onyx);
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });

        it('should return default approver for personal workspaces', () => {
            const policy: Policy = {
                ...createRandomPolicy(0),
                type: CONST.POLICY.TYPE.PERSONAL,
                approver: categoryApprover1Email,
            };
            const report: Report = {
                ...createRandomReport(0),
            };
            const result = getManagerAccountID(policy, report);

            expect(result).toBe(categoryapprover1AccountID);
        });

        it('should return -1 if there is no employee or default approver', () => {
            const policy: Policy = {
                ...createRandomPolicy(0),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: undefined,
                approver: undefined,
                owner: '',
            };
            const report: Report = {
                ...createRandomReport(0),
            };

            const result = getManagerAccountID(policy, report);

            expect(result).toBe(-1);
        });

        it('should return submitsTo account ID', () => {
            const policy: Policy = {
                ...createRandomPolicy(0),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: undefined,
                employeeList: {
                    [employeeEmail]: {
                        email: employeeEmail,
                        submitsTo: adminEmail,
                    },
                },
            };
            const report: Report = {
                ...createRandomReport(0),
                ownerAccountID: employeeAccountID,
            };

            const result = getManagerAccountID(policy, report);

            expect(result).toBe(adminAccountID);
        });

        it('should return the default approver', () => {
            const policy: Policy = {
                ...createRandomPolicy(0),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: undefined,
                approver: categoryApprover1Email,
            };
            const report: Report = {
                ...createRandomReport(0),
                ownerAccountID: employeeAccountID,
            };

            const result = getManagerAccountID(policy, report);

            expect(result).toBe(categoryapprover1AccountID);
        });
    });

    describe('isWorkspaceEligibleForReportChange', () => {
        beforeEach(() => {
            wrapOnyxWithWaitForBatchedUpdates(Onyx);
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });

        it('returns false if current user is not a member of the new policy', async () => {
            const newPolicy = {
                ...createRandomPolicy(1),
                employeeList: {},
            };
            const report = createRandomReport(0);
            const oldPolicy = createRandomPolicy(0);
            const currentUserLogin = 'nonmember@tests.com';
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: 0});

            const result = isWorkspaceEligibleForReportChange(newPolicy, report, oldPolicy, currentUserLogin);
            expect(result).toBe(false);
        });

        it('returns true if current user is the submitter', async () => {
            const currentUserLogin = employeeEmail;
            const currentUserAccountID = employeeAccountID;
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: currentUserAccountID});

            const newPolicy = {
                ...createRandomPolicy(1),
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.USER},
                },
            };
            const oldPolicy = createRandomPolicy(0);
            const report = {
                ...createRandomReport(0),
                ownerAccountID: currentUserAccountID,
            };

            const result = isWorkspaceEligibleForReportChange(newPolicy, report, oldPolicy, currentUserLogin);
            expect(result).toBe(true);
        });

        it('returns true if current user is a policy admin', async () => {
            const currentUserLogin = adminEmail;
            const currentUserAccountID = adminAccountID;
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: currentUserAccountID});

            const newPolicy = {
                ...createRandomPolicy(1),
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.ADMIN},
                },
            };
            const oldPolicy = createRandomPolicy(0);
            const report = createRandomReport(0);

            const result = isWorkspaceEligibleForReportChange(newPolicy, report, oldPolicy, currentUserLogin);
            expect(result).toBe(true);
        });

        it('returns true if current user is the policy owner', async () => {
            const currentUserLogin = 'owner@test.com';
            const currentUserAccountID = ownerAccountID;
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: currentUserAccountID});

            const newPolicy = {
                ...createRandomPolicy(1),
                ownerAccountID: currentUserAccountID,
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.ADMIN},
                },
            };
            const oldPolicy = createRandomPolicy(0);
            const report = createRandomReport(0);

            const result = isWorkspaceEligibleForReportChange(newPolicy, report, oldPolicy, currentUserLogin);
            expect(result).toBe(true);
        });

        it('returns true if current user is the approver and submitter is a member', async () => {
            const currentUserLogin = approverEmail;
            const currentUserAccountID = approverAccountID;
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: currentUserAccountID});

            const submitterLogin = employeeEmail;
            const submitterAccountID = employeeAccountID;

            const newPolicy = {
                ...createRandomPolicy(1),
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.USER},
                    [submitterLogin]: {email: submitterLogin, role: CONST.POLICY.ROLE.USER},
                },
            };
            const oldPolicy = {
                ...createRandomPolicy(0),
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.USER},
                    [submitterLogin]: {email: submitterLogin, role: CONST.POLICY.ROLE.USER, submitsTo: currentUserLogin},
                },
                approver: currentUserLogin,
            };
            const report = {
                ...createRandomReport(0),
                ownerAccountID: submitterAccountID,
            };

            const result = isWorkspaceEligibleForReportChange(newPolicy, report, oldPolicy, currentUserLogin);
            expect(result).toBe(true);
        });

        it('returns false if current user is approver but submitter not member', async () => {
            const currentUserLogin = approverEmail;
            const currentUserAccountID = approverAccountID;
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: currentUserAccountID});

            const newPolicy = {
                ...createRandomPolicy(1),
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.USER},
                },
            };
            const report = {
                ...createRandomReport(0),
                ownerAccountID: employeeAccountID,
            };
            const oldPolicy = createRandomPolicy(0);

            expect(isWorkspaceEligibleForReportChange(newPolicy, report, oldPolicy, currentUserLogin)).toBe(false);
        });
    });
});
