import * as OnyxCommon from './OnyxCommon';

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

export default Form;

export type {AddDebitCardForm, DateOfBirthForm};
