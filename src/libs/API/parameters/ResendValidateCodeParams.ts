import type {CONST} from 'expensify-common';
import type {ValueOf} from 'type-fest';

type ResendValidateCodeBaseParams = {
    // Exclude reasons that require parameters - redefine them as separate types below to enforce their parameters are always passed
    reasonCode: Exclude<ValueOf<typeof CONST.VALIDATE_CODE_REASONS>, typeof CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS>;
};

type ResendValidateCodeForRevealCardDetailsParams = {
    reasonCode: typeof CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS;
    reasonCardID: number;
};

// Will be removed eventually
type ResendValidateCodeNotYetImplementedParams = {
    reasonCode: null;
};

type ResendValidateCodeParams = ResendValidateCodeBaseParams | ResendValidateCodeNotYetImplementedParams | ResendValidateCodeForRevealCardDetailsParams;

export default ResendValidateCodeParams;
