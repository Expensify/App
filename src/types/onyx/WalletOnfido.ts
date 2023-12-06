import * as OnyxCommon from './OnyxCommon';

type WalletOnfido = {
    /** Unique identifier returned from openOnfidoFlow then re-sent to ActivateWallet with Onfido response data */
    applicantID: string;

    /** Token used to initialize the Onfido SDK token */
    sdkToken: string;

    /** Loading state to provide feedback when we are waiting for a request to finish */
    isLoading?: boolean;

    /** Error message to inform the user of any problem that might occur */
    errors?: OnyxCommon.Errors;

    /** A list of Onfido errors that the user can fix in order to attempt the Onfido flow again */
    fixableErrors?: string[];

    /** Whether the user has accepted the privacy policy of Onfido or not */
    hasAcceptedPrivacyPolicy?: boolean;

    /** If we should show the FailedKYC view after the user submitted their info with a non fixable error */
    shouldShowFailedKYC?: boolean;
};

export default WalletOnfido;
