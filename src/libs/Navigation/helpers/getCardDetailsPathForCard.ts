import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';
import removeDynamicRouteFromPath from './dynamicRoutesUtils/removeDynamicRouteFromPath';

/**
 * Points a card details path at another card, keeping the page it was opened on (Wallet, Home or Domains).
 * Used when reporting a card hands the user a replacement card.
 */
function getCardDetailsPathForCard(cardDetailsPath: Route, cardID: string): Route {
    if (!cardID) {
        return cardDetailsPath;
    }

    // Domains' static `settings/card/:cardID` ends the same way as the dynamic card suffix, so it is rebuilt the same way.
    const basePath = removeDynamicRouteFromPath(cardDetailsPath, DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.path);
    if (!basePath) {
        return cardDetailsPath;
    }

    return createDynamicRoute(DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute(cardID), basePath);
}

export default getCardDetailsPathForCard;
