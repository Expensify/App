import type PolicyData from '@hooks/usePolicyData/types';

import {
    canUpdateExpensifyCardLimitTypeInline,
    getExpensifyCardLimitInlineEditError,
    getExpensifyCardLimitInlineUpdate,
    renameCategoryInline,
    renameCompanyCardInline,
    renameExpensifyCardInline,
    updateDistanceRateValueInline,
    updateDistanceTaxClaimableValueInline,
    updateExpensifyCardLimitInline,
    updateExpensifyCardLimitTypeInline,
    updateMemberRoleInline,
} from '@libs/actions/Policy/InlineEdit';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {isRecord} from '@libs/ObjectUtils';

import {updateExpensifyCardLimitType} from '@userActions/Card';
import {renamePolicyCategory} from '@userActions/Policy/Category';
import {updateWorkspaceMembersRole} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {Card, Policy} from '@src/types/onyx';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

import type {PartialDeep} from 'type-fest';

import createMock from '../../utils/createMock';

jest.mock('@libs/API');
jest.mock('@userActions/Policy/Category', () => ({
    renamePolicyCategory: jest.fn(),
}));
jest.mock('@userActions/Policy/Member', () => ({
    updateWorkspaceMembersRole: jest.fn(),
}));

const mockWrite = jest.mocked(write);
const mockRenamePolicyCategory = jest.mocked(renamePolicyCategory);
const mockUpdateWorkspaceMembersRole = jest.mocked(updateWorkspaceMembersRole);

function getWriteCall(command: string) {
    const call = mockWrite.mock.calls.find((writeCall) => writeCall.at(0) === command);
    if (!call) {
        throw new Error(`${command} was not written`);
    }

    return {params: call.at(1), onyxData: call.at(2)};
}

function requireRecord(value: unknown, message: string): Record<string, unknown> {
    if (!isRecord(value)) {
        throw new Error(message);
    }
    return value;
}

function getOptimisticCardNameValuePairs(cardID: number): Record<string, unknown> {
    const onyxData = requireRecord(getWriteCall(WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT_TYPE).onyxData, 'Missing onyx data');
    if (!Array.isArray(onyxData.optimisticData)) {
        throw new Error('Missing optimistic data');
    }

    const firstUpdate = requireRecord(onyxData.optimisticData.at(0), 'Missing cards list optimistic update');
    const cardListUpdate = requireRecord(firstUpdate.value, 'Missing cards list optimistic value');
    const cardUpdate = requireRecord(cardListUpdate[cardID], `Missing card ${cardID} optimistic update`);
    return requireRecord(cardUpdate.nameValuePairs, 'Missing nameValuePairs optimistic update');
}

/** Echoes the translation path and any interpolated values so assertions can lock the chosen message. */
function translate<TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string {
    if (parameters.length === 0) {
        return path;
    }
    return `${path}|${parameters.map(String).join('|')}`;
}

const encodedFoodAndDrink = 'Food &amp; Drink';

const policyData = createMock<PolicyData>({
    policy: {id: '1'},
    categories: {
        Food: {name: 'Food', enabled: true},
        Travel: {name: 'Travel', enabled: true},
        [encodedFoodAndDrink]: {name: encodedFoodAndDrink, enabled: true},
    },
    tags: {},
    reports: [],
    transactionsAndViolations: {},
});

const policy = createMock<Policy>({id: '1'});

function buildCard(overrides: PartialDeep<Card> = {}): Card {
    return createMock<Card>({
        cardID: 10,
        availableSpend: 5000,
        ...overrides,
        nameValuePairs: {
            cardTitle: 'Travel',
            limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            unapprovedExpenseLimit: 10000,
            isVirtual: true,
            validFrom: '2026-01-01',
            validThru: '2026-12-31',
            ...overrides.nameValuePairs,
        },
    });
}

describe('PolicyInlineEdit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('renameCategoryInline', () => {
        it('does not persist when the sanitized name is unchanged', () => {
            renameCategoryInline(translate, policyData, 'Food', '  Food  ', true);

            expect(mockRenamePolicyCategory).not.toHaveBeenCalled();
        });

        it('does not persist an invalid name', () => {
            // Given a category name that already exists on the policy
            // When that name is saved from the table
            const rejection = renameCategoryInline(translate, policyData, 'Food', 'Travel', true);

            // Then the edit is dropped and the caller can toast the same duplicate-name error as the form
            expect(rejection).toBe('workspace.categories.existingCategoryError');
            expect(mockRenamePolicyCategory).not.toHaveBeenCalled();
        });

        it('does not persist an HTML-like name', () => {
            // Given a category renamed from the table rather than the Name page
            // When the new name contains an HTML-like token the Name page rejects
            const rejection = renameCategoryInline(translate, policyData, 'Food', '</>', true);

            // Then the edit is dropped with the invalid-name error, because that token must not be saved from the table either
            expect(rejection).toBe('workspace.categories.invalidCategoryName');
            expect(mockRenamePolicyCategory).not.toHaveBeenCalled();
        });

        it('delegates a valid rename to the canonical action', () => {
            renameCategoryInline(translate, policyData, 'Food', '  Meals  ', true);

            expect(mockRenamePolicyCategory).toHaveBeenCalledWith(policyData, {oldName: 'Food', newName: 'Meals'}, true, {});
        });

        it('does not persist a name that matches an HTML-encoded category', () => {
            renameCategoryInline(translate, policyData, 'Food', 'Food & Drink', true);

            expect(mockRenamePolicyCategory).not.toHaveBeenCalled();
        });

        it('does not persist when the sanitized name matches the decoded stored name', () => {
            renameCategoryInline(translate, policyData, encodedFoodAndDrink, '  Food & Drink  ', true);

            expect(mockRenamePolicyCategory).not.toHaveBeenCalled();
        });

        it('persists a rename of an HTML-encoded category using the raw stored name', () => {
            renameCategoryInline(translate, policyData, encodedFoodAndDrink, 'Snacks', true);

            expect(mockRenamePolicyCategory).toHaveBeenCalledWith(policyData, {oldName: encodedFoodAndDrink, newName: 'Snacks'}, true, {});
        });
    });

    describe('updateMemberRoleInline', () => {
        it('does not persist an unchanged role', () => {
            updateMemberRoleInline(policy, 'user@expensify.com', 1, CONST.POLICY.ROLE.ADMIN, CONST.POLICY.ROLE.ADMIN);

            expect(mockUpdateWorkspaceMembersRole).not.toHaveBeenCalled();
        });

        it('delegates an assignable role change to the canonical action', () => {
            updateMemberRoleInline(policy, 'user@expensify.com', 1, CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.ADMIN);

            expect(mockUpdateWorkspaceMembersRole).toHaveBeenCalledWith(policy, ['user@expensify.com'], [1], CONST.POLICY.ROLE.ADMIN);
        });
    });

    describe('updateDistanceRateValueInline', () => {
        const rate: Rate = {customUnitRateID: 'cars', rate: 10, currency: CONST.CURRENCY.GBP};
        const customUnit: CustomUnit = {customUnitID: 'distance', name: CONST.CUSTOM_UNITS.NAME_DISTANCE, rates: {cars: rate}};
        const toLocaleDigit = (digit: string) => digit;

        it.each(['0.1', '0.10', '0.1000'])('does not persist the unchanged rate %s', (newRate) => {
            // Given a stored rate displayed as 0.10
            // When the same numeric rate is entered with different padding
            const rejection = updateDistanceRateValueInline(translate, '1', customUnit, rate, newRate, toLocaleDigit);

            // Then no unnecessary request is written
            expect(rejection).toBeUndefined();
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('ignores floating-point noise when comparing at four decimals', () => {
            // Given a saved rate whose cents conversion contains floating-point noise
            const savedRate = {...rate, rate: Number('0.29') * 100};

            // When the same amount is submitted
            updateDistanceRateValueInline(translate, '1', customUnit, savedRate, '0.2900', toLocaleDigit);

            // Then the rate is unchanged at editor precision
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('persists a change in the fourth decimal place', () => {
            // Given a stored rate displayed as 0.10
            // When the fourth decimal is changed
            updateDistanceRateValueInline(translate, '1', customUnit, rate, '0.1001', toLocaleDigit);

            // Then all four decimals reach the canonical update action
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE_VALUE,
                expect.objectContaining({customUnitRateArray: JSON.stringify([{...rate, rate: Number('0.1001') * 100}])}),
                expect.anything(),
            );
        });
    });

    describe('updateDistanceTaxClaimableValueInline', () => {
        const rate: Rate = {
            customUnitRateID: 'cars',
            name: 'Cars',
            rate: 1000,
            currency: CONST.CURRENCY.GBP,
            enabled: true,
            attributes: {taxClaimablePercentage: 0.2, taxRateExternalID: 'VAT'},
        };
        const customUnit: CustomUnit = {customUnitID: 'distance', name: CONST.CUSTOM_UNITS.NAME_DISTANCE, rates: {cars: rate}};

        it('converts the entered amount to a fraction without rounding away four-decimal precision', () => {
            // Given a GBP rate with a tax rate and an existing reclaimable percentage
            // When the amount includes fractional pennies
            const rejection = updateDistanceTaxClaimableValueInline(translate, '1', customUnit, rate, '1.2345');

            // Then the canonical action persists the fraction and preserves the other rate attributes
            expect(rejection).toBeUndefined();
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DISTANCE_TAX_CLAIMABLE_VALUE,
                {
                    policyID: '1',
                    customUnitID: 'distance',
                    customUnitRateArray: JSON.stringify([{...rate, attributes: {...rate.attributes, taxClaimablePercentage: (1.2345 * 100) / 1000}}]),
                },
                expect.anything(),
            );
        });

        it.each(['10', '10.0001'])('rejects %s because it is not below the rate amount', (newAmount) => {
            // Given a rate of ten currency units
            // When the edit is equal to or greater than that rate
            const rejection = updateDistanceTaxClaimableValueInline(translate, '1', customUnit, rate, newAmount);

            // Then the page receives the details form error and no request is written
            expect(rejection).toBe('workspace.taxes.error.updateTaxClaimableFailureMessage');
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it.each(['2', '2.00', '2.0000'])('does not persist the unchanged amount %s', (newAmount) => {
            // Given a stored percentage representing two currency units
            // When the same amount is entered with a different number of decimal places
            const rejection = updateDistanceTaxClaimableValueInline(translate, '1', customUnit, rate, newAmount);

            // Then numeric equality avoids an unnecessary request
            expect(rejection).toBeUndefined();
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it.each(['0.1', '0.10', '0.1000'])('does not persist the unchanged fractional amount %s', (newAmount) => {
            // Given a reclaimable amount displayed as 0.10
            const fractionalRate = {...rate, attributes: {...rate.attributes, taxClaimablePercentage: (0.1 * 100) / 1000}};

            // When the same amount is entered with different padding
            updateDistanceTaxClaimableValueInline(translate, '1', customUnit, fractionalRate, newAmount);

            // Then both values are compared at four decimals instead of comparing their formatting
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('persists a change in the fourth decimal place', () => {
            // Given a reclaimable amount displayed as 2.00
            // When the fourth decimal is changed
            updateDistanceTaxClaimableValueInline(translate, '1', customUnit, rate, '2.0001');

            // Then the change is not mistaken for an unchanged two-decimal amount
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DISTANCE_TAX_CLAIMABLE_VALUE,
                expect.objectContaining({customUnitRateArray: JSON.stringify([{...rate, attributes: {...rate.attributes, taxClaimablePercentage: (2.0001 * 100) / 1000}}])}),
                expect.anything(),
            );
        });

        it.each(['', '0'])('clears an existing amount with input %s', (newAmount) => {
            // Given a rate with an existing reclaimable amount
            // When the amount is cleared or explicitly set to zero
            updateDistanceTaxClaimableValueInline(translate, '1', customUnit, rate, newAmount);

            // Then the fraction becomes zero without removing the assigned tax rate
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DISTANCE_TAX_CLAIMABLE_VALUE,
                expect.objectContaining({customUnitRateArray: JSON.stringify([{...rate, attributes: {...rate.attributes, taxClaimablePercentage: 0}}])}),
                expect.anything(),
            );
        });

        it.each([0, undefined])('matches the details form guard when the stored rate is %s', (rateValue) => {
            // Given a zero or missing distance rate
            const emptyRate = {...rate, rate: rateValue};

            // When an amount is submitted
            updateDistanceTaxClaimableValueInline(translate, '1', customUnit, emptyRate, '1');

            // Then no invalid division is serialized and the details page undefined-percentage behavior is preserved
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DISTANCE_TAX_CLAIMABLE_VALUE,
                expect.objectContaining({customUnitRateArray: JSON.stringify([{...emptyRate, attributes: {...rate.attributes, taxClaimablePercentage: undefined}}])}),
                expect.anything(),
            );
        });

        it('does not persist clearing an amount that is already unset', () => {
            // Given a rate without a tax reclaimable percentage
            const unsetRate = {...rate, attributes: {taxRateExternalID: 'VAT'}};

            // When its blank inline editor blurs
            updateDistanceTaxClaimableValueInline(translate, '1', customUnit, unsetRate, '');

            // Then nothing changes and no request is written
            expect(mockWrite).not.toHaveBeenCalled();
        });
    });

    describe('renameExpensifyCardInline', () => {
        it('does not persist a name the user never changed', () => {
            // Given a card named "Travel"
            // When the editor closes on blur with that same name
            const rejection = renameExpensifyCardInline(translate, 1, 10, 'Travel', 'Travel');

            // Then nothing is written and no toast is raised, so opening the editor and clicking away costs no request
            expect(rejection).toBeUndefined();
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('returns the required-field error for a name that sanitizes to nothing', () => {
            // Given a card named "Travel"
            // When the editor commits whitespace only
            const rejection = renameExpensifyCardInline(translate, 1, 10, '   ', 'Travel');

            // Then the page can toast the same required message as the card name form, and nothing is written
            expect(rejection).toBe('common.error.fieldRequired');
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('returns the invalid-character error for a name the card form rejects', () => {
            // Given a card named "Travel"
            // When the editor commits a name that contains an HTML-like tag
            const rejection = renameExpensifyCardInline(translate, 1, 10, '</>', 'Travel');

            // Then the page can toast the same invalid-character message as the card name form, and nothing is written
            expect(rejection).toBe('common.error.invalidCharacter');
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('returns the length error for a name past the card form limit', () => {
            // Given a card named "Travel" and a name one byte past the shared length limit
            const tooLongName = 'a'.repeat(CONST.STANDARD_LENGTH_LIMIT + 1);

            // When the editor commits that name
            const rejection = renameExpensifyCardInline(translate, 1, 10, tooLongName, 'Travel');

            // Then the page can toast the same character-limit message as the card name form, and nothing is written
            expect(rejection).toBe(`common.error.characterLimitExceedCounter|${CONST.STANDARD_LENGTH_LIMIT + 1}|${CONST.STANDARD_LENGTH_LIMIT}`);
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('persists the sanitized name', () => {
            // Given a card named "Travel"
            // When the editor commits a new name padded with whitespace
            const rejection = renameExpensifyCardInline(translate, 1, 10, '  Travel card  ', 'Travel');

            // Then the trimmed name reaches the backend and no toast is raised, so a padded paste cannot be stored verbatim
            expect(rejection).toBeUndefined();
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_TITLE,
                expect.objectContaining({
                    cardID: 10,
                    cardTitle: 'Travel card',
                }),
                expect.anything(),
            );
        });
    });

    describe('getExpensifyCardLimitInlineUpdate', () => {
        it('returns the field error for an invalid limit so the page can toast it', () => {
            // Given a limit the card form rejects because it is not a whole dollar amount
            // When the table asks whether that limit is an error
            const rejection = getExpensifyCardLimitInlineEditError(translate, '10.5');

            // Then the page can show the same whole-dollar message as the card form, and still skip the confirm modal
            expect(rejection).toBe('iou.error.invalidIntegerAmount');
        });

        it('returns undefined for an invalid limit so the confirm modal is not shown', () => {
            // Given a card with a current limit of $100
            const card = buildCard();

            // When the inline value is not an integer dollar amount
            const nextLimit = getExpensifyCardLimitInlineUpdate(card, '10.5');

            // Then there is no persistable update because the RHP form would also reject this
            expect(nextLimit).toBeUndefined();
        });

        it('returns undefined when the dollar amount matches the stored limit', () => {
            // Given a card whose unapproved expense limit is already 10000 cents
            const card = buildCard();

            // When the inline value is that same dollar amount
            const nextLimit = getExpensifyCardLimitInlineUpdate(card, '100');

            // Then there is no persistable update so the page can skip the remaining-spend confirm
            expect(nextLimit).toBeUndefined();
        });

        it('returns the backend amount in cents for a valid new limit', () => {
            // Given a card whose stored limit is $100
            const card = buildCard();

            // When the inline value is a different integer dollar amount
            const nextLimit = getExpensifyCardLimitInlineUpdate(card, '50');

            // Then the page and write path share the same cents value to persist
            expect(nextLimit).toBe(5000);
        });
    });

    describe('updateExpensifyCardLimitInline', () => {
        it('does not persist an invalid limit', () => {
            updateExpensifyCardLimitInline(1, buildCard(), '10.5');

            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('does not persist an unchanged limit', () => {
            updateExpensifyCardLimitInline(1, buildCard(), '100');

            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('persists the dollar amount as cents', () => {
            updateExpensifyCardLimitInline(1, buildCard(), '50');

            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT,
                expect.objectContaining({
                    cardID: 10,
                    limit: 5000,
                }),
                expect.anything(),
            );
        });
    });

    describe('canUpdateExpensifyCardLimitTypeInline', () => {
        it('returns false when the type is unchanged so the confirm modal is not shown', () => {
            // Given a card that is already Monthly
            const card = buildCard();

            // When the inline picker selects Monthly again
            const canUpdate = canUpdateExpensifyCardLimitTypeInline(card, CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY);

            // Then the page should not confirm or persist because nothing would change
            expect(canUpdate).toBe(false);
        });

        it('returns false for Single Use on a physical card', () => {
            // Given a physical card, which cannot use Single Use
            const card = buildCard({nameValuePairs: {isVirtual: false}});

            // When the inline picker selects Single Use
            const canUpdate = canUpdateExpensifyCardLimitTypeInline(card, CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE);

            // Then the page should skip confirm because the write path would no-op
            expect(canUpdate).toBe(false);
        });

        it('returns true for a persistable type change', () => {
            // Given a virtual Monthly card that can switch to Smart
            const card = buildCard();

            // When the inline picker selects Smart
            const canUpdate = canUpdateExpensifyCardLimitTypeInline(card, CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART);

            // Then the page can proceed to confirm or persist
            expect(canUpdate).toBe(true);
        });
    });

    describe('updateExpensifyCardLimitTypeInline', () => {
        it('does not persist Single Use on a physical card', () => {
            updateExpensifyCardLimitTypeInline(1, buildCard({nameValuePairs: {isVirtual: false}}), CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE);

            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('does not persist Fixed when that type is not valid for the card', () => {
            const card = buildCard({
                totalSpend: -10000,
                nameValuePairs: {
                    limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
                    unapprovedExpenseLimit: 10000,
                },
            });

            updateExpensifyCardLimitTypeInline(1, card, CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED);

            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('does not persist Fixed when the fallback limit type is fully spent', () => {
            const card = buildCard({
                totalSpend: -10000,
                nameValuePairs: {
                    limitType: undefined,
                    unapprovedExpenseLimit: 10000,
                },
            });

            updateExpensifyCardLimitTypeInline(1, card, CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED, CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY);

            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('changes only the limit type and leaves validity dates untouched', () => {
            const card = buildCard();

            updateExpensifyCardLimitTypeInline(1, card, CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART);

            const {params} = getWriteCall(WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT_TYPE);
            const nameValuePairs = getOptimisticCardNameValuePairs(10);
            const pendingFields = requireRecord(nameValuePairs.pendingFields, 'Missing pendingFields');

            expect(params).toEqual({
                cardID: 10,
                limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            });
            expect(nameValuePairs).not.toHaveProperty('validFrom');
            expect(nameValuePairs).not.toHaveProperty('validThru');
            expect(pendingFields).not.toHaveProperty('validFrom');
            expect(pendingFields).not.toHaveProperty('validThru');
        });
    });

    describe('renameCompanyCardInline', () => {
        const DOMAIN_ID = 1;
        const CARD_ID = '42';
        const BANK_NAME = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;

        it('does not persist when the sanitized name matches the displayed name', () => {
            // Given a card whose displayed name (from cardTitle) is "Marketing"
            // When the editor closes with the same trimmed name
            const rejection = renameCompanyCardInline(translate, DOMAIN_ID, CARD_ID, '  Marketing  ', BANK_NAME, 'Marketing', 'Marketing');

            // Then nothing is written and no toast is raised
            expect(rejection).toBeUndefined();
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('does not persist when the sanitized name matches the default-fallback displayed name for an unnamed card', () => {
            // Given a card with no stored cardTitle — the displayed name falls back to "John's card"
            // When the editor commits exactly that default name
            const rejection = renameCompanyCardInline(translate, DOMAIN_ID, CARD_ID, "John's card", BANK_NAME, "John's card", undefined);

            // Then nothing is persisted because the name equals what is already shown in the cell
            expect(rejection).toBeUndefined();
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('returns the required-field error for a name that sanitizes to nothing', () => {
            // Given a card named "Marketing"
            // When the editor commits whitespace only
            const rejection = renameCompanyCardInline(translate, DOMAIN_ID, CARD_ID, '   ', BANK_NAME, 'Marketing', 'Marketing');

            // Then the page can toast the same required message as the rename form, and nothing is written
            expect(rejection).toBe('common.error.fieldRequired');
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('returns the invalid-character error for a name the rename form rejects', () => {
            // Given a card named "Marketing"
            // When the editor commits a name containing an HTML-like tag
            const rejection = renameCompanyCardInline(translate, DOMAIN_ID, CARD_ID, '</>', BANK_NAME, 'Marketing', 'Marketing');

            // Then the page can toast the same invalid-character message as the form, and nothing is written
            expect(rejection).toBe('common.error.invalidCharacter');
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('writes the sanitized name and passes the stored cardTitle as the rollback value', () => {
            // Given a card whose cardTitle is "Marketing" (the rollback source)
            // When the editor commits a new name padded with whitespace
            const rejection = renameCompanyCardInline(translate, DOMAIN_ID, CARD_ID, '  Ads spend  ', BANK_NAME, 'Marketing', 'Marketing');

            // Then the trimmed name reaches the backend
            expect(rejection).toBeUndefined();
            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME, expect.objectContaining({cardID: Number(CARD_ID), cardName: 'Ads spend'}), expect.anything());
        });

        it('passes undefined as the rollback value for a card with no stored cardTitle', () => {
            // Given a card that was never renamed (storedName is undefined)
            // When the editor commits a new name
            renameCompanyCardInline(translate, DOMAIN_ID, CARD_ID, 'New name', BANK_NAME, "John's card", undefined);

            // Then the write is dispatched and the failure data will null-out cardTitle on rollback
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME,
                expect.objectContaining({cardID: Number(CARD_ID), cardName: 'New name'}),
                expect.objectContaining({
                    failureData: [
                        expect.objectContaining({
                            value: {[CARD_ID]: expect.objectContaining({nameValuePairs: expect.objectContaining({cardTitle: null})})},
                        }),
                    ],
                }),
            );
        });
    });
});

describe('updateExpensifyCardLimitType', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('still writes validity dates when the RHP supplies them', () => {
        const nameValuePairs = buildCard().nameValuePairs;

        updateExpensifyCardLimitType({
            workspaceAccountID: 1,
            cardID: 10,
            newLimitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            oldCardNameValuePairs: nameValuePairs,
            validFrom: '2026-03-01',
            validThru: '2026-03-31',
            shouldClearValidityDates: false,
        });

        const {params} = getWriteCall(WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT_TYPE);
        const optimisticNameValuePairs = getOptimisticCardNameValuePairs(10);

        expect(params).toEqual(
            expect.objectContaining({
                cardID: 10,
                limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                clearValidityDates: false,
            }),
        );
        expect(params).toHaveProperty('validFrom');
        expect(params).toHaveProperty('validThru');
        expect(optimisticNameValuePairs).toHaveProperty('validFrom');
        expect(optimisticNameValuePairs).toHaveProperty('validThru');
    });
});
