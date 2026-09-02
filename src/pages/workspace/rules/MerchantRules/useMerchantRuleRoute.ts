import useDynamicBackPath from '@hooks/useDynamicBackPath';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import isDynamicRouteScreen from '@libs/Navigation/helpers/dynamicRoutesUtils/isDynamicRouteScreen';

import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';

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
 * @param staticBackToRoute - where to return in the workspace settings flow, for the pages that sit deeper than the rule page itself
 */
function useMerchantRuleRoute(dynamicSuffix: DynamicRouteSuffix, policyID: string, ruleID?: string, staticBackToRoute?: Route): MerchantRuleRoute {
    const route = useRoute();
    // Asking the linking config keeps this from drifting: a screen added to the flow is dynamic or it is not, with no
    // list here to forget to update.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- useRoute is untyped here because this hook is shared by every page of the flow, and the repo's other isDynamicRouteScreen callers narrow the same way
    const isCreatedFromExpense = isDynamicRouteScreen(route.name as Screen);
    // Only a rule reached through workspace settings can be an edit. `ruleID` is absent on the dynamic routes, and
    // `undefined !== 'new'` would otherwise read as editing.
    const isEditing = !isCreatedFromExpense && !!ruleID && ruleID !== ROUTES.NEW;
    const dynamicBackToRoute = useDynamicBackPath(dynamicSuffix);
    const ruleRoute = isEditing && ruleID ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const getRuleRoute = (dynamicSuffixWithParams: string, staticRoute: Route) => (isCreatedFromExpense ? createDynamicRoute(dynamicSuffixWithParams) : staticRoute);

    return {
        isCreatedFromExpense,
        isEditing,
        backToRoute: isCreatedFromExpense ? dynamicBackToRoute : (staticBackToRoute ?? ruleRoute),
        getRuleRoute,
    };
}

export default useMerchantRuleRoute;
