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

// Forces a wide layout so the navigator renders the backdrop overlay the assertions use as the mounted marker.
jest.mock('@hooks/useResponsiveLayout');
// Drops the dev-only Stately inspector wiring, leaving the real useInspectedMachine to fall back to plain useMachine.
// `inspect: undefined` is exactly what @libs/XStateInspector returns in a non-dev build.
jest.mock('@libs/XStateInspector', () => ({__esModule: true, default: {inspect: undefined}}));
// Native / WebAuthn biometrics are out of scope for the modal-lifecycle contract.
jest.mock('@components/MultifactorAuthentication/biometrics/useBiometrics', () => require('tests/utils/mfa/realUi/mocks').biometricsHookMock());
// Browser/Android back-history wiring is a separate concern from the machine <-> UI contract.
jest.mock('@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory', () => require('tests/utils/mfa/realUi/mocks').syncHistoryMock());
// Reuses the shared Navigation mock and overrides the transition methods the MFA flow drives.
jest.mock('@libs/Navigation/Navigation', () => require('tests/utils/mfa/realUi/mocks').navigationMock());

// The queryable markers each state asserts against. `OutcomeScreenBase` is the success or failure screen's
// testID; the backdrop's `Close` label only renders while the MFA navigator is mounted.
const OUTCOME_SCREEN_TEST_ID = 'OutcomeScreenBase';
const MODAL_OVERLAY_LABEL = 'Close';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

// The TestModel config maps each event to a UI gesture and each state to a per-state assertion. State
// keys are dot-path values matched with `matchesState`, so they can target any depth, such as the
// settled success leaf `open.outcome.success` rather than just the `open` parent.
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

// getShortestPaths reaches every state. The lifecycle paths add the MODAL_CLOSED teardown that they skip.
const walkedPaths = getWalkedPaths();

// TestModel's own `path.description` embeds the full serialized event (scenario config, React nodes, INIT
// payload). Name the test from the driven event TYPES only, dropping the synthetic `xstate.init` step
// that the graph prepends (its runtime type is not part of the MfaEvent union, hence the widened param).
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

// Loud UI-walk counterpart to everyStateReachable: every settleable leaf must be the endpoint of a path we
// actually drive. The walk only asserts states a generated path reaches, so a leaf that stops being reached
// (e.g. a future guard needs a payload the bare-synthesized event lacks) would silently drop its coverage.
// Asserting reachability over walkedPaths turns that silent drop into a failure that names the leaf.
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
