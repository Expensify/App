import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type Form from './Form';

const INPUT_IDS = {
    PERSONAL_INFO_STEP: {
        FIRST_NAME: 'legalFirstName',
        LAST_NAME: 'legalLastName',
        DOB: 'dob',
        SSN_LAST_4: 'ssn',
        STREET: 'addressStreet',
        CITY: 'addressCity',
        STATE: 'addressState',
        ZIP_CODE: 'addressZipCode',
        PHONE_NUMBER: 'phoneNumber',
    },
} as const;

type InputID = DeepValueOf<typeof INPUT_IDS>;

type PersonalInfoStepProps = {
    [INPUT_IDS.PERSONAL_INFO_STEP.FIRST_NAME]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.LAST_NAME]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.STREET]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.CITY]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.STATE]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.ZIP_CODE]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.DOB]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.PHONE_NUMBER]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.SSN_LAST_4]: string;
};

type WalletAdditionalDetailsForm = Form<InputID, PersonalInfoStepProps>;

export type {PersonalInfoStepProps, WalletAdditionalDetailsForm};

export default INPUT_IDS;
