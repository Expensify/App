import type * as OnyxCommon from './OnyxCommon';

/** Model of action to receive validateCode */
type VerifyValidateCodeAction = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Epoch-ms timestamp of when the validateCode was last requested for any validateCode flow */
        lastValidateCodeRequestedAt?: number;

        /** Field-specific server side errors keyed by microtime */
        errorFields?: OnyxCommon.ErrorFields;

        /** Whether the validateCode is sending */
        isLoading?: boolean;
    },
    'actionVerified'
>;

export default VerifyValidateCodeAction;
