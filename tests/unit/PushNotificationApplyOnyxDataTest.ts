import ONYXKEYS from '@src/ONYXKEYS';

import {NativeModules} from 'react-native';
import Onyx from 'react-native-onyx';

import '@libs/Notification/PushNotification/subscribeToPushNotifications';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockReceivedHandlers: Record<string, (data: Record<string, unknown>) => Promise<void>> = {};
const mockApplyOnyxUpdatesReliably = jest.fn((): Promise<void> => Promise.resolve());

jest.mock('@libs/actions/applyOnyxUpdatesReliably', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockApplyOnyxUpdatesReliably(...args),
}));

jest.mock('@libs/Notification/PushNotification', () => ({
    __esModule: true,
    default: {
        register: jest.fn(),
        init: jest.fn(),
        deregister: jest.fn(),
        clearNotifications: jest.fn(),
        onSelected: jest.fn(),
        onReceived: jest.fn((type: string, callback: (data: Record<string, unknown>) => Promise<void>) => {
            mockReceivedHandlers[type] = callback;
        }),
        TYPE: {
            REPORT_COMMENT: 'reportComment',
            REPORT_ACTION: 'reportAction',
            TRANSACTION: 'transaction',
        },
    },
}));

describe('applyOnyxData, when a push notification arrives', () => {
    const finishBackgroundProcessing = jest.fn();

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        NativeModules.PushNotificationBridge = {finishBackgroundProcessing};
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID, 'notification-id');
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();
    });

    const receiveReportComment = () =>
        mockReceivedHandlers.reportComment({
            reportID: '1',
            lastUpdateID: 20,
            previousUpdateID: 10,
            onyxData: [],
        });

    it('should tell the OS the background work finished once the updates applied', async () => {
        // Given a notification whose updates apply cleanly
        mockApplyOnyxUpdatesReliably.mockReturnValueOnce(Promise.resolve());

        // When it is received
        await receiveReportComment();
        await waitForBatchedUpdates();

        // Then the background task is finished, so the OS is not left waiting on it
        expect(finishBackgroundProcessing).toHaveBeenCalledTimes(1);
    });

    it('should tell the OS the background work finished even when applying the updates failed', async () => {
        // Given a notification whose updates fail to apply
        mockApplyOnyxUpdatesReliably.mockReturnValueOnce(Promise.reject(new Error('apply failed')));

        // When it is received
        await receiveReportComment();
        await waitForBatchedUpdates();

        // Then the background task is still finished, instead of being left hanging on Android headless JS
        expect(finishBackgroundProcessing).toHaveBeenCalledTimes(1);
    });
});
