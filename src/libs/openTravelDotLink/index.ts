import {buildTravelDotURL, openTravelDotLink as openTravelDotLinkWeb} from '@libs/actions/Link';
import asyncOpenURL from '@libs/asyncOpenURL';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

const openTravelDotLink = (activePolicyID?: string, postLoginPath?: string, spotnanaToken?: string, isTestAccount?: boolean) => {
    if (spotnanaToken) {
        asyncOpenURL(Promise.resolve(), () => buildTravelDotURL(spotnanaToken, isTestAccount ?? false, postLoginPath));
        return;
    }
    openTravelDotLinkWeb(activePolicyID, postLoginPath)
        ?.then(() => {})
        ?.catch(() => {
            Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(activePolicyID));
        });
};

const shouldOpenTravelDotLinkWeb = () => true;

export {openTravelDotLink, shouldOpenTravelDotLinkWeb};
