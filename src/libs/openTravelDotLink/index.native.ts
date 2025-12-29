import {getTravelDotLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

const openTravelDotLink = (activePolicyID?: string, postLoginPath?: string) => {
    getTravelDotLink(activePolicyID)
        ?.then((response) => {
            if (response.spotnanaToken) {
                Navigation.navigate(ROUTES.TRAVEL_DOT_LINK_WEB_VIEW.getRoute(response.spotnanaToken, response.isTestAccount, postLoginPath));
                return;
            }
            Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(activePolicyID));
        })
        ?.catch((error) => {
            console.error('Failed to get travel dot link:', error);
            Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(activePolicyID));
        });
};

const shouldOpenTravelDotLinkWeb = () => false;

export {openTravelDotLink, shouldOpenTravelDotLinkWeb};
