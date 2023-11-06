import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {Login} from '@src/types/onyx';
import Navigation from './Navigation/Navigation';
import * as UserUtils from './UserUtils';

type PrivatePersonalDetails = {
    address: {street: string; city: string; state: string; country: string; zip: string};
    legalFirstName: string;
    legalLastName: string;
    phoneNumber: string;
};

type LoginList = Record<string, Login>;

/**
 *
 * @param domain
 * @param privatePersonalDetails
 * @param loginList
 * @returns
 */
function getCurrentRoute(domain: string, privatePersonalDetails: PrivatePersonalDetails, loginList: LoginList) {
    const {
        address: {street, city, state, country, zip},
        legalFirstName,
        legalLastName,
        phoneNumber,
    } = privatePersonalDetails;

    if (!legalFirstName && !legalLastName) {
        return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_NAME.getRoute(domain);
    }
    if (!phoneNumber && !UserUtils.getSecondaryPhoneLogin(loginList)) {
        return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_PHONE.getRoute(domain);
    }
    if (!(street && city && state && country && zip)) {
        return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_ADDRESS.getRoute(domain);
    }

    return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_CONFIRM.getRoute(domain);
}

/**
 *
 * @param domain
 * @param privatePersonalDetails
 * @param loginList
 * @returns
 */
function goToNextPhysicalCardRoute(domain: string, privatePersonalDetails: PrivatePersonalDetails, loginList: LoginList) {
    Navigation.navigate(getCurrentRoute(domain, privatePersonalDetails, loginList));
}

/**
 *
 * @param currentRoute
 * @param domain
 * @param privatePersonalDetails
 * @param loginList
 * @returns
 */
function setCurrentRoute(currentRoute: string, domain: string, privatePersonalDetails: PrivatePersonalDetails, loginList: LoginList) {
    const expectedRoute = getCurrentRoute(domain, privatePersonalDetails, loginList);

    // If the user is on the current route or the current route is confirmation, then he's allowed to stay on the current step
    if ([currentRoute, ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_CONFIRM.getRoute(domain)].includes(expectedRoute)) {
        return;
    }

    // Redirect the user if he's not allowed to be on the current step
    Navigation.navigate(expectedRoute, CONST.NAVIGATION.ACTION_TYPE.REPLACE);
}

export {goToNextPhysicalCardRoute, setCurrentRoute};
