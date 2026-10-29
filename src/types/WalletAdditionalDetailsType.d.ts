import * as CommonTypes from './common';

type WalletAdditionalDetailsType = CommonTypes.BaseState & {
    /** Questions returned by Idology */
    questions: {
        prompt: string;
        type: string;
        answer: string[];
    };

    /** ExpectID ID number related to those questions */
    idNumber: string;

    /** Error code to determine additional behavior */
    errorCode: string;

    /** Which field needs attention? */
    errorFields: {
        [fieldName: string]: boolean;
    };
};

export default WalletAdditionalDetailsType;
