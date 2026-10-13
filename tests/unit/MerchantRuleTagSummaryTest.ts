import {getMerchantRulesTableData} from '@libs/MerchantTypeRulesUtils';
import {toIndexMap} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists, Rule} from '@src/types/onyx';
import type {ExpenseDefaultAction} from '@src/types/onyx/ExpenseDefaultRules';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;
const {TRIGGERS: TRIGGER, ACTIONS: ACTION} = CONST.RULES;

const policy: Policy = {...createRandomPolicy(0), id: 'policy1'};

/** A single-level tag list, holding only the tags a test keeps in the workspace. */
const buildPolicyTags = (tags: PolicyTagLists[string]['tags']): PolicyTagLists => ({
    Tag: {name: 'Tag', orderWeight: 0, required: false, tags},
});

const buildRule = (actions: ExpenseDefaultAction[]): Rule => ({
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: policy.id,
    triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION]),
    filters: {left: FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Apple'},
    actions: toIndexMap(actions),
});

const setTag: ExpenseDefaultAction = {name: ACTION.SET, field: FIELD.TAG, value: 'Engineering'};
const setCategory: ExpenseDefaultAction = {name: ACTION.SET, field: FIELD.CATEGORY, value: 'Travel'};
const setMerchant: ExpenseDefaultAction = {name: ACTION.SET, field: FIELD.MERCHANT, value: 'Apple Inc'};

describe('Merchant rule tag summary', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    const getRow = (rule: Rule, policyTags: PolicyTagLists | undefined) =>
        getMerchantRulesTableData({
            policy,
            policyID: policy.id,
            rules: {[`${ONYXKEYS.COLLECTION.RULE}rule1`]: rule},
            policyTags,
            translate: translateLocal,
            isOffline: false,
            onNavigate: () => {},
        }).at(0);

    it('shows the tag while it still exists in the workspace', () => {
        // Given a rule that sets a tag the workspace still has
        const policyTags = buildPolicyTags({Engineering: {name: 'Engineering', enabled: true}});

        // When the rules table summarizes it
        const row = getRow(buildRule([setTag]), policyTags);

        // Then the tag is part of the summary
        expect(row?.ruleDescription).toBe('Update tag to "Engineering"');
    });

    it("hides a deleted tag but keeps the rule's other defaults", () => {
        // Given a rule that sets a category and a tag, and the tag has since been deleted. The backend keeps the
        // tag on the rule so it applies again if the tag is recreated, so only the summary can hide it.
        const policyTags = buildPolicyTags({Marketing: {name: 'Marketing', enabled: true}});

        // When the rules table summarizes it
        const row = getRow(buildRule([setCategory, setTag]), policyTags);

        // Then only the category is described
        expect(row?.ruleDescription).toBe('Update category to "Travel"');
    });

    it('hides a tag that is pending deletion', () => {
        // Given the tag was deleted offline, so it is still in the list but marked for deletion
        const policyTags = buildPolicyTags({Engineering: {name: 'Engineering', enabled: true, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}});

        // When the rules table summarizes the rule
        const row = getRow(buildRule([setCategory, setTag]), policyTags);

        // Then the tag is hidden right away rather than after the deletion syncs
        expect(row?.ruleDescription).toBe('Update category to "Travel"');
    });

    it('keeps the tag while the workspace tags have not loaded', () => {
        // Given the workspace tags are not in Onyx yet, so there is nothing to check the tag against
        const policyTags = undefined;

        // When the rules table summarizes the rule
        const row = getRow(buildRule([setTag]), policyTags);

        // Then the tag is still shown, so it doesn't flicker out and back once the tags load
        expect(row?.ruleDescription).toBe('Update tag to "Engineering"');
    });

    it('labels a rule as a rename once its deleted tag leaves only the merchant rename', () => {
        // Given a rule that renames the merchant and sets a tag that has since been deleted
        const policyTags = buildPolicyTags({});

        // When the rules table summarizes it
        const row = getRow(buildRule([setMerchant, setTag]), policyTags);

        // Then it reads as a rename, since renaming the merchant is all the rule still does
        expect(row?.isRename).toBe(true);
        expect(row?.typeLabel).toBe('Rename');
        expect(row?.ruleDescription).toBe('Rename merchant to "Apple Inc"');
    });

    it('keeps a tag-only rule in the table after its tag is deleted', () => {
        // Given a rule whose only default is a tag that has since been deleted
        const policyTags = buildPolicyTags({});

        // When the rules table summarizes it
        const row = getRow(buildRule([setTag]), policyTags);

        // Then the row stays, with nothing to describe, so an admin can still open or delete the rule
        expect(row?.ruleID).toBe('rule1');
        expect(row?.ruleDescription).toBe('');
    });
});
