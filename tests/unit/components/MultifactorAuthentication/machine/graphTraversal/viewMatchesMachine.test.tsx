import {act, fireEvent, screen} from '@testing-library/react-native';

import type {MfaActorDoneEvent, MfaInternalEvent, MfaMachineEvent} from '@components/MultifactorAuthentication/machine/machineEvents';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import {mfaNavigationRef} from '@components/MultifactorAuthentication/mfaNavigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type * as MfaRealUiMocks from 'tests/utils/mfa/realUi/mocks';
import type {SnapshotFrom} from 'xstate';

import Onyx from 'react-native-onyx';
import {MFA_TEST_ACCOUNT_ID} from 'tests/utils/mfa/flowFixtures';
import getWalkedPaths, {actorDoneEventType, actorErrorEventType, isAutoDrivenEvent} from 'tests/utils/mfa/flowPaths';
import {getSettleableLeafStates} from 'tests/utils/mfa/leafStates';
import renderMfaUi from 'tests/utils/mfa/realUi/harness';
import {
    checkLocalCredentialsControl,
    pendingModalClose,
    readHasAcceptedSoftPromptControl,
    requestRegistrationChallengeControl,
    resetMfaUiMocks,
    validateDeviceControl,
} from 'tests/utils/mfa/realUi/mocks';
import {translateLocal} from 'tests/utils/TestHelper';
import waitForBatchedUpdatesWithAct from 'tests/utils/waitForBatchedUpdatesWithAct';
import {matchesState} from 'xstate';

// This file tests that the rendered modal matches the machine: it mounts the production providers and
// navigator, drives each machine event as a real gesture, and asserts the UI markers of the reached
// state at every step of every generated path. A state or event added to the machine appears in the
// walked paths automatically, and the type checks and guard suites then demand the hand-written
// pieces it needs, such as an executor or a UI assertion. The machine-only suites live in
// `everyStateReachable.test.ts`, and the guard suites below check that the walk and `testConfig` stay complete.

// This mock forces a wide layout so the navigator renders the backdrop used as the mounted marker.
jest.mock('@hooks/useResponsiveLayout');
// This mock disables the dev-only Stately inspector so `useInspectedMachine` falls back to `useMachine`.
jest.mock('@libs/XStateInspector', () => ({__esModule: true, default: {inspect: undefined}}));

// Jest hoists every `jest.mock` call above the imports, so a factory cannot reference a top-of-file
// import. Each factory below therefore loads the shared mock module through `jest.requireActual`.

// The UI walk needs to control invoked actor outcomes, and the actors' real side effects are outside the modal lifecycle contract.
jest.mock('@components/MultifactorAuthentication/machine/mfaActors', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').mfaActorsMock());
// Native and WebAuthn biometrics are outside the modal lifecycle contract.
jest.mock('@components/MultifactorAuthentication/biometrics/useBiometrics', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').biometricsHookMock());
// RenderHTML requires an ambient provider that this lifecycle test does not mount.
jest.mock('@components/RenderHTML', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').renderHtmlMock());
// The resend countdown is a real-time presentational timer; finishing it immediately keeps the resend button pressable for the walk.
jest.mock('@components/ValidateCodeCountdown', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').validateCodeCountdownMock());
// Browser and Android history synchronization is outside the contract between the machine and UI.
jest.mock('@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').syncHistoryMock());
// The test renderer runs no real navigation transitions, so the mock controls when the transition callbacks fire.
jest.mock('@libs/Navigation/Navigation', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').navigationMock());
// The magic-code email request is a backend call outside the modal lifecycle contract.
jest.mock('@libs/actions/User', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').userActionsMock());

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

// These UI markers distinguish the closed, closing, and outcome states. The backdrop exists only while the MFA navigator is mounted.
const TEST_ID = CONST.MULTIFACTOR_AUTHENTICATION.TEST_ID;

/** Every event the walk drives as a gesture, which is all of them except the ones XState raises on its own. */
type MfaDrivableEventType = Exclude<MfaMachineEvent['type'], MfaInternalEvent['type']>;

/**
 * The step an executor receives. `TestParam` types its event as the bare `{type}`, while the walk
 * passes the fixture it actually drove. Accepting both keeps each executor assignable to what
 * `path.test` expects and still lets it narrow back to the payload.
 */
type MfaExecutorStep<Type extends MfaDrivableEventType> = {event: {type: Type} | Extract<MfaMachineEvent, {type: Type}>};

type MfaEventExecutors = {
    [Type in MfaDrivableEventType]: (step: MfaExecutorStep<Type>) => Promise<void>;
};

type ExecuteScenario = ReturnType<typeof renderMfaUi>['executeScenario'];

function getInitEvent(step: MfaExecutorStep<'INIT'>) {
    if (!('scenario' in step.event)) {
        throw new Error('MFA INIT executor received a path event without the scenario fixture payload.');
    }
    return step.event;
}

function getValidateCode(step: MfaExecutorStep<'VALIDATE_CODE_ENTERED'>) {
    if (!('validateCode' in step.event)) {
        throw new Error('MFA VALIDATE_CODE_ENTERED executor received a path event without the code fixture payload.');
    }
    return step.event.validateCode;
}

/**
 * Reads the output an actor resolved with. The generic recovers it from the step's own fixture member,
 * because a mapped executor type cannot infer the actor id back out of an `Extract`.
 */
function getActorDoneOutput<TOutput>(step: {event: {type: MfaActorDoneEvent['type']} | {type: MfaActorDoneEvent['type']; output: TOutput}}): TOutput {
    if (!('output' in step.event)) {
        throw new Error(`Actor done executor received event "${step.event.type}" without output.`);
    }
    return step.event.output;
}

/**
 * Maps every machine event to the action that produces it in the rendered app, such as a button press
 * or a navigator callback. The walk drives each path step through this table, and the `satisfies`
 * clause makes a machine event without an executor fail compilation. The executors act on a concrete
 * render, so each test builds them from its own `executeScenario`.
 */
/* eslint-disable @typescript-eslint/naming-convention -- keys mirror the machine's event type union. */
function createMfaEventExecutors(executeScenario: ExecuteScenario) {
    const settleActor = async (settle: () => void) => {
        await act(async () => settle());
    };

    return {
        INIT: async (step) => {
            const event = getInitEvent(step);
            await act(async () => {
                await executeScenario(event.scenarioName, event.payload);
            });
            await waitForBatchedUpdatesWithAct();
            // The test renderer does not calculate layout, so dispatch the event through the rendered View to exercise its onLayout wiring.
            fireEvent(screen.getByTestId(TEST_ID.INITIAL_SCREEN), 'layout', {
                nativeEvent: {layout: {width: 1, height: 1, x: 0, y: 0}},
            });
            await waitForBatchedUpdatesWithAct();
        },
        CLOSE_MODAL: async () => {
            if (screen.queryByTestId(TEST_ID.OUTCOME_SCREEN)) {
                fireEvent.press(screen.getByTestId(TEST_ID.OUTCOME_CONFIRM_BUTTON));
            } else {
                fireEvent.press(screen.getByTestId(TEST_ID.MODAL_BACKDROP));
            }
            await waitForBatchedUpdatesWithAct();
        },
        MODAL_CLOSED: async () => {
            act(() => pendingModalClose.run());
            await waitForBatchedUpdatesWithAct();
        },
        SOFT_PROMPT_APPROVED: async () => {
            fireEvent.press(screen.getByTestId(TEST_ID.PROMPT_CONFIRM_BUTTON));
            await waitForBatchedUpdatesWithAct();
        },
        VALIDATE_CODE_ENTERED: async (step) => {
            fireEvent.changeText(screen.getByTestId(TEST_ID.VALIDATE_CODE_INPUT), getValidateCode(step));
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByTestId(TEST_ID.VALIDATE_CODE_SUBMIT_BUTTON));
            await waitForBatchedUpdatesWithAct();
        },
        RESEND_VALIDATE_CODE: async () => {
            fireEvent.press(screen.getByTestId(TEST_ID.VALIDATE_CODE_RESEND_BUTTON));
            await waitForBatchedUpdatesWithAct();
        },
        VALIDATE_CODE_CHANGED: async () => {
            fireEvent.changeText(screen.getByTestId(TEST_ID.VALIDATE_CODE_INPUT), '1');
            await waitForBatchedUpdatesWithAct();
        },
        [actorDoneEventType('validateDevice')]: (step) => settleActor(() => validateDeviceControl.resolve(getActorDoneOutput(step))),
        [actorErrorEventType('validateDevice')]: () => settleActor(validateDeviceControl.reject),
        [actorDoneEventType('readHasAcceptedSoftPrompt')]: (step) => settleActor(() => readHasAcceptedSoftPromptControl.resolve(getActorDoneOutput(step))),
        [actorErrorEventType('readHasAcceptedSoftPrompt')]: () => settleActor(readHasAcceptedSoftPromptControl.reject),
        [actorDoneEventType('checkLocalCredentials')]: (step) => settleActor(() => checkLocalCredentialsControl.resolve(getActorDoneOutput(step))),
        [actorErrorEventType('checkLocalCredentials')]: () => settleActor(checkLocalCredentialsControl.reject),
        [actorDoneEventType('requestRegistrationChallenge')]: (step) => settleActor(() => requestRegistrationChallengeControl.resolve(getActorDoneOutput(step))),
        [actorErrorEventType('requestRegistrationChallenge')]: () => settleActor(requestRegistrationChallengeControl.reject),
    } satisfies MfaEventExecutors;
}
/* eslint-enable @typescript-eslint/naming-convention */

// Dot-path state keys let `matchesState` target nested leaves such as `open.outcome.success`.
const testConfig = {
    states: {
        [MFA_STATE.CLOSED]: () => {
            expect(screen.queryAllByTestId(TEST_ID.MODAL_BACKDROP)).toHaveLength(0);
            expect(screen.queryAllByTestId(TEST_ID.OUTCOME_SCREEN)).toHaveLength(0);
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.PREPARING}.${MFA_STATE.VALIDATING_DEVICE}`]: () => {
            expect(screen.queryAllByTestId(TEST_ID.MODAL_BACKDROP)).toHaveLength(1);
            expect(screen.queryAllByTestId(TEST_ID.INITIAL_SCREEN)).toHaveLength(1);
            expect(screen.queryAllByTestId(TEST_ID.OUTCOME_SCREEN)).toHaveLength(0);
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.PREPARING}.${MFA_STATE.DECIDING_REGISTRATION}`]: (state: SnapshotFrom<typeof mfaMachine>) => {
            expect(screen.queryAllByTestId(TEST_ID.MODAL_BACKDROP)).toHaveLength(1);
            expect(screen.queryAllByTestId(TEST_ID.INITIAL_SCREEN)).toHaveLength(1);
            expect(screen.queryAllByTestId(TEST_ID.OUTCOME_SCREEN)).toHaveLength(0);
            expect(state.context.error).toBeUndefined();
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.PREPARING}.${MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}`]: (state: SnapshotFrom<typeof mfaMachine>) => {
            expect(screen.queryAllByTestId(TEST_ID.MODAL_BACKDROP)).toHaveLength(1);
            expect(screen.queryAllByTestId(TEST_ID.OUTCOME_SCREEN)).toHaveLength(0);
            // A stored code means the flow re-entered this check from the magic-code screen, which
            // stays visible while the read runs; a first pass runs behind the transparent initial screen.
            if (state.context.validateCode === undefined) {
                expect(screen.queryAllByTestId(TEST_ID.INITIAL_SCREEN)).toHaveLength(1);
                expect(state.context.registrationChallenge).toBeUndefined();
            } else {
                expect(mfaNavigationRef.getCurrentRoute()?.name).toBe(SCREENS.MULTIFACTOR_AUTHENTICATION.MAGIC_CODE);
                expect(state.context.registrationChallenge).toBeDefined();
                // The magic-code screen stays visible during this read, but the machine no longer
                // accepts resend requests after a valid code has advanced the flow.
                expect(screen.getByTestId(TEST_ID.VALIDATE_CODE_RESEND_BUTTON)).toBeDisabled();
            }
            expect(state.context.accountID).toBeDefined();
            expect(state.context.error).toBeUndefined();
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.MAGIC_CODE}.${MFA_STATE.AWAITING_VALIDATE_CODE}`]: (state: SnapshotFrom<typeof mfaMachine>) => {
            expect(screen.queryAllByTestId(TEST_ID.MODAL_BACKDROP)).toHaveLength(1);
            expect(screen.queryAllByTestId(TEST_ID.OUTCOME_SCREEN)).toHaveLength(0);
            expect(mfaNavigationRef.getCurrentRoute()?.name).toBe(SCREENS.MULTIFACTOR_AUTHENTICATION.MAGIC_CODE);
            expect(screen.getByTestId(TEST_ID.VALIDATE_CODE_INPUT)).toBeOnTheScreen();
            expect(screen.getByTestId(TEST_ID.VALIDATE_CODE_SUBMIT_BUTTON)).toBeOnTheScreen();
            // The countdown mock finishes immediately, so the resend button is rendered and must be pressable while the screen waits for a code.
            expect(screen.getByTestId(TEST_ID.VALIDATE_CODE_RESEND_BUTTON)).toBeEnabled();
            expect(screen.getByText(translateLocal('multifactorAuthentication.letsVerifyItsYou'))).toBeOnTheScreen();
            expect(state.context.error).toBeUndefined();
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.MAGIC_CODE}.${MFA_STATE.AWAITING_VALIDATE_CODE}.${MFA_STATE.IDLE}`]: () => {
            expect(screen.queryByText(translateLocal('validateCodeForm.error.incorrectSecurityCode'))).not.toBeOnTheScreen();
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.MAGIC_CODE}.${MFA_STATE.AWAITING_VALIDATE_CODE}.${MFA_STATE.INVALID_CODE}`]: () => {
            expect(screen.getByText(translateLocal('validateCodeForm.error.incorrectSecurityCode'))).toBeOnTheScreen();
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.MAGIC_CODE}.${MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE}`]: (state: SnapshotFrom<typeof mfaMachine>) => {
            expect(screen.queryAllByTestId(TEST_ID.MODAL_BACKDROP)).toHaveLength(1);
            expect(screen.queryAllByTestId(TEST_ID.OUTCOME_SCREEN)).toHaveLength(0);
            expect(mfaNavigationRef.getCurrentRoute()?.name).toBe(SCREENS.MULTIFACTOR_AUTHENTICATION.MAGIC_CODE);
            expect(screen.getByTestId(TEST_ID.VALIDATE_CODE_INPUT)).toBeOnTheScreen();
            // The machine drops a resend while the challenge request is in flight, so the button must not offer one.
            expect(screen.getByTestId(TEST_ID.VALIDATE_CODE_RESEND_BUTTON)).toBeDisabled();
            expect(state.context.validateCode).toBeDefined();
            expect(state.context.registrationChallenge).toBeUndefined();
            expect(state.context.error).toBeUndefined();
        },
        // The biometrics copy is expected because the jest-expo haste config resolves the operations
        // module to its native variant, which verifies with HSM-backed biometrics.
        [`${MFA_STATE.OPEN}.${MFA_STATE.PROMPT}.${MFA_STATE.AWAITING_SOFT_PROMPT}`]: (state: SnapshotFrom<typeof mfaMachine>) => {
            expect(screen.queryAllByTestId(TEST_ID.MODAL_BACKDROP)).toHaveLength(1);
            expect(screen.queryAllByTestId(TEST_ID.OUTCOME_SCREEN)).toHaveLength(0);
            expect(mfaNavigationRef.getCurrentRoute()?.name).toBe(SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT);
            expect(screen.getByTestId(TEST_ID.PROMPT_CONFIRM_BUTTON)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('multifactorAuthentication.verifyYourself.biometrics'))).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('multifactorAuthentication.enableQuickVerification.biometrics'))).toBeOnTheScreen();
            expect(state.context.error).toBeUndefined();
            expect(state.context.softPromptApproved).toBe(false);
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.OUTCOME}.${MFA_STATE.SUCCESS}`]: (state: SnapshotFrom<typeof mfaMachine>) => {
            expect(screen.queryAllByTestId(TEST_ID.MODAL_BACKDROP)).toHaveLength(1);
            expect(screen.queryAllByTestId(TEST_ID.OUTCOME_SCREEN)).toHaveLength(1);
            expect(screen.getByText(translateLocal('multifactorAuthentication.biometricsTest.authenticationSuccessful'))).toBeOnTheScreen();
            expect(mfaNavigationRef.getCurrentRoute()?.name).toBe(SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS);
            expect(state.context.error).toBeUndefined();
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.OUTCOME}.${MFA_STATE.FAILURE}`]: (state: SnapshotFrom<typeof mfaMachine>) => {
            expect(screen.queryAllByTestId(TEST_ID.MODAL_BACKDROP)).toHaveLength(1);
            expect(screen.queryAllByTestId(TEST_ID.OUTCOME_SCREEN)).toHaveLength(1);
            expect(mfaNavigationRef.getCurrentRoute()?.name).toBe(SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_FAILURE);
            expect(state.context.error).toBeDefined();
            // The mock actor produces the same error the graph snapshot carries, so each branch can
            // assert the exact screen mapped for that error. The default client failure screen shows
            // the failure copy in both its header and its body title.
            if (state.context.error?.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED) {
                expect(screen.getByText(translateLocal('multifactorAuthentication.unsupportedDevice.unsupportedDevice'))).toBeOnTheScreen();
            } else if (state.context.error?.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED) {
                expect(screen.getByText(translateLocal('multifactorAuthentication.biometricsTest.youCouldNotBeAuthenticated'))).toBeOnTheScreen();
            } else {
                expect(screen.getAllByText(translateLocal('multifactorAuthentication.verificationFailed'))).toHaveLength(2);
            }
        },
        [MFA_STATE.CLOSING]: () => {
            expect(screen.queryAllByTestId(TEST_ID.MODAL_BACKDROP)).toHaveLength(1);
            // The outcome stays mounted during the production close animation, while the test renderer processes
            // goBack() synchronously. Its presence is therefore not part of the closing-state contract.
        },
    },
};

const walkedPaths = getWalkedPaths();

/**
 * Builds the event part of a test name. Framework-generated init and actor-settlement events are
 * excluded because they are not UI gestures.
 */
function describeDrivenEvents(steps: ReadonlyArray<{event: {type: string}}>): string {
    const drivenEventLabels = steps
        .map((step) => step.event)
        .filter((event) => !isAutoDrivenEvent(event.type))
        .map((event) => event.type);
    return drivenEventLabels.length > 0 ? drivenEventLabels.join(' -> ') : 'no driven events';
}

const walkedPathTestCases = walkedPaths.map((path) => ({
    title: `stays in sync with the machine along [${describeDrivenEvents(path.steps)}] to ${JSON.stringify(path.state.value)}`,
    path,
}));

describe('the real MFA modal matches the machine at every step of every generated path', () => {
    // The navigation buffer is deliberately not reset here. The machine resets it when it enters
    // `closed`, which also runs when each test's fresh actor starts, so a reset here would hide a
    // machine that stopped doing that cleanup. Onyx is cleared because approving the soft prompt
    // persists the acceptance, and no path may depend on what an earlier path stored. The session
    // account is then seeded because the MFA context rejects a flow start while the account is
    // still the hydration placeholder.
    beforeEach(async () => {
        resetMfaUiMocks();
        await act(async () => {
            await Onyx.clear();
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: MFA_TEST_ACCOUNT_ID});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it.each(walkedPathTestCases)('$title', async ({path}) => {
        const {executeScenario} = renderMfaUi();
        await waitForBatchedUpdatesWithAct();
        await path.test({...testConfig, events: createMfaEventExecutors(executeScenario)});
    });
});

// Every settleable leaf must occur in a path that the walk above drives. `everyStateReachable.test.ts`
// checks the unfiltered graph, so only this guard catches a state whose every route needs a step the
// walk cannot drive, such as a delayed transition. Paths removed as prefixes of longer paths do not
// reduce state coverage because `path.test` asserts every step.
describe('every settleable MFA state is reached by the UI walk', () => {
    const walkedStateValues = walkedPaths.flatMap((path) => path.steps.map((step) => step.state.value));

    it.each(getSettleableLeafStates(mfaMachine.root))('$description is reached through the real UI', ({description}) => {
        expect(walkedStateValues.some((reached) => matchesState(description, reached))).toBe(true);
    });
});

// TestModel runs only the state assertions whose keys match the reached state, so if no key matches a
// state, the test passes without checking it. These guards fail in that case.
//
// A type cannot enforce this, because TypeScript does not know which states auto-advance. A
// `Record` over all leaf states would then need empty assertions for the pass-through states, and an
// empty assertion keeps passing silently.
describe('testConfig defines a UI assertion for every settleable state and for nothing else', () => {
    const settleableLeafStates = getSettleableLeafStates(mfaMachine.root);
    const configuredStateKeys = Object.keys(testConfig.states);

    it.each(settleableLeafStates)('$description has a UI assertion', ({description}) => {
        expect(configuredStateKeys.some((key) => matchesState(key, description))).toBe(true);
    });

    it.each(configuredStateKeys.map((key) => ({key})))('$key matches a real settleable state', ({key}) => {
        expect(settleableLeafStates.some((leaf) => matchesState(key, leaf.description))).toBe(true);
    });
});
