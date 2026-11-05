/**
 * The account holder answers the user's private details already hold, keyed the way the Wise bank account schema asks for them, so the form
 * starts filled in. Only details that are set are returned, so nothing blank is written over what the user types.
 */
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';

import type {PrivatePersonalDetails} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/** The schema keeps the holder's address parts under this key, as Wise names them */
const ADDRESS_KEY = 'address';
const ADDRESS_COUNTRY_KEY = `${ADDRESS_KEY}.country`;

function getAccountHolderPrefill(privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>): Record<string, string> {
    const address = getCurrentAddress(privatePersonalDetails);
    const legalName = [privatePersonalDetails?.legalFirstName, privatePersonalDetails?.legalLastName].filter(Boolean).join(' ');
    const candidates: Record<string, string | undefined> = {
        accountHolderName: legalName,
        [`${ADDRESS_KEY}.firstLine`]: getStreetLines(address?.street).at(0),
        [`${ADDRESS_KEY}.city`]: address?.city,
        [`${ADDRESS_KEY}.state`]: address?.state,
        [`${ADDRESS_KEY}.postCode`]: address?.zip,
        [ADDRESS_COUNTRY_KEY]: address?.country,
    };
    return Object.fromEntries(Object.entries(candidates).filter((entry): entry is [string, string] => !!entry[1]));
}

export default getAccountHolderPrefill;
export {ADDRESS_COUNTRY_KEY};
