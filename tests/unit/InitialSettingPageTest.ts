import * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {act} from 'react-test-renderer';
import * as Localize from '@libs/Localize';
import App from '@src/App';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';

jest.setTimeout(60000);

jest.mock('@react-navigation/native');

// mock the destination page.
jest.mock('@pages/settings/ExitSurvey/ExitSurveyBookCall');
jest.mock('@pages/settings/ExitSurvey/ExitSurveyConfirmPage');

TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();

function navigateToSetting() {
    const hintText = Localize.translateLocal('sidebarScreen.buttonMySettings');
    const reportHeaderBackButton = screen.queryByAccessibilityHint(hintText);
    if (reportHeaderBackButton) {
        fireEvent(reportHeaderBackButton, 'press');
    }
    return waitForBatchedUpdatesWithAct();
}

function navigateToExpensifyClassicFlow() {
    const hintText = Localize.translateLocal('exitSurvey.goToExpensifyClassic');
    const switchToExpensifyClassicBtn = screen.queryByAccessibilityHint(hintText);
    if (switchToExpensifyClassicBtn) {
        fireEvent(switchToExpensifyClassicBtn, 'press');
    }
    return waitForBatchedUpdatesWithAct();
}

function signInAppAndEnterTestFlow(): Promise<void> {
    render(<App />);
    return waitForBatchedUpdatesWithAct()
        .then(async () => {
            await waitForBatchedUpdatesWithAct();
            const hintText = Localize.translateLocal('loginForm.loginForm');
            const loginForm = screen.queryAllByLabelText(hintText);
            expect(loginForm).toHaveLength(1);

            await act(async () => {
                await TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A');
            });
            return navigateToSetting();
        })
        .then(async () => {
            await act(() => (NativeNavigation as NativeNavigationMock).triggerTransitionEnd());
            return navigateToExpensifyClassicFlow();
        });
}

OnyxUpdateManager();

describe('InitialSettingPage', () => {
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            // Unsubscribe to pusher channels
            PusherHelper.teardown();
        });
    });

    test('Test switch to Expensify classic - dimissed is true', async () => {
        await signInAppAndEnterTestFlow();
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_TRYNEWDOT, {
                classicRedirect: {
                    dismissed: true,
                },
            });
        });
        await waitForBatchedUpdates();
        expect(screen.getAllByText(Localize.translateLocal('exitSurvey.goToExpensifyClassic')).at(0)).toBeOnTheScreen();
    });

    test('Test switch to Expensify classic - dimissed is false', async () => {
        await signInAppAndEnterTestFlow();
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_TRYNEWDOT, {
                classicRedirect: {
                    dismissed: false,
                },
            });
        });
        await waitForBatchedUpdates();
        expect(screen.getAllByText(Localize.translateLocal('exitSurvey.header')).at(0)).toBeOnTheScreen();
    });
});
