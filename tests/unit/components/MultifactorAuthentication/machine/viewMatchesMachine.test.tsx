/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- jest.mock factories delegate to require()'d helpers, which resolve as `any`. */
import createMfaTestModel from 'tests/utils/mfa/flowPaths';
import getSettleableLeafStates, {toStateValue} from 'tests/utils/mfa/reachableStates';
import {resetMfaUiMocks} from 'tests/utils/mfa/realUi/mocks';
import {flushMfaUi, isModalOverlayMounted, isOutcomeScreenVisible, renderMfaUi} from 'tests/utils/mfa/realUi/renderModal';
import mfaEventExecutors from 'tests/utils/mfa/realUi/userGestures';
import {matchesState} from 'xstate';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import {resetMfaNavigation} from '@components/MultifactorAuthentication/mfaNavigation';
import CONST from '@src/CONST';

// Forces a wide layout so the navigator renders the backdrop overlay the assertions use as the mounted marker.
jest.mock('@hooks/useResponsiveLayout');
// Replaces the dev-only Stately inspector wiring with the plain @xstate/react adapter the provider needs.
jest.mock('@hooks/useInspectedMachine', () => require('tests/utils/mfa/realUi/jestMocks').inspectedMachineMock());
// Native / WebAuthn biometrics are out of scope for the modal-lifecycle contract.
jest.mock('@components/MultifactorAuthentication/biometrics/useBiometrics', () => require('tests/utils/mfa/realUi/jestMocks').biometricsHookMock());
// Browser/Android back-history wiring is a separate concern from the machine <-> UI contract.
jest.mock('@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory', () => require('tests/utils/mfa/realUi/jestMocks').syncHistoryMock());
// Supplies the Navigation methods the flow drives with real behavior; the Proxy no-ops the rest.
jest.mock('@libs/Navigation/Navigation', () => require('tests/utils/mfa/realUi/jestMocks').navigationMock());

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

const testModel = createMfaTestModel();

// The createTestModel-style config maps each event to a UI gesture and each state to a per-state assertion.
// State keys are dot-path values matched with `matchesState`, so they can target any depth, such as the
// settled success leaf `open.outcome.success` rather than just the `open` parent.
const testConfig = {
    events: mfaEventExecutors,
    states: {
        [MFA_STATE.CLOSED]: () => {
            expect(isModalOverlayMounted()).toBe(false);
            expect(isOutcomeScreenVisible()).toBe(false);
        },
        [`${MFA_STATE.OPEN}.${MFA_STATE.OUTCOME}.${MFA_STATE.SUCCESS}`]: () => {
            expect(isModalOverlayMounted()).toBe(true);
            expect(isOutcomeScreenVisible()).toBe(true);
        },
        [MFA_STATE.CLOSING]: () => {
            expect(isModalOverlayMounted()).toBe(true);
            expect(isOutcomeScreenVisible()).toBe(false);
        },
    },
};

// getSimplePaths reaches every state. The lifecycle paths add the MODAL_CLOSED teardown that simple paths skip.
const walkedPaths = [...testModel.getSimplePaths(), ...testModel.getLifecyclePaths()];

describe('the real MFA modal follows the machine', () => {
    beforeEach(() => {
        resetMfaUiMocks();
        resetMfaNavigation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    for (const path of walkedPaths) {
        it(`reaches ${JSON.stringify(path.state.value)} via [${path.description}]`, async () => {
            renderMfaUi();
            await flushMfaUi();
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

    it.each(getSettleableLeafStates(mfaMachine))('walks the $description state', ({value}) => {
        expect(walkedLeafValues.some((reached) => matchesState(value, reached))).toBe(true);
    });
});

// assertMatchingStates runs only the entries whose key matches the reached state, so if no key matches a
// state, the test passes without checking it. These guards fail in that case: every settleable leaf must
// have a matching assertion, and every key must match a real leaf.
//
// Types cannot do this. TypeScript's inferred type does not record whether a state has an `always`
// transition, so it cannot tell a real leaf from a pass-through state such as `{open: "preparing"}`. A
// `Record<leaf, ...>` would then need an empty assertion for every pass-through state, and that empty
// entry would make the check pass on its own once the state later loses its `always` and becomes settleable.
describe('the view config stays in sync with the machine state by state', () => {
    const settleableLeafStates = getSettleableLeafStates(mfaMachine);
    const configuredStates = Object.keys(testConfig.states).map((stateValue) => ({description: stateValue, value: toStateValue(stateValue.split('.'))}));

    it.each(settleableLeafStates)('asserts the reachable $description state', ({value}) => {
        expect(configuredStates.some((configured) => matchesState(configured.value, value))).toBe(true);
    });

    it.each(configuredStates)('targets a real leaf with the $description key', ({value}) => {
        expect(settleableLeafStates.some((leaf) => matchesState(value, leaf.value))).toBe(true);
    });
});
