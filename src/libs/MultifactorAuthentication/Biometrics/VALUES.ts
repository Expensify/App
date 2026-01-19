/**
 * Constants for multifactor authentication biometrics flow and API responses.
 */
import SCENARIO from '@components/MultifactorAuthentication/config/scenarios/names';

/**
 * Backend reason messages for multifactor authentication responses.
 */
const REASON = {
    BACKEND: {
        REGISTRATION_REQUIRED: 'Registration is required',
        CHALLENGE_GENERATED: 'Challenge generated successfully',
        KEY_INFO_MISSING: 'Key info not provided',
        KEY_ALREADY_REGISTERED: 'This public key is already registered',
        VALIDATE_CODE_MISSING: 'Validate code is missing',
        VALIDATE_CODE_INVALID: 'Validate code is invalid',
        BIOMETRICS_REGISTERED: 'Biometrics registration successful',
        UNABLE_TO_AUTHORIZE: 'Authorization failed with provided credentials',
        AUTHORIZATION_SUCCESSFUL: 'User authorized successfully',
        BAD_REQUEST: 'Bad request',
        UNKNOWN_RESPONSE: 'Unrecognized response type',
    },
} as const;

/**
 * Maps API endpoints to their HTTP status codes and corresponding reason messages.
 */
/* eslint-disable @typescript-eslint/naming-convention */
const API_RESPONSE_MAP = {
    UNKNOWN: REASON.BACKEND.UNKNOWN_RESPONSE,
    REQUEST_AUTHENTICATION_CHALLENGE: {
        401: REASON.BACKEND.REGISTRATION_REQUIRED,
        200: REASON.BACKEND.CHALLENGE_GENERATED,
    },
    REGISTER_AUTHENTICATION_KEY: {
        422: REASON.BACKEND.KEY_INFO_MISSING,
        409: REASON.BACKEND.KEY_ALREADY_REGISTERED,
        401: REASON.BACKEND.VALIDATE_CODE_MISSING,
        400: REASON.BACKEND.VALIDATE_CODE_INVALID,
        200: REASON.BACKEND.BIOMETRICS_REGISTERED,
    },
    TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION: {
        401: REASON.BACKEND.REGISTRATION_REQUIRED,
        409: REASON.BACKEND.UNABLE_TO_AUTHORIZE,
        200: REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
        400: REASON.BACKEND.BAD_REQUEST,
    },
} as const;
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Factor origin types for multifactor authentication.
 */
const MULTIFACTOR_AUTHENTICATION_FACTOR_ORIGIN = {
    BIOMETRICS: 'Biometrics',
    ADDITIONAL: 'Additional',
} as const;

/**
 * Available multifactor authentication factors.
 */
const MULTIFACTOR_AUTHENTICATION_FACTORS = {
    SIGNED_CHALLENGE: 'SIGNED_CHALLENGE',
    VALIDATE_CODE: 'VALIDATE_CODE',
} as const;

/**
 * Centralized constants used by the multifactor authentication biometrics flow.
 * It is stored here instead of the CONST file to avoid circular dependencies.
 */
const MULTIFACTOR_AUTHENTICATION_VALUES = {
    /**
     * EdDSA key type identifier referred to as EdDSA in the Auth system.
     */
    ED25519_TYPE: 'biometric',
    /**
     * Key alias identifiers for secure storage.
     */
    KEY_ALIASES: {
        PUBLIC_KEY: '3DS_SCA_KEY_PUBLIC',
    },
    /**
     * Defines the requirements and configuration for each authentication factor.
     */
    FACTORS_REQUIREMENTS: {
        SIGNED_CHALLENGE: {
            id: MULTIFACTOR_AUTHENTICATION_FACTORS.SIGNED_CHALLENGE,
            name: 'Signed Challenge',
            parameter: 'signedChallenge',
            length: undefined,
            origin: MULTIFACTOR_AUTHENTICATION_FACTOR_ORIGIN.BIOMETRICS,
        },
        VALIDATE_CODE: {
            id: MULTIFACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE,
            name: 'Email One-Time Password',
            parameter: 'validateCode',
            length: 6,
            origin: MULTIFACTOR_AUTHENTICATION_FACTOR_ORIGIN.ADDITIONAL,
        },
    },
    FACTORS_ORIGIN: MULTIFACTOR_AUTHENTICATION_FACTOR_ORIGIN,
    SCENARIO,
    TYPE: {
        BIOMETRICS: 'BIOMETRICS',
    },
    CHALLENGE_TYPE: {
        REGISTRATION: 'registration',
        AUTHENTICATION: 'authentication',
    },
    FACTORS: MULTIFACTOR_AUTHENTICATION_FACTORS,
    API_RESPONSE_MAP,
    REASON,
} as const;

export default MULTIFACTOR_AUTHENTICATION_VALUES;
