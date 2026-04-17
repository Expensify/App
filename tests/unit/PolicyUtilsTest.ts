/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxMultiSetInput} from 'react-native-onyx';
import useDefaultFundID from '@hooks/useDefaultFundID';
import DateUtils from '@libs/DateUtils';
import {
    areAllGroupPoliciesExpenseChatDisabled,
    canSendInvoiceFromWorkspace,
    getActivePolicies,
    getActivePoliciesWithExpenseChatAndPerDiemEnabled,
    getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates,
    getAllTaxRates,
    getAllTaxRatesNamesAndValues,
    getConnectedIntegrationNamesForPolicies,
    getCustomUnitsForDuplication,
    getDefaultTimeTrackingRate,
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
    hasConfiguredRules,
    hasDependentTags,
    hasDynamicExternalWorkflow,
    hasIndependentTags,
    hasOnlyPersonalPolicies,
    hasOtherControlWorkspaces,
    hasPolicyWithXeroConnection,
    isCurrentUserMemberOfAnyPolicy,
    isPolicyMemberWithoutPendingDelete,
    shouldShowPolicy,
    sortPoliciesByName,
    sortWorkspacesBySelected,
} from '@libs/PolicyUtils';
import {isWorkspaceEligibleForReportChange} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import {getPolicyBrickRoadIndicatorStatus} from '@src/libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyEmployeeList, PolicyTagLists, Report, Transaction} from '@src/types/onyx';
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
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

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
            await Onyx.set(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}18441278`, {
                currentBalance: 0,
                domainName: 'expensify-policy8fe6324c4897.exfy',
                earnedCashback: 0,
                isLoading: false,
                isMonthlySettlementAllowed: false,
                marqetaBusinessToken: 18441278,
                paymentBankAccountAddressName: 'Alberta Bobbeth Charleson',
                paymentBankAccountID: 3288123,
                paymentBankAccountNumber: 'XXXXXXXXXXXX1111',
                preferredPolicy: '2',
                remainingLimit: 0,
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
                [CONST.COUNTRY.US]: {
                    paymentBankAccountID: 1234,
                },
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
            expect(getCustomUnitsForDuplication(policy, false, false, {distanceCustomUnitID: otherUnit.customUnitID, perDiemCustomUnitID: perDiemUnit.customUnitID})).toBeUndefined();
        });

        it('returns all custom units if both options are selected', () => {
            const result = getCustomUnitsForDuplication(policy, true, true, {distanceCustomUnitID: otherUnit.customUnitID, perDiemCustomUnitID: perDiemUnit.customUnitID});
            expect(result).toEqual(policy.customUnits);
        });
        it('returns only non-per-diem units if only custom units option is selected', () => {
            const result = getCustomUnitsForDuplication(policy, true, false, {distanceCustomUnitID: otherUnit.customUnitID, perDiemCustomUnitID: perDiemUnit.customUnitID});
            expect(result).toEqual({[otherUnit.customUnitID]: otherUnit});
        });

        it('returns only per diem unit if only per diem option is selected', () => {
            const result = getCustomUnitsForDuplication(policy, false, true, {distanceCustomUnitID: otherUnit.customUnitID, perDiemCustomUnitID: perDiemUnit.customUnitID});
            expect(result).toEqual({[perDiemUnit.customUnitID]: perDiemUnit});
        });

        it('returns undefined if customUnits is empty', () => {
            expect(
                getCustomUnitsForDuplication(policyWithoutCustomUnits, true, true, {distanceCustomUnitID: otherUnit.customUnitID, perDiemCustomUnitID: perDiemUnit.customUnitID}),
            ).toBeUndefined();
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
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
                } as unknown as OnyxMultiSetInput);
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
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
                } as unknown as OnyxMultiSetInput);
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
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction3.transactionID}`]: transaction3,
                } as unknown as OnyxMultiSetInput);

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
                    await Onyx.multiSet({
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
                    } as unknown as OnyxMultiSetInput);
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
                    await Onyx.multiSet({
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
                    } as unknown as OnyxMultiSetInput);
                    expect(getSubmitToAccountID(policy, expenseReport)).toBe(tagApprover2AccountID);
                });
            });
        });
    });
    describe('shouldShowPolicy', () => {
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
                pendingAction: null,
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
                pendingAction: null,
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
                pendingAction: null,
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
                pendingAction: null,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy);

            const result = isWorkspaceEligibleForReportChange(currentUserLogin, newPolicy);
            expect(result).toBe(false);
        });

        it('returns false if policy is pending delete', async () => {
            const currentUserLogin = employeeEmail;
            const newPolicy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                isPolicyExpenseChatEnabled: true,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };
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

    describe('getAllTaxRates (getAllTaxRatesNamesAndKeys)', () => {
        it('returns empty object when there are no policies or no tax rates', () => {
            expect(getAllTaxRates(undefined)).toEqual({});
            expect(getAllTaxRates({})).toEqual({});
            const policiesWithoutTaxes: OnyxCollection<Policy> = {
                policy1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    taxRates: undefined,
                },
            };
            expect(getAllTaxRates(policiesWithoutTaxes)).toEqual({});
        });

        it('maps tax rate names to their keys across policies', () => {
            const policies: OnyxCollection<Policy> = {
                p1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    taxRates: {
                        taxes: {
                            id_vat: {name: 'VAT', value: '20'},
                            id_gst: {name: 'GST', value: '10'},
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
                            id_sales: {name: 'Sales Tax', value: '8'},
                        },
                        name: '',
                        defaultExternalID: '',
                        defaultValue: '',
                        foreignTaxDefault: '',
                    },
                },
            };
            const result = getAllTaxRates(policies);
            expect(result).toEqual({
                VAT: ['id_vat'],
                GST: ['id_gst'],
                'Sales Tax': ['id_sales'],
            });
        });

        it('groups different keys under the same tax name', () => {
            const policies: OnyxCollection<Policy> = {
                p1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    taxRates: {
                        taxes: {
                            key_a: {name: 'VAT', value: '20'},
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
                            key_b: {name: 'VAT', value: '15'},
                        },
                        name: '',
                        defaultExternalID: '',
                        defaultValue: '',
                        foreignTaxDefault: '',
                    },
                },
            };
            const result = getAllTaxRates(policies);
            expect(result.VAT).toEqual(['key_a', 'key_b']);
        });

        it('deduplicates identical keys for the same tax name', () => {
            const policies: OnyxCollection<Policy> = {
                p1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    taxRates: {
                        taxes: {
                            same_key: {name: 'VAT', value: '20'},
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
                            same_key: {name: 'VAT', value: '20'},
                        },
                        name: '',
                        defaultExternalID: '',
                        defaultValue: '',
                        foreignTaxDefault: '',
                    },
                },
            };
            const result = getAllTaxRates(policies);
            expect(result.VAT).toEqual(['same_key']);
        });

        it('skips undefined policy entries', () => {
            const policies: OnyxCollection<Policy> = {
                p1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    taxRates: {
                        taxes: {id_vat: {name: 'VAT', value: '20'}},
                        name: '',
                        defaultExternalID: '',
                        defaultValue: '',
                        foreignTaxDefault: '',
                    },
                },
                p2: undefined,
            };
            const result = getAllTaxRates(policies);
            expect(result).toEqual({VAT: ['id_vat']});
        });
    });

    describe('canSendInvoiceFromWorkspace', () => {
        it('returns true when areInvoicesEnabled is true', () => {
            const policy = {areInvoicesEnabled: true} as Policy;
            expect(canSendInvoiceFromWorkspace(policy)).toBe(true);
        });

        it('returns false when areInvoicesEnabled is false', () => {
            const policy = {areInvoicesEnabled: false} as Policy;
            expect(canSendInvoiceFromWorkspace(policy)).toBe(false);
        });

        it('returns false when policy is undefined', () => {
            expect(canSendInvoiceFromWorkspace(undefined)).toBe(false);
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

    describe('areAllGroupPoliciesExpenseChatDisabled', () => {
        it('should return false when policies is empty', () => {
            const result = areAllGroupPoliciesExpenseChatDisabled({});
            expect(result).toBe(false);
        });

        it('should return false when there are no group policies (only personal)', () => {
            const policies: OnyxCollection<Policy> = {
                '1': {...createRandomPolicy(1, CONST.POLICY.TYPE.PERSONAL), isPolicyExpenseChatEnabled: false},
                '2': {...createRandomPolicy(2, CONST.POLICY.TYPE.PERSONAL), isPolicyExpenseChatEnabled: true},
            };
            const result = areAllGroupPoliciesExpenseChatDisabled(policies);
            expect(result).toBe(false);
        });

        it('should return false when single group policy has expense chat enabled', () => {
            const policies: OnyxCollection<Policy> = {
                '1': {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), isPolicyExpenseChatEnabled: true, pendingAction: null},
            };
            const result = areAllGroupPoliciesExpenseChatDisabled(policies);
            expect(result).toBe(false);
        });

        it('should return false when multiple group policies and at least one has expense chat enabled', () => {
            const policies: OnyxCollection<Policy> = {
                '1': {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), isPolicyExpenseChatEnabled: false, pendingAction: null},
                '2': {...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE), isPolicyExpenseChatEnabled: true, pendingAction: null},
                '3': {...createRandomPolicy(3, CONST.POLICY.TYPE.TEAM), isPolicyExpenseChatEnabled: false, pendingAction: null},
            };
            const result = areAllGroupPoliciesExpenseChatDisabled(policies);
            expect(result).toBe(false);
        });

        it('should return true when single group policy has expense chat disabled', () => {
            const policies: OnyxCollection<Policy> = {
                '1': {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), isPolicyExpenseChatEnabled: false, pendingAction: null},
            };
            const result = areAllGroupPoliciesExpenseChatDisabled(policies);
            expect(result).toBe(true);
        });

        it('should return true when all group policies have expense chat disabled', () => {
            const policies: OnyxCollection<Policy> = {
                '1': {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), isPolicyExpenseChatEnabled: false, pendingAction: null},
                '2': {...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE), isPolicyExpenseChatEnabled: false, pendingAction: null},
                '3': {...createRandomPolicy(3, CONST.POLICY.TYPE.TEAM), isPolicyExpenseChatEnabled: false, pendingAction: null},
            };
            const result = areAllGroupPoliciesExpenseChatDisabled(policies);
            expect(result).toBe(true);
        });
    });

    describe('getDefaultTimeTrackingRate', () => {
        it('should return rate in subunits', () => {
            const policy: Policy = {
                ...createRandomPolicy(1),
                units: {
                    time: {
                        enabled: true,
                        rate: 20,
                    },
                },
            };
            expect(getDefaultTimeTrackingRate(policy)).toBe(2000);
        });

        it('should return 0 when the rate is 0, not undefined', () => {
            const policy: Policy = {
                ...createRandomPolicy(1),
                units: {
                    time: {
                        enabled: true,
                        rate: 0,
                    },
                },
            };
            expect(getDefaultTimeTrackingRate(policy)).toBe(0);
        });

        it('should return undefined when the rate is not defined on the policy', () => {
            const policy = createRandomPolicy(1);
            expect(getDefaultTimeTrackingRate(policy)).toBeUndefined();
        });
    });

    describe('per diem policy filters', () => {
        const perDiemCustomUnit = {
            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
            customUnitID: 'ABCDEF',
            enabled: true,
            rates: {
                London: {
                    customUnitRateID: 'London',
                    name: 'London',
                },
            },
        };

        it('returns only control policies from getActivePoliciesWithExpenseChatAndPerDiemEnabled', () => {
            const policies: OnyxCollection<Policy> = {
                corporate: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    role: CONST.POLICY.ROLE.USER,
                    pendingAction: null,
                    isPolicyExpenseChatEnabled: true,
                    arePerDiemRatesEnabled: true,
                    customUnits: {
                        ABCDEF: perDiemCustomUnit,
                    },
                },
                collect: {
                    ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                    role: CONST.POLICY.ROLE.USER,
                    pendingAction: null,
                    isPolicyExpenseChatEnabled: true,
                    arePerDiemRatesEnabled: true,
                    customUnits: {
                        ABCDEF: perDiemCustomUnit,
                    },
                },
            };

            const result = getActivePoliciesWithExpenseChatAndPerDiemEnabled(policies, undefined);
            expect(result).toHaveLength(1);
            expect(result.at(0)?.type).toBe(CONST.POLICY.TYPE.CORPORATE);
        });

        it('returns only control policies with rates from getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates', () => {
            const policies: OnyxCollection<Policy> = {
                corporateWithRates: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    role: CONST.POLICY.ROLE.USER,
                    pendingAction: null,
                    isPolicyExpenseChatEnabled: true,
                    arePerDiemRatesEnabled: true,
                    customUnits: {
                        ABCDEF: perDiemCustomUnit,
                    },
                },
                corporateWithoutRates: {
                    ...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE),
                    role: CONST.POLICY.ROLE.USER,
                    pendingAction: null,
                    isPolicyExpenseChatEnabled: true,
                    arePerDiemRatesEnabled: true,
                    customUnits: {
                        ABCDEF: {
                            ...perDiemCustomUnit,
                            rates: {},
                        },
                    },
                },
                collectWithRates: {
                    ...createRandomPolicy(3, CONST.POLICY.TYPE.TEAM),
                    role: CONST.POLICY.ROLE.USER,
                    pendingAction: null,
                    isPolicyExpenseChatEnabled: true,
                    arePerDiemRatesEnabled: true,
                    customUnits: {
                        ABCDEF: perDiemCustomUnit,
                    },
                },
            };

            const result = getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates(policies, undefined);
            expect(result).toHaveLength(1);
            expect(result.at(0)?.id).toBe('1');
        });
    });

    describe('sortPoliciesByName', () => {
        const localeCompare = (a: string, b: string) => a.localeCompare(b);

        it('sorts policies alphabetically by name', () => {
            const policies: Policy[] = [
                {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), name: 'Charlie'},
                {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), name: 'Alpha'},
                {...createRandomPolicy(3, CONST.POLICY.TYPE.TEAM), name: 'Bravo'},
            ];

            const result = sortPoliciesByName(policies, localeCompare);
            expect(result.map((p) => p.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
        });

        it('returns empty array for empty input', () => {
            expect(sortPoliciesByName([], localeCompare)).toEqual([]);
        });

        it('treats undefined or empty names as empty string', () => {
            const policies: Policy[] = [
                {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), name: 'Bravo'},
                {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), name: ''},
                {...createRandomPolicy(3, CONST.POLICY.TYPE.TEAM), name: 'Alpha'},
            ];

            const result = sortPoliciesByName(policies, localeCompare);
            expect(result.map((p) => p.name)).toEqual(['', 'Alpha', 'Bravo']);
        });

        it('returns single-element array as-is', () => {
            const policies: Policy[] = [{...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), name: 'Only'}];

            const result = sortPoliciesByName(policies, localeCompare);
            expect(result).toHaveLength(1);
            expect(result.at(0)?.name).toBe('Only');
        });
    });

    describe('getConnectedIntegrationNamesForPolicies', () => {
        it('returns empty Set when policies is undefined', () => {
            expect(getConnectedIntegrationNamesForPolicies(undefined)).toEqual(new Set());
        });

        it('returns empty Set when policies is empty object', () => {
            expect(getConnectedIntegrationNamesForPolicies({})).toEqual(new Set());
        });

        it('returns Set with connection name when policy has verified connection', () => {
            const policyWithXero = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.XERO]: {
                        lastSync: {isConnected: true},
                    },
                } as Connections,
            } as Policy;
            const policies: OnyxCollection<Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}1`]: policyWithXero,
            };
            expect(getConnectedIntegrationNamesForPolicies(policies)).toEqual(new Set([CONST.POLICY.CONNECTIONS.NAME.XERO]));
        });

        it('filters by policyIDs when provided', () => {
            const policy1WithQBO = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {lastSync: {isConnected: true}},
                } as Connections,
            } as Policy;
            const policy2WithXero = {
                ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.XERO]: {lastSync: {isConnected: true}},
                } as Connections,
            } as Policy;
            const policies: OnyxCollection<Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}1`]: policy1WithQBO,
                [`${ONYXKEYS.COLLECTION.POLICY}2`]: policy2WithXero,
            };
            expect(getConnectedIntegrationNamesForPolicies(policies, ['1'])).toEqual(new Set([CONST.POLICY.CONNECTIONS.NAME.QBO]));
        });

        it('returns all connection names when policies have different connections', () => {
            const policy1 = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {lastSync: {isConnected: true}},
                } as Connections,
            } as Policy;

            const policy2 = {
                ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.XERO]: {lastSync: {isConnected: true}},
                } as Connections,
            } as Policy;

            const policies: OnyxCollection<Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}1`]: policy1,
                [`${ONYXKEYS.COLLECTION.POLICY}2`]: policy2,
            };
            const result = getConnectedIntegrationNamesForPolicies(policies);
            expect(result).toContain(CONST.POLICY.CONNECTIONS.NAME.QBO);
            expect(result).toContain(CONST.POLICY.CONNECTIONS.NAME.XERO);
            expect(result.size).toBe(2);
        });
    });

    describe('hasDependentTags', () => {
        it('returns false when policy has no multiple tag lists', () => {
            const policy = {hasMultipleTagLists: false} as Policy;
            const policyTagList: PolicyTagLists = {};
            expect(hasDependentTags(policy, policyTagList)).toBe(false);
        });

        it('returns false when policy is undefined', () => {
            expect(hasDependentTags(undefined, {})).toBe(false);
        });

        it('returns false when tags have no parentTagsFilter', () => {
            const policy = {hasMultipleTagLists: true} as Policy;
            const policyTagList = {
                Department: {
                    name: 'Department',
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true},
                    },
                    required: false,
                    orderWeight: 0,
                },
            } as PolicyTagLists;
            expect(hasDependentTags(policy, policyTagList)).toBe(false);
        });

        it('returns true when a tag has rules.parentTagsFilter', () => {
            const policy = {hasMultipleTagLists: true} as Policy;
            const policyTagList = {
                Department: {
                    name: 'Department',
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true, rules: {parentTagsFilter: '^California$'}},
                    },
                    required: false,
                    orderWeight: 0,
                },
            } as PolicyTagLists;
            expect(hasDependentTags(policy, policyTagList)).toBe(true);
        });

        it('returns true when a tag has parentTagsFilter at the top level', () => {
            const policy = {hasMultipleTagLists: true} as Policy;
            const policyTagList = {
                Department: {
                    name: 'Department',
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true, parentTagsFilter: '^California$'},
                    },
                    required: false,
                    orderWeight: 0,
                },
            } as PolicyTagLists;
            expect(hasDependentTags(policy, policyTagList)).toBe(true);
        });
    });

    describe('hasIndependentTags', () => {
        it('returns false when policy has no multiple tag lists', () => {
            const policy = {hasMultipleTagLists: false} as Policy;
            const policyTagList: PolicyTagLists = {};
            expect(hasIndependentTags(policy, policyTagList)).toBe(false);
        });

        it('returns false when policy is undefined', () => {
            expect(hasIndependentTags(undefined, {})).toBe(false);
        });

        it('returns false when tags are dependent (have parentTagsFilter)', () => {
            const policy = {hasMultipleTagLists: true} as Policy;
            const policyTagList = {
                Department: {
                    name: 'Department',
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true, rules: {parentTagsFilter: '^California$'}},
                    },
                    required: false,
                    orderWeight: 0,
                },
            } as PolicyTagLists;
            expect(hasIndependentTags(policy, policyTagList)).toBe(false);
        });

        it('returns false when all tag lists are empty', () => {
            const policy = {hasMultipleTagLists: true} as Policy;
            const policyTagList = {
                Department: {
                    name: 'Department',
                    tags: {},
                    required: false,
                    orderWeight: 0,
                },
                Location: {
                    name: 'Location',
                    tags: {},
                    required: false,
                    orderWeight: 1,
                },
            } as PolicyTagLists;
            expect(hasIndependentTags(policy, policyTagList)).toBe(false);
        });

        it('returns true when tags are independent and at least one tag exists', () => {
            const policy = {hasMultipleTagLists: true} as Policy;
            const policyTagList = {
                Department: {
                    name: 'Department',
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true},
                    },
                    required: false,
                    orderWeight: 0,
                },
            } as PolicyTagLists;
            expect(hasIndependentTags(policy, policyTagList)).toBe(true);
        });

        it('returns true when at least one tag list has tags and others are empty', () => {
            const policy = {hasMultipleTagLists: true} as Policy;
            const policyTagList = {
                Department: {
                    name: 'Department',
                    tags: {},
                    required: false,
                    orderWeight: 0,
                },
                Location: {
                    name: 'Location',
                    tags: {
                        'New York': {name: 'New York', enabled: true},
                    },
                    required: false,
                    orderWeight: 1,
                },
            } as PolicyTagLists;
            expect(hasIndependentTags(policy, policyTagList)).toBe(true);
        });

        it('returns false when policyTagList is undefined', () => {
            const policy = {hasMultipleTagLists: true} as Policy;
            expect(hasIndependentTags(policy, undefined)).toBe(false);
        });
    });

    describe('hasConfiguredRules', () => {
        it('returns false when policy is undefined', () => {
            expect(hasConfiguredRules(undefined)).toBe(false);
        });

        it('returns false when policy has no rules configured', () => {
            expect(hasConfiguredRules({} as Policy)).toBe(false);
        });

        describe('customRules', () => {
            it('returns true when customRules is non-empty', () => {
                expect(hasConfiguredRules({customRules: 'some rule'} as Policy)).toBe(true);
            });

            it('returns false when customRules is an empty string', () => {
                expect(hasConfiguredRules({customRules: ''} as Policy)).toBe(false);
            });

            it('returns false when customRules is only whitespace', () => {
                expect(hasConfiguredRules({customRules: '   '} as Policy)).toBe(false);
            });
        });

        describe('rules.approvalRules', () => {
            it('returns true when approvalRules has items', () => {
                const policy = {rules: {approvalRules: [{id: '1', applyWhen: [], approver: 'approver@test.com'}]}} as unknown as Policy;
                expect(hasConfiguredRules(policy)).toBe(true);
            });

            it('returns false when approvalRules is empty', () => {
                expect(hasConfiguredRules({rules: {approvalRules: []}} as unknown as Policy)).toBe(false);
            });
        });

        describe('rules.expenseRules', () => {
            it('returns true when expenseRules has items', () => {
                const policy = {
                    rules: {
                        expenseRules: [
                            {
                                id: '1',
                                applyWhen: [],
                                tax: {field_id_TAX: {externalID: 'TAX_US'}},
                            },
                        ],
                    },
                } as unknown as Policy;
                expect(hasConfiguredRules(policy)).toBe(true);
            });

            it('returns false when expenseRules is empty', () => {
                expect(hasConfiguredRules({rules: {expenseRules: []}} as unknown as Policy)).toBe(false);
            });
        });

        describe('rules.codingRules', () => {
            it('returns true when codingRules has entries', () => {
                const policy = {
                    rules: {
                        codingRules: {
                            rule1: {
                                ruleID: 'rule1',
                                filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Starbucks'},
                            },
                        },
                    },
                } as unknown as Policy;
                expect(hasConfiguredRules(policy)).toBe(true);
            });

            it('returns false when codingRules is empty', () => {
                expect(hasConfiguredRules({rules: {codingRules: {}}} as unknown as Policy)).toBe(false);
            });
        });

        describe('maxExpenseAmount', () => {
            it('returns true when maxExpenseAmount is set to a non-default value', () => {
                expect(hasConfiguredRules({maxExpenseAmount: 500000} as Policy)).toBe(true);
            });

            it('returns false when maxExpenseAmount is the default value', () => {
                expect(hasConfiguredRules({maxExpenseAmount: CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT} as Policy)).toBe(false);
            });

            it('returns false when maxExpenseAmount is the disabled value', () => {
                expect(hasConfiguredRules({maxExpenseAmount: CONST.DISABLED_MAX_EXPENSE_VALUE} as Policy)).toBe(false);
            });
        });

        describe('maxExpenseAge', () => {
            it('returns true when maxExpenseAge is set to a non-default value', () => {
                expect(hasConfiguredRules({maxExpenseAge: 30} as Policy)).toBe(true);
            });

            it('returns false when maxExpenseAge is the default value', () => {
                expect(hasConfiguredRules({maxExpenseAge: CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE} as Policy)).toBe(false);
            });

            it('returns false when maxExpenseAge is the disabled value', () => {
                expect(hasConfiguredRules({maxExpenseAge: CONST.DISABLED_MAX_EXPENSE_VALUE} as Policy)).toBe(false);
            });
        });

        describe('maxExpenseAmountNoReceipt', () => {
            it('returns true when maxExpenseAmountNoReceipt is set to a non-default value', () => {
                expect(hasConfiguredRules({maxExpenseAmountNoReceipt: 5000} as Policy)).toBe(true);
            });

            it('returns false when maxExpenseAmountNoReceipt is the default value', () => {
                expect(hasConfiguredRules({maxExpenseAmountNoReceipt: CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_RECEIPT} as Policy)).toBe(false);
            });

            it('returns false when maxExpenseAmountNoReceipt is the disabled value', () => {
                expect(hasConfiguredRules({maxExpenseAmountNoReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE} as Policy)).toBe(false);
            });
        });

        describe('maxExpenseAmountNoItemizedReceipt', () => {
            it('returns true when maxExpenseAmountNoItemizedReceipt is set to a non-default value', () => {
                expect(hasConfiguredRules({maxExpenseAmountNoItemizedReceipt: 10000} as Policy)).toBe(true);
            });

            it('returns false when maxExpenseAmountNoItemizedReceipt is the default value', () => {
                expect(hasConfiguredRules({maxExpenseAmountNoItemizedReceipt: CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_ITEMIZED_RECEIPT} as Policy)).toBe(false);
            });

            it('returns false when maxExpenseAmountNoItemizedReceipt is the disabled value', () => {
                expect(hasConfiguredRules({maxExpenseAmountNoItemizedReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE} as Policy)).toBe(false);
            });
        });

        describe('defaultBillable', () => {
            it('returns true when defaultBillable is true', () => {
                expect(hasConfiguredRules({defaultBillable: true} as Policy)).toBe(true);
            });

            it('returns false when defaultBillable is false', () => {
                expect(hasConfiguredRules({defaultBillable: false} as Policy)).toBe(false);
            });
        });

        describe('defaultReimbursable', () => {
            it('returns true when defaultReimbursable is false', () => {
                expect(hasConfiguredRules({defaultReimbursable: false} as Policy)).toBe(true);
            });

            it('returns false when defaultReimbursable is true', () => {
                expect(hasConfiguredRules({defaultReimbursable: true} as Policy)).toBe(false);
            });
        });

        describe('eReceipts', () => {
            it('returns true when eReceipts is true', () => {
                expect(hasConfiguredRules({eReceipts: true} as Policy)).toBe(true);
            });

            it('returns false when eReceipts is false', () => {
                expect(hasConfiguredRules({eReceipts: false} as Policy)).toBe(false);
            });
        });

        describe('requireCompanyCardsEnabled', () => {
            it('returns true when requireCompanyCardsEnabled is true', () => {
                expect(hasConfiguredRules({requireCompanyCardsEnabled: true} as Policy)).toBe(true);
            });

            it('returns false when requireCompanyCardsEnabled is false', () => {
                expect(hasConfiguredRules({requireCompanyCardsEnabled: false} as Policy)).toBe(false);
            });
        });

        describe('prohibitedExpenses', () => {
            it('returns true when a prohibitedExpenses value differs from its default', () => {
                // alcohol defaults to false — setting it to true triggers the rule
                expect(hasConfiguredRules({prohibitedExpenses: {alcohol: true}} as Policy)).toBe(true);
            });

            it('returns true when gambling is disabled (differs from default true)', () => {
                expect(hasConfiguredRules({prohibitedExpenses: {gambling: false}} as Policy)).toBe(true);
            });

            it('returns false when prohibitedExpenses matches all defaults', () => {
                expect(hasConfiguredRules({prohibitedExpenses: {...CONST.POLICY.DEFAULT_PROHIBITED_EXPENSES}} as Policy)).toBe(false);
            });

            it('returns false when prohibitedExpenses is an empty object', () => {
                expect(hasConfiguredRules({prohibitedExpenses: {}} as Policy)).toBe(false);
            });
        });
    });
});
