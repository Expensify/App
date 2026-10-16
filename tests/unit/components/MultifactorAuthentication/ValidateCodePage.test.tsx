import {act, fireEvent, screen, within} from '@testing-library/react-native';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as MfaRealUiMocks from 'tests/utils/mfa/realUi/mocks';

import Onyx from 'react-native-onyx';
import createInitEvent, {MFA_TEST_ACCOUNT_ID, MFA_TEST_INVALID_CODE_ERROR, MFA_TEST_REGISTRATION_REQUIRED_ERROR, MFA_TEST_VALIDATE_CODE} from 'tests/utils/mfa/flowFixtures';
import renderMfaUi from 'tests/utils/mfa/realUi/harness';
import {loadRegistrationStateControl, requestRegistrationChallengeControl, resetMfaUiMocks, validateDeviceControl} from 'tests/utils/mfa/realUi/mocks';
import {translateLocal} from 'tests/utils/TestHelper';
import waitForBatchedUpdatesWithAct from 'tests/utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useResponsiveLayout');
jest.mock('@libs/XStateInspector', () => ({__esModule: true, default: {inspect: undefined}}));

jest.mock('@components/MultifactorAuthentication/machine/mfaActors', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').mfaActorsMock());
jest.mock('@components/RenderHTML', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').renderHtmlMock());
jest.mock('@components/ValidateCodeCountdown', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').validateCodeCountdownMock());
jest.mock('@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').syncHistoryMock());
jest.mock('@libs/Navigation/Navigation', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').navigationMock());
jest.mock('@libs/actions/User', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').userActionsMock());

const TEST_ID = CONST.MULTIFACTOR_AUTHENTICATION.TEST_ID;

/** Starts a first-time registration flow and waits on the validate-code screen. */
async function openValidateCodeScreen() {
    const {executeScenario} = renderMfaUi();
    await waitForBatchedUpdatesWithAct();

    const initEvent = createInitEvent();
    await act(async () => executeScenario(initEvent.scenarioName, initEvent.payload));
    await waitForBatchedUpdatesWithAct();
    fireEvent(screen.getByTestId(TEST_ID.INITIAL_SCREEN), 'layout', {
        nativeEvent: {layout: {width: 1, height: 1, x: 0, y: 0}},
    });
    await waitForBatchedUpdatesWithAct();

    await act(async () => validateDeviceControl.resolve({success: true}));
    await waitForBatchedUpdatesWithAct();
    await act(async () => loadRegistrationStateControl.resolve({hasServerCredentials: false, hasLocalCredentials: false, hasEverAcceptedSoftPrompt: false}));
    await waitForBatchedUpdatesWithAct();
}

/** Types the test code and submits it. */
async function submitCode() {
    fireEvent.changeText(screen.getByTestId(TEST_ID.VALIDATE_CODE_INPUT), MFA_TEST_VALIDATE_CODE);
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByTestId(TEST_ID.VALIDATE_CODE_SUBMIT_BUTTON));
    await waitForBatchedUpdatesWithAct();
}

/**
 * Whether the digit slots show the test code. The hidden text input only buffers the digit being
 * edited, so the slots, hidden from accessibility, are the only place the whole code is rendered.
 */
function isTestCodeShown(): boolean {
    return [...MFA_TEST_VALIDATE_CODE].every((digit) => screen.queryAllByText(digit, {includeHiddenElements: true}).length > 0);
}

describe('MultifactorAuthenticationValidateCodePage', () => {
    beforeEach(async () => {
        resetMfaUiMocks();
        await act(async () => {
            await Onyx.clear();
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: MFA_TEST_ACCOUNT_ID});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('puts the submit button in a loading state while the registration challenge request is pending', async () => {
        await openValidateCodeScreen();

        const submitButton = screen.getByTestId(TEST_ID.VALIDATE_CODE_SUBMIT_BUTTON);
        const submitButtonText = within(submitButton).getByText(translateLocal('common.verify'));
        expect(submitButton).toBeEnabled();
        expect(submitButtonText).toBeVisible();

        fireEvent.changeText(screen.getByTestId(TEST_ID.VALIDATE_CODE_INPUT), MFA_TEST_VALIDATE_CODE);
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(submitButton);
        await waitForBatchedUpdatesWithAct();

        expect(submitButton).toBeDisabled();
        expect(submitButtonText).not.toBeVisible();
    });

    // The screen stays mounted while recovery emails a new code, so only a remount drops the old one.
    it('clears the entered code when recovery sends a new code from this screen', async () => {
        await openValidateCodeScreen();
        await submitCode();
        expect(isTestCodeShown()).toBe(true);

        await act(async () => requestRegistrationChallengeControl.resolve({success: false, error: MFA_TEST_REGISTRATION_REQUIRED_ERROR}));
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(TEST_ID.VALIDATE_CODE_SUBMIT_BUTTON)).toBeEnabled();
        expect(isTestCodeShown()).toBe(false);
    });

    it('keeps the entered code after an invalid code, so the user can correct it', async () => {
        await openValidateCodeScreen();
        await submitCode();

        await act(async () => requestRegistrationChallengeControl.resolve({success: false, error: MFA_TEST_INVALID_CODE_ERROR}));
        await waitForBatchedUpdatesWithAct();

        expect(isTestCodeShown()).toBe(true);
    });
});
