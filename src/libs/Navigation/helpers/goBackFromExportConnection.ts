import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';

import replaceCompanyCardsRoute from './replaceCompanyCardsRoute';

/**
 * If the card export value is changed to an unsupported type - we should redirect user directly to card details view
 * If not, just regular go back
 */
function goBackFromExportConnection(shouldGoBackToSpecificRoute: boolean, dynamicBackPath?: Route) {
    if (!shouldGoBackToSpecificRoute || !dynamicBackPath) {
        return Navigation.goBack(dynamicBackPath);
    }
    const cardDetailsPage = replaceCompanyCardsRoute(dynamicBackPath);
    return Navigation.goBack(cardDetailsPage, {compareParams: false});
}

export default goBackFromExportConnection;
