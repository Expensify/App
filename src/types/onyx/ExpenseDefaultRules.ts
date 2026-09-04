import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {RuleFilterNode} from './RuleFilters';

/**
 * A transaction lifecycle event that can fire an expense-default rule (currently only `CreateTransaction`).
 */
type ExpenseDefaultTrigger = ValueOf<typeof CONST.RULES.EXPENSE_DEFAULT.TRIGGER>;

/**
 * The triggers of a rule, keyed by a string index (e.g. `{"0": "CreateTransaction"}`). A rule fires when
 * any of its triggers matches the transaction event.
 */
type ExpenseDefaultTriggers = Record<string, ExpenseDefaultTrigger>;

/**
 * The name of the action a rule performs when it matches (currently only `Set`).
 */
type ExpenseDefaultActionName = ValueOf<typeof CONST.RULES.EXPENSE_DEFAULT.ACTION>;

/**
 * The expense field a `Set` action writes to.
 */
type ExpenseDefaultActionField = ValueOf<typeof CONST.RULES.EXPENSE_DEFAULT.FIELD>;

/**
 * The value of a `tax` action, wrapping the tax rate in the backend API format.
 */
type ExpenseDefaultTaxValue = {
    /** Object wrapping the tax field - field_id_TAX matches the backend API format */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    field_id_TAX: {
        /** The external ID of the tax rate */
        externalID: string;

        /** The tax rate value (e.g. "8.5%") */
        value?: string;

        /** The name of the tax rate */
        name?: string;
    };
};

/**
 * The value a `Set` action writes. Which of these is valid depends on the action's `field`.
 */
type ExpenseDefaultActionValue = string | boolean | ExpenseDefaultTaxValue;

/**
 * A single change applied to expenses that match the rule's filters.
 */
type ExpenseDefaultAction = {
    /** What the rule does when it matches. */
    name: ExpenseDefaultActionName;

    /** The expense field the action writes to. */
    field: ExpenseDefaultActionField;

    /** The value written to `field`. */
    value: ExpenseDefaultActionValue;
};

/**
 * The actions of a rule, keyed by a string index (e.g. `{"0": {"name": "Set", "field": "category", "value": "Travel"}}`).
 */
type ExpenseDefaultActions = Record<string, ExpenseDefaultAction>;

/**
 * The body of a single expense-default rule (what merchant rules are stored as). When a transaction event
 * matches one of the `triggers` and the `filters` match the transaction, the rule's `actions` are applied.
 */
type ExpenseDefaultRule = {
    /** Transaction lifecycle events that fire this rule. */
    triggers: ExpenseDefaultTriggers;

    /** Conditions that must match the transaction for the rule to fire. */
    filters: RuleFilterNode;

    /** What gets applied to matching expenses. */
    actions: ExpenseDefaultActions;
};

export type {ExpenseDefaultAction, ExpenseDefaultActionField, ExpenseDefaultActions, ExpenseDefaultRule, ExpenseDefaultTaxValue, ExpenseDefaultTriggers};
