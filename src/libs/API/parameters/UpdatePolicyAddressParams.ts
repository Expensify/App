type AddressData = {
    addressStreet: string;
    city: string;
    country: string;
    state: string;
    zipCode: string;
};

type UpdatePolicyAddressParams = {
    policyID: string;
    data: AddressData[];
};

export type {UpdatePolicyAddressParams, AddressData};
