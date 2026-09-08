import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationScenarioResponse} from '@components/MultifactorAuthentication/config/types';
import type {MultifactorAuthenticationInitEvent} from '@components/MultifactorAuthentication/machine/types';

import {PASSKEY_AUTH_TYPE} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import {createLocalMFAError, createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {AuthTypeInfo} from '@libs/MultifactorAuthentication/shared/types';

import {createScenarioActionRunner} from '@userActions/MultifactorAuthentication/processing';

import CONST from '@src/CONST';

const MFA_TEST_SCENARIO_NAME = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST;
const MFA_TEST_ACCOUNT_ID = 12345;
const MFA_TEST_VALIDATE_CODE = '123456';
const MFA_TEST_REGISTRATION_CHALLENGE: RegistrationChallenge = {
    challenge: 'registration-challenge',
    rp: {id: 'expensify.com'},
    user: {id: 'mfa-test-user', displayName: 'MFA Test User'},
    pubKeyCredParams: [{type: 'public-key', alg: -7}],
    timeout: 60000,
};
const MFA_TEST_AUTHENTICATION_CHALLENGE: AuthenticationChallenge = {
    challenge: 'authentication-challenge',
    rpId: 'expensify.com',
    allowCredentials: [{type: 'public-key', id: 'mfa-test-credential-id'}],
    userVerification: 'required',
    timeout: 60000,
};
const MFA_TEST_AUTH_METHOD: AuthTypeInfo = {name: PASSKEY_AUTH_TYPE.NAME, marqetaValue: PASSKEY_AUTH_TYPE.MARQETA_VALUE};
const MFA_TEST_SCENARIO_RESPONSE: MultifactorAuthenticationScenarioResponse = {httpStatusCode: 200, reason: undefined, message: undefined};
const MFA_TEST_INVALID_CODE_ERROR = createMFAErrorFromApiResponse(400, CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.INVALID_VALIDATE_CODE, 'Graph-traversal invalid code');
const MFA_TEST_FATAL_REGISTRATION_CHALLENGE_ERROR = createMFAErrorFromApiResponse(
    400,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.UNRECOGNIZED,
    'Graph-traversal fatal registration challenge rejection',
);
// A reason outside the two device-check reasons, so the walk lands on the generic failure copy.
const MFA_TEST_CREDENTIAL_CREATION_ERROR = createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.KEY_CREATION_FAILED, 'Graph-traversal credential creation failure');
const MFA_TEST_AUTHORIZATION_ORDINARY_ERROR = createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.CANCELED, 'Graph-traversal authorization cancellation');

/** Builds the INIT event fixture. Device-local registration state is loaded by the machine after initialization. */
function createInitEvent(): MultifactorAuthenticationInitEvent<typeof MFA_TEST_SCENARIO_NAME> {
    const scenario = getScenarioConfig(MFA_TEST_SCENARIO_NAME);
    return {
        type: 'INIT',
        accountID: MFA_TEST_ACCOUNT_ID,
        scenarioName: MFA_TEST_SCENARIO_NAME,
        scenario,
        payload: undefined,
        runScenarioAction: createScenarioActionRunner(MFA_TEST_SCENARIO_NAME, scenario.action, undefined),
    };
}

export default createInitEvent;
export {
    MFA_TEST_ACCOUNT_ID,
    MFA_TEST_AUTH_METHOD,
    MFA_TEST_AUTHENTICATION_CHALLENGE,
    MFA_TEST_AUTHORIZATION_ORDINARY_ERROR,
    MFA_TEST_CREDENTIAL_CREATION_ERROR,
    MFA_TEST_FATAL_REGISTRATION_CHALLENGE_ERROR,
    MFA_TEST_INVALID_CODE_ERROR,
    MFA_TEST_REGISTRATION_CHALLENGE,
    MFA_TEST_SCENARIO_RESPONSE,
    MFA_TEST_VALIDATE_CODE,
};
