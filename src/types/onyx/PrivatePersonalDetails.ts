import type {Country} from '@src/CONST';

/** User address data */
type Address = {
    /** Street line 1 */
    street: string;

    /** Street line 2 */
    street2?: string;

    /** City */
    city?: string;

    /** State */
    state?: string;

    /** Zip post code */
    zip?: string;

    /** Country code */
    country?: Country | '';

    /** Zip post code */
    zipPostCode?: string;

    /** Street line 1 */
    addressLine1?: string;

    /** Street line 2 */
    addressLine2?: string;

    /** Latitude */
    lat?: string;

    /** Longitude */
    lng?: string;

    /** Zip post code */
    zipCode?: string;

    /** Google place description */
    address?: string;

    /** Is the current address */
    current?: boolean;
};

/** Model of user private personal details */
type PrivatePersonalDetails = {
    /** User's legal first name */
    legalFirstName?: string;

    /** User's legal last name */
    legalLastName?: string;

    /** User's date of birth */
    dob?: string;

    /** User's phone number */
    phoneNumber?: string;

    /** @deprecated User's home address */
    address?: Address;

    /** User's home address history. The most recent address is the last item in the array */
    addresses?: Address[];
};

export default PrivatePersonalDetails;

export type {Address};
