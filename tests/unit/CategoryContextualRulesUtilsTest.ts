import getCategoryContextualRules from '@libs/CategoryContextualRulesUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {PolicyCategory} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';
import {convertToDisplayString} from '../utils/TestHelper';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const policy = {
    ...createRandomPolicy(0),
    id: 'policy123',
    outputCurrency: CONST.CURRENCY.USD,
};

describe('getCategoryContextualRules', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    it('returns an empty list when the category has no Rules Revamp overrides', () => {
        const category: PolicyCategory = {name: 'Travel', enabled: true};

        expect(
            getCategoryContextualRules({
                policy,
                category,
                categoryName: 'Travel',
                translate: translateLocal,
                convertToDisplayString,
                isOffline: false,
            }),
        ).toEqual([]);
    });

    it('returns flag-for-review and require-fields summaries with category dynamic edit routes', () => {
        const category: PolicyCategory = {
            name: 'Travel',
            enabled: true,
            maxExpenseAmount: 20000,
            expenseLimitType: CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
            areCommentsRequired: true,
        };

        const rules = getCategoryContextualRules({
            policy,
            category,
            categoryName: 'Travel',
            translate: translateLocal,
            convertToDisplayString,
            isOffline: false,
        });

        expect(rules).toHaveLength(2);
        expect(rules.at(0)?.summary).toContain('flag for review');
        expect(rules.at(0)?.summary).toContain('200');
        expect(rules.at(0)?.dynamicRoutePath).toBe(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_EDIT.path);
        expect(rules.at(1)?.summary).toContain('Require description');
        expect(rules.at(1)?.dynamicRoutePath).toBe(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_REQUIRE_FIELDS_EDIT.path);
    });

    it('keeps optimistically deleted rules listed and disabled while offline', () => {
        const category: PolicyCategory = {
            name: 'Travel',
            enabled: true,
            maxExpenseAmount: 20000,
            expenseLimitType: CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
            areCommentsRequired: true,
            pendingFields: {
                maxExpenseAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                areCommentsRequired: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        };

        const rules = getCategoryContextualRules({
            policy,
            category,
            categoryName: 'Travel',
            translate: translateLocal,
            convertToDisplayString,
            isOffline: true,
        });

        expect(rules).toHaveLength(2);
        expect(rules.at(0)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        expect(rules.at(0)?.isDisabled).toBe(true);
        // The require-fields summary is built from fields that are pending delete, so it has to opt into them.
        expect(rules.at(1)?.summary).toContain('Require description');
        expect(rules.at(1)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        expect(rules.at(1)?.isDisabled).toBe(true);
    });

    it('drops optimistically deleted rules once back online', () => {
        const category: PolicyCategory = {
            name: 'Travel',
            enabled: true,
            maxExpenseAmount: 20000,
            expenseLimitType: CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
            areCommentsRequired: true,
            pendingFields: {
                maxExpenseAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                areCommentsRequired: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        };

        expect(
            getCategoryContextualRules({
                policy,
                category,
                categoryName: 'Travel',
                translate: translateLocal,
                convertToDisplayString,
                isOffline: false,
            }),
        ).toEqual([]);
    });
});
