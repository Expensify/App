import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

type AddressInputKeys = {
    street: string;
    street2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    zipPostCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    lat?: string;
    lng?: string;
    zipCode?: string;
    address?: string;
    current?: string;
};

type AddressErrors = Record<keyof Address, boolean>;

export type {AddressErrors, AddressInputKeys};
