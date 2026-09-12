import type PolicyData from '@hooks/usePolicyData/types';

import {renameCategoryInline, updateExpensifyCardLimitInline, updateExpensifyCardLimitTypeInline, updateMemberRoleInline} from '@libs/actions/Policy/InlineEdit';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {isRecord} from '@libs/ObjectUtils';

import {updateExpensifyCardLimitType} from '@userActions/Card';
import {renamePolicyCategory} from '@userActions/Policy/Category';
import {updateWorkspaceMembersRole} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import type {Card, Policy} from '@src/types/onyx';

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

const policyData = createMock<PolicyData>({
    policy: {id: '1'},
    categories: {
        Food: {name: 'Food', enabled: true},
        Travel: {name: 'Travel', enabled: true},
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
            renameCategoryInline(policyData, 'Food', '  Food  ');

            expect(mockRenamePolicyCategory).not.toHaveBeenCalled();
        });

        it('does not persist an invalid name', () => {
            renameCategoryInline(policyData, 'Food', 'Travel');

            expect(mockRenamePolicyCategory).not.toHaveBeenCalled();
        });

        it('delegates a valid rename to the canonical action', () => {
            renameCategoryInline(policyData, 'Food', '  Meals  ');

            expect(mockRenamePolicyCategory).toHaveBeenCalledWith(policyData, {oldName: 'Food', newName: 'Meals'});
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

    describe('updateExpensifyCardLimitInline', () => {
        it('does not persist an invalid limit', () => {
            updateExpensifyCardLimitInline(1, buildCard(), '10.5');

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

        updateExpensifyCardLimitType(1, 10, CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED, undefined, nameValuePairs, '2026-03-01', '2026-03-31', false);

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
