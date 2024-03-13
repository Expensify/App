import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    SETUP_COMPLETE: 'setupComplete',
    CARD_NUMBER: 'cardNumber',
    NAME_ON_CARD: 'nameOnCard',
    EXPIRATION_DATE: 'expirationDate',
    SECURITY_CODE: 'securityCode',
    ADDRESS_NAME: 'addressName',
    ADDRESS_ZIP_CODE: 'addressZipCode',
    ACCEPT_TERMS: 'acceptTerms',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceChangeOwnerPaymentCardForm = Form<
    InputID,
    {
        /** Whether the form has been submitted */
        [INPUT_IDS.SETUP_COMPLETE]: boolean;
        [INPUT_IDS.NAME_ON_CARD]: string;
        [INPUT_IDS.CARD_NUMBER]: string;
        [INPUT_IDS.EXPIRATION_DATE]: string;
        [INPUT_IDS.SECURITY_CODE]: string;
        [INPUT_IDS.ADDRESS_NAME]: string;
        [INPUT_IDS.ADDRESS_ZIP_CODE]: string;
        [INPUT_IDS.ACCEPT_TERMS]: string;
    }
>;

export type {WorkspaceChangeOwnerPaymentCardForm};
export default INPUT_IDS;
