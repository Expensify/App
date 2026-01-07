import {openTravelDotLink as openTravelDotLinkWeb} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

const openTravelDotLink = (activePolicyID?: string, postLoginPath?: string) => {
    openTravelDotLinkWeb(activePolicyID, postLoginPath)
        ?.then(() => {})
        ?.catch(() => {
            Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(activePolicyID));
        });
};

const shouldOpenTravelDotLinkWeb = () => true;

export {openTravelDotLink, shouldOpenTravelDotLinkWeb};
