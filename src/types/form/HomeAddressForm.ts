import type Form from './Form';

const INPUT_IDS = {
    ADDRESS_LINE_1: 'addressLine1',
    ADDRESS_LINE_2: 'addressLine2',
    COUNTRY: 'country',
    STATE: 'state',
    CITY: 'city',
    ZIP_POST_CODE: 'zipPostCode',
} as const;

type HomeAddressForm = Form<{
    [INPUT_IDS.ADDRESS_LINE_1]: string;
    [INPUT_IDS.ADDRESS_LINE_2]: string;
    [INPUT_IDS.COUNTRY]: string;
    [INPUT_IDS.STATE]: string;
    [INPUT_IDS.CITY]: string;
    [INPUT_IDS.ZIP_POST_CODE]: string;
}>;

export type {HomeAddressForm};
export default INPUT_IDS;
