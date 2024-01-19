import type * as OnyxCommon from './OnyxCommon';

type Form = {
    /** Controls the loading state of the form */
    isLoading?: boolean;

    /** Server side errors keyed by microtime */
    errors?: OnyxCommon.Errors;

    /** Field-specific server side errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;
};

type AddDebitCardForm = Form & {
    /** Whether or not the form has been submitted */
    setupComplete: boolean;
};

type DateOfBirthForm = Form & {
    /** Date of birth */
    dob?: string;
};

type GetPhysicalCardForm = Form & {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    country?: string;
    legalFirstName?: string;
    legalLastName?: string;
    phoneNumber?: string;
    state?: string;
    zipPostCode?: string;
};

export default Form;

export type {AddDebitCardForm, DateOfBirthForm, GetPhysicalCardForm};
