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
    /** Address line 1 for delivery */
    addressLine1?: string;

    /** Address line 2 for delivery */
    addressLine2?: string;

    /** City for delivery */
    city?: string;

    /** Country for delivery */
    country?: string;

    /** First name for delivery */
    legalFirstName?: string;

    /** Last name  for delivery */
    legalLastName?: string;

    /** Phone number for delivery */
    phoneNumber?: string;

    /** State for delivery */
    state?: string;

    /** Zip code  for delivery */
    zipPostCode?: string;
};

export default Form;

export type {AddDebitCardForm, DateOfBirthForm, GetPhysicalCardForm};
