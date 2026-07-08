/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';

import useDefaultFundID from '@hooks/useDefaultFundID';

import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {
    arePolicyRulesEnabled,
    canAccessSubmitWorkspaceFeatures,
    canMemberAssignRole,
    canMemberManageMemberWithRole,
    canMemberRead,
    canMemberWrite,
    canSendInvoiceFromWorkspace,
    findVendorByID,
    getActivePolicies,
    getActivePoliciesWithExpenseChatAndPerDiemEnabled,
    getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates,
    getAllTaxRates,
    getAllTaxRatesNamesAndValues,
    getCustomUnitsForDuplication,
    getDefaultChatEnabledPolicy,
    getDefaultTimeTrackingRate,
    getEligibleBankAccountShareRecipients,
    getExcludedUsers,
    getExpensifyTeamExclusions,
    getManagerAccountID,
    getMatchingVendorByID,
    getMatchingVendors,
    getPolicyBrickRoadIndicatorStatus,
    getPolicyByCustomUnitID,
    getPolicyEmployeeAccountIDs,
    getRateDisplayValue,
    getSubmitToAccountID,
    getSubmitToEmail,
    getTagApproverRule,
    getTagGLCode,
    getTagList,
    getTagListByOrderWeight,
    getUberConnectionErrorDirectlyFromPolicy,
    getUnitRateValue,
    hasConfiguredRules,
    hasDependentTags,
    hasDynamicExternalWorkflow,
    hasEligibleActiveAdminFromWorkspaces,
    hasIndependentTags,
    hasOnlyPersonalPolicies,
    hasOtherControlWorkspaces,
    hasPolicyRulesError,
    hasPolicyWithXeroConnection,
    hasVendorFeature,
    isMergeHRCompleteSetupNeededSelector,
    isPerDiemEnabled,
    isPolicyMemberWithoutPendingDelete,
    isSubmitterApproveBlockedOnSubmitWorkspace,
    shouldShowPolicy,
    sortPoliciesByName,
    sortWorkspacesBySelected,
    tryNavigateToSubmitWorkspaceUpgrade,
} from '@libs/PolicyUtils';
import {isWorkspaceEligibleForReportChange} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy, PolicyEmployeeList, PolicyTagLists, Report, Transaction} from '@src/types/onyx';
import type {Connections, QBONonReimbursableExportAccountType, SageIntacctExportConfig} from '@src/types/onyx/Policy';

import type {OnyxCollection, OnyxEntry, OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';
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

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
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
const guideEmail = 'guide@expensify.com';
const guideAccountID = 9;

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
    '9': {
        accountID: guideAccountID,
        login: guideEmail,
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

    describe('canMemberRead and canMemberWrite', () => {
        const memberLogin = 'member@test.com';
        const buildPolicy = (role: Policy['role']): Policy =>
            createMock<Policy>({
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                role,
                employeeList: {
                    [memberLogin]: {
                        role,
                    },
                },
            });

        it('allows write access to satisfy read access', () => {
            expect(canMemberRead(buildPolicy(CONST.POLICY.ROLE.CARD_ADMIN), memberLogin, CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD)).toBe(true);
        });

        it('denies access when the role does not have the feature', () => {
            expect(canMemberRead(buildPolicy(CONST.POLICY.ROLE.USER), memberLogin, CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD)).toBe(false);
        });

        it('uses the requested member role when login is provided', () => {
            const policy = {
                ...buildPolicy(CONST.POLICY.ROLE.ADMIN),
                employeeList: {
                    'member@test.com': {
                        role: CONST.POLICY.ROLE.USER,
                    },
                },
            };

            expect(canMemberWrite(policy, memberLogin, CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD)).toBe(false);
        });

        it('allows admins to write every policy feature', () => {
            const policy = buildPolicy(CONST.POLICY.ROLE.ADMIN);

            for (const feature of Object.values(CONST.POLICY.POLICY_FEATURE)) {
                expect(canMemberWrite(policy, memberLogin, feature)).toBe(true);
            }
        });

        it('does not allow editors to assign elevated roles', () => {
            const policy = buildPolicy(CONST.POLICY.ROLE.EDITOR);

            expect(canMemberWrite(policy, memberLogin, CONST.POLICY.POLICY_FEATURE.OVERVIEW)).toBe(true);
            expect(canMemberWrite(policy, memberLogin, CONST.POLICY.POLICY_FEATURE.ASSIGN_ELEVATED_ROLES)).toBe(false);
        });

        it('allows auditors to read but not write every policy feature', () => {
            const policy = buildPolicy(CONST.POLICY.ROLE.AUDITOR);

            for (const feature of Object.values(CONST.POLICY.POLICY_FEATURE)) {
                expect(canMemberRead(policy, memberLogin, feature)).toBe(true);
                expect(canMemberWrite(policy, memberLogin, feature)).toBe(false);
            }
        });

        it('limits scoped admins to their assigned write features', () => {
            expect(canMemberWrite(buildPolicy(CONST.POLICY.ROLE.CARD_ADMIN), memberLogin, CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS)).toBe(true);
            expect(canMemberWrite(buildPolicy(CONST.POLICY.ROLE.CARD_ADMIN), memberLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS)).toBe(false);
            expect(canMemberWrite(buildPolicy(CONST.POLICY.ROLE.PEOPLE_ADMIN), memberLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS)).toBe(true);
            expect(canMemberWrite(buildPolicy(CONST.POLICY.ROLE.PAYMENTS_ADMIN), memberLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS)).toBe(true);
        });

        it('limits People Admin member role management to members and auditors', () => {
            const policy = buildPolicy(CONST.POLICY.ROLE.PEOPLE_ADMIN);

            expect(canMemberAssignRole(policy, memberLogin, CONST.POLICY.ROLE.USER)).toBe(true);
            expect(canMemberAssignRole(policy, memberLogin, CONST.POLICY.ROLE.AUDITOR)).toBe(true);
            expect(canMemberAssignRole(policy, memberLogin, CONST.POLICY.ROLE.ADMIN)).toBe(false);
            expect(canMemberAssignRole(policy, memberLogin, CONST.POLICY.ROLE.CARD_ADMIN)).toBe(false);
            expect(canMemberAssignRole(policy, memberLogin, CONST.POLICY.ROLE.PEOPLE_ADMIN)).toBe(false);
            expect(canMemberAssignRole(policy, memberLogin, CONST.POLICY.ROLE.PAYMENTS_ADMIN)).toBe(false);
        });

        it('allows Submit workspace editors to manage editor memberships without assigning roles', () => {
            const policy = {
                ...buildPolicy(CONST.POLICY.ROLE.EDITOR),
                type: CONST.POLICY.TYPE.SUBMIT,
            };

            expect(canMemberManageMemberWithRole(policy, memberLogin, CONST.POLICY.ROLE.EDITOR)).toBe(true);
            expect(canMemberAssignRole(policy, memberLogin, CONST.POLICY.ROLE.EDITOR)).toBe(false);
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
                policyAccountID: 0,
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
                policyAccountID: 0,
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
                policyAccountID: 123234,
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
                (index) => createMock<Policy>({...createRandomPolicy(index + 1), name: 'workspace', pendingAction: null, ...(!index && {role: undefined})}),
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

        it('rebinds the default rate to the API-known customUnitRateID and keeps non-default rates with their source IDs', () => {
            const distanceUnitWithMultipleRates = {
                customUnitID: 'srcDist',
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                enabled: true,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, taxEnabled: true},
                rates: {
                    rateB: {customUnitRateID: 'rateB', name: 'New Rate 1', rate: 100, currency: 'USD', enabled: true, index: 1, attributes: {taxRateExternalID: 'tax_other'}},
                    rateA: {customUnitRateID: 'rateA', name: 'Default Rate', rate: 70, currency: 'USD', enabled: true, index: 0, attributes: {taxRateExternalID: 'tax_default'}},
                },
            };
            const policyWithMultipleRates: Policy = {
                ...createRandomPolicy(0),
                customUnits: {[distanceUnitWithMultipleRates.customUnitID]: distanceUnitWithMultipleRates},
            };
            const result = getCustomUnitsForDuplication(policyWithMultipleRates, true, false, {
                distanceCustomUnitID: 'newDist',
                perDiemCustomUnitID: 'newPerDiem',
                customUnitRateID: 'newRate',
            });
            expect(result).toEqual({
                newDist: {
                    ...distanceUnitWithMultipleRates,
                    customUnitID: 'newDist',
                    rates: {
                        rateB: {customUnitRateID: 'rateB', name: 'New Rate 1', rate: 100, currency: 'USD', enabled: true, index: 1, attributes: {taxRateExternalID: 'tax_other'}},
                        newRate: {customUnitRateID: 'newRate', name: 'Default Rate', rate: 70, currency: 'USD', enabled: true, index: 0, attributes: {taxRateExternalID: 'tax_default'}},
                    },
                },
            });
        });

        it('keeps source rates with their source IDs when no enabled rate exists', () => {
            const distanceUnitAllDisabled = {
                customUnitID: 'srcDist',
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                enabled: true,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                rates: {
                    rateA: {customUnitRateID: 'rateA', name: 'Disabled', rate: 50, currency: 'USD', enabled: false, index: 0},
                },
            };
            const policyAllDisabled: Policy = {
                ...createRandomPolicy(0),
                customUnits: {[distanceUnitAllDisabled.customUnitID]: distanceUnitAllDisabled},
            };
            const result = getCustomUnitsForDuplication(policyAllDisabled, true, false, {
                distanceCustomUnitID: 'newDist',
                perDiemCustomUnitID: 'newPerDiem',
                customUnitRateID: 'newRate',
            });
            expect(result?.newDist.rates).toEqual({
                rateA: {customUnitRateID: 'rateA', name: 'Disabled', rate: 50, currency: 'USD', enabled: false, index: 0},
            });
        });

        it('treats missing index as 0 when picking the default rate', () => {
            const distanceUnitWithMissingIndex = {
                customUnitID: 'srcDist',
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                enabled: true,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                rates: {
                    rateB: {customUnitRateID: 'rateB', name: 'Indexed Rate', rate: 100, currency: 'USD', enabled: true, index: 1},
                    rateA: {customUnitRateID: 'rateA', name: 'No-Index Rate', rate: 70, currency: 'USD', enabled: true},
                },
            };
            const policyWithMissingIndex: Policy = {
                ...createRandomPolicy(0),
                customUnits: {[distanceUnitWithMissingIndex.customUnitID]: distanceUnitWithMissingIndex},
            };
            const result = getCustomUnitsForDuplication(policyWithMissingIndex, true, false, {
                distanceCustomUnitID: 'newDist',
                perDiemCustomUnitID: 'newPerDiem',
                customUnitRateID: 'newRate',
            });
            expect(result?.newDist.rates).toEqual({
                rateB: {customUnitRateID: 'rateB', name: 'Indexed Rate', rate: 100, currency: 'USD', enabled: true, index: 1},
                newRate: {customUnitRateID: 'newRate', name: 'No-Index Rate', rate: 70, currency: 'USD', enabled: true},
            });
        });

        it('preserves source iteration order so getDefaultMileageRate still picks the original default when a non-default rate has a missing index', () => {
            // Source has 3 rates: Default (index 0), Indexed (index 1), and No-Index (no index field).
            // No-Index ties with Default at the index-0 sort key after `?? CONST.DEFAULT_NUMBER_ID`.
            // The optimistic clone must keep the source's iteration order so JavaScript's stable
            // sort still places Default before No-Index — otherwise getDefaultMileageRate would
            // pick whichever tied rate appeared first in iteration order, swapping the default.
            const sourceUnit = {
                customUnitID: 'srcDist',
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                enabled: true,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                rates: {
                    rateA: {customUnitRateID: 'rateA', name: 'Default Rate', rate: 72.5, currency: 'USD', enabled: true, index: 0},
                    rateB: {customUnitRateID: 'rateB', name: 'Indexed Rate', rate: 100, currency: 'USD', enabled: true, index: 1},
                    rateC: {customUnitRateID: 'rateC', name: 'No-Index Rate', rate: 200, currency: 'USD', enabled: true},
                },
            };
            const policyWithTiedIndex: Policy = {
                ...createRandomPolicy(0),
                customUnits: {[sourceUnit.customUnitID]: sourceUnit},
            };
            const result = getCustomUnitsForDuplication(policyWithTiedIndex, true, false, {
                distanceCustomUnitID: 'newDist',
                perDiemCustomUnitID: 'newPerDiem',
                customUnitRateID: 'newRate',
            });

            const cloned = result?.newDist;
            if (!cloned) {
                throw new Error('Expected cloned distance unit');
            }
            // Iteration order: the rebound default should still be first, before the No-Index rate.
            const orderedKeys = Object.keys(cloned.rates);
            expect(orderedKeys).toEqual(['newRate', 'rateB', 'rateC']);

            // Sanity-check that getDefaultMileageRate's selection (enabled, sorted by index ?? 0,
            // first) lands on the rebound default and not on No-Index Rate.
            const pickedDefault = Object.values(cloned.rates)
                .filter((rate) => rate.enabled !== false)
                .sort((a, b) => (a.index ?? CONST.DEFAULT_NUMBER_ID) - (b.index ?? CONST.DEFAULT_NUMBER_ID))
                .at(0);
            expect(pickedDefault?.customUnitRateID).toBe('newRate');
            expect(pickedDefault?.name).toBe('Default Rate');
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
                expect(getSubmitToAccountID(policy, expenseReport, employeeEmail)).toBe(ownerAccountID);
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
                expect(getSubmitToAccountID(policy, expenseReport, employeeEmail)).toBe(ownerAccountID);
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
                expect(getSubmitToAccountID(policy, expenseReport, employeeEmail)).toBe(adminAccountID);
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
                expect(getSubmitToAccountID(policy, expenseReport, employeeEmail)).toBe(categoryApprover1AccountID);
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
                expect(getSubmitToAccountID(policy, expenseReport, categoryApprover1Email)).toBe(adminAccountID);
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
                expect(getSubmitToAccountID(policy, expenseReport, employeeEmail)).toBe(categoryApprover2AccountID);
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

                expect(getSubmitToAccountID(policy, expenseReport, categoryApprover1Email)).toBe(tagApprover1AccountID);
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
                    expect(getSubmitToAccountID(policy, expenseReport, employeeEmail)).toBe(tagApprover1AccountID);
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
                    expect(getSubmitToAccountID(policy, expenseReport, employeeEmail)).toBe(tagApprover2AccountID);
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
            const result = getManagerAccountID(policy, '');

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

            const result = getManagerAccountID(policy, '');

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

            const result = getManagerAccountID(policy, employeeEmail);

            expect(result).toBe(adminAccountID);
        });

        it('should return submitsTo email from workspace approval config', () => {
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

            expect(getSubmitToEmail(policy, report)).toBe(adminEmail);
        });

        it('should return the default approver', () => {
            const policy: Policy = {
                ...createRandomPolicy(0),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: undefined,
                approver: categoryApprover1Email,
            };

            const result = getManagerAccountID(policy, '');

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
    describe('getTagGLCode', () => {
        // Tag lists are intentionally declared out of orderWeight order to verify levels resolve by orderWeight
        const glCodePolicyTagLists: PolicyTagLists = {
            Project: {
                name: 'Project',
                orderWeight: 1,
                required: false,
                tags: {
                    Roadshow: {name: 'Roadshow', enabled: true, 'GL Code': '5678'},
                    Internal: {name: 'Internal', enabled: true},
                },
            },
            Department: {
                name: 'Department',
                orderWeight: 0,
                required: false,
                tags: {
                    Engineering: {name: 'Engineering', enabled: true, 'GL Code': '1234'},
                    Marketing: {name: 'Marketing', enabled: true},
                    'Sales\\:EMEA': {name: 'Sales\\:EMEA', enabled: true, 'GL Code': '"4321"'},
                },
            },
        };

        it('returns empty string when policy tags are undefined or empty', () => {
            expect(getTagGLCode(undefined, 'Engineering')).toBe('');
            expect(getTagGLCode({}, 'Engineering')).toBe('');
        });

        it('returns empty string when the transaction tag is undefined or empty', () => {
            expect(getTagGLCode(glCodePolicyTagLists, undefined)).toBe('');
            expect(getTagGLCode(glCodePolicyTagLists, '')).toBe('');
        });

        it('returns empty string when the tag is missing from the policy or has no GL code', () => {
            expect(getTagGLCode(glCodePolicyTagLists, 'Nonexistent')).toBe('');
            expect(getTagGLCode(glCodePolicyTagLists, 'Marketing')).toBe('');
        });

        it('returns the GL code of a single-level tag', () => {
            expect(getTagGLCode(glCodePolicyTagLists, 'Engineering')).toBe('1234');
        });

        it('joins the GL codes of multi-level tags in tag list order', () => {
            expect(getTagGLCode(glCodePolicyTagLists, 'Engineering:Roadshow')).toBe('1234, 5678');
        });

        it('skips multi-level tag levels without a GL code', () => {
            expect(getTagGLCode(glCodePolicyTagLists, 'Marketing:Roadshow')).toBe('5678');
            expect(getTagGLCode(glCodePolicyTagLists, 'Engineering:Internal')).toBe('1234');
        });

        it('resolves tags with escaped colons against the matching tag list level and strips double quotes', () => {
            expect(getTagGLCode(glCodePolicyTagLists, 'Sales\\:EMEA:Roadshow')).toBe('4321, 5678');
        });

        it('resolves dependent tags by name and parent filter when same-named children exist under different parents', () => {
            // Same-named child tags of dependent lists are stored under unique record keys,
            // so they can only be told apart by their parentTagsFilter
            const dependentPolicyTagLists: PolicyTagLists = {
                Department: {
                    name: 'Department',
                    orderWeight: 0,
                    required: false,
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true, 'GL Code': '1234'},
                        Marketing: {name: 'Marketing', enabled: true},
                    },
                },
                Project: {
                    name: 'Project',
                    orderWeight: 1,
                    required: false,
                    tags: {
                        Roadshow: {name: 'Roadshow', enabled: true, 'GL Code': '1111', rules: {parentTagsFilter: '^Marketing$'}},
                        'Roadshow-1': {name: 'Roadshow', enabled: true, 'GL Code': '2222', rules: {parentTagsFilter: '^Engineering$'}},
                    },
                },
            };

            expect(getTagGLCode(dependentPolicyTagLists, 'Engineering:Roadshow')).toBe('1234, 2222');
            expect(getTagGLCode(dependentPolicyTagLists, 'Marketing:Roadshow')).toBe('1111');
        });

        it('matches a dependent tag deeper in the hierarchy against the accumulated parent tag path', () => {
            const deepDependentPolicyTagLists: PolicyTagLists = {
                State: {
                    name: 'State',
                    orderWeight: 0,
                    required: false,
                    tags: {
                        California: {name: 'California', enabled: true},
                    },
                },
                City: {
                    name: 'City',
                    orderWeight: 1,
                    required: false,
                    tags: {
                        'San Francisco': {name: 'San Francisco', enabled: true, rules: {parentTagsFilter: '^California$'}},
                    },
                },
                District: {
                    name: 'District',
                    orderWeight: 2,
                    required: false,
                    tags: {
                        Mission: {name: 'Mission', enabled: true, 'GL Code': '9000', rules: {parentTagsFilter: '^California:San Francisco$'}},
                        'Mission-1': {name: 'Mission', enabled: true, 'GL Code': '9999', rules: {parentTagsFilter: '^Texas:Austin$'}},
                    },
                },
            };

            expect(getTagGLCode(deepDependentPolicyTagLists, 'California:San Francisco:Mission')).toBe('9000');
        });

        it('returns the GL code as a string when malformed Onyx data stores it as a number', () => {
            const tagListsWithNumberGLCode: PolicyTagLists = {
                Department: {
                    name: 'Department',
                    orderWeight: 0,
                    required: false,
                    tags: {
                        // @ts-expect-error - Defensively handles malformed Onyx data that violates the string type.
                        Engineering: {name: 'Engineering', enabled: true, 'GL Code': 1234},
                    },
                },
            };
            expect(getTagGLCode(tagListsWithNumberGLCode, 'Engineering')).toBe('1234');
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
        const baseAdminPolicy: OnyxEntry<Policy> = createMock<OnyxEntry<Policy>>({
            id: 'ABC123',
            name: 'Test Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            employeeList: {},
            connections: {},
            errors: {},
            errorFields: {},
        });

        const baseUserPolicy: OnyxEntry<Policy> = createMock<OnyxEntry<Policy>>({
            id: 'DEF456',
            name: 'User Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {},
            connections: {},
            errors: {},
            errorFields: {},
        });

        it('does return an ERROR RBR when a sync error exists for an admin', () => {
            const policyWithConnectionFailures = createMock<OnyxEntry<Policy>>({
                ...baseAdminPolicy,
                // Failed sync
                connections: createMock<Connections>({
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
                }),
            });

            const result = getPolicyBrickRoadIndicatorStatus(policyWithConnectionFailures, false);
            expect(result).toEqual(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        });

        it('does not return an ERROR RBR when a sync error exists for a user', () => {
            const policyWithConnectionFailures = createMock<OnyxEntry<Policy>>({
                ...baseUserPolicy,
                // Failed sync
                connections: createMock<Connections>({
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
                }),
            });

            const result = getPolicyBrickRoadIndicatorStatus(policyWithConnectionFailures, false);
            expect(result).toBeUndefined();
        });

        it('does not return an ERROR RBR when no sync errors exist for an admin', () => {
            const policyWithoutConnections = createMock<OnyxEntry<Policy>>({
                ...baseAdminPolicy,
                connections: createMock<Connections>({}),
            });

            const policyWithoutConnectionFailures = createMock<OnyxEntry<Policy>>({
                ...baseAdminPolicy,
                connections: createMock<Connections>({
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
                }),
            });

            const result = getPolicyBrickRoadIndicatorStatus(policyWithoutConnectionFailures, false);
            expect(result).toBeUndefined();

            const result2 = getPolicyBrickRoadIndicatorStatus(policyWithoutConnections, false);
            expect(result2).toBeUndefined();
        });

        it('does not return an ERROR RBR when no sync error exists for a user', () => {
            const policyWithoutConnections = createMock<OnyxEntry<Policy>>({
                ...baseUserPolicy,
                connections: createMock<Connections>({}),
            });

            const policyWithoutConnectionFailures = createMock<OnyxEntry<Policy>>({
                ...baseUserPolicy,
                connections: createMock<Connections>({
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
                }),
            });

            const result = getPolicyBrickRoadIndicatorStatus(policyWithoutConnections, false);
            expect(result).toBeUndefined();

            const result2 = getPolicyBrickRoadIndicatorStatus(policyWithoutConnectionFailures, false);
            expect(result2).toBeUndefined();
        });

        describe('QBO Export Errors', () => {
            it('does return an ERROR RBR when a QBO sync error exists for an admin', () => {
                const policyWithQBOSyncError = createMock<OnyxEntry<Policy>>({
                    ...baseAdminPolicy,
                    connections: createMock<Connections>({
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
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
                    }),
                });

                const result = getPolicyBrickRoadIndicatorStatus(policyWithQBOSyncError, false);
                expect(result).toEqual(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
            });

            it('does not return an ERROR RBR when a QBO sync error exists for a user', () => {
                const policyWithQBOSyncError = createMock<OnyxEntry<Policy>>({
                    ...baseUserPolicy,
                    connections: createMock<Connections>({
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
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
                    }),
                });

                const result = getPolicyBrickRoadIndicatorStatus(policyWithQBOSyncError, false);
                expect(result).toBeUndefined();
            });

            it('does not return an ERROR RBR when no QBO sync errors exist for an admin', () => {
                const policyWithSuccessfulQBOSync = createMock<OnyxEntry<Policy>>({
                    ...baseAdminPolicy,
                    connections: createMock<Connections>({
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
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
                    }),
                });

                const result = getPolicyBrickRoadIndicatorStatus(policyWithSuccessfulQBOSync, false);
                expect(result).toBeUndefined();
            });

            it('does not return an ERROR RBR when QBO sync is in progress for an admin', () => {
                const policyWithQBOSyncError = createMock<OnyxEntry<Policy>>({
                    ...baseAdminPolicy,
                    connections: createMock<Connections>({
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
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
                    }),
                });

                // When sync is in progress (second parameter is true), should not show error
                const result = getPolicyBrickRoadIndicatorStatus(policyWithQBOSyncError, true);
                expect(result).toBeUndefined();
            });

            it('does return an ERROR RBR when QBO reimbursable export destination account is missing for an admin', () => {
                const policyWithMissingQBOAccount = createMock<OnyxEntry<Policy>>({
                    ...baseAdminPolicy,
                    connections: createMock<Connections>({
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {
                                reimbursableExpensesExportDestination: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                                reimbursableExpensesAccount: undefined,
                            },
                        },
                    }),
                });

                const result = getPolicyBrickRoadIndicatorStatus(policyWithMissingQBOAccount, false);
                expect(result).toEqual(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
            });

            it('does not return an ERROR RBR when QBO reimbursable export destination account is missing for a user', () => {
                const policyWithMissingQBOAccount = createMock<OnyxEntry<Policy>>({
                    ...baseUserPolicy,
                    connections: createMock<Connections>({
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {
                                reimbursableExpensesExportDestination: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                                reimbursableExpensesAccount: undefined,
                            },
                        },
                    }),
                });

                const result = getPolicyBrickRoadIndicatorStatus(policyWithMissingQBOAccount, false);
                expect(result).toBeUndefined();
            });

            it('does not return an ERROR RBR when QBO reimbursable export destination account is configured for an admin', () => {
                const policyWithQBOConfigured = createMock<OnyxEntry<Policy>>({
                    ...baseAdminPolicy,
                    connections: createMock<Connections>({
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {
                                reimbursableExpensesExportDestination: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                                reimbursableExpensesAccount: {id: '123', name: 'Test Account'},
                            },
                        },
                    }),
                });

                const result = getPolicyBrickRoadIndicatorStatus(policyWithQBOConfigured, false);
                expect(result).toBeUndefined();
            });

            it('does not return an ERROR RBR when QBO connection does not exist for an admin', () => {
                const policyWithoutQBOConnection = createMock<OnyxEntry<Policy>>({
                    ...baseAdminPolicy,
                    connections: {},
                });

                const result = getPolicyBrickRoadIndicatorStatus(policyWithoutQBOConnection, false);
                expect(result).toBeUndefined();
            });

            it('does not return an ERROR RBR when QBO reimbursable export destination is not set for an admin', () => {
                const policyWithQBONoExportDestination = createMock<OnyxEntry<Policy>>({
                    ...baseAdminPolicy,
                    connections: createMock<Connections>({
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {
                                reimbursableExpensesExportDestination: undefined,
                                reimbursableExpensesAccount: undefined,
                            },
                        },
                    }),
                });

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
        it('should return empty array if no admins in policies', async () => {
            const bankAccountID = '1';
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                1: {
                    methodID: 12345,
                    accountData: {
                        additionalData: {policyID: '1'},
                    },
                },
            });
            const policies = {
                '1': {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), pendingAction: undefined},
                '2': {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), pendingAction: undefined},
            };
            const result = getEligibleBankAccountShareRecipients(policies, approverEmail, bankAccountID);
            expect(result).toHaveLength(0);
        });
        it('should return array with admins from the bank account workspace', async () => {
            const bankAccountID = '1';
            const currentUserLogin = adminEmail;
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                1: {
                    methodID: 12345,
                    accountData: {
                        additionalData: {policyID: '1'},
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
            expect(result).toHaveLength(1);
        });
        it('should not return user with already shared bank account', async () => {
            const bankAccountID = '1';
            const currentUserLogin = adminEmail;
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                1: {
                    methodID: 12345,
                    accountData: {
                        additionalData: {policyID: '1'},
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
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                1: {
                    methodID: 12345,
                    accountData: {
                        additionalData: {policyID: '1'},
                    },
                },
            });

            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    employeeList: {
                        [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN},
                        [approverEmail]: {email: approverEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
            };
            const result = getEligibleBankAccountShareRecipients(policies, adminEmail, bankAccountID);
            expect(result).toHaveLength(1);
        });
        it('should not return Expensify guide when policy owner is not Expensify team', () => {
            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    owner: 'normalowner@test.com',
                    employeeList: {
                        [guideEmail]: {email: guideEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
            };
            const result = getEligibleBankAccountShareRecipients(policies, adminEmail, '1');
            expect(result).toHaveLength(0);
        });
        it('should return Expensify guide when policy owner is Expensify team', () => {
            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    owner: 'owner@expensify.com',
                    employeeList: {
                        [guideEmail]: {email: guideEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
            };
            const result = getEligibleBankAccountShareRecipients(policies, adminEmail, '1');
            expect(result).toHaveLength(1);
        });
        it('should return Expensify guide when current user is Expensify team', () => {
            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    owner: 'normalowner@test.com',
                    employeeList: {
                        [guideEmail]: {email: guideEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
            };
            const result = getEligibleBankAccountShareRecipients(policies, 'someone@expensify.com', '1');
            expect(result).toHaveLength(1);
        });
    });

    describe('hasEligibleActiveAdminFromWorkspaces', () => {
        beforeEach(() => {
            wrapOnyxWithWaitForBatchedUpdates(Onyx);
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
        it('should return false when the only admin is an Expensify guide on a non-Expensify policy', () => {
            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    owner: 'normalowner@test.com',
                    employeeList: {
                        [guideEmail]: {email: guideEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
            };
            const result = hasEligibleActiveAdminFromWorkspaces(policies, adminEmail, '1');
            expect(result).toBe(false);
        });
        it('should return true when there is a non-guide admin', () => {
            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    owner: 'normalowner@test.com',
                    employeeList: {
                        [guideEmail]: {email: guideEmail, role: CONST.POLICY.ROLE.ADMIN},
                        [approverEmail]: {email: approverEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
            };
            const result = hasEligibleActiveAdminFromWorkspaces(policies, adminEmail, '1');
            expect(result).toBe(true);
        });
        it('should return true when the guide is on an Expensify-owned policy', () => {
            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    owner: 'owner@expensify.com',
                    employeeList: {
                        [guideEmail]: {email: guideEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
            };
            const result = hasEligibleActiveAdminFromWorkspaces(policies, adminEmail, '1');
            expect(result).toBe(true);
        });
    });

    describe('hasEligibleActiveAdminFromWorkspaces', () => {
        beforeEach(() => {
            wrapOnyxWithWaitForBatchedUpdates(Onyx);
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
        it('should return true when another admin is available in the bank account workspace', async () => {
            const bankAccountID = '1';
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                1: {
                    methodID: 12345,
                    accountData: {
                        additionalData: {policyID: '1'},
                    },
                },
            });

            const policies = {
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    employeeList: {
                        [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN},
                        [approverEmail]: {email: approverEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
            };
            const result = hasEligibleActiveAdminFromWorkspaces(policies, adminEmail, bankAccountID);
            expect(result).toBe(true);
        });
        it('should return false when the user only joined another workspace as a member', async () => {
            const bankAccountID = '1';
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                1: {
                    methodID: 12345,
                    accountData: {
                        additionalData: {policyID: '1'},
                    },
                },
            });

            const policies = {
                // The bank account's own workspace - current user is the only admin, no one to share with
                '1': {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.ADMIN,
                    employeeList: {
                        [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN},
                    },
                },
                // Another user's workspace the current user only joined as a member - has its own admin
                '2': {
                    ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                    pendingAction: undefined,
                    role: CONST.POLICY.ROLE.USER,
                    employeeList: {
                        [approverEmail]: {email: approverEmail, role: CONST.POLICY.ROLE.ADMIN},
                        [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.USER},
                    },
                },
            };
            const result = hasEligibleActiveAdminFromWorkspaces(policies, adminEmail, bankAccountID);
            expect(result).toBe(false);
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
                    connections: createMock<Connections>({
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
                    }),
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
                    connections: createMock<Connections>({
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
                            config: createMock<Connections[typeof CONST.POLICY.CONNECTIONS.NAME.XERO]['config']>({}),
                            data: createMock<Connections[typeof CONST.POLICY.CONNECTIONS.NAME.XERO]['data']>({}),
                        },
                    }),
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
            const policy = createMock<Policy>({areInvoicesEnabled: true});
            expect(canSendInvoiceFromWorkspace(policy)).toBe(true);
        });

        it('returns false when areInvoicesEnabled is false', () => {
            const policy = createMock<Policy>({areInvoicesEnabled: false});
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

        it('includes a control policy whose arePerDiemRatesEnabled flag is missing but has an enabled per diem custom unit', () => {
            const policies: OnyxCollection<Policy> = {
                corporate: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    role: CONST.POLICY.ROLE.USER,
                    pendingAction: null,
                    isPolicyExpenseChatEnabled: true,
                    // Migrated member: flag never arrived, but the configured custom unit is present
                    arePerDiemRatesEnabled: undefined,
                    customUnits: {
                        ABCDEF: perDiemCustomUnit,
                    },
                },
            };

            expect(getActivePoliciesWithExpenseChatAndPerDiemEnabled(policies, undefined)).toHaveLength(1);
            expect(getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates(policies, undefined)).toHaveLength(1);
        });

        it('excludes a control policy where per diem was explicitly disabled even if a custom unit lingers', () => {
            const policies: OnyxCollection<Policy> = {
                corporate: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    role: CONST.POLICY.ROLE.USER,
                    pendingAction: null,
                    isPolicyExpenseChatEnabled: true,
                    // Explicit off must be respected, so the lingering custom unit cannot re-enable it
                    arePerDiemRatesEnabled: false,
                    customUnits: {
                        ABCDEF: perDiemCustomUnit,
                    },
                },
            };

            expect(getActivePoliciesWithExpenseChatAndPerDiemEnabled(policies, undefined)).toHaveLength(0);
            expect(getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates(policies, undefined)).toHaveLength(0);
        });

        describe('isPerDiemEnabled', () => {
            it('returns true when arePerDiemRatesEnabled is explicitly true', () => {
                const policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), arePerDiemRatesEnabled: true, customUnits: {}};
                expect(isPerDiemEnabled(policy)).toBe(true);
            });

            it('returns false when arePerDiemRatesEnabled is explicitly false, ignoring the configured custom unit', () => {
                const policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), arePerDiemRatesEnabled: false, customUnits: {ABCDEF: perDiemCustomUnit}};
                expect(isPerDiemEnabled(policy)).toBe(false);
            });

            it('infers true from an enabled per diem custom unit when the flag is missing', () => {
                const policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), arePerDiemRatesEnabled: undefined, customUnits: {ABCDEF: perDiemCustomUnit}};
                expect(isPerDiemEnabled(policy)).toBe(true);
            });

            it('returns false when the flag is missing and the per diem custom unit is disabled', () => {
                const policy = {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    arePerDiemRatesEnabled: undefined,
                    customUnits: {ABCDEF: {...perDiemCustomUnit, enabled: false}},
                };
                expect(isPerDiemEnabled(policy)).toBe(false);
            });

            it('returns false when the flag is missing and there is no per diem custom unit', () => {
                const policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), arePerDiemRatesEnabled: undefined, customUnits: {}};
                expect(isPerDiemEnabled(policy)).toBe(false);
            });
        });

        describe('getPolicyByCustomUnitID', () => {
            const transactionWithPerDiemUnit: Transaction = {
                ...createRandomTransaction(0),
                comment: {customUnit: {customUnitID: 'ABCDEF'}},
            };

            it('resolves the policy with the matching custom unit when arePerDiemRatesEnabled is missing', () => {
                const policies: OnyxCollection<Policy> = {
                    corporate: {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), arePerDiemRatesEnabled: undefined, customUnits: {ABCDEF: perDiemCustomUnit}},
                };
                expect(getPolicyByCustomUnitID(transactionWithPerDiemUnit, policies)?.id).toBe('1');
            });

            it('does not resolve a policy where per diem was explicitly disabled', () => {
                const policies: OnyxCollection<Policy> = {
                    corporate: {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), arePerDiemRatesEnabled: false, customUnits: {ABCDEF: perDiemCustomUnit}},
                };
                expect(getPolicyByCustomUnitID(transactionWithPerDiemUnit, policies)).toBeUndefined();
            });
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

    describe('hasDependentTags', () => {
        it('returns false when policy has no multiple tag lists', () => {
            const policy = createMock<Policy>({hasMultipleTagLists: false});
            const policyTagList: PolicyTagLists = {};
            expect(hasDependentTags(policy, policyTagList)).toBe(false);
        });

        it('returns false when policy is undefined', () => {
            expect(hasDependentTags(undefined, {})).toBe(false);
        });

        it('returns false when tags have no parentTagsFilter', () => {
            const policy = createMock<Policy>({hasMultipleTagLists: true});
            const policyTagList = createMock<PolicyTagLists>({
                Department: {
                    name: 'Department',
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true},
                    },
                    required: false,
                    orderWeight: 0,
                },
            });
            expect(hasDependentTags(policy, policyTagList)).toBe(false);
        });

        it('returns true when a tag has rules.parentTagsFilter', () => {
            const policy = createMock<Policy>({hasMultipleTagLists: true});
            const policyTagList = createMock<PolicyTagLists>({
                Department: {
                    name: 'Department',
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true, rules: {parentTagsFilter: '^California$'}},
                    },
                    required: false,
                    orderWeight: 0,
                },
            });
            expect(hasDependentTags(policy, policyTagList)).toBe(true);
        });

        it('returns true when a tag has parentTagsFilter at the top level', () => {
            const policy = createMock<Policy>({hasMultipleTagLists: true});
            const policyTagList = createMock<PolicyTagLists>({
                Department: {
                    name: 'Department',
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true, parentTagsFilter: '^California$'},
                    },
                    required: false,
                    orderWeight: 0,
                },
            });
            expect(hasDependentTags(policy, policyTagList)).toBe(true);
        });
    });

    describe('hasIndependentTags', () => {
        it('returns false when policy has no multiple tag lists', () => {
            const policy = createMock<Policy>({hasMultipleTagLists: false});
            const policyTagList: PolicyTagLists = {};
            expect(hasIndependentTags(policy, policyTagList)).toBe(false);
        });

        it('returns false when policy is undefined', () => {
            expect(hasIndependentTags(undefined, {})).toBe(false);
        });

        it('returns false when tags are dependent (have parentTagsFilter)', () => {
            const policy = createMock<Policy>({hasMultipleTagLists: true});
            const policyTagList = createMock<PolicyTagLists>({
                Department: {
                    name: 'Department',
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true, rules: {parentTagsFilter: '^California$'}},
                    },
                    required: false,
                    orderWeight: 0,
                },
            });
            expect(hasIndependentTags(policy, policyTagList)).toBe(false);
        });

        it('returns false when all tag lists are empty', () => {
            const policy = createMock<Policy>({hasMultipleTagLists: true});
            const policyTagList = createMock<PolicyTagLists>({
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
            });
            expect(hasIndependentTags(policy, policyTagList)).toBe(false);
        });

        it('returns true when tags are independent and at least one tag exists', () => {
            const policy = createMock<Policy>({hasMultipleTagLists: true});
            const policyTagList = createMock<PolicyTagLists>({
                Department: {
                    name: 'Department',
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true},
                    },
                    required: false,
                    orderWeight: 0,
                },
            });
            expect(hasIndependentTags(policy, policyTagList)).toBe(true);
        });

        it('returns true when at least one tag list has tags and others are empty', () => {
            const policy = createMock<Policy>({hasMultipleTagLists: true});
            const policyTagList = createMock<PolicyTagLists>({
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
            });
            expect(hasIndependentTags(policy, policyTagList)).toBe(true);
        });

        it('returns false when policyTagList is undefined', () => {
            const policy = createMock<Policy>({hasMultipleTagLists: true});
            expect(hasIndependentTags(policy, undefined)).toBe(false);
        });
    });

    describe('hasConfiguredRules', () => {
        it('returns false when policy is undefined', () => {
            expect(hasConfiguredRules(undefined)).toBe(false);
        });

        it('returns false when policy has no rules configured', () => {
            expect(hasConfiguredRules(createMock<Policy>({}))).toBe(false);
        });

        describe('customRules', () => {
            it('returns true when customRules is non-empty', () => {
                expect(hasConfiguredRules(createMock<Policy>({customRules: 'some rule'}))).toBe(true);
            });

            it('returns false when customRules is an empty string', () => {
                expect(hasConfiguredRules(createMock<Policy>({customRules: ''}))).toBe(false);
            });

            it('returns false when customRules is only whitespace', () => {
                expect(hasConfiguredRules(createMock<Policy>({customRules: '   '}))).toBe(false);
            });
        });

        describe('rules.approvalRules', () => {
            it('returns true when approvalRules has items', () => {
                const policy = createMock<Policy>({rules: {approvalRules: [{id: '1', applyWhen: [], approver: 'approver@test.com'}]}});
                expect(hasConfiguredRules(policy)).toBe(true);
            });

            it('returns false when approvalRules is empty', () => {
                expect(hasConfiguredRules(createMock<Policy>({rules: {approvalRules: []}}))).toBe(false);
            });
        });

        describe('rules.expenseRules', () => {
            it('returns true when expenseRules has items', () => {
                const policy = createMock<Policy>({
                    rules: {
                        expenseRules: [
                            {
                                id: '1',
                                applyWhen: [],
                                tax: {field_id_TAX: {externalID: 'TAX_US'}},
                            },
                        ],
                    },
                });
                expect(hasConfiguredRules(policy)).toBe(true);
            });

            it('returns false when expenseRules is empty', () => {
                expect(hasConfiguredRules(createMock<Policy>({rules: {expenseRules: []}}))).toBe(false);
            });
        });

        describe('rules.codingRules', () => {
            it('returns true when codingRules has entries', () => {
                const policy = createMock<Policy>({
                    rules: {
                        codingRules: {
                            rule1: {
                                ruleID: 'rule1',
                                filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Starbucks'},
                            },
                        },
                    },
                });
                expect(hasConfiguredRules(policy)).toBe(true);
            });

            it('returns false when codingRules is empty', () => {
                expect(hasConfiguredRules(createMock<Policy>({rules: {codingRules: {}}}))).toBe(false);
            });
        });

        describe('maxExpenseAmount', () => {
            it('returns true when maxExpenseAmount is set to a non-default value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAmount: 500000}))).toBe(true);
            });

            it('returns false when maxExpenseAmount is the default value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAmount: CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT}))).toBe(false);
            });

            it('returns false when maxExpenseAmount is the disabled value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAmount: CONST.DISABLED_MAX_EXPENSE_VALUE}))).toBe(false);
            });
        });

        describe('maxExpenseAge', () => {
            it('returns true when maxExpenseAge is set to a non-default value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAge: 30}))).toBe(true);
            });

            it('returns false when maxExpenseAge is the default value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAge: CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE}))).toBe(false);
            });

            it('returns false when maxExpenseAge is the disabled value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAge: CONST.DISABLED_MAX_EXPENSE_VALUE}))).toBe(false);
            });
        });

        describe('maxExpenseAmountNoReceipt', () => {
            it('returns true when maxExpenseAmountNoReceipt is set to a non-default value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAmountNoReceipt: 5000}))).toBe(true);
            });

            it('returns false when maxExpenseAmountNoReceipt is the default value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAmountNoReceipt: CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_RECEIPT}))).toBe(false);
            });

            it('returns false when maxExpenseAmountNoReceipt is the disabled value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAmountNoReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE}))).toBe(false);
            });
        });

        describe('maxExpenseAmountNoItemizedReceipt', () => {
            it('returns true when maxExpenseAmountNoItemizedReceipt is set to a non-default value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAmountNoItemizedReceipt: 10000}))).toBe(true);
            });

            it('returns false when maxExpenseAmountNoItemizedReceipt is the default value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAmountNoItemizedReceipt: CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_ITEMIZED_RECEIPT}))).toBe(false);
            });

            it('returns false when maxExpenseAmountNoItemizedReceipt is the disabled value', () => {
                expect(hasConfiguredRules(createMock<Policy>({maxExpenseAmountNoItemizedReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE}))).toBe(false);
            });
        });

        describe('defaultBillable', () => {
            it('returns true when defaultBillable is true', () => {
                expect(hasConfiguredRules(createMock<Policy>({defaultBillable: true}))).toBe(true);
            });

            it('returns false when defaultBillable is false', () => {
                expect(hasConfiguredRules(createMock<Policy>({defaultBillable: false}))).toBe(false);
            });
        });

        describe('defaultReimbursable', () => {
            it('returns true when defaultReimbursable is false', () => {
                expect(hasConfiguredRules(createMock<Policy>({defaultReimbursable: false}))).toBe(true);
            });

            it('returns false when defaultReimbursable is true', () => {
                expect(hasConfiguredRules(createMock<Policy>({defaultReimbursable: true}))).toBe(false);
            });
        });

        describe('eReceipts', () => {
            it('returns true when eReceipts is true', () => {
                expect(hasConfiguredRules(createMock<Policy>({eReceipts: true}))).toBe(true);
            });

            it('returns false when eReceipts is false', () => {
                expect(hasConfiguredRules(createMock<Policy>({eReceipts: false}))).toBe(false);
            });
        });

        describe('requireCompanyCardsEnabled', () => {
            it('returns true when requireCompanyCardsEnabled is true', () => {
                expect(hasConfiguredRules(createMock<Policy>({requireCompanyCardsEnabled: true}))).toBe(true);
            });

            it('returns false when requireCompanyCardsEnabled is false', () => {
                expect(hasConfiguredRules(createMock<Policy>({requireCompanyCardsEnabled: false}))).toBe(false);
            });
        });

        describe('prohibitedExpenses', () => {
            it('returns true when a prohibitedExpenses value differs from its default', () => {
                // alcohol defaults to false — setting it to true triggers the rule
                expect(hasConfiguredRules(createMock<Policy>({prohibitedExpenses: {alcohol: true}}))).toBe(true);
            });

            it('returns true when gambling is disabled (differs from default true)', () => {
                expect(hasConfiguredRules(createMock<Policy>({prohibitedExpenses: {gambling: false}}))).toBe(true);
            });

            it('returns false when prohibitedExpenses matches all defaults', () => {
                expect(hasConfiguredRules(createMock<Policy>({prohibitedExpenses: {...CONST.POLICY.DEFAULT_PROHIBITED_EXPENSES}}))).toBe(false);
            });

            it('returns false when prohibitedExpenses is an empty object', () => {
                expect(hasConfiguredRules(createMock<Policy>({prohibitedExpenses: {}}))).toBe(false);
            });
        });

        it('returns true when only Classic category rules exist', () => {
            const categories = {Travel: {name: 'Travel', enabled: true, maxAmountNoReceipt: 0}};
            expect(hasConfiguredRules(createMock<Policy>({}), categories)).toBe(true);
        });

        it('returns false when categories have no active rule fields', () => {
            const categories = {Advertising: {name: 'Advertising', enabled: true, 'GL Code': '1234'}};
            expect(hasConfiguredRules(createMock<Policy>({}), categories)).toBe(false);
        });
    });

    describe('getExpensifyTeamExclusions', () => {
        const buildPersonalDetails = (logins: string[]): PersonalDetailsList => {
            const result: PersonalDetailsList = {};
            for (const [index, login] of logins.entries()) {
                const accountID = index + 1;
                result[accountID] = {accountID, login};
            }
            return result;
        };
        const buildPolicies = (
            specs: Array<{
                owner: string;
                employeeLogins: string[];
            }>,
        ): OnyxCollection<Policy> => {
            const result: OnyxCollection<Policy> = {};
            for (const [index, {owner, employeeLogins}] of specs.entries()) {
                const memberList: PolicyEmployeeList = {};
                for (const login of employeeLogins) {
                    memberList[login] = {email: login};
                }
                result[`policy_${index + 1}`] = createMock<Policy>({id: `${index + 1}`, owner, employeeList: memberList});
            }
            return result;
        };

        it('returns empty when currentUserLogin is undefined', () => {
            const details = buildPersonalDetails(['am@expensify.com', 'bob@acme.com']);
            const policies = buildPolicies([{owner: 'customer@acme.com', employeeLogins: ['bob@acme.com']}]);
            expect(getExpensifyTeamExclusions(details, policies, undefined)).toEqual({});
        });

        it('returns empty when currentUserLogin is on the Expensify team (exception)', () => {
            const details = buildPersonalDetails(['am@expensify.com', 'bob@acme.com']);
            const policies = buildPolicies([{owner: 'customer@acme.com', employeeLogins: ['am@expensify.com', 'bob@acme.com']}]);
            expect(getExpensifyTeamExclusions(details, policies, 'staff@expensify.com')).toEqual({});
        });

        it('excludes all Expensify-team logins from personalDetails when current user is non-Expensify and has no Expensify-owned policies', () => {
            const details = buildPersonalDetails(['am@expensify.com', 'guide@team.expensify.com', 'bob@acme.com']);
            const policies = buildPolicies([{owner: 'customer@acme.com', employeeLogins: ['bob@acme.com']}]);
            const result = getExpensifyTeamExclusions(details, policies, 'customer@acme.com');
            expect(result['am@expensify.com']).toBe(true);
            expect(result['guide@team.expensify.com']).toBe(true);
            expect(result['bob@acme.com']).toBeUndefined();
        });

        it('preserves Expensify-team members of an Expensify-owned policy the current user belongs to', () => {
            const details = buildPersonalDetails(['lead@expensify.com', 'unrelated_am@expensify.com', 'contractor@acme.com']);
            const policies = buildPolicies([{owner: 'lead@expensify.com', employeeLogins: ['contractor@acme.com', 'lead@expensify.com']}]);
            const result = getExpensifyTeamExclusions(details, policies, 'contractor@acme.com');
            expect(result['lead@expensify.com']).toBeUndefined();
            expect(result['unrelated_am@expensify.com']).toBe(true);
            expect(result['contractor@acme.com']).toBeUndefined();
        });

        it('does not preserve Expensify-team members of policies the current user is not in', () => {
            const details = buildPersonalDetails(['lead@expensify.com', 'bob@acme.com']);
            const policies = buildPolicies([{owner: 'lead@expensify.com', employeeLogins: ['lead@expensify.com', 'someone_else@acme.com']}]);
            const result = getExpensifyTeamExclusions(details, policies, 'bob@acme.com');
            expect(result['lead@expensify.com']).toBe(true);
        });

        it('does not preserve when policy owner is non-Expensify', () => {
            const details = buildPersonalDetails(['am@expensify.com', 'bob@acme.com']);
            const policies = buildPolicies([{owner: 'bob@acme.com', employeeLogins: ['am@expensify.com', 'bob@acme.com']}]);
            const result = getExpensifyTeamExclusions(details, policies, 'bob@acme.com');
            expect(result['am@expensify.com']).toBe(true);
        });

        it('handles undefined and empty inputs gracefully', () => {
            expect(getExpensifyTeamExclusions(undefined, undefined, 'customer@acme.com')).toEqual({});
            expect(getExpensifyTeamExclusions(null as unknown as OnyxEntry<PersonalDetailsList>, null as unknown as OnyxCollection<Policy>, 'customer@acme.com')).toEqual({});
            expect(getExpensifyTeamExclusions({}, {}, 'customer@acme.com')).toEqual({});
        });

        it('lowercases comparison keys for current user and employeeList matching', () => {
            const details = buildPersonalDetails(['AM@expensify.com', 'Bob@Acme.com']);
            const policies = buildPolicies([{owner: 'lead@expensify.com', employeeLogins: ['AM@expensify.com', 'Contractor@Acme.com']}]);
            const result = getExpensifyTeamExclusions(details, policies, 'Contractor@Acme.com');
            expect(result['am@expensify.com']).toBeUndefined();
            expect(result['bob@acme.com']).toBeUndefined();
        });
    });
    describe('isSubmitterApproveBlockedOnSubmitWorkspace', () => {
        const submitPolicy: Policy = {...createRandomPolicy(99000, CONST.POLICY.TYPE.SUBMIT), id: 'policy-submit-approve-block-test'};
        const teamPolicy: Policy = {...createRandomPolicy(99001, CONST.POLICY.TYPE.TEAM), id: 'policy-team-approve-block-test'};
        const submitterAccountID = 100;

        it('returns true when policy is Submit and the approver is the report owner', () => {
            expect(isSubmitterApproveBlockedOnSubmitWorkspace(submitPolicy, submitterAccountID, submitterAccountID)).toBe(true);
        });

        it('returns false when policy is Submit and the approver is not the report owner', () => {
            expect(isSubmitterApproveBlockedOnSubmitWorkspace(submitPolicy, submitterAccountID, approverAccountID)).toBe(false);
        });

        it('returns false when policy is not Submit even if the approver is the report owner', () => {
            expect(isSubmitterApproveBlockedOnSubmitWorkspace(teamPolicy, submitterAccountID, submitterAccountID)).toBe(false);
        });

        it('returns false when report owner account ID is undefined', () => {
            expect(isSubmitterApproveBlockedOnSubmitWorkspace(submitPolicy, undefined, submitterAccountID)).toBe(false);
        });
    });

    describe('canAccessSubmitWorkspaceFeatures', () => {
        const submitPolicyForAccessTest: Policy = {...createRandomPolicy(99001, CONST.POLICY.TYPE.SUBMIT), id: 'policy-submit-access-test'};
        const teamPolicyForAccessTest: Policy = {...createRandomPolicy(99002, CONST.POLICY.TYPE.TEAM), id: 'policy-team-access-test'};

        it('returns true when policy is Submit and SUBMIT_2026 beta is enabled', () => {
            expect(canAccessSubmitWorkspaceFeatures(submitPolicyForAccessTest, true)).toBe(true);
        });

        it('returns false when policy is Submit and SUBMIT_2026 beta is disabled', () => {
            expect(canAccessSubmitWorkspaceFeatures(submitPolicyForAccessTest, false)).toBe(false);
        });

        it('returns false when policy is not Submit even if beta is enabled', () => {
            expect(canAccessSubmitWorkspaceFeatures(teamPolicyForAccessTest, true)).toBe(false);
        });

        it('returns false when policy is undefined', () => {
            expect(canAccessSubmitWorkspaceFeatures(undefined, true)).toBe(false);
        });
    });

    describe('tryNavigateToSubmitWorkspaceUpgrade', () => {
        const submitPolicyForNavTest: Policy = {...createRandomPolicy(99003, CONST.POLICY.TYPE.SUBMIT), id: 'policy-submit-nav-test'};
        const teamPolicyForNavTest: Policy = {...createRandomPolicy(99004, CONST.POLICY.TYPE.TEAM), id: 'policy-team-nav-test'};
        const featureAlias = CONST.UPGRADE_FEATURE_INTRO_MAPPING.accounting.alias;

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('returns false and does not navigate when isEnabling is false', () => {
            expect(tryNavigateToSubmitWorkspaceUpgrade(submitPolicyForNavTest, false, featureAlias)).toBe(false);
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('returns false when policy is not Submit', () => {
            expect(tryNavigateToSubmitWorkspaceUpgrade(teamPolicyForNavTest, true, featureAlias)).toBe(false);
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('navigates to workspace upgrade and returns true for Submit policy regardless of beta', () => {
            const policyID = submitPolicyForNavTest.id;
            const expectedRoute = ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, featureAlias, ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));

            expect(tryNavigateToSubmitWorkspaceUpgrade(submitPolicyForNavTest, true, featureAlias)).toBe(true);

            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
            expect(Navigation.navigate).toHaveBeenCalledWith(expectedRoute);
        });
    });

    describe('Vendor matching helpers', () => {
        const buildQBOPolicy = (
            exportDestination: QBONonReimbursableExportAccountType | undefined,
            vendors: Array<{id: string; name: string; currency: string}> = [{id: 'v-1', name: 'Acme Co', currency: 'USD'}],
        ): Policy =>
            createMock<Policy>({
                ...createRandomPolicy(0),
                connections: createMock<Connections>({
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: exportDestination ? {nonReimbursableExpensesExportDestination: exportDestination} : {},
                        data: {vendors},
                    },
                }),
            });

        const buildIntacctPolicy = (
            nonReimbursable: SageIntacctExportConfig['nonReimbursable'] | undefined,
            vendors: Array<{id: string; name: string; value: string}> = [{id: 'iv-1', name: 'V001', value: 'Acme Intacct'}],
        ): Policy =>
            createMock<Policy>({
                ...createRandomPolicy(0),
                connections: createMock<Connections>({
                    [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                        config: nonReimbursable ? {export: {nonReimbursable}} : {export: {}},
                        data: {vendors},
                    },
                }),
            });

        describe('hasVendorFeature', () => {
            it('returns true when beta is enabled and QBO non-reimbursable export is Credit Card', () => {
                expect(hasVendorFeature(buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD), true)).toBe(true);
            });

            it('returns true when beta is enabled and QBO non-reimbursable export is Debit Card', () => {
                expect(hasVendorFeature(buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD), true)).toBe(true);
            });

            it('returns true when beta is enabled and Intacct non-reimbursable export is Credit Card Charge (R2)', () => {
                expect(hasVendorFeature(buildIntacctPolicy(CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE), true)).toBe(true);
            });

            it('returns false when beta is disabled, even with Credit Card export configured', () => {
                expect(hasVendorFeature(buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD), false)).toBe(false);
            });

            it('returns false when beta is disabled, even with Intacct CC Charge export configured', () => {
                expect(hasVendorFeature(buildIntacctPolicy(CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE), false)).toBe(false);
            });

            it('returns false when QBO non-reimbursable export is Vendor Bill', () => {
                expect(hasVendorFeature(buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL), true)).toBe(false);
            });

            it('returns false when Intacct non-reimbursable export is Vendor Bill', () => {
                expect(hasVendorFeature(buildIntacctPolicy(CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL), true)).toBe(false);
            });

            it('returns false when QBO export destination is not set', () => {
                expect(hasVendorFeature(buildQBOPolicy(undefined), true)).toBe(false);
            });

            it('returns false when no supported connection exists on the policy', () => {
                const policy = createMock<Policy>({...createRandomPolicy(0), connections: {}});
                expect(hasVendorFeature(policy, true)).toBe(false);
            });

            it('returns false when policy is undefined', () => {
                expect(hasVendorFeature(undefined, true)).toBe(false);
            });
        });

        describe('getMatchingVendors', () => {
            it('returns the QBO vendor list when QBO is connected', () => {
                const vendors = [
                    {id: 'v-1', name: 'Acme', currency: 'USD'},
                    {id: 'v-2', name: 'Other Co', currency: 'USD'},
                ];
                const policy = buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, vendors);
                expect(getMatchingVendors(policy)).toEqual(vendors);
            });

            it('returns the Intacct vendor list normalized to {id, name} using Intacct `value` for the display label (R2)', () => {
                const intacctVendors = [
                    {id: 'iv-1', name: 'V001', value: 'Acme Intacct'},
                    {id: 'iv-2', name: 'V002', value: 'Other Intacct'},
                ];
                const policy = buildIntacctPolicy(CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE, intacctVendors);
                expect(getMatchingVendors(policy)).toEqual([
                    {id: 'iv-1', name: 'Acme Intacct', currency: '', email: ''},
                    {id: 'iv-2', name: 'Other Intacct', currency: '', email: ''},
                ]);
            });

            it('returns Intacct vendors when both QBO and Intacct are connected but only Intacct has a vendor-matching export destination', () => {
                const intacctVendors = [{id: 'iv-1', name: 'V001', value: 'Acme Intacct'}];
                const qboVendors = [{id: 'v-1', name: 'Stale QBO', currency: 'USD'}];
                const policy = createMock<Policy>({
                    ...createRandomPolicy(0),
                    connections: createMock<Connections>({
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            // QBO is connected but not in CC/DC mode, so vendor matching isn't active on the QBO side
                            config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL},
                            data: {vendors: qboVendors},
                        },
                        [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                            config: {export: {nonReimbursable: CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE}},
                            data: {vendors: intacctVendors},
                        },
                    }),
                });
                expect(getMatchingVendors(policy)).toEqual([{id: 'iv-1', name: 'Acme Intacct', currency: '', email: ''}]);
            });

            it('returns QBO vendors when both connections are populated and QBO is the active vendor-matching integration', () => {
                const qboVendors = [{id: 'v-1', name: 'Acme', currency: 'USD'}];
                const intacctVendors = [{id: 'iv-stale', name: 'V001', value: 'Stale Intacct'}];
                const policy = createMock<Policy>({
                    ...createRandomPolicy(0),
                    connections: createMock<Connections>({
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                            data: {vendors: qboVendors},
                        },
                        [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                            config: {export: {nonReimbursable: CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE}},
                            data: {vendors: intacctVendors},
                        },
                    }),
                });
                expect(getMatchingVendors(policy)).toEqual(qboVendors);
            });

            it('returns an empty array when no supported connection exists', () => {
                const policy = createMock<Policy>({...createRandomPolicy(0), connections: {}});
                expect(getMatchingVendors(policy)).toEqual([]);
            });

            it('returns an empty array when policy is undefined', () => {
                expect(getMatchingVendors(undefined)).toEqual([]);
            });
        });

        describe('getMatchingVendorByID', () => {
            it('returns the matching QBO vendor when the ID exists in the list', () => {
                const policy = buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, [
                    {id: 'v-1', name: 'Acme', currency: 'USD'},
                    {id: 'v-2', name: 'Other Co', currency: 'USD'},
                ]);
                expect(getMatchingVendorByID(policy, 'v-2')).toEqual({id: 'v-2', name: 'Other Co', currency: 'USD'});
            });

            it('returns the matching Intacct vendor (normalized) when the ID exists in the list (R2)', () => {
                const policy = buildIntacctPolicy(CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE, [
                    {id: 'iv-1', name: 'V001', value: 'Acme Intacct'},
                    {id: 'iv-2', name: 'V002', value: 'Other Intacct'},
                ]);
                expect(getMatchingVendorByID(policy, 'iv-2')).toEqual({id: 'iv-2', name: 'Other Intacct', currency: '', email: ''});
            });

            it('returns undefined when the ID is not in the list (the inactive-vendor case)', () => {
                const policy = buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD);
                expect(getMatchingVendorByID(policy, 'v-missing')).toBeUndefined();
            });

            it('returns undefined when no supported connection exists', () => {
                const policy = createMock<Policy>({...createRandomPolicy(0), connections: {}});
                expect(getMatchingVendorByID(policy, 'v-1')).toBeUndefined();
            });
        });

        describe('findVendorByID', () => {
            it('resolves a QBO vendor even when the current export mode is no longer vendor-matching (Vendor Bill)', () => {
                const policy = buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL, [{id: 'v-1', name: 'Acme', currency: 'USD'}]);
                expect(findVendorByID(policy, 'v-1')).toEqual({id: 'v-1', name: 'Acme', currency: 'USD'});
            });

            it('resolves an Intacct vendor (normalized) even when the current export mode is no longer Credit Card Charge', () => {
                const policy = buildIntacctPolicy(CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL, [{id: 'iv-1', name: 'V001', value: 'Acme Intacct'}]);
                expect(findVendorByID(policy, 'iv-1')).toEqual({id: 'iv-1', name: 'Acme Intacct', currency: '', email: ''});
            });

            it('prefers the active Intacct integration over stale QBO data when both hold the same vendor ID', () => {
                // Workspace state: QBO connected but in Vendor Bill mode (not vendor-matching),
                // Intacct connected in Credit Card Charge mode (the active matching integration).
                // Both happen to carry a vendor with the same external ID. The selector wrote the
                // Intacct vendor, so the display lookup must return the Intacct name, not the
                // stale QBO one.
                const intacctPolicy = buildIntacctPolicy(CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE, [{id: 'shared', name: 'V001', value: 'Intacct Name'}]);
                const policy = createMock<Policy>({
                    ...intacctPolicy,
                    connections: {
                        ...intacctPolicy.connections,
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL},
                            data: {vendors: [{id: 'shared', name: 'QBO Stale Name', currency: 'USD'}]},
                        },
                    },
                });
                expect(findVendorByID(policy, 'shared')).toEqual({id: 'shared', name: 'Intacct Name', currency: '', email: ''});
            });

            it('prefers the active QBO integration over stale Intacct data when both hold the same vendor ID', () => {
                // Symmetric to the prior case: QBO is the active matching integration, Intacct has
                // lingering data from a prior config. QBO wins.
                const qboPolicy = buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, [{id: 'shared', name: 'QBO Name', currency: 'USD'}]);
                const policy = createMock<Policy>({
                    ...qboPolicy,
                    connections: {
                        ...qboPolicy.connections,
                        [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                            config: {export: {nonReimbursable: CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL}},
                            data: {vendors: [{id: 'shared', name: 'V001', value: 'Intacct Stale Name'}]},
                        },
                    },
                });
                expect(findVendorByID(policy, 'shared')).toEqual({id: 'shared', name: 'QBO Name', currency: 'USD'});
            });

            it('falls back to QBO data first when neither integration is in vendor-matching mode and both hold the same vendor ID (historical lookup)', () => {
                // Workspace state: admin switched both integrations away from vendor-matching mode
                // after a vendor was set on a historical transaction. The display must still
                // resolve to *a* vendor name; pick the QBO entry first to match `getMatchingVendors`'
                // QBO-first tie-break.
                const qboPolicy = buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL, [{id: 'shared', name: 'QBO Name', currency: 'USD'}]);
                const policy = createMock<Policy>({
                    ...qboPolicy,
                    connections: {
                        ...qboPolicy.connections,
                        [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                            config: {export: {}},
                            data: {vendors: [{id: 'shared', name: 'V001', value: 'Intacct Name'}]},
                        },
                    },
                });
                expect(findVendorByID(policy, 'shared')).toEqual({id: 'shared', name: 'QBO Name', currency: 'USD'});
            });

            it('returns undefined when the ID is not found in any connection vendor list', () => {
                const policy = buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD);
                expect(findVendorByID(policy, 'v-missing')).toBeUndefined();
            });

            it('returns undefined when the policy is undefined', () => {
                expect(findVendorByID(undefined, 'v-1')).toBeUndefined();
            });

            it('returns undefined when the vendorID is undefined', () => {
                const policy = buildQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD);
                expect(findVendorByID(policy, undefined)).toBeUndefined();
            });
        });
    });

    describe('hasPolicyRulesError', () => {
        it('returns false for an undefined policy', () => {
            expect(hasPolicyRulesError(undefined)).toBe(false);
        });

        it('returns false when no coding or agent rules exist', () => {
            const policy: Policy = {...createRandomPolicy(0), rules: {}};
            expect(hasPolicyRulesError(policy)).toBe(false);
        });

        it('returns false when rules exist but none have errors', () => {
            const policy: Policy = {
                ...createRandomPolicy(0),
                rules: {
                    codingRules: {rule1: {ruleID: 'rule1', filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Starbucks'}}},
                    agentRules: {ai1: {ruleID: 'ai1', prompt: 'p', created: '2026-06-08'}},
                },
            };
            expect(hasPolicyRulesError(policy)).toBe(false);
        });

        it('returns true when a coding rule has errors', () => {
            const policy: Policy = {
                ...createRandomPolicy(0),
                rules: {
                    codingRules: {rule1: {ruleID: 'rule1', filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Starbucks'}, errors: {123: 'boom'}}},
                },
            };
            expect(hasPolicyRulesError(policy)).toBe(true);
        });

        it('returns true when an agent rule has errors', () => {
            const policy: Policy = {
                ...createRandomPolicy(0),
                rules: {
                    agentRules: {ai1: {ruleID: 'ai1', prompt: 'p', created: '2026-06-08', errors: {123: 'boom'}}},
                },
            };
            expect(hasPolicyRulesError(policy)).toBe(true);
        });
    });

    describe('getExcludedUsers', () => {
        it('marks every active policy member as excluded', () => {
            const result = getExcludedUsers(employeeList);
            expect(result['owner@test.com']).toBe(true);
            expect(result['admin@test.com']).toBe(true);
            expect(result['employee@test.com']).toBe(true);
        });

        it('always excludes Expensify emails', () => {
            const result = getExcludedUsers(employeeList);
            for (const email of CONST.EXPENSIFY_EMAILS) {
                expect(result[email]).toBe(true);
            }
        });

        it('does not exclude a member that is pending delete', () => {
            const list: PolicyEmployeeList = {
                'employee@test.com': {email: 'employee@test.com', role: 'user', submitsTo: '', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            };
            const result = getExcludedUsers(list);
            expect(result['employee@test.com']).toBeUndefined();
        });

        it('does not exclude a member that has errors', () => {
            const list: PolicyEmployeeList = {
                'employee@test.com': {email: 'employee@test.com', role: 'user', submitsTo: '', errors: {error1: 'Something went wrong'}},
            };
            const result = getExcludedUsers(list);
            expect(result['employee@test.com']).toBeUndefined();
        });

        it('returns only Expensify emails when the employee list is undefined', () => {
            const result = getExcludedUsers(undefined);
            expect(Object.keys(result)).toEqual([...CONST.EXPENSIFY_EMAILS]);
        });
    });

    describe('isMergeHRCompleteSetupNeededSelector', () => {
        // Only the fields read by the selector are modeled here; `Object.assign` attaches the connection
        // to a real policy without an unsafe cast.
        type MergeHRTestConnection = {
            lastSync?: {syncStatus?: string};
            data?: {groups?: unknown[]};
            config?: {groups?: unknown[] | null};
        };
        const buildMergeHRPolicy = (seed: number, mergeHR: MergeHRTestConnection): Policy => Object.assign(createRandomPolicy(seed), {connections: {merge_hris: mergeHR}});
        const mergeHRBase = {
            lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.DONE},
            data: {groups: [{id: 'g1', name: 'Engineering'}]},
        };

        it('returns false when policy is undefined', () => {
            expect(isMergeHRCompleteSetupNeededSelector(undefined)).toBe(false);
        });

        it('returns false when policy has no merge_hris connection', () => {
            const policy = createRandomPolicy(1);
            expect(isMergeHRCompleteSetupNeededSelector(policy)).toBe(false);
        });

        it('returns false when sync is not done', () => {
            const policy = buildMergeHRPolicy(2, {...mergeHRBase, lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.SYNCING}});
            expect(isMergeHRCompleteSetupNeededSelector(policy)).toBe(false);
        });

        it('returns false when sync is done but there are no groups', () => {
            const policy = buildMergeHRPolicy(3, {...mergeHRBase, data: {groups: []}});
            expect(isMergeHRCompleteSetupNeededSelector(policy)).toBe(false);
        });

        it('returns false when setup is already complete (groups configured)', () => {
            const policy = buildMergeHRPolicy(4, {...mergeHRBase, config: {groups: ['g1']}});
            expect(isMergeHRCompleteSetupNeededSelector(policy)).toBe(false);
        });

        it('returns true when sync is done, groups exist, and setup is not yet complete', () => {
            const policy = buildMergeHRPolicy(5, mergeHRBase);
            expect(isMergeHRCompleteSetupNeededSelector(policy)).toBe(true);
        });
    });
});

describe('arePolicyRulesEnabled', () => {
    const corporateBase = createMock<Policy>({id: 'policy1', type: CONST.POLICY.TYPE.CORPORATE});
    const teamBase = createMock<Policy>({id: 'policy2', type: CONST.POLICY.TYPE.TEAM});

    it('returns true for a corporate policy with areRulesEnabled explicitly true', () => {
        expect(arePolicyRulesEnabled({...corporateBase, areRulesEnabled: true})).toBe(true);
    });

    it('returns false for a corporate policy with areRulesEnabled explicitly false', () => {
        expect(arePolicyRulesEnabled({...corporateBase, areRulesEnabled: false})).toBe(false);
    });

    it('returns false for a corporate policy with areRulesEnabled undefined and no categories', () => {
        expect(arePolicyRulesEnabled({...corporateBase, areRulesEnabled: undefined})).toBe(false);
    });

    it('returns false for a corporate policy with areRulesEnabled undefined and categories with no rule fields', () => {
        const categories = {Advertising: {name: 'Advertising', enabled: true, 'GL Code': '1234'}};
        expect(arePolicyRulesEnabled({...corporateBase, areRulesEnabled: undefined}, categories)).toBe(false);
    });

    it('returns true for a corporate policy with areRulesEnabled undefined and a category with maxExpenseAmount set', () => {
        const categories = {Advertising: {name: 'Advertising', enabled: true, maxExpenseAmount: 50000}};
        expect(arePolicyRulesEnabled({...corporateBase, areRulesEnabled: undefined}, categories)).toBe(true);
    });

    it('returns true for a corporate policy with areRulesEnabled undefined and a category with maxAmountNoReceipt = 0', () => {
        const categories = {Travel: {name: 'Travel', enabled: true, maxAmountNoReceipt: 0}};
        expect(arePolicyRulesEnabled({...corporateBase, areRulesEnabled: undefined}, categories)).toBe(true);
    });

    it('returns true for a corporate policy with areRulesEnabled undefined and a category with areCommentsRequired = true', () => {
        const categories = {Meals: {name: 'Meals', enabled: true, areCommentsRequired: true}};
        expect(arePolicyRulesEnabled({...corporateBase, areRulesEnabled: undefined}, categories)).toBe(true);
    });

    it('returns true for a corporate policy with areRulesEnabled undefined and a category with commentHint set', () => {
        const categories = {Car: {name: 'Car', enabled: true, commentHint: 'Enter purpose'}};
        expect(arePolicyRulesEnabled({...corporateBase, areRulesEnabled: undefined}, categories)).toBe(true);
    });

    it('returns false for a team policy with areRulesEnabled undefined', () => {
        expect(arePolicyRulesEnabled({...teamBase, areRulesEnabled: undefined})).toBe(false);
    });

    it('returns false for a team policy even when areRulesEnabled is true', () => {
        expect(arePolicyRulesEnabled({...teamBase, areRulesEnabled: true})).toBe(false);
    });
});

describe('getDefaultChatEnabledPolicy', () => {
    const submitPolicy = {...createRandomPolicy(1, CONST.POLICY.TYPE.SUBMIT), id: 'submit1'};
    const teamPolicy = {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), id: 'team1'};
    const corporatePolicy = {...createRandomPolicy(3, CONST.POLICY.TYPE.CORPORATE), id: 'corporate1'};
    const personalPolicy = {...createRandomPolicy(4, CONST.POLICY.TYPE.PERSONAL), id: 'personal1'};

    it('returns the active policy when it is a Submit workspace, even with multiple eligible workspaces', () => {
        // Regression: a Submit active policy must be recognized as the report-creation default. Previously
        // isPaidGroupPolicy excluded it, returning undefined here and wrongly forcing the workspace selector.
        expect(getDefaultChatEnabledPolicy([submitPolicy, teamPolicy], submitPolicy)).toBe(submitPolicy);
    });

    it('returns the active policy when it is a paid (Collect/Control) workspace', () => {
        expect(getDefaultChatEnabledPolicy([teamPolicy, corporatePolicy], teamPolicy)).toBe(teamPolicy);
    });

    it('returns the only eligible workspace when the active policy is personal', () => {
        expect(getDefaultChatEnabledPolicy([submitPolicy], personalPolicy)).toBe(submitPolicy);
    });

    it('returns undefined when the active policy is not a group policy and there are multiple eligible workspaces', () => {
        expect(getDefaultChatEnabledPolicy([submitPolicy, teamPolicy], personalPolicy)).toBeUndefined();
    });

    it('returns undefined when there are no eligible workspaces', () => {
        expect(getDefaultChatEnabledPolicy([], undefined)).toBeUndefined();
    });

    it('does not return the active policy when it is not in the eligible list (e.g. Submit beta off), falling back to the eligible workspace', () => {
        expect(getDefaultChatEnabledPolicy([teamPolicy], submitPolicy)).toBe(teamPolicy);
    });

    it('returns undefined when the active policy is ineligible and there are multiple eligible workspaces', () => {
        expect(getDefaultChatEnabledPolicy([teamPolicy, corporatePolicy], submitPolicy)).toBeUndefined();
    });
});
