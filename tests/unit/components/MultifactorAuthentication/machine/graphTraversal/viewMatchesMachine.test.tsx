import {act, fireEvent, screen} from '@testing-library/react-native';
import {describeTraversalEvent, isTestScenarioInitEvent} from 'tests/utils/mfa/flowFixtures';
import getWalkedPaths from 'tests/utils/mfa/flowPaths';
import {getMfaControls, renderMfaUi} from 'tests/utils/mfa/realUi/harness';
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

// This file pins the contract between the machine and the rendered modal: it mounts the production
// providers and navigator, drives each machine event as a real gesture, and asserts the UI markers of
// the reached state at every step of every generated path. The paths come from `getWalkedPaths`, so a
// state or event added to the machine gains steps here without edits. The chart-only suites live in
// `everyStateReachable.test.ts`, and the guards on the generated coverage in `coverageStaysComplete.test.ts`.

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
// This mock reuses the shared Navigation implementation and overrides the transition methods used by the MFA flow.
jest.mock('@libs/Navigation/Navigation', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').navigationMock());

// These UI markers distinguish the closed, closing, and outcome states. `OutcomeScreenBase` identifies the
// outcome screen, while the backdrop exists only when the MFA navigator is mounted. Every outcome screen
// renders the same `OutcomeScreenBase`, so the success assertion also checks the route name to pin which
// outcome screen is on top.
const OUTCOME_SCREEN_TEST_ID = 'OutcomeScreenBase';
const MODAL_BACKDROP_TEST_ID = 'MultifactorAuthenticationModalBackdrop';

// This stable testID keeps the test independent of translated button text.
const CONFIRM_BUTTON_TEST_ID = 'MultifactorAuthenticationOutcomeConfirmButton';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

type MfaEventType = MfaEvent['type'];
// The event carries only its `type` here because `xstate/graph` erases the payload from the executor's
// step type. The INIT executor recovers the payload through `isTestScenarioInitEvent`.
type MfaEventExecutor = (step: {event: {type: MfaEventType}}) => Promise<void>;

/**
 * `INIT` enters through the public API with the scenario and payload of the step's own event, so paths
 * built from different INIT fixtures drive different flows. `MODAL_CLOSED` runs the navigator's teardown
 * callback. `satisfies Record<MfaEventType, ...>` requires an explicit executor for every machine event.
 */
/* eslint-disable @typescript-eslint/naming-convention -- keys mirror the machine's event type union. */
const mfaEventExecutors = {
    INIT: async ({event}) => {
        if (!isTestScenarioInitEvent(event)) {
            throw new Error(`The INIT executor received an event outside the test-scenario fixtures: ${JSON.stringify(event)}`);
        }
        await act(async () => {
            await getMfaControls().executeScenario(event.scenarioName, event.payload);
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
/* eslint-enable @typescript-eslint/naming-convention */

// Dot-path state keys let `matchesState` target nested leaves such as `open.outcome.success`.
const testConfig = {
    events: mfaEventExecutors,
    states: {
        [MFA_STATE.CLOSED]: () => {
            expect(screen.queryAllByTestId(MODAL_BACKDROP_TEST_ID)).toHaveLength(0);
            expect(screen.queryAllByTestId(OUTCOME_SCREEN_TEST_ID)).toHaveLength(0);
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.OUTCOME}.${MFA_STATE.SUCCESS}`]: () => {
            expect(screen.queryAllByTestId(MODAL_BACKDROP_TEST_ID)).not.toHaveLength(0);
            expect(screen.queryAllByTestId(OUTCOME_SCREEN_TEST_ID)).not.toHaveLength(0);
            expect(mfaNavigationRef.getCurrentRoute()?.name).toBe(SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS);
        },
        [MFA_STATE.CLOSING]: () => {
            expect(screen.queryAllByTestId(MODAL_BACKDROP_TEST_ID)).not.toHaveLength(0);
            expect(screen.queryAllByTestId(OUTCOME_SCREEN_TEST_ID)).toHaveLength(0);
        },
    },
};

const walkedPaths = getWalkedPaths();

// `path.description` serializes the complete event payload, so test names use the short labels from
// `describeTraversalEvent` instead. The synthetic `xstate.init` event is excluded because it is not part
// of `MfaEvent`.
const INIT_STEP_EVENT_TYPE = 'xstate.init';
function describeDrivenEvents(steps: ReadonlyArray<{event: {type: string}}>): string {
    const drivenEventLabels = steps
        .map((step) => step.event)
        .filter((event) => event.type !== INIT_STEP_EVENT_TYPE)
        .map(describeTraversalEvent);
    return drivenEventLabels.length > 0 ? drivenEventLabels.join(' -> ') : 'no driven events';
}

describe('the real MFA modal matches the machine at every step of every generated path', () => {
    // The navigation buffer is deliberately not reset here. The machine owns that cleanup on `closed`
    // entry, which also runs when each test's fresh actor starts, so a reset here would hide a machine
    // that stopped performing it.
    beforeEach(() => {
        resetMfaUiMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    for (const path of walkedPaths) {
        it(`stays in sync with the machine along [${describeDrivenEvents(path.steps)}] to ${JSON.stringify(path.state.value)}`, async () => {
            renderMfaUi();
            await waitForBatchedUpdatesWithAct();
            await path.test(testConfig);
        });
    }
});

// TestModel runs only the state assertions whose keys match the reached state, so if no key matches a
// state, the test passes without checking it. These guards fail in that case.
//
// Types cannot do this. TypeScript's inferred type does not record whether a state has an `always`
// transition, so it cannot tell a real leaf from a pass-through state such as `{open: "preparing"}`. A
// `Record<leaf, ...>` would then need an empty assertion for every pass-through state, and that empty
// entry would make the check pass on its own once the state later loses its `always` and becomes settleable.
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
