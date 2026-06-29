/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- jest.mock factories delegate to require()'d helpers, which resolve as `any`. */
import {resetMfaNavigation} from '@components/MultifactorAuthentication/mfaNavigation';
import CONST from '@src/CONST';
import createMfaTestModel from '../../../utils/mfa/flowPaths';
import {resetMfaUiMocks} from '../../../utils/mfa/realUi/mocks';
import {flushMfaUi, isModalOverlayMounted, isOutcomeScreenVisible, renderMfaUi} from '../../../utils/mfa/realUi/renderModal';
import mfaEventExecutors from '../../../utils/mfa/realUi/userGestures';

// Forces a wide layout so the navigator renders the backdrop overlay the assertions use as the mounted marker.
jest.mock('@hooks/useResponsiveLayout');
// Replaces the dev-only Stately inspector wiring with the plain @xstate/react adapter the provider needs.
jest.mock('@hooks/useInspectedMachine', () => require('../../../utils/mfa/realUi/jestMocks').inspectedMachineMock());
// Native / WebAuthn biometrics are out of scope for the modal-lifecycle contract.
jest.mock('@components/MultifactorAuthentication/biometrics/useBiometrics', () => require('../../../utils/mfa/realUi/jestMocks').biometricsHookMock());
// Browser/Android back-history wiring is a separate concern from the machine <-> UI contract.
jest.mock('@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory', () => require('../../../utils/mfa/realUi/jestMocks').syncHistoryMock());
// Navigation automock leaves methods undefined, so this supplies the methods the flow needs and no-ops the rest.
jest.mock('@libs/Navigation/Navigation', () => require('../../../utils/mfa/realUi/jestMocks').navigationMock());

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

describe('the real MFA modal follows the machine', () => {
    beforeEach(() => {
        resetMfaUiMocks();
        resetMfaNavigation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // getSimplePaths reaches every state. The lifecycle paths add the MODAL_CLOSED teardown that simple paths skip.
    const paths = [...testModel.getSimplePaths(), ...testModel.getLifecyclePaths()];

    for (const path of paths) {
        it(`reaches ${JSON.stringify(path.state.value)} via [${path.description}]`, async () => {
            renderMfaUi();
            await flushMfaUi();
            await path.test(testConfig);
        });
    }
});
