import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

import replaceCompanyCardsRoute from './replaceCompanyCardsRoute';

/**
 * If export company card value is changed to unsupported - we should redirect user directly to card details view
 * If not, just regular go back
 */
function goBackFromExportConnection(shouldGoBackToSpecificRoute: boolean, dynamicBackPath?: Route) {
    const feature = CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards;

    if (!(shouldGoBackToSpecificRoute && dynamicBackPath?.includes(feature.alias))) {
        return Navigation.goBack(dynamicBackPath);
    }
    const companyCardDetailsPage = replaceCompanyCardsRoute(dynamicBackPath);
    return Navigation.goBack(companyCardDetailsPage, {compareParams: false});
}

export default goBackFromExportConnection;
