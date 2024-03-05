import type {ValueOf} from 'type-fest';
import type {Country} from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = {
    ADDRESS_LINE_1: 'addressLine1',
    ADDRESS_LINE_2: 'addressLine2',
    COUNTRY: 'country',
    STATE: 'state',
    CITY: 'city',
    ZIP_POST_CODE: 'zipPostCode',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type HomeAddressForm = Form<
    InputID,
    {
        [INPUT_IDS.ADDRESS_LINE_1]: string;
        [INPUT_IDS.ADDRESS_LINE_2]: string;
        [INPUT_IDS.COUNTRY]: Country | '';
        [INPUT_IDS.STATE]: string;
        [INPUT_IDS.CITY]: string;
        [INPUT_IDS.ZIP_POST_CODE]: string;
    }
>;

export type {HomeAddressForm};
export default INPUT_IDS;
