// TODO: Change API endpoint parameters format to make it possible to follow naming-convention
/* eslint-disable @typescript-eslint/naming-convention */
type UpdatePolicyAddressParams = {
    policyID: string;
    'data[addressStreet]': string;
    'data[city]': string;
    'data[country]': string;
    'data[state]': string;
    'data[zipCode]': string;
};

export default UpdatePolicyAddressParams;
