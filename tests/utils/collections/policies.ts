import {toIndexMap} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Rule} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {rand, randAvatar, randBoolean, randCurrencyCode, randEmail, randPastDate, randWord} from '@ngneat/falso';

export default function createRandomPolicy(index: number, type?: ValueOf<typeof CONST.POLICY.TYPE>, name?: string): Policy {
    return {
        id: index.toString(),
        name: name ?? randWord(),
        // Exclude the Submit (submit2026) plan from the random default: it has distinct, plan-specific behavior
        // (e.g. forced Editor role, locked role changes), so tests that exercise it pass the type explicitly.
        type: type ?? rand(Object.values(CONST.POLICY.TYPE).filter((policyType) => policyType !== CONST.POLICY.TYPE.SUBMIT)),
        autoReporting: randBoolean(),
        autoReportingFrequency: rand(
            Object.values(CONST.POLICY.AUTO_REPORTING_FREQUENCIES).filter(
                (frequency): frequency is Exclude<ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>, typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL> =>
                    frequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL,
            ),
        ),
        harvesting: {
            enabled: randBoolean(),
        },
        autoReportingOffset: 1,
        preventSelfApproval: randBoolean(),
        outputCurrency: randCurrencyCode(),
        role: rand(Object.values(CONST.POLICY.ROLE).filter((role) => role !== CONST.POLICY.ROLE.APPROVE_ONLY)),
        owner: randEmail(),
        ownerAccountID: index,
        avatarURL: randAvatar(),
        isFromFullPolicy: randBoolean(),
        lastModified: randPastDate().toISOString(),
        // Exclude DELETE from the random default: a policy pending deletion blocks report state transitions.
        pendingAction: rand(Object.values(CONST.RED_BRICK_ROAD_PENDING_ACTION).filter((action) => action !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)),
        errors: {},
        customUnits: {},
        errorFields: {},
        approvalMode: rand(Object.values(CONST.POLICY.APPROVAL_MODE)),
    };
}

/**
 * A `rules_` collection holding one expense default that matches on the given category and sets a tax, which is
 * where category tax defaults live now that they no longer sit in `policy.rules.expenseRules`.
 *
 * Passing a merchant narrows the rule to that merchant as well, which is what a rule the category tax lookup has
 * to skip looks like.
 */
function createCategoryTaxRulesCollection(policyID: string, category: string, taxCode: string, merchant?: string): OnyxCollection<Rule> {
    const categoryFilter = {left: CONST.RULES.EXPENSE_DEFAULT.FIELD.CATEGORY, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: category};

    return {
        [`${ONYXKEYS.COLLECTION.RULE}categoryTaxRule`]: {
            scope: CONST.RULES.SCOPE.POLICY,
            scopeID: policyID,
            triggers: toIndexMap([CONST.RULES.TRIGGERS.CREATE_TRANSACTION]),
            filters: merchant
                ? {
                      left: categoryFilter,
                      operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                      right: {left: CONST.RULES.EXPENSE_DEFAULT.FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: merchant},
                  }
                : categoryFilter,
            actions: toIndexMap([
                {
                    name: CONST.RULES.ACTIONS.SET,
                    field: CONST.RULES.EXPENSE_DEFAULT.FIELD.TAX,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    value: {field_id_TAX: {externalID: taxCode}},
                },
            ]),
        },
    };
}

export {createCategoryTaxRulesCollection};
