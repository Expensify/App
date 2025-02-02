import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {GetPhysicalCardForm} from '@src/types/form';
import type {LoginList, PrivatePersonalDetails} from '@src/types/onyx';
import {appendCountryCode} from './LoginUtils';
import Navigation from './Navigation/Navigation';
import {getCurrentAddress, getFormattedStreet} from './PersonalDetailsUtils';
import {parsePhoneNumber} from './PhoneNumber';
import {getSecondaryPhoneLogin} from './UserUtils';

function getCurrentRoute(domain: string, privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>): Route {
    const {legalFirstName, legalLastName, phoneNumber} = privatePersonalDetails ?? {};
    const address = getCurrentAddress(privatePersonalDetails);
    const phoneNumberWithCountryCode = appendCountryCode(phoneNumber ?? '');
    const parsedPhoneNumber = parsePhoneNumber(phoneNumberWithCountryCode);

    if (!legalFirstName && !legalLastName) {
        return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_NAME.getRoute(domain);
    }
    if (!phoneNumber || !parsedPhoneNumber.possible || !Str.isValidE164Phone(phoneNumberWithCountryCode.slice(0))) {
        return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_PHONE.getRoute(domain);
    }
    if (!(address?.street && address?.city && address?.state && address?.country && address?.zip)) {
        return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_ADDRESS.getRoute(domain);
    }

    return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_CONFIRM.getRoute(domain);
}

function goToNextPhysicalCardRoute(domain: string, privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) {
    Navigation.navigate(getCurrentRoute(domain, privatePersonalDetails));
}

/**
 *
 * @param currentRoute
 * @param domain
 * @param privatePersonalDetails
 * @param loginList
 * @returns
 */
function setCurrentRoute(currentRoute: string, domain: string, privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) {
    const expectedRoute = getCurrentRoute(domain, privatePersonalDetails);

    // If the user is on the current route or the current route is confirmation, then he's allowed to stay on the current step
    if ([currentRoute, ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_CONFIRM.getRoute(domain)].includes(expectedRoute)) {
        return;
    }

    // Redirect the user if he's not allowed to be on the current step
    Navigation.goBack(expectedRoute);
}

/**
 *
 * @param draftValues
 * @param privatePersonalDetails
 * @returns
 */
function getUpdatedDraftValues(draftValues: OnyxEntry<GetPhysicalCardForm>, privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>, loginList: OnyxEntry<LoginList>): GetPhysicalCardForm {
    const {legalFirstName, legalLastName, phoneNumber} = privatePersonalDetails ?? {};
    const address = getCurrentAddress(privatePersonalDetails);

    return {
        /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
        // we do not need to use nullish coalescing here because we want to allow empty strings
        legalFirstName: draftValues?.legalFirstName || legalFirstName || '',
        legalLastName: draftValues?.legalLastName || legalLastName || '',
        addressLine1: draftValues?.addressLine1 || address?.street.split('\n')[0] || '',
        addressLine2: draftValues?.addressLine2 || address?.street.split('\n')[1] || '',
        city: draftValues?.city || address?.city || '',
        country: draftValues?.country || address?.country || '',
        phoneNumber: draftValues?.phoneNumber || phoneNumber || getSecondaryPhoneLogin(loginList) || '',
        state: draftValues?.state || address?.state || '',
        zipPostCode: draftValues?.zipPostCode || address?.zip || '',
        /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
    };
}

/**
 *
 * @param draftValues
 * @returns
 */
function getUpdatedPrivatePersonalDetails(draftValues: OnyxEntry<GetPhysicalCardForm>, privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>): PrivatePersonalDetails {
    const {addressLine1, addressLine2, city = '', country = '', legalFirstName, legalLastName, phoneNumber, state = '', zipPostCode = ''} = draftValues ?? {};
    return {
        legalFirstName,
        legalLastName,
        phoneNumber,
        addresses: [...(privatePersonalDetails?.addresses ?? []), {street: getFormattedStreet(addressLine1, addressLine2), city, country, state, zip: zipPostCode}],
    };
}

export {getUpdatedDraftValues, getUpdatedPrivatePersonalDetails, goToNextPhysicalCardRoute, setCurrentRoute};
export type {PrivatePersonalDetails};
