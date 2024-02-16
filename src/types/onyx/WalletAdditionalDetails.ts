import type * as OnyxCommon from './OnyxCommon';

type WalletAdditionalQuestionDetails = {
    prompt: string;
    type: string;
    answer: string[];
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

export default WalletAdditionalDetails;
export type {WalletAdditionalQuestionDetails};
