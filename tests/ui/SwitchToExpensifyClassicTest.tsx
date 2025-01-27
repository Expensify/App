import * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {act} from 'react-test-renderer';
import {translateLocal} from '@libs/Localize';
import App from '@src/App';
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

jest.mock('@libs/fileDownload/FileUtils', () => ({
    readFileAsync: jest.fn(),
}));

TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();

function navigateToSetting() {
    const hintText = translateLocal('sidebarScreen.buttonMySettings');
    const mySettingButton = screen.queryByAccessibilityHint(hintText);
    if (mySettingButton) {
        fireEvent(mySettingButton, 'press');
    }
    return waitForBatchedUpdatesWithAct();
}

function navigateToExpensifyClassicFlow() {
    const hintText = translateLocal('exitSurvey.goToExpensifyClassic');
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
            const hintText = translateLocal('loginForm.loginForm');
            const loginForm = screen.queryAllByLabelText(hintText);
            expect(loginForm).toHaveLength(1);

            await act(async () => {
                await TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A');
            });
            await Onyx.set(ONYXKEYS.NVP_TRYNEWDOT, {
                classicRedirect: {
                    dismissed: dismissedValue,
                },
            });
            await waitForBatchedUpdates();
            return navigateToSetting();
        })
        .then(async () => {
            await act(() => (NativeNavigation as NativeNavigationMock).triggerTransitionEnd());
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

    test('Should navigate to BookACall when dismissed is false', () => {
        signInAppAndEnterTestFlow(false).then(() => {
            expect(screen.getAllByText(translateLocal('exitSurvey.bookACallTitle')).at(0)).toBeOnTheScreen();
        });
    });

    test('Should navigate to ConfirmPage when dismissed is true', () => {
        signInAppAndEnterTestFlow(true).then(() => {
            expect(screen.getAllByText(translateLocal('exitSurvey.goToExpensifyClassic')).at(0)).toBeOnTheScreen();
        });
    });
});
