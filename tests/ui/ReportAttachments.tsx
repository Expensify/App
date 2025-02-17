import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import {translateLocal} from '@libs/Localize';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {waitForIdle} from '@libs/Network/SequentialQueue';
import type {AuthScreensParamList} from '@navigation/types';
import ReportAttachments from '@pages/home/report/ReportAttachments';
import {ReportAttachmentsProvider} from '@pages/home/report/ReportAttachmentsContext';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, ReportActions} from '@src/types/onyx';
import {setupGlobalFetchMock, signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const Stack = createPlatformStackNavigator<AuthScreensParamList>();

setupGlobalFetchMock();

const renderPage = (initialRouteName: typeof SCREENS.ATTACHMENTS, initialParams: AuthScreensParamList[typeof SCREENS.ATTACHMENTS]) => {
    return render(
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, ReportAttachmentsProvider, CurrentReportIDContextProvider, PortalProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={initialRouteName}>
                    <Stack.Screen
                        name={SCREENS.ATTACHMENTS}
                        component={ReportAttachments}
                        initialParams={initialParams}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
};

// // Given report attachment data results consisting of involved report id, report and reportActions
const reportAttachmentID = '7487537791562875';
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
    lastActorAccountID: 2,
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
        '1': {
            notificationPreference: 'always',
        },
        '2': {
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
    '7006877151048865417': {
        person: [
            {
                type: 'TEXT',
                style: 'strong',
                text: 'test123@gmail.com',
            },
        ],
        actorAccountID: 2,
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
    '1496162603975400831': {
        reportActionID: '1496162603975400831',
        actionName: 'CREATED',
        created: '2025-02-05 07:29:12.575',
        reportActionTimestamp: 1738740552575,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
        message: [
            {
                type: 'TEXT',
                style: 'strong',
                text: '__fake__',
            },
            {
                type: 'TEXT',
                style: 'normal',
                text: ' created this report',
            },
        ],
        person: [
            {
                type: 'TEXT',
                style: 'strong',
                text: '__fake__',
            },
        ],
        automatic: false,
        sequenceNumber: 0,
        shouldShow: true,
        lastModified: '2025-02-05 07:29:12.575',
    },
};

describe('ReportAttachments', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    afterEach(async () => {
        await waitForIdle();
        await act(async () => {
            await Onyx.clear();
        });

        jest.clearAllMocks();
    });
    it('it should display the attachment if the source link is origin url', async () => {
        await signInWithTestUser();

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportAttachmentID}`, reportAttachmentOnyx);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAttachmentID}`, reportActionsAttachmentOnyx);

        // Given the report attachments params
        const params: AuthScreensParamList[typeof SCREENS.ATTACHMENTS] = {
            source: 'https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png',
            type: 'r',
            reportID: '7487537791562875',
            isAuthTokenRequired: 'true',
            fileName: 'Screenshot_2025-02-05_at_13.03.32.png',
            accountID: '1',
        };

        // And ReportAttachmments is opened
        const {queryByText} = renderPage(SCREENS.ATTACHMENTS, params);

        await waitForBatchedUpdatesWithAct();
        // Then the blocking view or not here page should not appear.
        expect(queryByText("Hmm... it's not hereOops, this page cannot be foundGo back to home page")).toBeNull();
    });
});
