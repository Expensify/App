import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route as Routes} from '@src/ROUTES';

import stripDynamicRouteSuffixFromPath from './dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';

/**
 * Strips the company-card export suffix (`edit/export/:feed/:cardID`) from a route.
 * `goBackFromExportConnection` calls this so back from QBO, QBD, NetSuite, or Intacct
 * export pages lands on card details when those pages skip the per-card account selector.
 *
 * @param route - The route to strip the company-card export suffix from.
 * @returns The route without the company-card export suffix.
 */
const replaceCompanyCardsRoute = (route: string): Routes => {
    const strippedPath = stripDynamicRouteSuffixFromPath(route, DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.path);
    return strippedPath.replaceAll(/\/edit\/export$/g, '') as Routes;
};

export default replaceCompanyCardsRoute;
