import {getTravelDotLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

const openTravelDotLink = (activePolicyID?: string) => {
    getTravelDotLink(activePolicyID)
        ?.then((response) => {
            if (response.spotnanaToken) {
                Navigation.navigate(ROUTES.TRAVEL_DOT_LINK_WEB_VIEW.getRoute(response.spotnanaToken, response.isTestAccount));
                return;
            }
            Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS);
        })
        ?.catch((error) => {
            console.error('Failed to get travel dot link:', error);
            Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS);
        });
};

export default openTravelDotLink;
