/* eslint-disable @typescript-eslint/naming-convention */
import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import {addSeconds, format, subMinutes} from 'date-fns';
import React from 'react';
import Onyx from 'react-native-onyx';
import * as Localize from '@libs/Localize';
import * as AppActions from '@userActions/App';
import * as User from '@userActions/User';
import App from '@src/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(30000);

jest.mock('@react-navigation/native');
jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');
jest.mock('../../src/components/ConfirmedRoute.tsx');

TestHelper.setupApp();
const fetchMock = TestHelper.setupGlobalFetchMock();

const LIST_SIZE = {
    width: 300,
    height: 400,
};
const LIST_CONTENT_SIZE = {
    width: 300,
    height: 600,
};

function scrollToOffset(offset: number) {
    const hintText = Localize.translateLocal('sidebarScreen.listOfChatMessages');
    fireEvent.scroll(screen.getByLabelText(hintText), {
        nativeEvent: {
            contentOffset: {
                y: offset,
            },
            contentSize: LIST_CONTENT_SIZE,
            layoutMeasurement: LIST_SIZE,
        },
    });
}

function triggerListLayout() {
    fireEvent(screen.getByTestId('report-actions-view-container'), 'onLayout', {
        nativeEvent: {
            layout: {
                x: 0,
                y: 0,
                ...LIST_SIZE,
            },
        },
    });
    fireEvent(screen.getByTestId('report-actions-list'), 'onContentSizeChange', LIST_CONTENT_SIZE.width, LIST_CONTENT_SIZE.height);
}

function getReportActions() {
    return [
        ...screen.queryAllByLabelText(Localize.translateLocal('accessibilityHints.chatMessage')),
        // Created action has a different accessibility label.
        ...screen.queryAllByLabelText(Localize.translateLocal('accessibilityHints.chatWelcomeMessage')),
    ];
}

async function navigateToSidebarOption(index: number): Promise<void> {
    const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
    const optionRows = screen.queryAllByAccessibilityHint(hintText);
    fireEvent(optionRows[index], 'press');
    await act(() => {
        (NativeNavigation as TestHelper.NativeNavigationMock).triggerTransitionEnd();
    });
    // ReportScreen relies on the onLayout event to receive updates from onyx.
    triggerListLayout();
    await waitForBatchedUpdatesWithAct();
}

const REPORT_ID = '1';
const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';
const USER_B_ACCOUNT_ID = 2;
const USER_B_EMAIL = 'user_b@test.com';

function buildReportComments(count: number, initialID: string, reverse = false) {
    let currentID = parseInt(initialID, 10);
    const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
    return Object.fromEntries(
        Array.from({length: Math.min(count, currentID)}).map(() => {
            const created = format(addSeconds(TEN_MINUTES_AGO, 10 * currentID), CONST.DATE.FNS_DB_FORMAT_STRING);
            const id = currentID;
            currentID += reverse ? 1 : -1;
            return [
                `${id}`,
                id === 1
                    ? {
                          reportActionID: '1',
                          actionName: 'CREATED' as const,
                          created,
                          message: [
                              {
                                  type: 'TEXT',
                                  text: 'CREATED',
                              },
                          ],
                      }
                    : TestHelper.buildTestReportComment(created, USER_B_ACCOUNT_ID, `${id}`),
            ];
        }),
    );
}

function mockOpenReport(messageCount: number, initialID: string) {
    fetchMock.mockAPICommand('OpenReport', () => [
        {
            onyxMethod: 'merge',
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            value: buildReportComments(messageCount, initialID),
        },
    ]);
}

function mockGetOlderActions(messageCount: number) {
    fetchMock.mockAPICommand('GetOlderActions', ({reportActionID}) => [
        {
            onyxMethod: 'merge',
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            // The API also returns the action that was requested with the reportActionID.
            value: buildReportComments(messageCount + 1, reportActionID),
        },
    ]);
}

// function mockGetNewerActions(messageCount: number) {
//     fetchMock.mockAPICommand('GetNewerActions', ({reportActionID}) => [
//         {
//             onyxMethod: 'merge',
//             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
//             // The API also returns the action that was requested with the reportActionID.
//             value: buildReportComments(messageCount + 1, reportActionID, true),
//         },
//     ]);
// }

/**
 * Sets up a test with a logged in user. Returns the <App/> test instance.
 */
async function signInAndGetApp(): Promise<void> {
    // Render the App and sign in as a test user.
    render(<App />);
    await waitForBatchedUpdatesWithAct();
    const hintText = Localize.translateLocal('loginForm.loginForm');
    const loginForm = screen.queryAllByLabelText(hintText);
    expect(loginForm).toHaveLength(1);

    await act(async () => {
        await TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A');
    });

    await waitForBatchedUpdatesWithAct();

    User.subscribeToUserEvents();

    await waitForBatchedUpdates();

    await act(async () => {
        // Simulate setting an unread report and personal details
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            reportID: REPORT_ID,
            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            lastMessageText: 'Test',
            participants: {[USER_B_ACCOUNT_ID]: {hidden: false}},
            lastActorAccountID: USER_B_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.CHAT,
        });

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [USER_B_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
        });

        // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
        AppActions.setSidebarLoaded();
    });

    await waitForBatchedUpdatesWithAct();
}

describe('Pagination', () => {
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();

            // Unsubscribe to pusher channels
            PusherHelper.teardown();
        });

        await waitForBatchedUpdatesWithAct();

        jest.clearAllMocks();
    });

    it('opens a chat and load initial messages', async () => {
        mockOpenReport(5, '5');

        await signInAndGetApp();
        await navigateToSidebarOption(0);

        expect(getReportActions()).toHaveLength(5);
        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalledWith('OpenReport', 0, {reportID: REPORT_ID, reportActionID: ''});
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);

        // Scrolling here should not trigger a new network request.
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();
        scrollToOffset(0);
        await waitForBatchedUpdatesWithAct();

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);
    });

    it('opens a chat and load older messages', async () => {
        mockOpenReport(5, '8');
        mockGetOlderActions(5);

        await signInAndGetApp();
        await navigateToSidebarOption(0);

        expect(getReportActions()).toHaveLength(5);
        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalledWith('OpenReport', 0, {reportID: REPORT_ID, reportActionID: ''});
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);

        // Scrolling here should trigger a new network request.
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 1);
        TestHelper.expectAPICommandToHaveBeenCalledWith('GetOlderActions', 0, {reportID: REPORT_ID, reportActionID: '4'});
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);
    });
});
