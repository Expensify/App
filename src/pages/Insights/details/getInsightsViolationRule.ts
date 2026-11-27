/** Finds the workspace setting behind a violation type, for the Edit rule row of a Top violations item. */
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type InsightsViolationRule =
    | {
          type: typeof CONST.VIOLATIONS.RECEIPT_REQUIRED | typeof CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED | typeof CONST.VIOLATIONS.OVER_LIMIT;
          amount: number;
          currency: string;
          route: Route;
      }
    | {type: typeof CONST.VIOLATIONS.MAX_AGE; days: number; route: Route}
    | {type: typeof CONST.VIOLATIONS.MISSING_CATEGORY; route: Route};

/** Returns the amount a rule flags expenses above, or undefined when the rule is off. */
function getEnabledLimit(limit: number | undefined): number | undefined {
    return limit === undefined || limit === CONST.DISABLED_MAX_EXPENSE_VALUE ? undefined : limit;
}

/** Returns the workspace setting that raises the violation, or undefined when the violation doesn't come from a single setting or the setting is off. */
function getInsightsViolationRule(violation: string, policy: OnyxEntry<Policy>): InsightsViolationRule | undefined {
    if (!policy?.id) {
        return undefined;
    }

    switch (violation) {
        case CONST.VIOLATIONS.RECEIPT_REQUIRED: {
            const amount = getEnabledLimit(policy.maxExpenseAmountNoReceipt);
            return amount === undefined ? undefined : {type: violation, amount, currency: policy.outputCurrency, route: ROUTES.RULES_RECEIPT_REQUIRED_AMOUNT.getRoute(policy.id)};
        }
        case CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED: {
            const amount = getEnabledLimit(policy.maxExpenseAmountNoItemizedReceipt);
            return amount === undefined ? undefined : {type: violation, amount, currency: policy.outputCurrency, route: ROUTES.RULES_ITEMIZED_RECEIPT_REQUIRED_AMOUNT.getRoute(policy.id)};
        }
        case CONST.VIOLATIONS.OVER_LIMIT: {
            const amount = getEnabledLimit(policy.maxExpenseAmount);
            return amount === undefined ? undefined : {type: violation, amount, currency: policy.outputCurrency, route: ROUTES.RULES_MAX_EXPENSE_AMOUNT.getRoute(policy.id)};
        }
        case CONST.VIOLATIONS.MAX_AGE: {
            const days = getEnabledLimit(policy.maxExpenseAge);
            return days === undefined ? undefined : {type: violation, days, route: ROUTES.RULES_MAX_EXPENSE_AGE.getRoute(policy.id)};
        }
        case CONST.VIOLATIONS.MISSING_CATEGORY:
            return policy.requiresCategory ? {type: violation, route: ROUTES.RULES_REQUIRE_FIELDS.getRoute(policy.id)} : undefined;
        default:
            return undefined;
    }
}

export default getInsightsViolationRule;
