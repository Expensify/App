/**
 * Helpers for the expense default rules stored in the `rules_` collection, which is what the merchant rule
 * editor reads and writes. Converts between the rules engine's filter tree and the flat form the editor
 * uses, and reports the rules the form can't represent so they stay read-only instead of losing data on save.
 */
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Rule} from '@src/types/onyx';
import type {ApprovalWorkflowAction} from '@src/types/onyx/ApprovalWorkflowRules';
import type {
    ExpenseDefaultAction,
    ExpenseDefaultActionField,
    ExpenseDefaultActions,
    ExpenseDefaultRule,
    ExpenseDefaultTaxValue,
    ExpenseDefaultTrigger,
    ExpenseDefaultTriggers,
} from '@src/types/onyx/ExpenseDefaultRules';
import type {RuleFilterComparison, RuleFilterNode} from '@src/types/onyx/RuleFilters';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {rand64} from './NumberUtils';
import Parser from './Parser';
import {fromIndexMap, getRuleFilterLeaves, isExpenseDefaultRule, isRuleFilterComparison, isRuleFilterNode, toIndexMap} from './RuleUtils';

/** The form shape the merchant rule editor round-trips a rule through. */
type ExpenseDefaultFormValues = {
    /** The merchant string an expense has to match */
    merchantToMatch?: string;

    /** Whether the merchant has to match exactly (`eq`) or partially (`contains`) */
    matchType?: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;

    /** The categories an expense has to be in. The list is matched as an OR, so any one of them matches */
    categoriesToMatch?: string[];

    /** The tags an expense has to carry. The list is matched as an OR, so any one of them matches */
    tagsToMatch?: string[];

    /** The merchant the expense is renamed to */
    merchant?: string;

    /** The category set on the expense */
    category?: string;

    /** The tag set on the expense */
    tag?: string;

    /** The external ID of the tax rate set on the expense */
    tax?: string;

    /** The amount set on the expense, as positive whole cents. A form input can only hold a string, and the rule stores the value negated */
    amount?: string;

    /** The external ID of the vendor set on the expense */
    vendorID?: string;

    /** The description set on the expense, as markdown */
    comment?: string;

    /** Whether the expense is reimbursable */
    reimbursable?: boolean;

    /** Whether the expense is billable */
    billable?: boolean;
};

/** A rule from the `rules_` collection together with the ID parsed out of its Onyx key. */
type RuleWithID = {
    /** The rule's ID, i.e. the `rules_` key suffix */
    ruleID: string;

    /** The rule itself, narrowed to the expense default shape by `getPolicyExpenseDefaultRules` */
    rule: Rule & ExpenseDefaultRule;
};

const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;
const {TRIGGERS: TRIGGER, ACTIONS: ACTION} = CONST.RULES;
const {AND, EQUAL_TO, CONTAINS} = CONST.SEARCH.SYNTAX_OPERATORS;

/**
 * The expense fields a rule can match on.
 *
 * These are search syntax filter keys, which is what the rules engine's filter tree speaks. They are not the
 * action field names, even where the two happen to spell a field the same way.
 */
const CONDITION = {
    MERCHANT: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
    CATEGORY: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
    TAG: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
} as const;

/** The order actions are written in, which fixes the numeric keys a built rule uses. */
const ACTION_FIELD_ORDER = [FIELD.MERCHANT, FIELD.CATEGORY, FIELD.TAG, FIELD.TAX, FIELD.AMOUNT, FIELD.VENDOR_ID, FIELD.COMMENT, FIELD.REIMBURSABLE, FIELD.BILLABLE] as const;

/** Merchant match types the editor can represent. Any other operator on the merchant node makes a rule read-only. */
const SUPPORTED_MERCHANT_MATCH_TYPES = new Set<ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>>([EQUAL_TO, CONTAINS]);

/**
 * The form key each action field reads back into, which makes reading a rule the mirror of writing one.
 *
 * A field that is absent here has no form input, so a rule setting it is read-only rather than landing in
 * whichever branch happens to catch it.
 */
const STRING_ACTION_FIELD_TO_FORM_KEY = {
    [FIELD.MERCHANT]: 'merchant',
    [FIELD.CATEGORY]: 'category',
    [FIELD.TAG]: 'tag',
    [FIELD.VENDOR_ID]: 'vendorID',
    [FIELD.COMMENT]: 'comment',
} as const satisfies Partial<Record<ExpenseDefaultActionField, keyof ExpenseDefaultFormValues>>;

/** See `STRING_ACTION_FIELD_TO_FORM_KEY`. */
const BOOLEAN_ACTION_FIELD_TO_FORM_KEY = {
    [FIELD.REIMBURSABLE]: 'reimbursable',
    [FIELD.BILLABLE]: 'billable',
} as const satisfies Partial<Record<ExpenseDefaultActionField, keyof ExpenseDefaultFormValues>>;

function isStringActionField(field: ExpenseDefaultActionField): field is keyof typeof STRING_ACTION_FIELD_TO_FORM_KEY {
    return field in STRING_ACTION_FIELD_TO_FORM_KEY;
}

function isBooleanActionField(field: ExpenseDefaultActionField): field is keyof typeof BOOLEAN_ACTION_FIELD_TO_FORM_KEY {
    return field in BOOLEAN_ACTION_FIELD_TO_FORM_KEY;
}

/**
 * The rule format has no notion of an empty value: a field the admin cleared is simply not set.
 *
 * The value is trimmed as well as tested, so a field holding only padding round-trips as unset rather than as
 * whitespace the admin never typed.
 */
function emptyToUndefined(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    if (!trimmed) {
        return undefined;
    }
    return trimmed;
}

/** Lists a rule's actions keyed by their stringified index. Rules of other kinds (approval workflows) carry actions of a different shape. */
function getRuleActionEntries(rule: Rule | ExpenseDefaultRule | undefined): Array<[string, ExpenseDefaultAction | ApprovalWorkflowAction]> {
    const actions: Record<string, ExpenseDefaultAction | ApprovalWorkflowAction> | undefined = rule?.actions;
    return Object.entries(actions ?? {});
}

/** Lists a rule's actions. See `getRuleActionEntries`. */
function getRuleActions(rule: Rule | ExpenseDefaultRule | undefined): Array<ExpenseDefaultAction | ApprovalWorkflowAction> {
    const actions: Record<string, ExpenseDefaultAction | ApprovalWorkflowAction> | undefined = rule?.actions;
    return fromIndexMap(actions);
}

/** `GetRules` returns every rule the user can see, so callers have to narrow the collection to one policy themselves. */
function isPolicyScopedRule(rule: Rule | undefined, policyID: string | undefined): boolean {
    return !!rule && !!policyID && rule.scope === CONST.RULES.SCOPE.POLICY && rule.scopeID === policyID;
}

/**
 * Returns the policy's expense default rules, with each rule's ID parsed out of its Onyx key.
 *
 * A rule deleted offline sticks around until the request goes through. `shouldExcludeRulesPendingDelete` leaves
 * those out, for callers that would otherwise keep offering a deleted rule.
 */
function getPolicyExpenseDefaultRules(rulesCollection: OnyxCollection<Rule> | undefined, policyID: string | undefined, shouldExcludeRulesPendingDelete = false): RuleWithID[] {
    if (!policyID) {
        return [];
    }

    const rules: RuleWithID[] = [];

    for (const [onyxKey, rule] of Object.entries(rulesCollection ?? {})) {
        if (!rule || !isPolicyScopedRule(rule, policyID) || !isExpenseDefaultRule(rule)) {
            continue;
        }
        if (shouldExcludeRulesPendingDelete && rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        rules.push({ruleID: onyxKey.slice(ONYXKEYS.COLLECTION.RULE.length), rule});
    }

    return rules;
}

/** Builds the `tax` action value, which carries the rate's name and value alongside its external ID for display. */
function buildTaxActionValue(taxKey: string | undefined, policy: Policy | undefined): ExpenseDefaultTaxValue | undefined {
    if (!taxKey) {
        return undefined;
    }

    const tax = policy?.taxRates?.taxes?.[taxKey];

    return {
        // field_id_TAX is the name the rules engine gives this key, so it can't follow our casing convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        field_id_TAX: {
            externalID: taxKey,
            ...(tax ? {value: tax.value, name: tax.name} : {}),
        },
    };
}

/**
 * Builds the `amount` action value.
 *
 * The rules engine stores an expense amount negated, so $30.00 is saved as -3000. The form holds what the admin
 * typed, and the sign is applied here so only one place knows the convention.
 */
function buildAmountActionValue(amount: string | undefined): number | undefined {
    const amountInCents = Number(amount);
    if (!amount || !Number.isFinite(amountInCents) || amountInCents === 0) {
        return undefined;
    }

    return -Math.abs(amountInCents);
}

/** A merchant rule as this editor builds it, which is the stored shape minus the fields the server fills in. */
type BuiltExpenseDefaultRule = Omit<ExpenseDefaultRule, 'filters'> & {
    /** The conditions the expense has to meet, ANDed together. */
    filters: RuleFilterNode;
};

/** Drops the blanks a multi-select leaves behind, so an emptied picker reads as no condition at all. */
function getNonEmptyValues(values: string[] | undefined): string[] {
    return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

/**
 * Builds the filter tree for a merchant rule, ANDing every condition the form set.
 *
 * The tree is left nested, so three conditions become `and(and(a, b), c)`. Each node only takes two children,
 * and nesting to the left keeps the order the form reads them back in.
 */
function buildExpenseDefaultFilters(formValues: Partial<ExpenseDefaultFormValues>): RuleFilterNode | undefined {
    const comparisons: RuleFilterComparison[] = [];

    const merchantToMatch = formValues.merchantToMatch?.trim();
    if (merchantToMatch) {
        comparisons.push({left: CONDITION.MERCHANT, operator: formValues.matchType ?? CONTAINS, right: merchantToMatch});
    }

    const categoriesToMatch = getNonEmptyValues(formValues.categoriesToMatch);
    if (categoriesToMatch.length > 0) {
        comparisons.push({left: CONDITION.CATEGORY, operator: EQUAL_TO, right: categoriesToMatch});
    }

    const tagsToMatch = getNonEmptyValues(formValues.tagsToMatch);
    if (tagsToMatch.length > 0) {
        comparisons.push({left: CONDITION.TAG, operator: EQUAL_TO, right: tagsToMatch});
    }

    const [firstComparison, ...rest] = comparisons;
    if (!firstComparison) {
        return undefined;
    }

    return rest.reduce<RuleFilterNode>((left, right) => ({operator: AND, left, right}), firstComparison);
}

/** Whether the form matches on anything. A rule with no conditions would apply to every expense, and the API rejects it. */
function hasExpenseDefaultConditions(formValues: Partial<ExpenseDefaultFormValues>): boolean {
    return !!buildExpenseDefaultFilters(formValues);
}

/** Compares two multi-select conditions, which are ORed lists rather than ordered ones. */
function haveSameConditionValues(first: string[] | undefined, second: string[] | undefined): boolean {
    const sortedFirst = getNonEmptyValues(first).sort();
    const sortedSecond = getNonEmptyValues(second).sort();

    return sortedFirst.length === sortedSecond.length && sortedFirst.every((value, index) => value === sortedSecond.at(index));
}

/** Whether two rules match on the same expenses, which is what makes one a duplicate of the other. */
function haveSameConditions(first: Partial<ExpenseDefaultFormValues>, second: Partial<ExpenseDefaultFormValues>): boolean {
    const firstMerchant = first.merchantToMatch?.trim().toLowerCase() ?? '';
    const secondMerchant = second.merchantToMatch?.trim().toLowerCase() ?? '';

    if (firstMerchant !== secondMerchant) {
        return false;
    }

    // The match type only tells two rules apart when they both match on a merchant.
    if (firstMerchant && (first.matchType ?? CONTAINS) !== (second.matchType ?? CONTAINS)) {
        return false;
    }

    return haveSameConditionValues(first.categoriesToMatch, second.categoriesToMatch) && haveSameConditionValues(first.tagsToMatch, second.tagsToMatch);
}

/** Builds the `Set` actions for a merchant rule, keyed by a stringified index in a fixed field order. */
function buildExpenseDefaultActions(formValues: Partial<ExpenseDefaultFormValues>, policy: Policy | undefined): ExpenseDefaultActions {
    const comment = emptyToUndefined(formValues.comment);
    const valuesByField: Partial<Record<ExpenseDefaultActionField, ExpenseDefaultAction['value'] | undefined>> = {
        [FIELD.MERCHANT]: emptyToUndefined(formValues.merchant),
        [FIELD.CATEGORY]: emptyToUndefined(formValues.category),
        [FIELD.TAG]: emptyToUndefined(formValues.tag),
        [FIELD.TAX]: buildTaxActionValue(formValues.tax, policy),
        [FIELD.AMOUNT]: buildAmountActionValue(formValues.amount),
        [FIELD.VENDOR_ID]: emptyToUndefined(formValues.vendorID),
        [FIELD.COMMENT]: comment ? Parser.replace(comment) : undefined,
        [FIELD.REIMBURSABLE]: formValues.reimbursable,
        [FIELD.BILLABLE]: formValues.billable,
    };

    const actions: ExpenseDefaultAction[] = [];

    for (const field of ACTION_FIELD_ORDER) {
        const value = valuesByField[field];
        if (value === undefined) {
            continue;
        }
        actions.push({name: ACTION.SET, field, value});
    }

    return toIndexMap(actions);
}

/**
 * Builds the rules engine body for a merchant rule. It is what the `rules_` collection stores and what is sent
 * as the `value` param of `SetRule`.
 * Returns undefined when the form has nothing to match on or nothing to set, which the API rejects.
 */
function buildExpenseDefaultRule(formValues: Partial<ExpenseDefaultFormValues>, policy: Policy | undefined, existingTriggers?: Rule['triggers']): BuiltExpenseDefaultRule | undefined {
    const filters = buildExpenseDefaultFilters(formValues);
    const actions = buildExpenseDefaultActions(formValues, policy);

    if (!filters || Object.keys(actions).length === 0) {
        return undefined;
    }

    // The form has no input for which events a rule fires on, so an edit hands back the triggers the rule already
    // carries rather than rebuilding them and dropping any the editor does not offer.
    const triggers: ExpenseDefaultTriggers = getEditableTriggers(existingTriggers) ?? toIndexMap([TRIGGER.CREATE_TRANSACTION, TRIGGER.UPDATE_TRANSACTION]);

    return {triggers, filters, actions};
}

/** A tax action value is the only non-primitive value a `Set` action can carry. */
function isExpenseDefaultTaxValue(value: unknown): value is ExpenseDefaultTaxValue {
    if (!value || typeof value !== 'object' || !('field_id_TAX' in value)) {
        return false;
    }

    const taxField: unknown = value.field_id_TAX;
    return !!taxField && typeof taxField === 'object' && 'externalID' in taxField && typeof taxField.externalID === 'string';
}

function isExpenseDefaultTrigger(trigger: string): trigger is ExpenseDefaultTrigger {
    return trigger === TRIGGER.CREATE_TRANSACTION || trigger === TRIGGER.UPDATE_TRANSACTION;
}

/**
 * The rule's triggers when the editor knows every one of them, otherwise undefined.
 *
 * The form has no trigger input, so it can only save a rule whose triggers it is able to hand back untouched.
 */
function getEditableTriggers(triggers: Rule['triggers'] | undefined): ExpenseDefaultTriggers | undefined {
    const triggerValues = fromIndexMap(triggers);
    const editableTriggers = triggerValues.filter(isExpenseDefaultTrigger);
    if (editableTriggers.length === 0 || editableTriggers.length !== triggerValues.length) {
        return undefined;
    }
    return toIndexMap(editableTriggers);
}

/** The conditions the editor renders, read back off a rule's filter tree. */
type EditableConditions = Pick<ExpenseDefaultFormValues, 'matchType' | 'merchantToMatch' | 'categoriesToMatch' | 'tagsToMatch'>;

/**
 * Reads one leaf comparison into the conditions it sets.
 *
 * Returns undefined when the form can't represent the leaf, which makes the whole rule read-only.
 */
function getConditionFromLeaf(leaf: RuleFilterComparison): EditableConditions | undefined {
    // The backend ORs a list of values together, and stores a single value unwrapped.
    const values: string[] = [];
    for (const value of [leaf.right].flat()) {
        if (typeof value !== 'string' || !value) {
            return undefined;
        }
        values.push(value);
    }

    if (values.length === 0) {
        return undefined;
    }

    if (leaf.left === CONDITION.MERCHANT) {
        const merchantToMatch = values.at(0);
        // The form has a single merchant input, so only one value round-trips.
        if (values.length !== 1 || !merchantToMatch || !SUPPORTED_MERCHANT_MATCH_TYPES.has(leaf.operator)) {
            return undefined;
        }
        return {merchantToMatch, matchType: leaf.operator};
    }

    if (leaf.operator !== EQUAL_TO) {
        return undefined;
    }

    if (leaf.left === CONDITION.CATEGORY) {
        return {categoriesToMatch: values};
    }

    if (leaf.left === CONDITION.TAG) {
        return {tagsToMatch: values};
    }

    return undefined;
}

/** The conditions the editor can show for a rule, or undefined when its filter tree can't be represented. */
function getEditableConditions(filters: RuleFilterNode | undefined): EditableConditions | undefined {
    // Rules arrive from the server, so a node can be malformed even though the type says otherwise.
    if (!filters || !isRuleFilterNode(filters)) {
        return undefined;
    }

    if (isRuleFilterComparison(filters)) {
        return getConditionFromLeaf(filters);
    }

    // The form lists conditions that all have to match, so only an `and` tree round-trips.
    if (filters.operator !== AND) {
        return undefined;
    }

    const left = getEditableConditions(filters.left);
    const right = getEditableConditions(filters.right);
    if (!left || !right) {
        return undefined;
    }

    // The form has one input per field, so a field matched on twice would lose a condition on save.
    if (Object.keys(left).some((field) => field in right)) {
        return undefined;
    }

    return {...left, ...right};
}

/**
 * Converts a stored rule back into the values the merchant rule editor renders.
 *
 * Returns undefined when the rule can't be represented by the form, such as a nested filter tree, a filter on a
 * field the form has no input for, an unknown trigger or action, or two actions writing the same field.
 * Callers MUST treat undefined as "show this rule read-only": rendering a partial form and saving it back
 * would silently drop everything the form couldn't represent.
 */
function getExpenseDefaultFormValues(rule: Rule | ExpenseDefaultRule | undefined): ExpenseDefaultFormValues | undefined {
    // Every trigger has to be one the editor knows about, otherwise saving the form would drop the rest.
    if (!rule || !getEditableTriggers(rule.triggers)) {
        return undefined;
    }

    const conditions = getEditableConditions(rule.filters);
    if (!conditions) {
        return undefined;
    }

    const formValues: ExpenseDefaultFormValues = {...conditions};

    const actions = getRuleActions(rule);
    if (actions.length === 0) {
        return undefined;
    }

    const seenFields = new Set<ExpenseDefaultActionField>();

    for (const action of actions) {
        // An action the form can't produce - a non-`Set` action, an unknown field, or a second action on a
        // field the form has a single input for - means saving the form would drop it.
        if (!action || action.name !== ACTION.SET || !('field' in action) || !('value' in action) || seenFields.has(action.field)) {
            return undefined;
        }
        seenFields.add(action.field);

        const {field, value} = action;

        if (isStringActionField(field)) {
            if (typeof value !== 'string') {
                return undefined;
            }
            // Descriptions are stored as HTML and edited as markdown. Every other string field is stored as typed.
            formValues[STRING_ACTION_FIELD_TO_FORM_KEY[field]] = field === FIELD.COMMENT ? Parser.htmlToMarkdown(value) : value;
            continue;
        }

        if (isBooleanActionField(field)) {
            if (typeof value !== 'boolean') {
                return undefined;
            }
            formValues[BOOLEAN_ACTION_FIELD_TO_FORM_KEY[field]] = value;
            continue;
        }

        if (field === FIELD.AMOUNT) {
            // A rule setting a credit rather than an expense has no input in the form, so it stays read-only.
            if (typeof value !== 'number' || value >= 0) {
                return undefined;
            }
            formValues.amount = String(Math.abs(value));
            continue;
        }

        if (field === FIELD.TAX) {
            if (!isExpenseDefaultTaxValue(value)) {
                return undefined;
            }
            formValues.tax = value.field_id_TAX.externalID;
            continue;
        }

        return undefined;
    }

    return formValues;
}

/** A merchant a rule matches on, with the way it matches, since a rule can match a merchant exactly or by substring. */
type MerchantCondition = {
    /** The merchant text the rule matches against */
    value: string;

    /** Whether the merchant has to match in full rather than only contain the text */
    isExactMatch: boolean;
};

/** The values a rule matches on, grouped by field. */
type ExpenseDefaultConditionSummary = {
    /** The merchants the rule matches on */
    merchants: MerchantCondition[];

    /** The categories the rule matches on, as they are stored on the policy */
    categories: string[];

    /** The tags the rule matches on, as they are stored on the policy */
    tags: string[];
};

/**
 * Groups a rule's conditions by field, for the rules table's condition text and its search tokens.
 *
 * Derived from the filter tree rather than from `getExpenseDefaultFormValues`, so a rule the editor can't
 * represent still shows what it matches and can still be found by it while staying read-only.
 */
function getExpenseDefaultConditionSummary(filters: RuleFilterNode | undefined): ExpenseDefaultConditionSummary {
    const summary: ExpenseDefaultConditionSummary = {merchants: [], categories: [], tags: []};

    for (const leaf of getRuleFilterLeaves(filters)) {
        const values = [leaf.right].flat().filter((value): value is string => typeof value === 'string');

        if (leaf.left === CONDITION.MERCHANT) {
            summary.merchants.push(...values.map((value) => ({value, isExactMatch: leaf.operator === EQUAL_TO})));
        } else if (leaf.left === CONDITION.CATEGORY) {
            summary.categories.push(...values);
        } else if (leaf.left === CONDITION.TAG) {
            summary.tags.push(...values);
        }
    }

    return summary;
}

/** A rule that matches on a category, paired with the conditions the match was read from. */
type CategoryRuleMatch = {
    /** The matching rule and its ID */
    match: RuleWithID;

    /** The rule's conditions, carried so a caller narrowing the matches does not rebuild the summary */
    conditions: ExpenseDefaultConditionSummary;
};

/** Whether a match is one the category decides on its own, rather than together with a merchant or a tag. */
function isCategoryOnlyMatch({conditions}: CategoryRuleMatch): boolean {
    return conditions.merchants.length === 0 && conditions.tags.length === 0 && conditions.categories.length === 1;
}

/** Every expense default the policy has that matches on the given category. */
function getCategoryExpenseDefaultMatches(rulesCollection: OnyxCollection<Rule> | undefined, policyID: string | undefined, categoryName: string | undefined): CategoryRuleMatch[] {
    if (!categoryName) {
        return [];
    }

    const matches: CategoryRuleMatch[] = [];
    for (const match of getPolicyExpenseDefaultRules(rulesCollection, policyID, true)) {
        const conditions = getExpenseDefaultConditionSummary(match.rule.filters);
        if (conditions.categories.includes(categoryName)) {
            matches.push({match, conditions});
        }
    }

    return matches;
}

/**
 * The rules a category decides on its own, which are the ones category settings lists.
 *
 * A rule that also matches on a merchant or a tag belongs to that merchant or tag as much as to the category, so
 * it is left to the Rules page, which files it with them.
 */
function getCategoryOwnExpenseDefaultRules(rulesCollection: OnyxCollection<Rule> | undefined, policyID: string | undefined, categoryName: string | undefined): RuleWithID[] {
    return getCategoryExpenseDefaultMatches(rulesCollection, policyID, categoryName)
        .filter(isCategoryOnlyMatch)
        .map(({match}) => match);
}

/** The first rule a category decides on its own, which is the one a further rule for that category would duplicate. */
function getCategoryOwnExpenseDefaultRule(rulesCollection: OnyxCollection<Rule> | undefined, policyID: string | undefined, categoryName: string | undefined): RuleWithID | undefined {
    return getCategoryOwnExpenseDefaultRules(rulesCollection, policyID, categoryName).at(0);
}

/** The tax rate a rule applies, if it sets one. */
function getExpenseDefaultTaxID(rule: Rule | ExpenseDefaultRule | undefined): string | undefined {
    for (const action of getRuleActions(rule)) {
        if (action?.name === ACTION.SET && 'field' in action && action.field === FIELD.TAX && isExpenseDefaultTaxValue(action.value)) {
            return action.value.field_id_TAX.externalID;
        }
    }

    return undefined;
}

/** A single field a rule sets, normalized for display. */
type ExpenseDefaultRuleSummaryField = {
    /** The expense field being set */
    field: ExpenseDefaultActionField;

    /** The value the field is set to. `comment` is converted back to markdown; `tax` keeps its object shape */
    value: ExpenseDefaultAction['value'];
};

/**
 * Lists the fields a rule sets, in action-key order. Works for any rule, including ones the editor
 * can't open, so the rules list can summarize them without going through the form.
 */
function getExpenseDefaultRuleSummaryFields(rule: Rule | ExpenseDefaultRule | undefined): ExpenseDefaultRuleSummaryField[] {
    // Keys are stringified indexes, so "10" has to sort after "2" rather than before it.
    const sortedEntries = getRuleActionEntries(rule).sort(([leftKey], [rightKey]) => Number(leftKey) - Number(rightKey));

    const summaryFields: ExpenseDefaultRuleSummaryField[] = [];

    for (const [, action] of sortedEntries) {
        if (!action || action.name !== ACTION.SET || !('field' in action) || !('value' in action)) {
            continue;
        }
        summaryFields.push({
            field: action.field,
            value: action.field === FIELD.COMMENT && typeof action.value === 'string' ? Parser.htmlToMarkdown(action.value) : action.value,
        });
    }

    // Read back in the same field order the editor writes, not the order the actions happen to be indexed in.
    // The backend reindexes the actions it stores, so ordering the summary by index reshuffles the text once a
    // save comes back.
    return summaryFields.sort((first, second) => ACTION_FIELD_ORDER.indexOf(first.field) - ACTION_FIELD_ORDER.indexOf(second.field));
}

/**
 * Builds copies of a policy's expense default rules for another policy, as `ruleID -> rule`.
 *
 * Rules live in their own collection and carry the ID of the policy they belong to, so copying a workspace
 * can't reuse the source's rules: each copy is a new rule, with a new ID, scoped to the target policy.
 */
function buildCopiedExpenseDefaultRules(rules: OnyxCollection<Rule> | undefined, sourcePolicyID: string | undefined, targetPolicyID: string): Record<string, Rule> {
    const copiedRules: Record<string, Rule> = {};
    const created = new Date().toISOString();

    for (const {rule} of getPolicyExpenseDefaultRules(rules, sourcePolicyID)) {
        if (rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }

        copiedRules[rand64()] = {
            triggers: rule.triggers,
            filters: rule.filters,
            actions: rule.actions,
            scope: CONST.RULES.SCOPE.POLICY,
            scopeID: targetPolicyID,
            priority: rule.priority ?? CONST.RULES.EXPENSE_DEFAULT.PRIORITY,
            created,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
    }

    return copiedRules;
}

/** How many expense default rules the policy has, ignoring ones being deleted. Used by the copy/duplicate feature lists. */
function getExpenseDefaultRuleCount(rules: OnyxCollection<Rule> | undefined, policyID: string | undefined): number {
    return getPolicyExpenseDefaultRules(rules, policyID).filter(({rule}) => rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
}

/** Whether any of the policy's expense default rules failed to save. */
function hasExpenseDefaultRuleErrors(rules: OnyxCollection<Rule> | undefined, policyID: string | undefined): boolean {
    return getPolicyExpenseDefaultRules(rules, policyID).some(({rule}) => Object.keys(rule.errors ?? {}).length > 0);
}

/** Whether the merchant rule editor can safely open this rule. See `getExpenseDefaultFormValues`. */
function isEditableExpenseDefaultRule(rule: Rule | ExpenseDefaultRule | undefined): boolean {
    return !!getExpenseDefaultFormValues(rule);
}

/**
 * Whether the merchant rule editor is allowed to open this rule for the given policy.
 *
 * The `rules_` collection holds every kind of rule for every workspace the user can see, so a ruleID from a
 * stale link or a bookmark can resolve to another policy's rule or to an approval workflow. Saving from the
 * editor writes a freshly built merchant rule over that same ruleID, so anything it can't represent has to be
 * refused rather than opened. A rule the form can edit is already an expense default rule, because the form only
 * accepts `CreateTransaction` and `UpdateTransaction` triggers and `Set` actions.
 */
function canEditExpenseDefaultRule(rule: Rule | undefined, policyID: string | undefined): boolean {
    return isPolicyScopedRule(rule, policyID) && isEditableExpenseDefaultRule(rule);
}

export type {ExpenseDefaultFormValues, ExpenseDefaultRuleSummaryField};
export {
    buildCopiedExpenseDefaultRules,
    buildExpenseDefaultFilters,
    buildExpenseDefaultRule,
    canEditExpenseDefaultRule,
    getExpenseDefaultTaxID,
    getCategoryOwnExpenseDefaultRule,
    getCategoryOwnExpenseDefaultRules,
    getExpenseDefaultConditionSummary,
    getExpenseDefaultRuleCount,
    getExpenseDefaultRuleSummaryFields,
    getExpenseDefaultFormValues,
    getPolicyExpenseDefaultRules,
    hasExpenseDefaultConditions,
    hasExpenseDefaultRuleErrors,
    haveSameConditions,
    isEditableExpenseDefaultRule,
    isExpenseDefaultTaxValue,
};
