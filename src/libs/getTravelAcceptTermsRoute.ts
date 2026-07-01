import type {OnyxEntry} from 'react-native-onyx';
import type {Route} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import createDynamicRoute from './Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {isNonUSDPolicy, isWorkspaceProvisionedForTravel} from './PolicyUtils';

/**
 * Resolves where the Travel enablement flow should send the user when accepting terms.
 *
 * A non-USD workspace that hasn't been provisioned yet must supply a legal entity tax ID so Solutions
 * can provision a DK number, so it is routed to the tax ID page first. Everything else goes straight
 * to the terms & conditions page.
 */
function getTravelAcceptTermsRoute(domain: string, policyID: string | undefined, policy: OnyxEntry<Policy>): Route {
    const needsTaxID = isNonUSDPolicy(policy) && !isWorkspaceProvisionedForTravel(policy?.travelSettings) && !policy?.travelSettings?.taxID;

    if (needsTaxID) {
        return ROUTES.TRAVEL_LEGAL_ENTITY_TAX_ID.getRoute(domain, policyID);
    }

    return createDynamicRoute(DYNAMIC_ROUTES.TRAVEL_TCS.getRoute(domain, policyID));
}

export default getTravelAcceptTermsRoute;
