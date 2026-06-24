import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import replaceCompanyCardsRoute from './replaceCompanyCardsRoute';

/**
 * If export company card value is changed to unsupported - we should redirect user directly to card details view
 * If not, just regular go back
 */
function goBackFromExportConnection(shouldGoBackToSpecificRoute: boolean, backTo?: string, dynamicBackPath?: Route) {
    const feature = CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards;
    const effectivePath = dynamicBackPath ?? backTo;

    // TODO: Remove `backTo` fallback once all routes using this helper are migrated to dynamic back paths.
    if (!(shouldGoBackToSpecificRoute && effectivePath?.includes(feature.alias))) {
        return Navigation.goBack(dynamicBackPath);
    }
    const companyCardDetailsPage = replaceCompanyCardsRoute(effectivePath);
    return Navigation.goBack(companyCardDetailsPage, {compareParams: false});
}

export default goBackFromExportConnection;
