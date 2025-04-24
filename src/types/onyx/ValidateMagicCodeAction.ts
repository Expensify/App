import type * as OnyxCommon from './OnyxCommon';

/** Model of action to receive magic code */
type ValidateMagicCodeAction = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Whether the user validation code was sent */
        validateCodeSent?: boolean;

        /** Field-specific server side errors keyed by microtime */
        errorFields?: OnyxCommon.ErrorFields;

        /** Whether the magic code is sending */
        isLoading?: boolean;
    },
    'actionVerified'
>;

export default ValidateMagicCodeAction;
