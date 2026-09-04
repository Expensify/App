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

const {FIELD, TRIGGER, ACTION} = CONST.RULES.EXPENSE_DEFAULT;
const {EQUAL_TO, CONTAINS} = CONST.SEARCH.SYNTAX_OPERATORS;

/** The order actions are written in, which fixes the numeric keys a built rule uses. */
const ACTION_FIELD_ORDER = [FIELD.MERCHANT, FIELD.CATEGORY, FIELD.TAG, FIELD.TAX, FIELD.VENDOR_ID, FIELD.COMMENT, FIELD.REIMBURSABLE, FIELD.BILLABLE] as const;

/** Merchant match types the editor can represent. Any other operator on the merchant node makes a rule read-only. */
const SUPPORTED_MERCHANT_MATCH_TYPES = new Set<ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>>([EQUAL_TO, CONTAINS]);

const STRING_ACTION_FIELDS = new Set<ExpenseDefaultActionField>([FIELD.MERCHANT, FIELD.CATEGORY, FIELD.TAG, FIELD.VENDOR_ID, FIELD.COMMENT]);
const BOOLEAN_ACTION_FIELDS = new Set<ExpenseDefaultActionField>([FIELD.REIMBURSABLE, FIELD.BILLABLE]);

/** The rules engine keys `triggers` and `actions` by a stringified index rather than storing them as arrays. */
function toIndexMap<T>(values: T[]): Record<string, T> {
    return Object.fromEntries(values.map((value, index) => [String(index), value]));
}

/** The rule format has no notion of an empty value: a field the admin cleared is simply not set. */
function emptyToUndefined(value: string | undefined): string | undefined {
    return value?.trim() ? value : undefined;
}

/** Lists a rule's actions keyed by their stringified index. Rules of other kinds (approval workflows) carry actions of a different shape. */
function getRuleActionEntries(rule: Rule | ExpenseDefaultRule | undefined): Array<[string, ExpenseDefaultAction | ApprovalWorkflowAction]> {
    if (!rule?.actions) {
        return [];
    }
    const actions: Record<string, ExpenseDefaultAction | ApprovalWorkflowAction> = rule.actions;
    return Object.entries(actions);
}

/** Lists a rule's actions. See `getRuleActionEntries`. */
function getRuleActions(rule: Rule | ExpenseDefaultRule | undefined): Array<ExpenseDefaultAction | ApprovalWorkflowAction> {
    return getRuleActionEntries(rule).map(([, action]) => action);
}

function isRuleFilterNode(value: unknown): value is RuleFilterNode {
    return !!value && typeof value === 'object' && 'left' in value && 'operator' in value && 'right' in value;
}

/** A leaf node compares a single field: its `left` is a field name rather than another node. */
function isRuleFilterComparison(node: RuleFilterNode): node is RuleFilterComparison {
    return typeof node.left === 'string';
}

/**
 * A rule is an expense default rule when it runs on transaction creation and changes at least one field.
 * This is what decides whether a rule shows up in the workspace's expense defaults list.
 */
function isExpenseDefaultRule(rule: Rule | undefined): rule is Rule & ExpenseDefaultRule {
    if (!rule) {
        return false;
    }

    const hasCreateTransactionTrigger = Object.values(rule.triggers ?? {}).some((trigger) => trigger === TRIGGER.CREATE_TRANSACTION);
    const hasSetAction = getRuleActions(rule).some((action) => action?.name === ACTION.SET);

    return hasCreateTransactionTrigger && hasSetAction;
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        field_id_TAX: {
            externalID: taxKey,
            ...(tax ? {value: tax.value, name: tax.name} : {}),
        },
    };
}

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
 * Builds the rule body sent as the `value` param of `SetRule`.
 * Returns undefined when the form has nothing to match on or nothing to set, which the API rejects.
 */
function buildMerchantRule(formValues: Partial<MerchantRuleFormValues>, policy: Policy | undefined): ExpenseDefaultRule | undefined {
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
    const triggerValues = Object.values(triggers ?? {});
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

    // The backend ORs a list of values together; the form only has one merchant input, so only a single value round-trips.
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
 * Returns undefined when the rule can't be represented by the form — a nested filter tree, a filter on a
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

        if (STRING_ACTION_FIELDS.has(field)) {
            if (typeof value !== 'string') {
                return undefined;
            }
            if (field === FIELD.COMMENT) {
                formValues.comment = Parser.htmlToMarkdown(value);
            } else if (field === FIELD.MERCHANT) {
                formValues.merchant = value;
            } else if (field === FIELD.CATEGORY) {
                formValues.category = value;
            } else if (field === FIELD.TAG) {
                formValues.tag = value;
            } else {
                formValues.vendorID = value;
            }
            continue;
        }

        if (BOOLEAN_ACTION_FIELDS.has(field)) {
            if (typeof value !== 'boolean') {
                return undefined;
            }
            if (field === FIELD.REIMBURSABLE) {
                formValues.reimbursable = value;
            } else {
                formValues.billable = value;
            }
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
 * Flattens a filter tree into its leaf comparisons, left to right. Used to summarize rules the editor
 * can't open, which still have to render a readable condition in the rules list.
 */
function getRuleFilterLeaves(filters: RuleFilterNode | undefined): RuleFilterComparison[] {
    if (!filters || !isRuleFilterNode(filters)) {
        return [];
    }

    if (isRuleFilterComparison(filters)) {
        return [filters];
    }

    return [...getRuleFilterLeaves(filters.left), ...getRuleFilterLeaves(filters.right)];
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

export type {MerchantRuleFormValues, RuleWithID};
export {
    buildCopiedExpenseDefaultRules,
    buildMerchantRule,
    getExpenseDefaultRuleCount,
    getExpenseDefaultRuleSummaryFields,
    getMerchantRuleFormValues,
    getPolicyExpenseDefaultRules,
    getRuleFilterLeaves,
    hasExpenseDefaultRuleErrors,
    isEditableMerchantRule,
    isExpenseDefaultRule,
    isExpenseDefaultTaxValue,
};
