import type * as OnyxCommon from './OnyxCommon';

/** Model of action to receive magic code */
type ValidateMagicCodeAction = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Epoch-ms timestamp of when the magic code was last requested for any validateCode flow */
        lastValidateCodeRequestedAt?: number;

        /** Field-specific server side errors keyed by microtime */
        errorFields?: OnyxCommon.ErrorFields;

        /** Whether the magic code is sending */
        isLoading?: boolean;
    },
    'actionVerified'
>;

export default ValidateMagicCodeAction;
