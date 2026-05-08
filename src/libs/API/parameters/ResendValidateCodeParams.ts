import type {ValueOf} from 'type-fest';
import type {CONST} from 'expensify-common';

type ResendValidateCodeBaseParams = {
    // Exclude reasons that require parameters - redefine them as separate types below to enforce their parameters are always passed
    reasonCode: Exclude<ValueOf<typeof CONST.VALIDATE_CODE_REASONS>, typeof CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS>;
};

type ResendValidateCodeForRevealCardDetailsParams = {
    reasonCode: typeof CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS;
    reasonCardID: number;
};

type ResendValidateCodeParams = ResendValidateCodeBaseParams | ResendValidateCodeForRevealCardDetailsParams;

export default ResendValidateCodeParams;
