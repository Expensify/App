import * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {act} from 'react-test-renderer';
import * as Report from '@libs/actions/Report';
import * as Localize from '@libs/Localize';
import App from '@src/App';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCollectionDataSet} from '@src/types/onyx/Policy';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';

jest.setTimeout(60000);

jest.mock('@react-navigation/native');

TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();

function navigateToSetting() {
    const hintText = Localize.translateLocal('workspace.switcher.headerTitle');
    const mySettingButton = screen.queryByAccessibilityHint(hintText);
    if (mySettingButton) {
        fireEvent(mySettingButton, 'press');
    }
    return waitForBatchedUpdatesWithAct();
}

function navigateToExpensifyClassicFlow() {
    const hintText = Localize.translateLocal('exitSurvey.goToExpensifyClassic');
    const switchToExpensifyClassicBtn = screen.queryByAccessibilityHint('Workspace 1');
    expect(switchToExpensifyClassicBtn).toHaveLength(210);
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
            const hintText = Localize.translateLocal('loginForm.loginForm');
            const loginForm = screen.queryAllByLabelText(hintText);
            expect(loginForm).toHaveLength(1);

            // Given three unread reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            const report2 = LHNTestUtils.getFakeReport([1, 3], 2);
            const report3 = LHNTestUtils.getFakeReport([1, 4], 1);

            const policy1 = LHNTestUtils.getFakePolicy('1', 'Workspace A');
            const policy2 = LHNTestUtils.getFakePolicy('2', 'B');
            const policy3 = LHNTestUtils.getFakePolicy('3', 'C');

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            const policyCollectionDataSet: PolicyCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.POLICY}${policy1.id}`]: policy1,
                [`${ONYXKEYS.COLLECTION.POLICY}${policy2.id}`]: policy2,
                [`${ONYXKEYS.COLLECTION.POLICY}${policy3.id}`]: policy3,
            };

            await act(async () => {
                await TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A');
            });
            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                [ONYXKEYS.IS_LOADING_APP]: false,
                ...reportCollectionDataSet,
                ...policyCollectionDataSet,
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
            expect(screen.getAllByText(Localize.translateLocal('exitSurvey.bookACallTitle')).at(0)).toBeOnTheScreen();
        });
    });

    test('Should navigate to ConfirmPage when dismissed is true', () => {
        signInAppAndEnterTestFlow(true).then(() => {
            expect(screen.getAllByText(Localize.translateLocal('exitSurvey.goToExpensifyClassic')).at(0)).toBeOnTheScreen();
        });
    });
});
