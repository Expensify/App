import type {CONST} from 'expensify-common';
import type {ValueOf} from 'type-fest';

type ResendValidateCodeBaseParams = {
    // Exclude reasons that require parameters - redefine them as separate types below to enforce their parameters are always passed
    reasonCode: Exclude<
        ValueOf<typeof CONST.VALIDATE_CODE_REASONS>,
        | typeof CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS
        | typeof CONST.VALIDATE_CODE_REASONS.REPLACE_CARD
        | typeof CONST.VALIDATE_CODE_REASONS.REPORT_CARD_FRAUD
        | typeof CONST.VALIDATE_CODE_REASONS.ADD_DELEGATE
        | typeof CONST.VALIDATE_CODE_REASONS.UPDATE_DELEGATE
    >;
};

type ResendValidateCodeForRevealCardDetailsParams = {
    reasonCode: typeof CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS;
    reasonCardID: number;
};

type ResendValidateCodeForReplaceCardParams = {
    reasonCode: typeof CONST.VALIDATE_CODE_REASONS.REPLACE_CARD;
    reasonCardID: number;
};

type ResendValidateCodeForReportCardFraudParams = {
    reasonCode: typeof CONST.VALIDATE_CODE_REASONS.REPORT_CARD_FRAUD;
    reasonCardID: number;
};

type ResendValidateCodeForAddDelegateParams = {
    reasonCode: typeof CONST.VALIDATE_CODE_REASONS.ADD_DELEGATE;
    reasonTargetEmail: string;
};

type ResendValidateCodeForUpdateDelegateParams = {
    reasonCode: typeof CONST.VALIDATE_CODE_REASONS.UPDATE_DELEGATE;
    reasonTargetEmail: string;
};

// Will be removed eventually
type ResendValidateCodeNotYetImplementedParams = {
    reasonCode: null;
};

type ResendValidateCodeParams =
    | ResendValidateCodeBaseParams
    | ResendValidateCodeNotYetImplementedParams
    | ResendValidateCodeForRevealCardDetailsParams
    | ResendValidateCodeForReplaceCardParams
    | ResendValidateCodeForReportCardFraudParams
    | ResendValidateCodeForAddDelegateParams
    | ResendValidateCodeForUpdateDelegateParams;

export default ResendValidateCodeParams;
