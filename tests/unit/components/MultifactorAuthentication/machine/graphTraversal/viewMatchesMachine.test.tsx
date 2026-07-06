import {act, fireEvent, screen} from '@testing-library/react-native';
import {MFA_TEST_SCENARIO_NAME} from 'tests/utils/mfa/flowFixtures';
import getWalkedPaths from 'tests/utils/mfa/flowPaths';
import renderMfaUi from 'tests/utils/mfa/realUi/harness';
import {pendingModalClose, resetMfaUiMocks} from 'tests/utils/mfa/realUi/mocks';
import type * as MfaRealUiMocks from 'tests/utils/mfa/realUi/mocks';
import getSettleableLeafStates from 'tests/utils/mfa/settleableLeafStates';
import waitForBatchedUpdatesWithAct from 'tests/utils/waitForBatchedUpdatesWithAct';
import {matchesState} from 'xstate';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';
import {handleInitialScreenLayout, mfaNavigationRef} from '@components/MultifactorAuthentication/mfaNavigation';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

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
// Native and WebAuthn biometrics are outside the modal lifecycle contract. Jest hoists every `jest.mock`
// call above the imports, so a factory cannot reference a top-of-file import and each factory below loads
// the shared mock module through `jest.requireActual` instead.
jest.mock('@components/MultifactorAuthentication/biometrics/useBiometrics', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').biometricsHookMock());
// Browser and Android history synchronization is outside the contract between the machine and UI.
jest.mock('@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').syncHistoryMock());
// jsdom runs no real navigation transitions, so the mock controls when the transition callbacks fire.
jest.mock('@libs/Navigation/Navigation', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').navigationMock());

// These UI markers distinguish the closed, closing, and outcome states. The backdrop exists only while
// the MFA navigator is mounted.
const OUTCOME_SCREEN_TEST_ID = 'MultifactorAuthenticationOutcomeScreen';
const MODAL_BACKDROP_TEST_ID = 'MultifactorAuthenticationModalBackdrop';

// This stable testID keeps the test independent of translated button text.
const CONFIRM_BUTTON_TEST_ID = 'MultifactorAuthenticationOutcomeConfirmButton';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

type MfaEventType = MfaEvent['type'];

type MfaEventExecutor = () => Promise<void>;

type ExecuteScenario = ReturnType<typeof renderMfaUi>['executeScenario'];

/**
 * Maps every machine event to the action that produces it in the rendered app, such as a button press
 * or a navigator callback. The walk drives each path step through this table, and the `satisfies`
 * clause makes a machine event without an executor fail compilation. The executors act on a concrete
 * render, so each test builds them from its own `executeScenario`.
 */
/* eslint-disable @typescript-eslint/naming-convention -- keys mirror the machine's event type union. */
function createMfaEventExecutors(executeScenario: ExecuteScenario) {
    return {
        INIT: async () => {
            await act(async () => {
                await executeScenario(MFA_TEST_SCENARIO_NAME);
            });
            await waitForBatchedUpdatesWithAct();
            // The initial screen's `onLayout` does not fire in jsdom, so the test calls the same handler to flush the
            // buffered navigation.
            act(() => handleInitialScreenLayout());
            await waitForBatchedUpdatesWithAct();
        },
        CLOSE_MODAL: async () => {
            fireEvent.press(screen.getByTestId(CONFIRM_BUTTON_TEST_ID));
            await waitForBatchedUpdatesWithAct();
        },
        MODAL_CLOSED: async () => {
            act(() => pendingModalClose.run());
            await waitForBatchedUpdatesWithAct();
        },
    } satisfies Record<MfaEventType, MfaEventExecutor>;
}
/* eslint-enable @typescript-eslint/naming-convention */

// Dot-path state keys let `matchesState` target nested leaves such as `open.outcome.success`.
const testConfig = {
    states: {
        [MFA_STATE.CLOSED]: () => {
            expect(screen.queryAllByTestId(MODAL_BACKDROP_TEST_ID)).toHaveLength(0);
            expect(screen.queryAllByTestId(OUTCOME_SCREEN_TEST_ID)).toHaveLength(0);
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.OUTCOME}.${MFA_STATE.SUCCESS}`]: () => {
            expect(screen.queryAllByTestId(MODAL_BACKDROP_TEST_ID)).toHaveLength(1);
            expect(screen.queryAllByTestId(OUTCOME_SCREEN_TEST_ID)).toHaveLength(1);
            // Every outcome screen renders the same `OutcomeScreenBase`, so the route name identifies which one is on top.
            expect(mfaNavigationRef.getCurrentRoute()?.name).toBe(SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS);
        },
        [MFA_STATE.CLOSING]: () => {
            expect(screen.queryAllByTestId(MODAL_BACKDROP_TEST_ID)).toHaveLength(1);
            // The outcome stays mounted during the production close animation, while jsdom's goBack()
            // removes it synchronously. Its presence is therefore not part of the closing-state contract.
        },
    },
};

const walkedPaths = getWalkedPaths();

const INIT_STEP_EVENT_TYPE = 'xstate.init';

/**
 * Builds the event part of a test name. The synthetic `xstate.init` event is excluded because it is
 * not part of `MfaEvent`.
 */
function describeDrivenEvents(steps: ReadonlyArray<{event: {type: string}}>): string {
    const drivenEventLabels = steps
        .map((step) => step.event)
        .filter((event) => event.type !== INIT_STEP_EVENT_TYPE)
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
    // machine that stopped doing that cleanup.
    beforeEach(() => {
        resetMfaUiMocks();
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
