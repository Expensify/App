import {getMerchantRulesTableData} from '@libs/MerchantTypeRulesUtils';
import {toIndexMap} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Rule} from '@src/types/onyx';
import type {RuleFilterNode} from '@src/types/onyx/RuleFilters';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;
const {TRIGGERS: TRIGGER, ACTIONS: ACTION} = CONST.RULES;
const {AND, EQUAL_TO} = CONST.SEARCH.SYNTAX_OPERATORS;
const SECTION = CONST.POLICY.EXPENSE_DEFAULTS_SECTION;

const policy: Policy = {...createRandomPolicy(0), id: 'policy1'};

const merchantIs: RuleFilterNode = {left: FIELD.MERCHANT, operator: EQUAL_TO, right: 'Apple'};
const categoryIs: RuleFilterNode = {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Travel'};
const tagIs: RuleFilterNode = {left: FIELD.TAG, operator: EQUAL_TO, right: 'Engineering'};

const buildRule = (filters: RuleFilterNode): Rule => ({
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: policy.id,
    triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION]),
    filters,
    actions: toIndexMap([{name: ACTION.SET, field: FIELD.REIMBURSABLE, value: true}]),
});

describe('Merchant rule section', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    const getSection = (filters: RuleFilterNode) =>
        getMerchantRulesTableData({
            policy,
            policyID: policy.id,
            rules: {[`${ONYXKEYS.COLLECTION.RULE}rule1`]: buildRule(filters)},
            translate: translateLocal,
            isOffline: false,
            onNavigate: () => {},
        }).at(0)?.section;

    it('lists a rule under the one field it matches on', () => {
        // Given three rules that each match on a single field
        // When the rules table groups them
        // Then each one is listed under that field's section
        expect(getSection(merchantIs)).toBe(SECTION.MERCHANTS);
        expect(getSection(categoryIs)).toBe(SECTION.CATEGORIES);
        expect(getSection(tagIs)).toBe(SECTION.TAGS);
    });

    it('lists a rule matching on more than one field under its own section', () => {
        // Given a rule matching on a category and a tag, which belongs to neither section on its own
        const filters: RuleFilterNode = {operator: AND, left: categoryIs, right: tagIs};

        // When the rules table groups it
        // Then it is listed once under the multiple conditions section rather than repeated or filed as a merchant rule
        expect(getSection(filters)).toBe(SECTION.MULTIPLE_CONDITIONS);
    });

    it('keeps a rule that matches on a merchant and another field out of the merchants section', () => {
        // Given a rule matching on a merchant and a category
        const filters: RuleFilterNode = {operator: AND, left: merchantIs, right: categoryIs};

        // When the rules table groups it
        // Then the merchant no longer decides the section, because the rule is narrower than the merchant alone
        expect(getSection(filters)).toBe(SECTION.MULTIPLE_CONDITIONS);
    });
});
