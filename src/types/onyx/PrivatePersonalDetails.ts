import type {Country} from '@src/CONST';

type Address = {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: Country | '';
    zipPostCode?: string;
    addressLine1?: string;
    addressLine2?: string;
};

type PrivatePersonalDetails = {
    legalFirstName?: string;
    legalLastName?: string;
    dob?: string;
    phoneNumber?: string;

    /** User's home address */
    address?: Address;
};

export default PrivatePersonalDetails;

export type {Address};
