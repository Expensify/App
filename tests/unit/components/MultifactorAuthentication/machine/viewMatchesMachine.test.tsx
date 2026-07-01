/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- jest.mock factories delegate to require()'d helpers, which resolve as `any`. */
import {screen} from '@testing-library/react-native';
import getWalkedPaths from 'tests/utils/mfa/flowPaths';
import getSettleableLeafStates from 'tests/utils/mfa/reachableStates';
import {mfaEventExecutors, renderMfaUi} from 'tests/utils/mfa/realUi/harness';
import {resetMfaUiMocks} from 'tests/utils/mfa/realUi/mocks';
import waitForBatchedUpdatesWithAct from 'tests/utils/waitForBatchedUpdatesWithAct';
import {matchesState} from 'xstate';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import {resetMfaNavigation} from '@components/MultifactorAuthentication/mfaNavigation';
import CONST from '@src/CONST';

// This mock forces a wide layout so the navigator renders the backdrop used as the mounted marker.
jest.mock('@hooks/useResponsiveLayout');
// This mock disables the dev-only Stately inspector so `useInspectedMachine` falls back to `useMachine`.
jest.mock('@libs/XStateInspector', () => ({__esModule: true, default: {inspect: undefined}}));
// Native and WebAuthn biometrics are outside the modal lifecycle contract.
jest.mock('@components/MultifactorAuthentication/biometrics/useBiometrics', () => require('tests/utils/mfa/realUi/mocks').biometricsHookMock());
// Browser and Android history synchronization is outside the contract between the machine and UI.
jest.mock('@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory', () => require('tests/utils/mfa/realUi/mocks').syncHistoryMock());
// This mock reuses the shared Navigation implementation and overrides the transition methods used by the MFA flow.
jest.mock('@libs/Navigation/Navigation', () => require('tests/utils/mfa/realUi/mocks').navigationMock());

// These UI markers distinguish the closed, closing, and outcome states. `OutcomeScreenBase` identifies the
// outcome screen, while the backdrop's `Close` label exists only when the MFA navigator is mounted.
const OUTCOME_SCREEN_TEST_ID = 'OutcomeScreenBase';
const MODAL_OVERLAY_LABEL = 'Close';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

// Dot-path state keys let `matchesState` target nested leaves such as `open.outcome.success`.
const testConfig = {
    events: mfaEventExecutors,
    states: {
        [MFA_STATE.CLOSED]: () => {
            expect(screen.queryAllByLabelText(MODAL_OVERLAY_LABEL)).toHaveLength(0);
            expect(screen.queryAllByTestId(OUTCOME_SCREEN_TEST_ID)).toHaveLength(0);
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.OUTCOME}.${MFA_STATE.SUCCESS}`]: () => {
            expect(screen.queryAllByLabelText(MODAL_OVERLAY_LABEL)).not.toHaveLength(0);
            expect(screen.queryAllByTestId(OUTCOME_SCREEN_TEST_ID)).not.toHaveLength(0);
        },
        [MFA_STATE.CLOSING]: () => {
            expect(screen.queryAllByLabelText(MODAL_OVERLAY_LABEL)).not.toHaveLength(0);
            expect(screen.queryAllByTestId(OUTCOME_SCREEN_TEST_ID)).toHaveLength(0);
        },
    },
};

const walkedPaths = getWalkedPaths();

// `path.description` serializes the complete event payload, so test names use only driven event types.
// The synthetic `xstate.init` event is excluded because it is not part of `MfaEvent`.
const INIT_STEP_EVENT_TYPE = 'xstate.init';
function describeDrivenEvents(steps: ReadonlyArray<{event: {type: string}}>): string {
    const drivenEventTypes = steps.map((step) => step.event.type).filter((type) => type !== INIT_STEP_EVENT_TYPE);
    return drivenEventTypes.length > 0 ? drivenEventTypes.join(' -> ') : '(initial state)';
}

describe('the real MFA modal follows the machine', () => {
    beforeEach(() => {
        resetMfaUiMocks();
        resetMfaNavigation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    for (const path of walkedPaths) {
        it(`reaches ${JSON.stringify(path.state.value)} via [${describeDrivenEvents(path.steps)}]`, async () => {
            renderMfaUi();
            await waitForBatchedUpdatesWithAct();
            await path.test(testConfig);
        });
    }
});

// This check requires every settleable leaf to end a path that the UI walk drives. If a generated path
// stops reaching a leaf, the failure identifies that leaf explicitly.
describe('the UI walk reaches every settleable leaf', () => {
    const walkedLeafValues = walkedPaths.map((path) => path.state.value);

    it.each(getSettleableLeafStates(mfaMachine.root))('walks the $description state', ({description}) => {
        expect(walkedLeafValues.some((reached) => matchesState(description, reached))).toBe(true);
    });
});

// TestModel runs only the state assertions whose keys match the reached state, so if no key matches a
// state, the test passes without checking it. These guards fail in that case: every settleable leaf must
// have a matching assertion, and every key must match a real leaf.
//
// Types cannot do this. TypeScript's inferred type does not record whether a state has an `always`
// transition, so it cannot tell a real leaf from a pass-through state such as `{open: "preparing"}`. A
// `Record<leaf, ...>` would then need an empty assertion for every pass-through state, and that empty
// entry would make the check pass on its own once the state later loses its `always` and becomes settleable.
describe('the view config stays in sync with the machine state by state', () => {
    const settleableLeafStates = getSettleableLeafStates(mfaMachine.root);
    const configuredStateKeys = Object.keys(testConfig.states);

    it.each(settleableLeafStates)('asserts the reachable $description state', ({description}) => {
        expect(configuredStateKeys.some((key) => matchesState(key, description))).toBe(true);
    });

    it.each(configuredStateKeys.map((key) => ({key})))('targets a real leaf with the $key key', ({key}) => {
        expect(settleableLeafStates.some((leaf) => matchesState(key, leaf.description))).toBe(true);
    });
});
