import type {ValueOf} from 'type-fest';
import type {Country} from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = {
    LEGAL_FIRST_NAME: 'legalFirstName',
    LEGAL_LAST_NAME: 'legalLastName',
    DATE_OF_BIRTH: 'dob',
    ADDRESS_LINE_1: 'addressLine1',
    ADDRESS_LINE_2: 'addressLine2',
    COUNTRY: 'country',
    STATE: 'state',
    CITY: 'city',
    ZIP_POST_CODE: 'zipPostCode',
    PHONE_NUMBER: 'phoneNumber',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type PersonalDetailsForm = Form<
    InputID,
    {
        [INPUT_IDS.LEGAL_FIRST_NAME]: string;
        [INPUT_IDS.LEGAL_LAST_NAME]: string;
        [INPUT_IDS.DATE_OF_BIRTH]: string;
        [INPUT_IDS.ADDRESS_LINE_1]: string;
        [INPUT_IDS.ADDRESS_LINE_2]: string;
        [INPUT_IDS.COUNTRY]: Country | '';
        [INPUT_IDS.STATE]: string;
        [INPUT_IDS.CITY]: string;
        [INPUT_IDS.ZIP_POST_CODE]: string;
        [INPUT_IDS.PHONE_NUMBER]: string;
    }
>;

export type {PersonalDetailsForm};
export default INPUT_IDS;
