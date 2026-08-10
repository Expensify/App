import {getTravelDotLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

const openTravelDotLink = (activePolicyID?: string, postLoginPath?: string, spotnanaToken?: string, isTestAccount?: boolean, onError?: () => void) => {
    if (spotnanaToken) {
        Navigation.navigate(ROUTES.TRAVEL_DOT_LINK_WEB_VIEW.getRoute(spotnanaToken, isTestAccount, postLoginPath));
        return;
    }
    const handleError = onError ?? (() => Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(activePolicyID)));
    getTravelDotLink(activePolicyID)
        ?.then((response) => {
            if (response.spotnanaToken) {
                Navigation.navigate(ROUTES.TRAVEL_DOT_LINK_WEB_VIEW.getRoute(response.spotnanaToken, response.isTestAccount, postLoginPath));
                return;
            }
            handleError();
        })
        ?.catch((error) => {
            console.error('Failed to get travel dot link:', error);
            handleError();
        });
};

const shouldOpenTravelDotLinkWeb = () => false;

export {openTravelDotLink, shouldOpenTravelDotLinkWeb};
