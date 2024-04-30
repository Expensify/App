import type * as OnyxCommon from './OnyxCommon';

type WalletAdditionalQuestionDetails = {
    prompt: string;
    type: string;
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

type WalletAdditionalDetails = {
    /** Questions returned by Idology */
    questions?: WalletAdditionalQuestionDetails[];

    /** ExpectID ID number related to those questions */
    idNumber?: string;

    /** Error code to determine additional behavior */
    errorCode?: string;

    /** Which field needs attention? */
    errorFields?: OnyxCommon.ErrorFields;
    additionalErrorMessage?: string;
    isLoading?: boolean;
    errors?: OnyxCommon.Errors;
};

// TODO: refactor into one type after removing old wallet flow
type WalletAdditionalDetailsRefactor = WalletAdditionalDetails & WalletPersonalDetails;

export default WalletAdditionalDetails;
export type {WalletAdditionalQuestionDetails, WalletPersonalDetails, WalletAdditionalDetailsRefactor};
