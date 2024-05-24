// TODO: Change API endpoint parameters format to make it possible to follow naming-convention
/* eslint-disable @typescript-eslint/naming-convention */
type UpdatePolicyAddressParams = {
    policyID: string;
    addressStreet: string;
    addressStreet2: string;
    city: string;
    country: string;
    state: string;
    zipCode: string;
};

export default UpdatePolicyAddressParams;
