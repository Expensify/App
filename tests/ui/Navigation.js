import React from 'react';
import Onyx from 'react-native-onyx';
import {render, screen, fireEvent} from '@testing-library/react-native';
import {Linking} from 'react-native';
import App from '../../src/App';
import CONST from '../../src/CONST';
import ROUTES from '../../src/ROUTES';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import * as TestHelper from '../utils/TestHelper';
import appSetup from '../../src/setup';
import PusherConnectionManager from '../../src/libs/PusherConnectionManager';
import * as Pusher from '../../src/libs/Pusher/pusher';
import CONFIG from '../../src/CONFIG';
import * as Localize from '../../src/libs/Localize';
import * as User from '../../src/libs/actions/User';
import * as AppActions from '../../src/libs/actions/App';
import DateUtils from '../../src/libs/DateUtils';
import * as NumberUtils from '../../src/libs/NumberUtils';
import Navigation from '../../src/libs/Navigation/Navigation';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(30000);

jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');

beforeAll(() => {
    // In this test, we are generically mocking the responses of all API requests by mocking fetch() and having it
    // return 200. In other tests, we might mock HttpUtils.xhr() with a more specific mock data response (which means
    // fetch() never gets called so it does not need mocking) or we might have fetch throw an error to test error handling
    // behavior. But here we just want to treat all API requests as a generic "success" and in the cases where we need to
    // simulate data arriving we will just set it into Onyx directly with Onyx.merge() or Onyx.set() etc.
    global.fetch = TestHelper.getGlobalFetchMock();

    Linking.setInitialURL('https://new.expensify.com/');
    appSetup();

    // Connect to Pusher
    PusherConnectionManager.init();
    Pusher.init({
        appKey: CONFIG.PUSHER.APP_KEY,
        cluster: CONFIG.PUSHER.CLUSTER,
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api?command=AuthenticatePusher`,
    });
});

const ALICE = {
    ACCOUNT_ID: 1,
    EMAIL: 'alice@expensifail.com',
    NAME: 'Alice',
};
const BOB = {
    ACCOUNT_ID: 2,
    EMAIL: 'bob@expensifail.com',
    NAME: 'Bob',
};

async function signInToApp() {
    // Render the App and sign in as a test user.
    render(<App />);
    await waitForBatchedUpdatesWithAct();
    const hintText = Localize.translateLocal('loginForm.loginForm');
    const loginForm = screen.queryAllByLabelText(hintText);
    expect(loginForm).toHaveLength(1);
    await TestHelper.signInWithTestUser(ALICE.ACCOUNT_ID, ALICE.EMAIL, undefined, undefined, 'A');
    User.subscribeToUserEvents();
    await waitForBatchedUpdates();

    // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
    AppActions.setSidebarLoaded(true);
    await waitForBatchedUpdates();
}

/**
 * @param {Number} index
 * @return {Promise}
 */
function navigateToSidebarOption(index) {
    const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
    const optionRows = screen.getAllByAccessibilityHint(hintText);
    fireEvent(optionRows[index], 'press');
    return waitForBatchedUpdates();
}

describe('Navigation', () => {
    beforeEach(async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ALICE.ACCOUNT_ID]: TestHelper.buildPersonalDetails(ALICE.EMAIL, ALICE.ACCOUNT_ID, ALICE.NAME),
            [BOB.ACCOUNT_ID]: TestHelper.buildPersonalDetails(BOB.EMAIL, BOB.ACCOUNT_ID, BOB.NAME),
        });
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('Replaces report screen in stack', async () => {
        await signInToApp();

        // Verify the sidebar links are rendered
        const sidebarLinksHintText = Localize.translateLocal('sidebarScreen.listOfChats');
        const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
        expect(sidebarLinks).toHaveLength(1);

        // Verify there is nothing in the sidebar to begin with
        const optionRowsHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
        let optionRows = screen.queryAllByAccessibilityHint(optionRowsHintText);
        expect(optionRows).toHaveLength(0);

        // Add a report in Onyx
        let now = DateUtils.getDBTime();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${1}`, {
            reportID: 1,
            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            lastReadTime: now,
            lastVisibleActionCreated: now,

            // Note: this is intentionally different from the actual last message to prevent the sidebar from matching when we want to make sure that the central report pane is visible
            lastMessageText: `Hi from ${ALICE.NAME}`,
            participantAccountIDs: [ALICE.ACCOUNT_ID, BOB.ACCOUNT_ID],
            type: CONST.REPORT.TYPE.CHAT,
        });
        let createdReportActionID = NumberUtils.rand64();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${1}`, {
            [createdReportActionID]: {
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                automatic: false,
                created: now,
                reportActionID: createdReportActionID,
                message: [
                    {
                        style: 'strong',
                        text: '__FAKE__',
                        type: 'TEXT',
                    },
                    {
                        style: 'normal',
                        text: 'created this report',
                        type: 'TEXT',
                    },
                ],
            },
            1: TestHelper.buildTestReportComment(now, ALICE.ACCOUNT_ID, '1', ALICE.NAME),
        });
        await waitForBatchedUpdates();

        // Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute('1'));
        // await new Promise((resolve) => setTimeout(resolve, CONST.ANIMATED_TRANSITION));

        // Verify there is now one option in the sidebar
        optionRows = screen.queryAllByAccessibilityHint(optionRowsHintText);
        expect(optionRows).toHaveLength(1);
        screen.getByText(`Hi from ${ALICE.NAME}`);

        await navigateToSidebarOption(0);
        await navigateToSidebarOption(0);
        const welcomeMessageHintText = Localize.translateLocal('accessibilityHints.chatWelcomeMessage');
        const createdAction = screen.queryByLabelText(welcomeMessageHintText);
        expect(createdAction).toBeTruthy();
        const reportCommentsHintText = Localize.translateLocal('accessibilityHints.chatMessage');
        const reportComments = screen.queryAllByLabelText(reportCommentsHintText);
        expect(reportComments).toHaveLength(1);
        screen.getByText(`Comment 1 from ${ALICE.NAME}`);

        // Add another report to Onyx
        now = DateUtils.getDBTime();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${2}`, {
            reportID: 2,
            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            lastReadTime: now,
            lastVisibleActionCreated: now,

            // Note: this is intentionally different from the actual last message to prevent the sidebar from matching when we want to make sure that the central report pane is visible
            lastMessageText: `Hi from ${BOB.NAME}`,
            participantAccountIDs: [ALICE.ACCOUNT_ID, BOB.ACCOUNT_ID],
            type: CONST.REPORT.TYPE.CHAT,
        });
        createdReportActionID = NumberUtils.rand64();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${2}`, {
            [createdReportActionID]: {
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                automatic: false,
                created: now,
                reportActionID: createdReportActionID,
                message: [
                    {
                        style: 'strong',
                        text: '__FAKE__',
                        type: 'TEXT',
                    },
                    {
                        style: 'normal',
                        text: 'created this report',
                        type: 'TEXT',
                    },
                ],
            },
            2: TestHelper.buildTestReportComment(now, BOB.ACCOUNT_ID, '2', BOB.NAME),
        });
        await waitForBatchedUpdates();

        // Message from alice should still be visible
        messageFromAlice = screen.getByText(`1 from ${ALICE.NAME}`);
        expect(messageFromAlice).not.toBeNull();
    });
});
