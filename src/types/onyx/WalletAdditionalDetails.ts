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

type WalletPersonalDetails = {
    legalFirstName: string;
    legalLastName: string;
    dob: string;
    ssn: string;
    addressStreet: string;
    addressCity: string;
    addressState: string;
    addressZipCode: string;
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

// TODO: refactor into one type after removing old wallet flow
type WalletAdditionalDetailsRefactor = WalletAdditionalDetails & WalletPersonalDetails;

export default WalletAdditionalDetails;
export type {WalletAdditionalQuestionDetails, WalletPersonalDetails, WalletAdditionalDetailsRefactor};
