import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {waitForIdle} from '@libs/Network/SequentialQueue';

import type {AuthScreensParamList} from '@navigation/types';

import AttachmentModalScreen from '@pages/media/AttachmentModalScreen';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, ReportAction, Transaction} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import {getGlobalFetchMock, setupGlobalFetchMock, signInWithTestUser, translateLocal} from '../utils/TestHelper';
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
jest.mock('@libs/fetchImage', () => jest.fn((source: string) => Promise.resolve(source)));

const TEST_USER_LOGIN = 'test@test.com';
const TEST_USER_ACCOUNT_ID = 1;
const POLICY_ID = 'odometerPolicy';
const EXPENSE_REPORT_ID = '100';
const TRANSACTION_THREAD_REPORT_ID = '101';
const IOU_ACTION_ID = '102';
const TRANSACTION_ID = '103';

const policy: Policy = {
    id: POLICY_ID,
    name: 'Odometer Workspace',
    role: CONST.POLICY.ROLE.USER,
    type: CONST.POLICY.TYPE.TEAM,
    owner: TEST_USER_LOGIN,
    outputCurrency: CONST.CURRENCY.USD,
    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
};

const expenseReport: Report = {
    reportID: EXPENSE_REPORT_ID,
    policyID: POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    ownerAccountID: TEST_USER_ACCOUNT_ID,
    managerID: TEST_USER_ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    currency: CONST.CURRENCY.USD,
};

const transactionThreadReport: Report = {
    reportID: TRANSACTION_THREAD_REPORT_ID,
    policyID: POLICY_ID,
    type: CONST.REPORT.TYPE.CHAT,
    parentReportID: EXPENSE_REPORT_ID,
    parentReportActionID: IOU_ACTION_ID,
};

const iouAction: ReportAction = {
    reportActionID: IOU_ACTION_ID,
    actorAccountID: TEST_USER_ACCOUNT_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    childReportID: TRANSACTION_THREAD_REPORT_ID,
    created: '2026-10-19 12:00:00.000',
    originalMessage: {
        IOUReportID: EXPENSE_REPORT_ID,
        IOUTransactionID: TRANSACTION_ID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
    },
    message: [{type: 'COMMENT', html: 'USD 10.00 expense', text: 'USD 10.00 expense'}],
};

const odometerTransaction: Transaction = {
    transactionID: TRANSACTION_ID,
    reportID: EXPENSE_REPORT_ID,
    amount: 1000,
    currency: CONST.CURRENCY.USD,
    created: '2026-10-19',
    merchant: '10 mi @ $1.00 / mi',
    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
    comment: {odometerStart: 100, odometerEnd: 110},
    receipt: {source: 'https://www.expensify.com/receipts/w_odometer.jpg', filename: 'w_odometer.jpg'},
};

const renderReceiptModal = (initialParams: AuthScreensParamList[typeof SCREENS.TRANSACTION_RECEIPT]) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, AttachmentModalContextProvider, CurrentReportIDContextProvider, PortalProvider, PlaybackContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={SCREENS.TRANSACTION_RECEIPT}>
                    <Stack.Screen
                        name={SCREENS.TRANSACTION_RECEIPT}
                        component={AttachmentModalScreen}
                        initialParams={initialParams}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );

describe('TransactionReceiptModalContent - odometer receipt', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: TEST_USER_ACCOUNT_ID, email: TEST_USER_LOGIN},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[TEST_USER_ACCOUNT_ID]: {accountID: TEST_USER_ACCOUNT_ID, login: TEST_USER_LOGIN}},
            },
        });
    });

    beforeEach(async () => {
        global.fetch = getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
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

    it('shows Replace for the receipt of a created odometer expense', async () => {
        // Given a created odometer expense with a receipt, submitted by the current user on an open report
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${TRANSACTION_THREAD_REPORT_ID}`, transactionThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`, {[IOU_ACTION_ID]: iouAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, odometerTransaction);
        });
        await waitForBatchedUpdatesWithAct();

        // When the receipt is opened from the expense
        renderReceiptModal({reportID: TRANSACTION_THREAD_REPORT_ID, transactionID: TRANSACTION_ID});
        await waitForBatchedUpdatesWithAct();

        // Then Replace is shown, because the stitcher no longer owns the receipt once the expense is created
        expect(screen.getByText(translateLocal('common.replace'))).toBeOnTheScreen();
    });

    it('hides Replace for the receipt of an odometer draft', async () => {
        // Given an odometer draft whose receipt is built from the odometer photos
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, odometerTransaction);
        });
        await waitForBatchedUpdatesWithAct();

        // When the receipt is opened from the create flow
        renderReceiptModal({
            reportID: EXPENSE_REPORT_ID,
            transactionID: TRANSACTION_ID,
            action: CONST.IOU.ACTION.CREATE,
            iouType: CONST.IOU.TYPE.SUBMIT,
        });
        await waitForBatchedUpdatesWithAct();

        // Then Replace is hidden, so the user cannot overwrite the receipt the stitcher builds from the photos
        expect(screen.queryByText(translateLocal('common.replace'))).toBeNull();
    });
});
