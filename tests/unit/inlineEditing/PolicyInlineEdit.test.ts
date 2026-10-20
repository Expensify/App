import type PolicyData from '@hooks/usePolicyData/types';

import {
    canUpdateExpensifyCardLimitTypeInline,
    getExpensifyCardLimitInlineEditError,
    getExpensifyCardLimitInlineUpdate,
    renameCategoryInline,
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
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, Policy, Rule} from '@src/types/onyx';

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

const rules: Record<string, Rule> = {
    [`${ONYXKEYS.COLLECTION.RULE}1`]: createMock<Rule>({scope: CONST.RULES.SCOPE.POLICY, scopeID: '1'}),
};

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
            // Given the coding rules, which the action needs because it rewrites the renamed category inside them
            // When the rename is made from the table
            renameCategoryInline(translate, policyData, 'Food', '  Meals  ', true, rules);

            // Then the collection reaches the action alongside the names
            expect(mockRenamePolicyCategory).toHaveBeenCalledWith(policyData, {oldName: 'Food', newName: 'Meals'}, true, rules);
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
            renameCategoryInline(translate, policyData, encodedFoodAndDrink, 'Snacks', true, rules);

            expect(mockRenamePolicyCategory).toHaveBeenCalledWith(policyData, {oldName: encodedFoodAndDrink, newName: 'Snacks'}, true, rules);
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
