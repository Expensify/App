import * as OnyxCommon from './OnyxCommon';

type WalletAdditionalDetails = {
    /** Questions returned by Idology */
    questions?: {
        prompt: string;
        type: string;
        answer: string[];
    };

    /** ExpectID ID number related to those questions */
    idNumber?: string;

    /** Error code to determine additional behavior */
    errorCode?: string;

    /** Which field needs attention? */
    errorFields?: OnyxCommon.ErrorFields;
    isLoading?: boolean;
    errors?: OnyxCommon.Errors;
};

export default WalletAdditionalDetails;
