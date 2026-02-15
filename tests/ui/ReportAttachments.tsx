import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import {WRITE_COMMANDS} from '@libs/API/types';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {waitForIdle} from '@libs/Network/SequentialQueue';
import type {AuthScreensParamList} from '@navigation/types';
import AttachmentModalScreen from '@pages/media/AttachmentModalScreen';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, ReportActions} from '@src/types/onyx';
import {getFetchMockCalls, getGlobalFetchMock, setupGlobalFetchMock, signInWithTestUser, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const Stack = createPlatformStackNavigator<AuthScreensParamList>();

setupGlobalFetchMock();

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});
jest.mock('@src/components/Attachments/AttachmentCarousel/Pager/usePageScrollHandler', () => jest.fn());

const renderPage = (initialRouteName: typeof SCREENS.REPORT_ATTACHMENTS, initialParams: AuthScreensParamList[typeof SCREENS.REPORT_ATTACHMENTS]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, AttachmentModalContextProvider, CurrentReportIDContextProvider, PortalProvider, PlaybackContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={initialRouteName}>
                    <Stack.Screen
                        name={SCREENS.REPORT_ATTACHMENTS}
                        component={AttachmentModalScreen}
                        initialParams={initialParams}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
};

// // Given report attachment data results consisting of involved user login, user account id, report & report action and attachment id
const TEST_USER_LOGIN = 'test@test.com';
const TEST_USER_ACCOUNT_ID = 1;
const reportAttachmentID = '7487537791562875';
const reportActionAttachmentID = '7006877151048865417';
const reportAttachmentOnyx: Report = {
    reportName: 'Chat Report',
    currency: 'USD',
    description: '',
    errorFields: {},
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,
    isCancelledIOU: false,
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    lastActionType: 'ADDCOMMENT',
    lastActorAccountID: TEST_USER_ACCOUNT_ID,
    lastMessageHtml:
        '<img src="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png.1024.jpg" data-expensify-source="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png" data-name="Screenshot_2025-02-05_at_13.03.32.png" data-expensify-height="408" data-expensify-width="980" />',
    lastMessageText: '[Attachment]',
    lastReadSequenceNumber: 0,
    lastReadTime: '2025-02-05 07:32:45.788',
    lastVisibleActionCreated: '2025-02-05 07:29:21.593',
    lastVisibleActionLastModified: '2025-02-05 07:29:21.593',
    managerID: 0,
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: 0,
    participants: {
        [TEST_USER_ACCOUNT_ID]: {
            notificationPreference: 'always',
        },
    },
    permissions: ['read', 'write'],
    policyID: '_FAKE_',
    reportID: '7487537791562875',
    stateNum: 0,
    statusNum: 0,
    total: 0,
    type: 'chat',
    unheldNonReimbursableTotal: 0,
    unheldTotal: 0,
    welcomeMessage: '',
    writeCapability: 'all',
};
const reportActionsAttachmentOnyx: ReportActions = {
    [reportActionAttachmentID]: {
        person: [
            {
                type: 'TEXT',
                style: 'strong',
                text: TEST_USER_LOGIN,
            },
        ],
        actorAccountID: TEST_USER_ACCOUNT_ID,
        message: [
            {
                type: 'COMMENT',
                html: '<img src="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png.1024.jpg" data-expensify-source="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png" data-name="Screenshot_2025-02-05_at_13.03.32.png" data-expensify-height="408" data-expensify-width="980" />',
                text: '[Attachment]',
                isEdited: false,
                whisperedTo: [],
                isDeletedParentAction: false,
                deleted: '',
            },
        ],
        originalMessage: {
            html: '<img src="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png.1024.jpg" data-expensify-source="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png" data-name="Screenshot_2025-02-05_at_13.03.32.png" data-expensify-height="408" data-expensify-width="980" />',
            lastModified: '2025-02-05 07:29:21.593',
        },
        avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/c751290e0b771edfe5a0f1eeaf6aea98baf7c70c.png',
        created: '2025-02-05 07:29:21.593',
        timestamp: 1738740561,
        reportActionTimestamp: 1738740561593,
        automatic: false,
        actionName: 'ADDCOMMENT',
        shouldShow: true,
        reportActionID: '7006877151048865417',
        lastModified: '2025-02-05 07:29:21.593',
        whisperedToAccountIDs: [],
    },
};

describe('ReportAttachments', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: TEST_USER_ACCOUNT_ID, email: TEST_USER_LOGIN},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[TEST_USER_ACCOUNT_ID]: {accountID: TEST_USER_ACCOUNT_ID, login: TEST_USER_LOGIN}},
            },
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });
    beforeEach(async () => {
        global.fetch = getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        await waitForBatchedUpdatesWithAct();

        // Given a test user is signed in with Onyx setup and some initial data
        await signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await waitForIdle();
        await act(async () => {
            await Onyx.clear();
        });

        jest.clearAllMocks();
    });
    it('should display the attachment if the source link is origin url', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportAttachmentID}`, reportAttachmentOnyx);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAttachmentID}`, reportActionsAttachmentOnyx);
        });

        await waitForBatchedUpdatesWithAct();

        // Given the report attachments params
        const params: AuthScreensParamList[typeof SCREENS.REPORT_ATTACHMENTS] = {
            source: 'https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png',
            type: 'r',
            reportID: '7487537791562875',
            isAuthTokenRequired: true,
            originalFileName: 'Screenshot_2025-02-05_at_13.03.32.png',
            accountID: TEST_USER_ACCOUNT_ID,
        };

        // And ReportAttachments is opened
        renderPage(SCREENS.REPORT_ATTACHMENTS, params);

        await waitForBatchedUpdatesWithAct();

        // Then the not here page and the loading spinner should not appear.
        expect(screen.queryByText(translateLocal('notFound.notHere'))).toBeNull();
        expect(screen.queryByTestId('attachment-loading-spinner')).toBeNull();
    });
    it('should fetch the report id, if the report has not yet been opened by the user', async () => {
        // Given the report attachments params
        const params: AuthScreensParamList[typeof SCREENS.REPORT_ATTACHMENTS] = {
            source: 'https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png',
            type: 'r',
            reportID: '7487537791562875',
            isAuthTokenRequired: true,
            originalFileName: 'Screenshot_2025-02-05_at_13.03.32.png',
            accountID: TEST_USER_ACCOUNT_ID,
        };

        // And ReportAttachments is opened
        renderPage(SCREENS.REPORT_ATTACHMENTS, params);
        await waitForBatchedUpdatesWithAct();

        const openReportRequest = getFetchMockCalls(WRITE_COMMANDS.OPEN_REPORT).find((request) => {
            const body = request[1]?.body;
            const requestParams = body instanceof FormData ? Object.fromEntries(body) : {};
            return requestParams?.reportID === params.reportID;
        });

        // Then the report should fetched by OpenReport API command
        expect(openReportRequest).toBeDefined();
    });
});
