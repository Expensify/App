import type {CONST} from 'expensify-common';
import type {ValueOf} from 'type-fest';

import type * as OnyxCommon from './OnyxCommon';

/** The flow a validateCode was requested for */
type ValidateCodeReason = ValueOf<typeof CONST.VALIDATE_CODE_REASONS>;

/** Model of action to receive validateCode */
type VerifyValidateCodeAction = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Epoch-ms timestamp of when the validateCode was last requested for any validateCode flow */
        lastValidateCodeRequestedAt?: number;

        /** The flow the last validateCode was requested for */
        lastValidateCodeReason?: ValidateCodeReason | null;

        /** Field-specific server side errors keyed by microtime */
        errorFields?: OnyxCommon.ErrorFields;

        /** Whether the validateCode is sending */
        isLoading?: boolean;
    },
    'actionVerified'
>;

export default VerifyValidateCodeAction;
export type {ValidateCodeReason};
