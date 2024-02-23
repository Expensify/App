import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    SETUP_COMPLETE: 'setupComplete',
    NAME_ON_CARD: 'nameOnCard',
    CARD_NUMBER: 'cardNumber',
    EXPIRATION_DATE: 'expirationDate',
    SECURITY_CODE: 'securityCode',
    ADDRESS_STREET: 'addressStreet',
    ADDRESS_ZIP_CODE: 'addressZipCode',
    ADDRESS_STATE: 'addressState',
    ACCEPT_TERMS: 'acceptTerms',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type AddDebitCardForm = Form<
    InputID,
    {
        /** Whether the form has been submitted */
        [INPUT_IDS.SETUP_COMPLETE]: boolean;
        [INPUT_IDS.NAME_ON_CARD]: string;
        [INPUT_IDS.CARD_NUMBER]: string;
        [INPUT_IDS.EXPIRATION_DATE]: string;
        [INPUT_IDS.SECURITY_CODE]: string;
        [INPUT_IDS.ADDRESS_STREET]: string;
        [INPUT_IDS.ADDRESS_ZIP_CODE]: string;
        [INPUT_IDS.ADDRESS_STATE]: string;
        [INPUT_IDS.ACCEPT_TERMS]: string;
    }
>;

export type {AddDebitCardForm};
export default INPUT_IDS;
