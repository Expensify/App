import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

/**
 * Resolves where the Travel enablement flow should send the user after verifying their account mid-flow.
 * The old per-screen pages (tax ID, terms) this used to route between were replaced by the single dynamic
 * stepper, which recomputes which step to land on from current policy/account state, so this always routes
 * back into it rather than to a specific step.
 */
function getTravelAcceptTermsRoute(policyID: string): Route {
    return ROUTES.TRAVEL_ENABLE.getRoute(policyID);
}

export default getTravelAcceptTermsRoute;
