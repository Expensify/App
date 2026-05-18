import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    LEGAL_FIRST_NAME: 'legalFirstName',
    LEGAL_LAST_NAME: 'legalLastName',
    PHONE_NUMBER: 'phoneNumber',
    ADDRESS_STREET: 'addressStreet',
    ADDRESS_CITY: 'addressCity',
    ADDRESS_ZIP_CODE: 'addressZipCode',
    ADDRESS_STATE: 'addressState',
    DOB: 'dob',
    SSN: 'ssn',
    ANSWER: 'answer',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type AdditionalDetailStepForm = Form<
    InputID,
    {
        [INPUT_IDS.LEGAL_FIRST_NAME]: string;
        [INPUT_IDS.LEGAL_LAST_NAME]: string;
        [INPUT_IDS.PHONE_NUMBER]: string;
        [INPUT_IDS.ADDRESS_STREET]: string;
        [INPUT_IDS.ADDRESS_CITY]: string;
        [INPUT_IDS.ADDRESS_ZIP_CODE]: string;
        [INPUT_IDS.ADDRESS_STATE]: string;
        [INPUT_IDS.DOB]: string;
        [INPUT_IDS.SSN]: string;
        [INPUT_IDS.ANSWER]: string;
    }
>;

export type {AdditionalDetailStepForm};
export default INPUT_IDS;
