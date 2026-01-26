/**
 * Values required by Marqeta in requests for the 3DS authentication.
 * @see https://www.marqeta.com/docs/core-api/3ds/#_the_threedschallengeresultrequest_object
 */

const AUTHENTICATION_METHOD = {
    /** Facial recognition authentication */
    BIOMETRIC_FACE: 'BIOMETRIC_FACE',

    /** Fingerprint authentication */
    BIOMETRIC_FINGERPRINT: 'BIOMETRIC_FINGERPRINT',

    /** Voice pattern recognition authentication */
    VOICE_RECOGNITION: 'VOICE_RECOGNITION',

    /** Authentication within the issuer’s mobile application */
    IN_APP_LOGIN: 'IN_APP_LOGIN',

    /** Voice call with human or automated verification */
    AUDIO_CALL: 'AUDIO_CALL',

    /** Video call with human verification */
    VIDEO_CALL: 'VIDEO_CALL',

    /** One-time password sent via SMS text message */
    OTP_SMS: 'OTP_SMS',

    /** One-time password sent via email */
    OTP_EMAIL: 'OTP_EMAIL',

    /** Knowledge-based authentication, such as security questions */
    KNOWLEDGE_BASED: 'KNOWLEDGE_BASED',

    /** Other authentication method not listed above */
    OTHER: 'OTHER',
} as const;

const MQ_VALUES = {
    AUTHENTICATION_METHOD,
} as const;

export default MQ_VALUES;
