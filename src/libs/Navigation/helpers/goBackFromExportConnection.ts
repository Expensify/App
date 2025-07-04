import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import replaceCompanyCardsRoute from './replaceCompanyCardsRoute';

/**
 * If export company card value is changed to unsupported - we should redirect user directly to card details view
 * If not, just regular go back
 */
function goBackFromExportConnection(shouldGoBackToSpecificRoute: boolean, backTo?: string) {
    const feature = CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards;

    if (!(shouldGoBackToSpecificRoute && backTo?.includes(feature.alias))) {
        return Navigation.goBack();
    }
    const companyCardDetailsPage = replaceCompanyCardsRoute(backTo);
    return Navigation.goBack(companyCardDetailsPage);
}

export default goBackFromExportConnection;
