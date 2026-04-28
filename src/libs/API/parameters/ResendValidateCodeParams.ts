import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ResendValidateCodeBaseParams = {
    reasonCode: ValueOf<typeof CONST.VALIDATE_CODE_REASON>;
};

type ResendValidateCodeForRevealCardDetailsParams = {
    reasonCode: typeof CONST.VALIDATE_CODE_REASON.REVEAL_CARD_DETAILS;
    reasonCardID: number;
};

type ResendValidateCodeParams = ResendValidateCodeBaseParams | ResendValidateCodeForRevealCardDetailsParams;

export default ResendValidateCodeParams;
