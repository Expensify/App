import type {OnyxEntry} from 'react-native-onyx';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {GetPhysicalCardForm, PersonalDetailsForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {LoginList, PrivatePersonalDetails} from '@src/types/onyx';
import {validateNumber} from './LoginUtils';
import Navigation from './Navigation/Navigation';
import {getCurrentAddress, getFormattedStreet} from './PersonalDetailsUtils';
import {getSecondaryPhoneLogin} from './UserUtils';

function getCurrentRoute(domain: string, privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>, backTo?: string): Route {
    const {legalFirstName, legalLastName, phoneNumber} = privatePersonalDetails ?? {};
    const address = getCurrentAddress(privatePersonalDetails);

    if (!legalFirstName && !legalLastName) {
        return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_NAME.getRoute(domain, backTo);
    }
    if (!phoneNumber || !validateNumber(phoneNumber)) {
        return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_PHONE.getRoute(domain);
    }
    if (!(address?.street && address?.city && address?.state && address?.country && address?.zip)) {
        return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_ADDRESS.getRoute(domain);
    }

    return ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_CONFIRM.getRoute(domain);
}

function goToNextPhysicalCardRoute(domain: string, privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>, backTo?: string) {
    Navigation.navigate(getCurrentRoute(domain, privatePersonalDetails, backTo));
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

function getSubstepValues(privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>, personalDetailsDraft: OnyxEntry<PersonalDetailsForm>): PersonalDetailsForm {
    const address = getCurrentAddress(privatePersonalDetails);
    const {street} = address ?? {};
    const [street1, street2] = street ? street.split('\n') : [undefined, undefined];
    return {
        [INPUT_IDS.LEGAL_FIRST_NAME]: personalDetailsDraft?.[INPUT_IDS.LEGAL_FIRST_NAME] ?? privatePersonalDetails?.legalFirstName ?? '',
        [INPUT_IDS.LEGAL_LAST_NAME]: personalDetailsDraft?.[INPUT_IDS.LEGAL_LAST_NAME] ?? privatePersonalDetails?.legalLastName ?? '',
        [INPUT_IDS.DATE_OF_BIRTH]: personalDetailsDraft?.[INPUT_IDS.DATE_OF_BIRTH] ?? privatePersonalDetails?.dob ?? '',
        [INPUT_IDS.PHONE_NUMBER]: personalDetailsDraft?.[INPUT_IDS.PHONE_NUMBER] ?? privatePersonalDetails?.phoneNumber ?? '',
        [INPUT_IDS.ADDRESS_LINE_1]: personalDetailsDraft?.[INPUT_IDS.ADDRESS_LINE_1] ?? street1 ?? '',
        [INPUT_IDS.ADDRESS_LINE_2]: personalDetailsDraft?.[INPUT_IDS.ADDRESS_LINE_2] ?? street2 ?? '',
        [INPUT_IDS.CITY]: personalDetailsDraft?.[INPUT_IDS.CITY] ?? address?.city ?? '',
        [INPUT_IDS.STATE]: personalDetailsDraft?.[INPUT_IDS.STATE] ?? address?.state ?? '',
        [INPUT_IDS.ZIP_POST_CODE]: personalDetailsDraft?.[INPUT_IDS.ZIP_POST_CODE] ?? address?.zip ?? '',
        [INPUT_IDS.COUNTRY]: personalDetailsDraft?.[INPUT_IDS.COUNTRY] ?? address?.country ?? '',
    };
}

export {getUpdatedDraftValues, getUpdatedPrivatePersonalDetails, goToNextPhysicalCardRoute, setCurrentRoute, getSubstepValues};
export type {PrivatePersonalDetails};
