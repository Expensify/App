/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useDefaultFundID from '@hooks/useDefaultFundID';
import DateUtils from '@libs/DateUtils';
import {
    getActivePolicies,
    getAllTaxRatesNamesAndValues,
    getCustomUnitsForDuplication,
    getEligibleBankAccountShareRecipients,
    getManagerAccountID,
    getPolicyEmployeeAccountIDs,
    getPolicyNameByID,
    getRateDisplayValue,
    getSubmitToAccountID,
    getTagApproverRule,
    getTagList,
    getTagListByOrderWeight,
    getUberConnectionErrorDirectlyFromPolicy,
    getUnitRateValue,
    hasDynamicExternalWorkflow,
    hasOnlyPersonalPolicies,
    hasOtherControlWorkspaces,
    hasPolicyWithXeroConnection,
    isCurrentUserMemberOfAnyPolicy,
    isPolicyMemberWithoutPendingDelete,
    shouldShowPolicy,
    sortWorkspacesBySelected,
} from '@libs/PolicyUtils';
import {isWorkspaceEligibleForReportChange} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import {getPolicyBrickRoadIndicatorStatus} from '@src/libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyEmployeeList, Report, Transaction} from '@src/types/onyx';
import type {Connections} from '@src/types/onyx/Policy';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
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
const categoryApprover1AccountID = 3;
const categoryApprover2AccountID = 4;
const tagApprover1AccountID = 5;
const tagApprover2AccountID = 6;
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
        accountID: categoryApprover1AccountID,
        login: categoryApprover1Email,
    },
    '4': {
        accountID: categoryApprover2AccountID,
        login: 'categoryapprover2@test.com',
    },
    '5': {
        accountID: tagApprover1AccountID,
        login: 'tagapprover1@test.com',
    },
    '6': {
        accountID: tagApprover2AccountID,
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
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'category',
                    value: 'cat3',
                },
            ],
            approver: 'categoryapprover1@test.com',
            id: '5',
        },
    ],
};
const policyTags = {
    TagListTest0: {
        name: 'TagListTest0',
        orderWeight: 0,
        required: false,
        tags: {},
    },
    TagListTest2: {
        name: 'TagListTest2',
        orderWeight: 2,
        required: false,
        tags: {},
    },
};

describe('PolicyUtils', () => {
    describe('useDefaultFundID', () => {
        beforeEach(() => {
            wrapOnyxWithWaitForBatchedUpdates(Onyx);
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
        it('should return domainID for given policyID when workspaceID is not set', async () => {
            const policy: Policy = {
                ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                workspaceAccountID: 0,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}2`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}`, {
                [`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}18441278`]: {
                    currentBalance: 0,
                    domainName: 'expensify-policy8fe6324c4897.exfy',
                    earnedCashback: 0,
                    isLoading: false,
                    isMonthlySettlementAllowed: false,
                    limit: 0,
                    marqetaBusinessToken: 18441278,
                    ownerEmail: 'user@gmail.com',
                    paymentBankAccountAddressName: 'Alberta Bobbeth Charleson',
                    paymentBankAccountID: 3288123,
                    paymentBankAccountNumber: 'XXXXXXXXXXXX1111',
                    preferredPolicy: '2',
                    remainingLimit: 0,
                },
            });
            const {result} = renderHook(() => useDefaultFundID(policy.id));

            expect(result?.current).toBe(18441278);
        });

        it('should return lastSelectedExpensifyCardFeed for given policyID when lastSelectedExpensifyCardFeed is set', async () => {
            const policy: Policy = {
                ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                workspaceAccountID: 0,
            };
            const lastSelectedExpensifyCardFeed = 11111;
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}2`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}2`, lastSelectedExpensifyCardFeed);
            await Onyx.set(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${lastSelectedExpensifyCardFeed}`, {
                paymentBankAccountID: 1234,
            });
            const {result} = renderHook(() => useDefaultFundID(policy.id));

            expect(result?.current).toBe(lastSelectedExpensifyCardFeed);
        });

        it('should return workspaceAccountID for given policyID', async () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                workspaceAccountID: 123234,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);
            const {result} = renderHook(() => useDefaultFundID(policy.id));

            expect(result?.current).toBe(123234);
        });
    });

    describe('getActivePolicies', () => {
        it("getActivePolicies should filter out policies that the current user doesn't belong to", () => {
            const policies = createCollection<Policy>(
                (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
                (index) => ({...createRandomPolicy(index + 1), name: 'workspace', pendingAction: null, ...(!index && {role: null})}) as Policy,
                2,
            );
            expect(getActivePolicies(policies, undefined)).toHaveLength(1);
        });
    });
    describe('getCustomUnitsForDuplication', () => {
        const perDiemUnit = {
            customUnitID: '123',
            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
            enabled: true,
            rates: {},
        };
        const otherUnit = {
            customUnitID: '456',
            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
            enabled: true,
            rates: {},
        };
        const policy: Policy = {
            ...createRandomPolicy(0),
            customUnits: {
                [perDiemUnit.customUnitID]: perDiemUnit,
                [otherUnit.customUnitID]: otherUnit,
            },
        };

        const policyWithoutCustomUnits: Policy = {
            ...createRandomPolicy(0),
        };

        it('returns undefined if neither option is selected', () => {
            expect(getCustomUnitsForDuplication(policy, false, false)).toBeUndefined();
        });

        it('returns all custom units if both options are selected', () => {
            const result = getCustomUnitsForDuplication(policy, true, true);
            expect(result).toEqual(policy.customUnits);
        });
        it('returns only non-per-diem units if only custom units option is selected', () => {
            const result = getCustomUnitsForDuplication(policy, true, false);
            expect(result).toEqual({[otherUnit.customUnitID]: otherUnit});
        });

        it('returns only per diem unit if only per diem option is selected', () => {
            const result = getCustomUnitsForDuplication(policy, false, true);
            expect(result).toEqual({[perDiemUnit.customUnitID]: perDiemUnit});
        });

        it('returns undefined if customUnits is empty', () => {
            expect(getCustomUnitsForDuplication(policyWithoutCustomUnits, true, true)).toBeUndefined();
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

    describe('getUberConnectionErrorDirectlyFromPolicy', () => {
        it('should return true if Uber connection is enabled and has an error', () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                receiptPartners: {
                    uber: {
                        enabled: true,
                        error: 'Some error',
                        connectFormData: 'Some data',
                    },
                },
            };

            expect(getUberConnectionErrorDirectlyFromPolicy(policy)).toBe(true);
        });

        it('should return false if Uber connection is enabled but has no error', () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                receiptPartners: {
                    uber: {
                        enabled: true,
                        error: undefined,
                        connectFormData: 'Some data',
                    },
                },
            };

            expect(getUberConnectionErrorDirectlyFromPolicy(policy)).toBe(false);
        });

        it('should return false if Uber connection does not exist', () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
            };

            expect(getUberConnectionErrorDirectlyFromPolicy(policy)).toBe(false);
        });

        it('should return false if policy is undefined', () => {
            expect(getUberConnectionErrorDirectlyFromPolicy(undefined)).toBe(false);
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
                    ...createRandomReport(0, undefined),
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
                    ...createRandomReport(0, undefined),
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
                    ...createRandomReport(0, undefined),
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
                    ...createRandomReport(0, undefined),
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
                await Onyx.multiSet({
                    [ONYXKEYS.COLLECTION.TRANSACTION]: {
                        [transaction1.transactionID]: transaction1,
                        [transaction2.transactionID]: transaction2,
                    },
                });
                expect(getSubmitToAccountID(policy, expenseReport)).toBe(categoryApprover1AccountID);
            });
            it('should return default approver if rule approver is submitter and prevent self approval is enabled', async () => {
                const policy: Policy = {
                    ...createRandomPolicy(0),
                    approver: 'owner@test.com',
                    owner: 'owner@test.com',
                    type: CONST.POLICY.TYPE.CORPORATE,
                    employeeList,
                    rules,
                    preventSelfApproval: true,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                };
                const expenseReport: Report = {
                    ...createRandomReport(0, undefined),
                    ownerAccountID: categoryApprover1AccountID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const transaction: Transaction = {
                    ...createRandomTransaction(0),
                    category: 'cat1',
                    reportID: expenseReport.reportID,
                    tag: '',
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                expect(getSubmitToAccountID(policy, expenseReport)).toBe(adminAccountID);
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
                    ...createRandomReport(0, undefined),
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
                await Onyx.multiSet({
                    [ONYXKEYS.COLLECTION.TRANSACTION]: {
                        [transaction1.transactionID]: transaction1,
                        [transaction2.transactionID]: transaction2,
                    },
                });
                expect(getSubmitToAccountID(policy, expenseReport)).toBe(categoryApprover2AccountID);
            });
            it('should return the first rule approver who is not the current submitter', async () => {
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
                    ...createRandomReport(0, undefined),
                    ownerAccountID: categoryApprover1AccountID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const transaction1: Transaction = {
                    ...createRandomTransaction(0),
                    category: 'cat1',
                    reportID: expenseReport.reportID,
                    tag: '',
                    created: DateUtils.subtractMillisecondsFromDateTime(testDate, 2),
                };

                const transaction2: Transaction = {
                    ...createRandomTransaction(1),
                    category: 'cat3',
                    reportID: expenseReport.reportID,
                    tag: '',
                    created: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                };

                const transaction3: Transaction = {
                    ...createRandomTransaction(2),
                    category: '',
                    reportID: expenseReport.reportID,
                    tag: 'tag1',
                    created: testDate,
                };

                await Onyx.multiSet({
                    [ONYXKEYS.COLLECTION.TRANSACTION]: {
                        [transaction1.transactionID]: transaction1,
                        [transaction2.transactionID]: transaction2,
                        [transaction3.transactionID]: transaction3,
                    },
                });

                expect(getSubmitToAccountID(policy, expenseReport)).toBe(tagApprover1AccountID);
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
                        ...createRandomReport(0, undefined),
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
                    expect(getSubmitToAccountID(policy, expenseReport)).toBe(tagApprover1AccountID);
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
                        ...createRandomReport(0, undefined),
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
                    expect(getSubmitToAccountID(policy, expenseReport)).toBe(tagApprover2AccountID);
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
        it('should return false', () => {
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

        it('should return the empty if the name is not set', async () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                name: null!,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            expect(getPolicyNameByID('1')).toBe('');
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
                ...createRandomReport(0, undefined),
            };
            const result = getManagerAccountID(policy, report);

            expect(result).toBe(categoryApprover1AccountID);
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
                ...createRandomReport(0, undefined),
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
                ...createRandomReport(0, undefined),
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
                ...createRandomReport(0, undefined),
                ownerAccountID: employeeAccountID,
            };

            const result = getManagerAccountID(policy, report);

            expect(result).toBe(categoryApprover1AccountID);
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

        it('returns false if policy is not paid group policy', async () => {
            const currentUserLogin = employeeEmail;

            const newPolicy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.PERSONAL),
                isPolicyExpenseChatEnabled: true,
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.USER},
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy);

            const result = isWorkspaceEligibleForReportChange(currentUserLogin, newPolicy);
            expect(result).toBe(false);
        });

        it('returns true if policy is paid group policy and the manager is the payer', async () => {
            const currentUserLogin = employeeEmail;

            const newPolicy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
                isPolicyExpenseChatEnabled: true,
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.ADMIN},
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy);

            const result = isWorkspaceEligibleForReportChange(currentUserLogin, newPolicy);
            expect(result).toBe(true);
        });

        it('returns true if the manager is not the payer of the new policy', async () => {
            const currentUserLogin = employeeEmail;

            const newPolicy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                isPolicyExpenseChatEnabled: true,
                role: CONST.POLICY.ROLE.ADMIN,
                employeeList: {
                    [approverEmail]: {email: approverEmail, role: CONST.POLICY.ROLE.USER},
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy);

            const result = isWorkspaceEligibleForReportChange(currentUserLogin, newPolicy);
            expect(result).toBe(true);
        });

        it('returns false if policies are not policyExpenseChatEnabled', async () => {
            const currentUserLogin = employeeEmail;

            const newPolicy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
                isPolicyExpenseChatEnabled: false,
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.ADMIN},
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy);

            const result = isWorkspaceEligibleForReportChange(currentUserLogin, newPolicy);
            expect(result).toBe(false);
        });
    });

    describe('isCurrentUserMemberOfAnyPolicy', () => {
        beforeEach(() => {
            wrapOnyxWithWaitForBatchedUpdates(Onyx);
        });
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });

        it('should return false if user has no policies', async () => {
            const currentUserLogin = approverEmail;
            const currentUserAccountID = approverAccountID;

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: currentUserAccountID});
            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, {});

            const result = isCurrentUserMemberOfAnyPolicy();

            expect(result).toBeFalsy();
        });

        it('should return true if user owns a workspace', async () => {
            const currentUserLogin = approverEmail;
            const currentUserAccountID = approverAccountID;
            const policies = {...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM, `John's Workspace`), ownerAccountID: approverAccountID, isPolicyExpenseChatEnabled: true};

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: currentUserAccountID});
            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, policies);

            const result = isCurrentUserMemberOfAnyPolicy();

            expect(result).toBeTruthy();
        });

        it('should return false if expense chat is not enabled', async () => {
            const currentUserLogin = approverEmail;
            const currentUserAccountID = approverAccountID;
            const policies = {...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM, `John's Workspace`), isPolicyExpenseChatEnabled: false};

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: currentUserAccountID});
            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, policies);

            const result = isCurrentUserMemberOfAnyPolicy();

            expect(result).toBeFalsy();
        });

        it('should return false if its a fake policy id', async () => {
            const currentUserLogin = approverEmail;
            const currentUserAccountID = approverAccountID;
            const policies = {...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM, `John's Workspace`), id: CONST.POLICY.ID_FAKE};

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: currentUserAccountID});
            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, policies);

            const result = isCurrentUserMemberOfAnyPolicy();

            expect(result).toBeFalsy();
        });

        it('should return true if user is invited to a workspace', async () => {
            const currentUserLogin = approverEmail;
            const currentUserAccountID = approverAccountID;
            const policies = {...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM, `John's Workspace`), ownerAccountID, isPolicyExpenseChatEnabled: true};

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserLogin, accountID: currentUserAccountID});
            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, policies);

            const result = isCurrentUserMemberOfAnyPolicy();

            expect(result).toBeTruthy();
        });
    });
    describe('getTagList', () => {
        it.each([
            ['when index is 0', 0, policyTags.TagListTest0.name],
            ['when index is 1', 1, policyTags.TagListTest2.name],
            ['when index is out of range', 2, ''],
        ])('%s', (_description, index, expected) => {
            const tagList = getTagList(policyTags, index);
            expect(tagList.name).toEqual(expected);
        });
    });
    describe('getTagListByOrderWeight', () => {
        it.each([
            ['when orderWeight is 0', 0, policyTags.TagListTest0.name],
            ['when orderWeight is 2', 2, policyTags.TagListTest2.name],
            ['when orderWeight is out of range', 1, ''],
        ])('%s', (_description, orderWeight, expected) => {
            const tagList = getTagListByOrderWeight(policyTags, orderWeight);
            expect(tagList.name).toEqual(expected);
        });
    });
    describe('sortWorkspacesBySelected', () => {
        it('should order workspaces with selected workspace first', () => {
            const workspace1 = {policyID: '1', name: 'Workspace 1'};
            const workspace2 = {policyID: '2', name: 'Workspace 2'};
            const selectedWorkspace1 = {policyID: '3', name: 'Workspace 3'};
            const selectedWorkspace2 = {policyID: '4', name: 'Workspace 4'};
            expect(sortWorkspacesBySelected(workspace1, workspace2, ['3', '4'], TestHelper.localeCompare)).toBe(-1);
            expect(sortWorkspacesBySelected(workspace1, selectedWorkspace1, ['3', '4'], TestHelper.localeCompare)).toBe(1);
            expect(sortWorkspacesBySelected(selectedWorkspace1, selectedWorkspace2, ['3', '4'], TestHelper.localeCompare)).toBe(-1);
        });

        it('should order workspaces using name if no workspace is selected', () => {
            const workspace1 = {policyID: '1', name: 'Workspace 1'};
            const workspace2 = {policyID: '2', name: 'Workspace 2'};
            const workspace3 = {policyID: '3', name: 'Workspace 3'};
            const workspace4 = {policyID: '4', name: 'Workspace 4'};
            expect(sortWorkspacesBySelected(workspace1, workspace2, undefined, TestHelper.localeCompare)).toBe(-1);
            expect(sortWorkspacesBySelected(workspace1, workspace3, undefined, TestHelper.localeCompare)).toBe(-1);
            expect(sortWorkspacesBySelected(workspace3, workspace4, undefined, TestHelper.localeCompare)).toBe(-1);
        });

        it('should sort workspaces when using this method correctly', () => {
            const unsortedWorkspaces = [
                {policyID: '2', name: 'Workspace 2'},
                {policyID: '1', name: 'Workspace 1'},
                {policyID: '4', name: 'Workspace 4'},
                {policyID: '3', name: 'Workspace 3'},
            ];
            const selectedWorkspaceIDs = ['3', '4'];
            const sortedWorkspaces = unsortedWorkspaces.sort((a, b) => sortWorkspacesBySelected(a, b, selectedWorkspaceIDs, TestHelper.localeCompare));
            expect(sortedWorkspaces).toEqual([
                {policyID: '3', name: 'Workspace 3'},
                {policyID: '4', name: 'Workspace 4'},
                {policyID: '1', name: 'Workspace 1'},
                {policyID: '2', name: 'Workspace 2'},
            ]);
        });
    });

    describe('getPolicyEmployeeAccountIDs', () => {
        beforeEach(() => {
            wrapOnyxWithWaitForBatchedUpdates(Onyx);
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });

        it('should return an array of employee accountIDs for the given policy (including current user accountID) if no current user is passed', () => {
            const policy = {
                employeeList,
            };
            const result = getPolicyEmployeeAccountIDs(policy);
            expect(result).toEqual([7, 1, 2, 3, 4, 5, 6]);
        });

        it('should return an array of employee accountIDs for the given policy (excluding current user accountID) if current user is passed', () => {
            const policy = {
                employeeList,
            };
            const result = getPolicyEmployeeAccountIDs(policy, 5);
            expect(result).toEqual([7, 1, 2, 3, 4, 6]);
        });

        it('should return an empty array if no employees are found', () => {
            const policy = {
                employeeList: {},
            };
            const result = getPolicyEmployeeAccountIDs(policy);
            expect(result).toEqual([]);
        });
    });

    describe('isPolicyMemberWithoutPendingDelete', () => {
        it('should return true if the policy member is not pending delete', () => {
            const policy = {
                id: '1',
                employeeList: {
                    [employeeEmail]: {email: employeeEmail, role: CONST.POLICY.ROLE.USER},
                },
            };
            const result = isPolicyMemberWithoutPendingDelete(employeeEmail, policy as unknown as Policy);
            expect(result).toBe(true);
        });

        it('should return false if the policy member is pending delete', () => {
            const policy = {
                id: '1',
                employeeList: {
                    [employeeEmail]: {email: employeeEmail, role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                },
            };
            const result = isPolicyMemberWithoutPendingDelete(employeeEmail, policy as unknown as Policy);
            expect(result).toBe(false);
        });

        it('should return false if the policy member is not found', () => {
            const policy = {
                id: '1',
                employeeList: {
                    [employeeEmail]: {email: employeeEmail, role: CONST.POLICY.ROLE.USER},
                },
            };
            const result = isPolicyMemberWithoutPendingDelete('fakeEmail', policy as unknown as Policy);
            expect(result).toBe(false);
        });
    });

    describe('getPolicyBrickRoadIndicatorStatus', () => {
        const baseAdminPolicy: OnyxEntry<Policy> = {
            id: 'ABC123',
            name: 'Test Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            employeeList: {},
            connections: {},
            errors: {},
            errorFields: {},
        } as OnyxEntry<Policy>;

        const baseUserPolicy: OnyxEntry<Policy> = {
            id: 'DEF456',
            name: 'User Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {},
            connections: {},
            errors: {},
            errorFields: {},
        } as OnyxEntry<Policy>;

        it('does return an ERROR RBR when a sync error exists for an admin', () => {
            const policyWithConnectionFailures = {
                ...baseAdminPolicy,
                // Failed sync
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                        verified: false,
                        lastSync: {
                            errorDate: new Date().toISOString(),
                            errorMessage: 'Error',
                            isAuthenticationError: true,
                            isConnected: false,
                            isSuccessful: false,
                            source: 'NEWEXPENSIFY',
                            successfulDate: '',
                        },
                    },
                } as Connections,
            } as OnyxEntry<Policy>;

            const result = getPolicyBrickRoadIndicatorStatus(policyWithConnectionFailures, false);
            expect(result).toEqual(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        });

        it('does not return an ERROR RBR when a sync error exists for a user', () => {
            const policyWithConnectionFailures = {
                ...baseUserPolicy,
                // Failed sync
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                        verified: false,
                        lastSync: {
                            errorDate: new Date().toISOString(),
                            errorMessage: 'Error',
                            isAuthenticationError: true,
                            isConnected: false,
                            isSuccessful: false,
                            source: 'NEWEXPENSIFY',
                            successfulDate: '',
                        },
                    },
                } as Connections,
            } as OnyxEntry<Policy>;

            const result = getPolicyBrickRoadIndicatorStatus(policyWithConnectionFailures, false);
            expect(result).toBeUndefined();
        });

        it('does not return an ERROR RBR when no sync errors exist for an admin', () => {
            const policyWithoutConnections = {
                ...baseAdminPolicy,
                connections: {} as Connections,
            } as OnyxEntry<Policy>;

            const policyWithoutConnectionFailures = {
                ...baseAdminPolicy,
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                        verified: true,
                        lastSync: {
                            errorDate: '',
                            errorMessage: '',
                            isAuthenticationError: false,
                            isConnected: true,
                            isSuccessful: true,
                            source: 'NEWEXPENSIFY',
                            successfulDate: '',
                        },
                    },
                } as Connections,
            } as OnyxEntry<Policy>;

            const result = getPolicyBrickRoadIndicatorStatus(policyWithoutConnectionFailures, false);
            expect(result).toBeUndefined();

            const result2 = getPolicyBrickRoadIndicatorStatus(policyWithoutConnections, false);
            expect(result2).toBeUndefined();
        });

        it('does not return an ERROR RBR when no sync error exists for a user', () => {
            const policyWithoutConnections = {
                ...baseUserPolicy,
                connections: {} as Connections,
            } as OnyxEntry<Policy>;

            const policyWithoutConnectionFailures = {
                ...baseUserPolicy,
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                        verified: true,
                        lastSync: {
                            errorDate: '',
                            errorMessage: '',
                            isAuthenticationError: false,
                            isConnected: true,
                            isSuccessful: true,
                            source: 'NEWEXPENSIFY',
                            successfulDate: '',
                        },
                    },
                } as Connections,
            } as OnyxEntry<Policy>;

            const result = getPolicyBrickRoadIndicatorStatus(policyWithoutConnections, false);
            expect(result).toBeUndefined();

            const result2 = getPolicyBrickRoadIndicatorStatus(policyWithoutConnectionFailures, false);
            expect(result2).toBeUndefined();
        });

        describe('QBO Export Errors', () => {
            it('does return an ERROR RBR when a QBO sync error exists for an admin', () => {
                const policyWithQBOSyncError = {
                    ...baseAdminPolicy,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            verified: false,
                            lastSync: {
                                errorDate: new Date().toISOString(),
                                errorMessage: 'QBO sync failed',
                                isAuthenticationError: true,
                                isConnected: false,
                                isSuccessful: false,
                                source: 'NEWEXPENSIFY',
                                successfulDate: '',
                            },
                        },
                    } as unknown as Connections,
                } as OnyxEntry<Policy>;

                const result = getPolicyBrickRoadIndicatorStatus(policyWithQBOSyncError, false);
                expect(result).toEqual(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
            });

            it('does not return an ERROR RBR when a QBO sync error exists for a user', () => {
                const policyWithQBOSyncError = {
                    ...baseUserPolicy,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            verified: false,
                            lastSync: {
                                errorDate: new Date().toISOString(),
                                errorMessage: 'QBO sync failed',
                                isAuthenticationError: true,
                                isConnected: false,
                                isSuccessful: false,
                                source: 'NEWEXPENSIFY',
                                successfulDate: '',
                            },
                        },
                    } as unknown as Connections,
                } as OnyxEntry<Policy>;

                const result = getPolicyBrickRoadIndicatorStatus(policyWithQBOSyncError, false);
                expect(result).toBeUndefined();
            });

            it('does not return an ERROR RBR when no QBO sync errors exist for an admin', () => {
                const policyWithSuccessfulQBOSync = {
                    ...baseAdminPolicy,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            verified: true,
                            lastSync: {
                                errorDate: '',
                                errorMessage: '',
                                isAuthenticationError: false,
                                isConnected: true,
                                isSuccessful: true,
                                source: 'NEWEXPENSIFY',
                                successfulDate: new Date().toISOString(),
                            },
                        },
                    } as unknown as Connections,
                } as OnyxEntry<Policy>;

                const result = getPolicyBrickRoadIndicatorStatus(policyWithSuccessfulQBOSync, false);
                expect(result).toBeUndefined();
            });

            it('does not return an ERROR RBR when QBO sync is in progress for an admin', () => {
                const policyWithQBOSyncError = {
                    ...baseAdminPolicy,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            verified: false,
                            lastSync: {
                                errorDate: new Date().toISOString(),
                                errorMessage: 'QBO sync failed',
                                isAuthenticationError: true,
                                isConnected: false,
                                isSuccessful: false,
                                source: 'NEWEXPENSIFY',
                                successfulDate: '',
                            },
                        },
                    } as unknown as Connections,
                } as OnyxEntry<Policy>;

                // When sync is in progress (second parameter is true), should not show error
                const result = getPolicyBrickRoadIndicatorStatus(policyWithQBOSyncError, true);
                expect(result).toBeUndefined();
            });

            it('does return an ERROR RBR when QBO reimbursable export destination account is missing for an admin', () => {
                const policyWithMissingQBOAccount = {
                    ...baseAdminPolicy,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {
                                reimbursableExpensesExportDestination: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                                reimbursableExpensesAccount: undefined,
                            },
                        },
                    } as unknown as Connections,
                } as OnyxEntry<Policy>;

                const result = getPolicyBrickRoadIndicatorStatus(policyWithMissingQBOAccount, false);
                expect(result).toEqual(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
            });

            it('does not return an ERROR RBR when QBO reimbursable export destination account is missing for a user', () => {
                const policyWithMissingQBOAccount = {
                    ...baseUserPolicy,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {
                                reimbursableExpensesExportDestination: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                                reimbursableExpensesAccount: undefined,
                            },
                        },
                    } as unknown as Connections,
                } as OnyxEntry<Policy>;

                const result = getPolicyBrickRoadIndicatorStatus(policyWithMissingQBOAccount, false);
                expect(result).toBeUndefined();
            });

            it('does not return an ERROR RBR when QBO reimbursable export destination account is configured for an admin', () => {
                const policyWithQBOConfigured = {
                    ...baseAdminPolicy,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {
                                reimbursableExpensesExportDestination: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                                reimbursableExpensesAccount: {id: '123', name: 'Test Account'},
                            },
                        },
                    } as unknown as Connections,
                } as OnyxEntry<Policy>;

                const result = getPolicyBrickRoadIndicatorStatus(policyWithQBOConfigured, false);
                expect(result).toBeUndefined();
            });

            it('does not return an ERROR RBR when QBO connection does not exist for an admin', () => {
                const policyWithoutQBOConnection = {
                    ...baseAdminPolicy,
                    connections: {},
                } as OnyxEntry<Policy>;

                const result = getPolicyBrickRoadIndicatorStatus(policyWithoutQBOConnection, false);
                expect(result).toBeUndefined();
            });

            it('does not return an ERROR RBR when QBO reimbursable export destination is not set for an admin', () => {
                const policyWithQBONoExportDestination = {
                    ...baseAdminPolicy,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {
                                reimbursableExpensesExportDestination: undefined,
                                reimbursableExpensesAccount: undefined,
                            },
                        },
                    } as unknown as Connections,
                } as OnyxEntry<Policy>;

                const result = getPolicyBrickRoadIndicatorStatus(policyWithQBONoExportDestination, false);
                expect(result).toBeUndefined();
            });
        });
    });

    describe('hasDynamicExternalWorkflow', () => {
        it('should return true when policy has DYNAMICEXTERNAL approval mode', () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
            };
            const result = hasDynamicExternalWorkflow(policy);
            expect(result).toBe(true);
        });

        it('should return false when policy has BASIC approval mode', () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const result = hasDynamicExternalWorkflow(policy);
            expect(result).toBe(false);
        });

        it('should return false when policy has ADVANCED approval mode', () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            };
            const result = hasDynamicExternalWorkflow(policy);
            expect(result).toBe(false);
        });

        it('should return false when policy has OPTIONAL approval mode', () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
            };
            const result = hasDynamicExternalWorkflow(policy);
            expect(result).toBe(false);
        });

        it('should return false when policy is undefined', () => {
            const result = hasDynamicExternalWorkflow(undefined);
            expect(result).toBe(false);
        });

        it('should return false when policy has no approvalMode', () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                approvalMode: undefined,
            };
            const result = hasDynamicExternalWorkflow(policy);
            expect(result).toBe(false);
        });
    });

    describe('hasOnlyPersonalPolicies', () => {
        it('should return true when policies is empty', () => {
            const result = hasOnlyPersonalPolicies({});
            expect(result).toBe(true);
        });

        it('should return false when there are policies other than personal policies', () => {
            const policies = {
                '1': {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), pendingAction: undefined},
                '2': {...createRandomPolicy(2, CONST.POLICY.TYPE.PERSONAL), pendingAction: undefined},
            };
            const result = hasOnlyPersonalPolicies(policies);
            expect(result).toBe(false);
        });

        it('should return true when there are no policies other than personal policies', () => {
            const policies = {
                '2': {...createRandomPolicy(2, CONST.POLICY.TYPE.PERSONAL), pendingAction: undefined},
            };
            const result = hasOnlyPersonalPolicies(policies);
            expect(result).toBe(true);
        });
    });

    describe('getEligibleBankAccountShareRecipients', () => {
        beforeEach(() => {
            wrapOnyxWithWaitForBatchedUpdates(Onyx);
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
        it('should return empty array if no admins in policies', () => {
            const policies = {
                '1': {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), pendingAction: undefined},
                '2': {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), pendingAction: undefined},
            };
            const result = getEligibleBankAccountShareRecipients(policies, approverEmail, '1');
            expect(result).toHaveLength(0);
        });
        it('should return array with admins', () => {
            const currentUserLogin = adminEmail;

            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    employeeList: {
                        [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
                '2': {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), pendingAction: undefined},
            };
            const result = getEligibleBankAccountShareRecipients(policies, approverEmail, '1');
            expect(result).toHaveLength(1);
        });
        it('should not return user with already shared bank account', async () => {
            const bankAccountID = '1';
            const currentUserLogin = adminEmail;
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                1: {
                    methodID: 12345,
                    accountData: {
                        sharees: [adminEmail],
                    },
                },
            });

            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    employeeList: {
                        [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
                '2': {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), pendingAction: undefined},
            };
            const result = getEligibleBankAccountShareRecipients(policies, approverEmail, bankAccountID);
            expect(result).toHaveLength(0);
        });
        it('should not return current user for sharing account', async () => {
            const bankAccountID = '1';

            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    employeeList: {
                        [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
                '2': {
                    ...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    employeeList: {
                        [approverEmail]: {email: approverEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
            };
            const result = getEligibleBankAccountShareRecipients(policies, adminEmail, bankAccountID);
            expect(result).toHaveLength(1);
        });
    });

    describe('hasOtherControlWorkspaces', () => {
        it('should return false when policies is empty', () => {
            const result = hasOtherControlWorkspaces([], '1');
            expect(result).toBe(false);
        });

        it('should return false when there are no control workspaces other than the current one', () => {
            const policies = [
                {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), pendingAction: undefined},
                {...createRandomPolicy(2, CONST.POLICY.TYPE.PERSONAL), pendingAction: undefined},
                {...createRandomPolicy(3, CONST.POLICY.TYPE.TEAM), pendingAction: undefined},
            ];
            const result = hasOtherControlWorkspaces(policies, '1');
            expect(result).toBe(false);
        });

        it('should return true when there are other control workspaces', () => {
            const policies = [
                {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), pendingAction: undefined},
                {...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE), pendingAction: undefined},
                {...createRandomPolicy(3, CONST.POLICY.TYPE.PERSONAL), pendingAction: undefined},
            ];
            const result = hasOtherControlWorkspaces(policies, '1');
            expect(result).toBe(true);
        });
    });

    describe('hasPolicyWithXeroConnection', () => {
        it('should return false when no admin policies are provided', () => {
            const result = hasPolicyWithXeroConnection(undefined);
            expect(result).toBe(false);
        });

        it('should return false when no admin policies have Xero connection', () => {
            const adminPolicies: Policy[] = [
                {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                            verified: true,
                            lastSync: {
                                errorDate: '',
                                errorMessage: '',
                                isAuthenticationError: false,
                                isConnected: true,
                                isSuccessful: true,
                                source: 'NEWEXPENSIFY',
                                successfulDate: '',
                            },
                        },
                    } as Connections,
                },
                {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), pendingAction: undefined},
            ];
            const result = hasPolicyWithXeroConnection(adminPolicies);
            expect(result).toBe(false);
        });

        it('should return true when at least one admin policy has Xero connection', () => {
            const adminPolicies: Policy[] = [
                {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.XERO]: {
                            lastSync: {
                                errorDate: '',
                                errorMessage: '',
                                isAuthenticationError: false,
                                isConnected: true,
                                isSuccessful: true,
                                source: 'NEWEXPENSIFY',
                                successfulDate: '',
                            },
                            config: {} as unknown as Connections[typeof CONST.POLICY.CONNECTIONS.NAME.XERO]['config'],
                            data: {} as unknown as Connections[typeof CONST.POLICY.CONNECTIONS.NAME.XERO]['data'],
                        },
                    } as Connections,
                },
                {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), pendingAction: undefined},
            ];
            const result = hasPolicyWithXeroConnection(adminPolicies);
            expect(result).toBe(true);
        });
    });

    describe('getTagApproverRule', () => {
        it('should return undefined when no approval rules are present', () => {
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                rules: {
                    approvalRules: [],
                },
            };
            const result = getTagApproverRule(policy, '');
            expect(result).toBeUndefined();
        });
    });

    describe('getAllTaxRatesNamesAndValues', () => {
        it('returns empty object when there are no policies or no tax rates', () => {
            expect(getAllTaxRatesNamesAndValues(undefined)).toEqual({});
            expect(getAllTaxRatesNamesAndValues({})).toEqual({});
            const policiesWithoutTaxes: OnyxCollection<Policy> = {
                policy1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    taxRates: undefined,
                },
            };
            expect(getAllTaxRatesNamesAndValues(policiesWithoutTaxes)).toEqual({});
        });

        it('aggregates tax rates across policies', () => {
            const policies: OnyxCollection<Policy> = {
                p1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    taxRates: {
                        taxes: {
                            TAX_A: {name: 'A', value: '5'},
                            TAX_B: {name: 'B', value: '10'},
                        },
                        name: '',
                        defaultExternalID: '',
                        defaultValue: '',
                        foreignTaxDefault: '',
                    },
                },
                p2: {
                    ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                    taxRates: {
                        taxes: {
                            TAX_C: {name: 'C', value: '15'},
                        },
                        name: '',
                        defaultExternalID: '',
                        defaultValue: '',
                        foreignTaxDefault: '',
                    },
                },
            };
            const result = getAllTaxRatesNamesAndValues(policies);
            expect(Object.keys(result).sort()).toEqual(['TAX_A', 'TAX_B', 'TAX_C']);
            expect(result.TAX_B).toEqual({name: 'B', value: '10'});
        });

        it('preserves the first occurrence when duplicate tax keys appear in multiple policies', () => {
            const policies: OnyxCollection<Policy> = {
                first: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    taxRates: {
                        taxes: {
                            DUP_TAX: {name: 'First', value: '1'},
                        },
                        name: '',
                        defaultExternalID: '',
                        defaultValue: '',
                        foreignTaxDefault: '',
                    },
                },
                second: {
                    ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                    taxRates: {
                        taxes: {
                            DUP_TAX: {name: 'Second', value: '2'},
                        },
                        name: '',
                        defaultExternalID: '',
                        defaultValue: '',
                        foreignTaxDefault: '',
                    },
                },
            };
            const result = getAllTaxRatesNamesAndValues(policies);
            expect(result.DUP_TAX).toEqual({name: 'First', value: '1'});
        });
    });

    it('should return undefined when no tag approver rule is present', () => {
        const policy: Policy = {
            ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
            rules: {
                approvalRules: [
                    {
                        id: 'rule-1',
                        applyWhen: [
                            {
                                field: CONST.POLICY.FIELDS.TAG,
                                condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
                                value: 'Fake tag',
                            },
                        ],
                        approver: 'lol@hhh.com',
                    },
                ],
            },
        };
        const result = getTagApproverRule(policy, 'NonExistentTag');
        expect(result).toBeUndefined();
    });

    it('should return the tag approver rule when present', () => {
        const tagName = 'ImportantTag';
        const policy: Policy = {
            ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
            rules: {
                approvalRules: [
                    {
                        id: 'rule-1',
                        applyWhen: [
                            {
                                field: CONST.POLICY.FIELDS.TAG,
                                condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
                                value: tagName,
                            },
                        ],
                        approver: 'approver@example.com',
                    },
                ],
            },
        };
        const result = getTagApproverRule(policy, tagName);
        expect(result).toEqual({
            id: 'rule-1',
            applyWhen: [
                {
                    field: CONST.POLICY.FIELDS.TAG,
                    condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
                    value: tagName,
                },
            ],
            approver: 'approver@example.com',
        });
    });
});
