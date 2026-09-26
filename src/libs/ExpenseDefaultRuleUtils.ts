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
    ExpenseDefaultTriggers,
} from '@src/types/onyx/ExpenseDefaultRules';
import type {RuleFilterComparison, RuleFilterNode} from '@src/types/onyx/RuleFilters';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {rand64} from './NumberUtils';
import Parser from './Parser';
import {fromIndexMap, getRuleFilterLeaves, isExpenseDefaultRule, isRuleFilterComparison, isRuleFilterNode, toIndexMap} from './RuleUtils';

/** The form shape the merchant rule editor round-trips a rule through. */
type MerchantRuleFormValues = {
    /** The merchant string an expense has to match */
    merchantToMatch: string;

    /** Whether the merchant has to match exactly (`eq`) or partially (`contains`) */
    matchType: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;

    /** The merchant the expense is renamed to */
    merchant?: string;

    /** The category set on the expense */
    category?: string;

    /** The tag set on the expense */
    tag?: string;

    /** The external ID of the tax rate set on the expense */
    tax?: string;

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
const {EQUAL_TO, CONTAINS} = CONST.SEARCH.SYNTAX_OPERATORS;

/** The order actions are written in, which fixes the numeric keys a built rule uses. */
const ACTION_FIELD_ORDER = [FIELD.MERCHANT, FIELD.CATEGORY, FIELD.TAG, FIELD.TAX, FIELD.VENDOR_ID, FIELD.COMMENT, FIELD.REIMBURSABLE, FIELD.BILLABLE] as const;

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
} as const satisfies Partial<Record<ExpenseDefaultActionField, keyof MerchantRuleFormValues>>;

/** See `STRING_ACTION_FIELD_TO_FORM_KEY`. */
const BOOLEAN_ACTION_FIELD_TO_FORM_KEY = {
    [FIELD.REIMBURSABLE]: 'reimbursable',
    [FIELD.BILLABLE]: 'billable',
} as const satisfies Partial<Record<ExpenseDefaultActionField, keyof MerchantRuleFormValues>>;

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

/** Returns the policy's expense default rules, with each rule's ID parsed out of its Onyx key. */
function getPolicyExpenseDefaultRules(rulesCollection: OnyxCollection<Rule> | undefined, policyID: string | undefined): RuleWithID[] {
    if (!policyID) {
        return [];
    }

    const rules: RuleWithID[] = [];

    for (const [onyxKey, rule] of Object.entries(rulesCollection ?? {})) {
        if (!rule || !isPolicyScopedRule(rule, policyID) || !isExpenseDefaultRule(rule)) {
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
 * A merchant rule as this editor builds it. Stored rules may carry a whole filter tree, but the editor only ever
 * produces one merchant comparison, so callers converting a freshly built rule can read the filter directly.
 */
type BuiltMerchantRule = Omit<ExpenseDefaultRule, 'filters'> & {
    /** The single `merchant eq|contains <value>` comparison this editor matches on. */
    filters: RuleFilterComparison;
};

/** Builds the filter tree for a merchant rule: a single `merchant eq|contains <value>` comparison. */
function buildMerchantRuleFilters(formValues: Partial<MerchantRuleFormValues>): RuleFilterComparison | undefined {
    const merchantToMatch = formValues.merchantToMatch?.trim();
    if (!merchantToMatch) {
        return undefined;
    }

    return {
        left: FIELD.MERCHANT,
        operator: formValues.matchType ?? CONTAINS,
        right: merchantToMatch,
    };
}

/** Builds the `Set` actions for a merchant rule, keyed by a stringified index in a fixed field order. */
function buildMerchantRuleActions(formValues: Partial<MerchantRuleFormValues>, policy: Policy | undefined): ExpenseDefaultActions {
    const comment = emptyToUndefined(formValues.comment);
    const valuesByField: Partial<Record<ExpenseDefaultActionField, ExpenseDefaultAction['value'] | undefined>> = {
        [FIELD.MERCHANT]: emptyToUndefined(formValues.merchant),
        [FIELD.CATEGORY]: emptyToUndefined(formValues.category),
        [FIELD.TAG]: emptyToUndefined(formValues.tag),
        [FIELD.TAX]: buildTaxActionValue(formValues.tax, policy),
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
 * Builds the rules engine body for a merchant rule. It is what the `rules_` collection stores, and what the
 * legacy `codingRuleValue` is derived from until writes move to `SetRule`.
 * Returns undefined when the form has nothing to match on or nothing to set, which the API rejects.
 */
function buildMerchantRule(formValues: Partial<MerchantRuleFormValues>, policy: Policy | undefined): BuiltMerchantRule | undefined {
    const filters = buildMerchantRuleFilters(formValues);
    const actions = buildMerchantRuleActions(formValues, policy);

    if (!filters || Object.keys(actions).length === 0) {
        return undefined;
    }

    const triggers: ExpenseDefaultTriggers = toIndexMap([TRIGGER.CREATE_TRANSACTION]);

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

/** Every trigger has to be one the editor knows about, otherwise saving the form would drop the rest. */
function areTriggersEditable(triggers: Record<string, string> | undefined): boolean {
    const triggerValues = fromIndexMap(triggers);
    return triggerValues.length > 0 && triggerValues.every((trigger) => trigger === TRIGGER.CREATE_TRANSACTION);
}

/** The editor matches on exactly one merchant condition, so anything else (a tree, another field, a list) can't be shown in the form. */
function getEditableMerchantMatch(filters: RuleFilterNode | undefined): Pick<MerchantRuleFormValues, 'matchType' | 'merchantToMatch'> | undefined {
    if (!filters || !isRuleFilterNode(filters) || !isRuleFilterComparison(filters)) {
        return undefined;
    }

    if (filters.left !== FIELD.MERCHANT || !SUPPORTED_MERCHANT_MATCH_TYPES.has(filters.operator)) {
        return undefined;
    }

    // The backend ORs a list of values together. The form only has one merchant input, so only a single value round-trips.
    const rightValues = [filters.right].flat();
    const merchantToMatch = rightValues.at(0);
    if (rightValues.length !== 1 || typeof merchantToMatch !== 'string' || !merchantToMatch) {
        return undefined;
    }

    return {merchantToMatch, matchType: filters.operator};
}

/**
 * Converts a stored rule back into the values the merchant rule editor renders.
 *
 * Returns undefined when the rule can't be represented by the form, such as a nested filter tree, a filter on a
 * field the form has no input for, an unknown trigger or action, or two actions writing the same field.
 * Callers MUST treat undefined as "show this rule read-only": rendering a partial form and saving it back
 * would silently drop everything the form couldn't represent.
 */
function getMerchantRuleFormValues(rule: Rule | ExpenseDefaultRule | undefined): MerchantRuleFormValues | undefined {
    if (!rule || !areTriggersEditable(rule.triggers)) {
        return undefined;
    }

    const merchantMatch = getEditableMerchantMatch(rule.filters);
    if (!merchantMatch) {
        return undefined;
    }

    const formValues: MerchantRuleFormValues = {...merchantMatch};

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

/**
 * Summarizes the merchants a rule matches on, for the condition text and the search index.
 *
 * Derived from the filter tree rather than from `getMerchantRuleFormValues`, so a rule the editor can't
 * represent still shows what it matches and can still be found by merchant while staying read-only.
 */
function getRuleMerchantMatchSummary(filters: RuleFilterNode | undefined): {merchants: string; isExactMatch: boolean} {
    const merchantLeaves = getRuleFilterLeaves(filters).filter((leaf) => leaf.left === FIELD.MERCHANT);

    return {
        merchants: merchantLeaves.flatMap((leaf) => [leaf.right].flat()).join(', '),
        isExactMatch: merchantLeaves.length > 0 && merchantLeaves.every((leaf) => leaf.operator === EQUAL_TO),
    };
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

    return summaryFields;
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

/** Whether the merchant rule editor can safely open this rule. See `getMerchantRuleFormValues`. */
function isEditableMerchantRule(rule: Rule | ExpenseDefaultRule | undefined): boolean {
    return !!getMerchantRuleFormValues(rule);
}

/**
 * Whether the merchant rule editor is allowed to open this rule for the given policy.
 *
 * The `rules_` collection holds every kind of rule for every workspace the user can see, so a ruleID from a
 * stale link or a bookmark can resolve to another policy's rule or to an approval workflow. Saving from the
 * editor writes a freshly built merchant rule over that same ruleID, so anything it can't represent has to be
 * refused rather than opened. A rule the form can edit is already an expense default rule, because the form only
 * accepts `CreateTransaction` triggers and `Set` actions.
 */
function canEditMerchantRule(rule: Rule | undefined, policyID: string | undefined): boolean {
    return isPolicyScopedRule(rule, policyID) && isEditableMerchantRule(rule);
}

export type {BuiltMerchantRule, MerchantRuleFormValues};
export {
    buildCopiedExpenseDefaultRules,
    buildMerchantRule,
    canEditMerchantRule,
    getExpenseDefaultRuleCount,
    getExpenseDefaultRuleSummaryFields,
    getMerchantRuleFormValues,
    getPolicyExpenseDefaultRules,
    getRuleMerchantMatchSummary,
    hasExpenseDefaultRuleErrors,
    isEditableMerchantRule,
    isExpenseDefaultTaxValue,
};
