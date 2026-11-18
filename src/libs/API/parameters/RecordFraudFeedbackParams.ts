import type {MarqetaAuthTypeName} from '@libs/MultifactorAuthentication/shared/types';

type RecordFraudFeedbackParams = {
    transactionID: string;

    /** Whether the cardholder recognizes the transaction, i.e. it isn't fraud */
    transactionRecognized: boolean;

    /** Stringified signed MFA challenge, only sent when the transaction is recognized */
    signedChallenge?: string;

    /** Only sent when the transaction is recognized */
    authenticationMethod?: MarqetaAuthTypeName;
};

export default RecordFraudFeedbackParams;
