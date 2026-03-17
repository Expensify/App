import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import App from '@src/App';
import ONYXKEYS from '@src/ONYXKEYS';
import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';

jest.setTimeout(120000);

jest.mock('@react-navigation/native');

TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();

function navigateToSetting() {
    const hintText = TestHelper.translateLocal('sidebarScreen.buttonMySettings');
    const mySettingButton = screen.queryByAccessibilityHint(hintText);
    if (mySettingButton) {
        fireEvent(mySettingButton, 'press');
    }
    return waitForBatchedUpdatesWithAct();
}

function navigateToExpensifyClassicFlow() {
    const hintText = TestHelper.translateLocal('exitSurvey.goToExpensifyClassic');
    const switchToExpensifyClassicBtn = screen.queryByAccessibilityHint(hintText);
    if (switchToExpensifyClassicBtn) {
        fireEvent(switchToExpensifyClassicBtn, 'press');
    }
    return waitForBatchedUpdatesWithAct();
}

function signInAppAndEnterTestFlow(dismissedValue?: boolean): Promise<void> {
    render(<App />);
    return waitForBatchedUpdatesWithAct()
        .then(async () => {
            await waitForBatchedUpdatesWithAct();
            const hintText = TestHelper.translateLocal('loginForm.loginForm');
            const loginForm = screen.queryAllByLabelText(hintText);
            expect(loginForm).toHaveLength(1);

            await act(async () => {
                await TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A');
            });
            await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, {
                classicRedirect: {
                    dismissed: dismissedValue,
                },
            });
            await waitForBatchedUpdates();
            return navigateToSetting();
        })
        .then(() => {
            act(() => (NativeNavigation as NativeNavigationMock).triggerTransitionEnd());
            return navigateToExpensifyClassicFlow();
        });
}

describe('Switch to Expensify Classic flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();

        // Unsubscribe to pusher channels
        PusherHelper.teardown();
    });

    test('Should navigate to exit survey reason page', () => {
        signInAppAndEnterTestFlow(true).then(() => {
            expect(screen.getAllByText(TestHelper.translateLocal('exitSurvey.reasonPage.subtitle')).at(0)).toBeOnTheScreen();
        });
    });
});
