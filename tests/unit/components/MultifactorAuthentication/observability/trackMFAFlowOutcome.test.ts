import type {MFARegistrationStateSnapshot} from '@components/MultifactorAuthentication/biometrics/captureRegistrationState';
import trackMFAFlowOutcome from '@components/MultifactorAuthentication/observability/trackMFAFlowOutcome';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

jest.mock('@sentry/react-native', () => ({captureMessage: jest.fn()}));
jest.mock('@libs/Log', () => ({__esModule: true, default: {info: jest.fn(), warn: jest.fn()}}));

// Read back through `requireMock` rather than off the imported modules: the mock factories are hoisted
// above every `const` in this file, and property-typed handles keep the assertions out of
// `@typescript-eslint/unbound-method`'s way.
const {captureMessage: mockCaptureMessage} = jest.requireMock<{captureMessage: jest.Mock}>('@sentry/react-native');
const {info: mockLogInfo, warn: mockLogWarn} = jest.requireMock<{default: {info: jest.Mock; warn: jest.Mock}}>('@libs/Log').default;

const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;
const REGISTRATION_STATE: MFARegistrationStateSnapshot = {hasServerCredentials: true, hasLocalCredentials: true, hasEverAcceptedSoftPrompt: true};

// The reveal scenarios put the card PIN and the PAN/expiration/CVV in the scenario response body, so
// this exact object must never reach Sentry or the logs through any path out of the tracker.
const RECOVERED_FROM = {reason: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED, step: CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.SIGNING_CHALLENGE};
const SECRET_BODY = {pin: '4321', pan: '4111111111111111', cvv: '737'};

type FlowOutcomeContext = Parameters<typeof trackMFAFlowOutcome>[0];

function buildContext(overrides: Partial<FlowOutcomeContext> = {}): FlowOutcomeContext {
    return {
        isSuccessful: true,
        scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.REVEAL_PIN,
        scenarioResponse: {httpStatusCode: 200, reason: undefined, message: undefined, body: SECRET_BODY},
        error: undefined,
        authenticationMethod: undefined,
        isRegistrationComplete: false,
        isAuthorizationComplete: true,
        softPromptApproved: false,
        recoveryAttempts: 0,
        recoveredFrom: undefined,
        startState: REGISTRATION_STATE,
        endState: REGISTRATION_STATE,
        ...overrides,
    };
}

/** Every argument the tracker handed to Sentry and to the logger during one call, flattened for a single containment check. */
function everythingReported(): string {
    return JSON.stringify([mockCaptureMessage.mock.calls, mockLogWarn.mock.calls, mockLogInfo.mock.calls]);
}

describe('trackMFAFlowOutcome', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('reports the scenario response status, reason and message but never its body', () => {
        trackMFAFlowOutcome(buildContext({scenarioResponse: {httpStatusCode: 403, reason: REASON.CLIENT_ERRORS.UNRECOGNIZED, message: 'reveal refused', body: SECRET_BODY}}));

        expect(mockLogInfo).toHaveBeenCalledWith(
            '[MFA] MFA Flow Success',
            false,
            expect.objectContaining({mfa: expect.objectContaining({scenarioResponse: {httpStatusCode: 403, reason: REASON.CLIENT_ERRORS.UNRECOGNIZED, message: 'reveal refused'}})}),
        );
        expect(everythingReported()).not.toContain(SECRET_BODY.pin);
        expect(everythingReported()).not.toContain(SECRET_BODY.pan);
    });

    it('never sends the response body to Sentry on the error path', () => {
        trackMFAFlowOutcome(buildContext({isSuccessful: false, error: createLocalMFAError(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, 'reveal blew up')}));

        expect(mockCaptureMessage).toHaveBeenCalledTimes(1);
        expect(mockLogWarn).toHaveBeenCalledTimes(1);
        expect(everythingReported()).not.toContain(SECRET_BODY.pin);
        expect(everythingReported()).not.toContain(SECRET_BODY.cvv);
    });

    it('reports the recovery a successful flow needed and the failure it started from', () => {
        // Given a flow that succeeded after recovering from `Registration required`
        const context = buildContext({recoveryAttempts: 1, recoveredFrom: RECOVERED_FROM});

        // When its outcome is tracked
        trackMFAFlowOutcome(context);

        // Then the success log carries the recovery, since a successful flow reports nothing else about it
        expect(mockLogInfo).toHaveBeenCalledWith('[MFA] MFA Flow Success', false, {mfa: expect.objectContaining({recoveryAttempts: 1, recoveredFrom: RECOVERED_FROM})});
    });

    it('tags a failed flow with how many recoveries it went through, so failures after a recovery can be filtered', () => {
        // Given a flow that failed after recovering
        const context = buildContext({
            isSuccessful: false,
            error: createLocalMFAError(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, 'failed after recovery'),
            recoveryAttempts: 1,
            recoveredFrom: RECOVERED_FROM,
        });

        // When its outcome is tracked
        trackMFAFlowOutcome(context);

        // Then the error event is tagged with the recovery count and carries the failure the recovery started from
        expect(mockCaptureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                tags: expect.objectContaining({[CONST.TELEMETRY.TAGS.MFA_RECOVERY_ATTEMPTS]: '1'}),
                extra: expect.objectContaining({recoveryAttempts: 1, recoveredFrom: RECOVERED_FROM}),
            }),
        );
    });

    it('keeps the body out of the fallback log when reporting itself throws', () => {
        // The fallback logs the whole context, so the body has to be gone before the tracker's own
        // try block runs - otherwise a Sentry outage uploads card secrets to the application logs.
        mockCaptureMessage.mockImplementationOnce(() => {
            throw new Error('Sentry is down');
        });

        trackMFAFlowOutcome(buildContext({isSuccessful: false, error: createLocalMFAError(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, 'reveal blew up')}));

        expect(mockLogWarn).toHaveBeenCalledWith(
            '[trackMFAFlowOutcome] Failed to track MFA flow outcome',
            expect.objectContaining({originalContext: expect.objectContaining({scenarioResponse: {httpStatusCode: 200, reason: undefined, message: undefined}})}),
        );
        expect(everythingReported()).not.toContain(SECRET_BODY.pan);
    });
});
