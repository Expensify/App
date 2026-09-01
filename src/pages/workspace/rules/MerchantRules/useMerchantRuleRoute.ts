import useDynamicBackPath from '@hooks/useDynamicBackPath';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';

// The merchant rule screens that hang off an expense. Membership is checked directly rather than through
// `isDynamicRouteScreen` so this stays a plain string lookup, and so only this flow's screens can match.
const SCREENS_FROM_EXPENSE = new Set<string>([
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_NEW,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_MERCHANT_TO_MATCH,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_MATCH_TYPE,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_MERCHANT,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_CATEGORY,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_TAG,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_TAX,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_VENDOR,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_DESCRIPTION,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_REIMBURSABLE,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_BILLABLE,
    SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_PREVIEW_MATCHES,
]);

type MerchantRuleRoute = {
    /** Whether these pages were entered from the "Create a rule" callout on an expense rather than workspace settings */
    isCreatedFromExpense: boolean;

    /** Whether an existing rule is being edited. The callout only ever creates, so it is never editing. */
    isEditing: boolean;

    /** Where this page's back button and its save handler should return to */
    backToRoute: Route;

    /**
     * Builds a route to another page of this flow, keeping it in whichever stack the flow was entered from.
     *
     * @param dynamicSuffixWithParams - the target's dynamic path, with its params filled in
     * @param staticRoute - the target's workspace settings route
     */
    getRuleRoute: (dynamicSuffixWithParams: string, staticRoute: Route) => Route;
};

/**
 * Routing for the merchant rule pages, which are reachable both from workspace settings and from the "Create a rule"
 * callout on an expense.
 *
 * The callout enters through dynamic routes, whose paths are suffixes appended to the expense the user came from, so
 * the expense stays underneath the modal. Those pages therefore cannot hardcode the workspace paths: going back means
 * dropping their own suffix, and going on means appending the next one.
 *
 * @param dynamicSuffix - this page's own dynamic route path, dropped from the URL to go back
 * @param policyID - the workspace the rule belongs to
 * @param ruleID - the rule being edited, absent when creating one
 */
function useMerchantRuleRoute(dynamicSuffix: DynamicRouteSuffix, policyID: string, ruleID?: string): MerchantRuleRoute {
    const route = useRoute();
    const isCreatedFromExpense = SCREENS_FROM_EXPENSE.has(route.name);
    // Only a rule reached through workspace settings can be an edit. `ruleID` is absent on the dynamic routes, and
    // `undefined !== 'new'` would otherwise read as editing.
    const isEditing = !isCreatedFromExpense && !!ruleID && ruleID !== ROUTES.NEW;
    const dynamicBackToRoute = useDynamicBackPath(dynamicSuffix);
    const staticBackToRoute = isEditing && ruleID ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const getRuleRoute = (dynamicSuffixWithParams: string, staticRoute: Route) => (isCreatedFromExpense ? createDynamicRoute(dynamicSuffixWithParams) : staticRoute);

    return {
        isCreatedFromExpense,
        isEditing,
        backToRoute: isCreatedFromExpense ? dynamicBackToRoute : staticBackToRoute,
        getRuleRoute,
    };
}

export default useMerchantRuleRoute;
