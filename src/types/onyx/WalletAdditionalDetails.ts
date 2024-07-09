import type * as OnyxCommon from './OnyxCommon';

/** Model of user wallet Idology question */
type WalletAdditionalQuestionDetails = {
    /** Question prompt */
    prompt: string;

    /** Question type */
    type: string;

    /** Possible answers */
    answer: string[];
};

/** Model of wallet personal details */
type WalletPersonalDetails = {
    /** Legal first name */
    legalFirstName: string;

    /** Legal last name */
    legalLastName: string;

    /** Date of birth */
    dob: string;

    /** Social Security Number (SSN) */
    ssn: string;

    /** Street address */
    addressStreet: string;

    /** City */
    addressCity: string;

    /** State */
    addressState: string;

    /** ZIP code */
    addressZipCode: string;

    /** Phone number */
    phoneNumber: string;
};

/** Model of user wallet additional details */
type WalletAdditionalDetails = {
    /** Questions returned by Idology */
    questions?: WalletAdditionalQuestionDetails[];

    /** ExpectID ID number related to those questions */
    idNumber?: string;

    /** Error code to determine additional behavior */
    errorCode?: string;

    /** Which field needs attention? */
    errorFields?: OnyxCommon.ErrorFields;

    /** Whether the details are being loaded */
    isLoading?: boolean;

    /** Error messages to display to the user */
    errors?: OnyxCommon.Errors;
};

/** TODO: refactor into one type after removing old wallet flow */
type WalletAdditionalDetailsRefactor = WalletAdditionalDetails & WalletPersonalDetails;

export default WalletAdditionalDetails;
export type {WalletAdditionalQuestionDetails, WalletPersonalDetails, WalletAdditionalDetailsRefactor};
