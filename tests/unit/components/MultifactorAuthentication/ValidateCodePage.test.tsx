import {act, fireEvent, screen, within} from '@testing-library/react-native';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as MfaRealUiMocks from 'tests/utils/mfa/realUi/mocks';

import Onyx from 'react-native-onyx';
import createInitEvent, {MFA_TEST_ACCOUNT_ID} from 'tests/utils/mfa/flowFixtures';
import renderMfaUi from 'tests/utils/mfa/realUi/harness';
import {checkLocalCredentialsControl, resetMfaUiMocks, validateDeviceControl} from 'tests/utils/mfa/realUi/mocks';
import {translateLocal} from 'tests/utils/TestHelper';
import waitForBatchedUpdatesWithAct from 'tests/utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useResponsiveLayout');
jest.mock('@libs/XStateInspector', () => ({__esModule: true, default: {inspect: undefined}}));

jest.mock('@components/MultifactorAuthentication/machine/mfaActors', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').mfaActorsMock());
jest.mock('@components/MultifactorAuthentication/biometrics/useBiometrics', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').biometricsHookMock());
jest.mock('@components/RenderHTML', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').renderHtmlMock());
jest.mock('@components/ValidateCodeCountdown', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').validateCodeCountdownMock());
jest.mock('@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').syncHistoryMock());
jest.mock('@libs/Navigation/Navigation', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').navigationMock());
jest.mock('@libs/actions/User', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').userActionsMock());

const TEST_ID = CONST.MULTIFACTOR_AUTHENTICATION.TEST_ID;

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

    it('puts the submit button in a loading state for the registration challenge request when the account has 2FA enabled', async () => {
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
        await act(async () => checkLocalCredentialsControl.resolve(false));
        await waitForBatchedUpdatesWithAct();

        const submitButton = screen.getByTestId(TEST_ID.VALIDATE_CODE_SUBMIT_BUTTON);
        const submitButtonText = within(submitButton).getByText(translateLocal('common.verify'));
        expect(submitButton).toBeEnabled();
        expect(submitButtonText).toBeVisible();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isLoading: true,
                loadingForm: CONST.FORMS.VALIDATE_CODE_FORM,
            });
        });
        await waitForBatchedUpdatesWithAct();

        expect(submitButton).toBeDisabled();
        expect(submitButtonText).not.toBeVisible();
    });
});
