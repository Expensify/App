import {openTravelDotLink as openTravelDotLinkWeb} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

const openTravelDotLink = (activePolicyID?: string) => {
    openTravelDotLinkWeb(activePolicyID)
        ?.then(() => {})
        ?.catch(() => {
            Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS);
        });
};

export default openTravelDotLink;
