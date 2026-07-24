import getCategoryContextualRules from '@libs/CategoryContextualRulesUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {PolicyCategory} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';
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
            }),
        ).toEqual([]);
    });

    it('returns flag-for-review and require-fields summaries with Rules edit routes', () => {
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
        });

        expect(rules).toHaveLength(2);
        expect(rules.at(0)?.summary).toContain('flag for review');
        expect(rules.at(0)?.summary).toContain('200');
        expect(rules.at(0)?.route).toContain('flag-for-review-rules/edit/Travel');
        expect(rules.at(0)?.route).toContain('isCategoryLocked=true');
        expect(rules.at(1)?.summary).toContain('Require description');
        expect(rules.at(1)?.route).toContain('require-fields-rules/edit/Travel');
        expect(rules.at(1)?.route).toContain('isCategoryLocked=true');
    });
});
