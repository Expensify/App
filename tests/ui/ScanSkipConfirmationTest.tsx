import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as MoneyRequestActions from '@libs/actions/IOU/MoneyRequest';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import IOURequestStepScan from '@pages/iou/request/step/IOURequestStepScan';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type CreateTransactionArg = {optimisticTransactionIDs?: string[]; optimisticChatReportID?: string};

// These mocks isolate the submit-orchestration boundary so we can assert *what ScanSkipConfirmation composes*
// (optimistic-id threading + dismiss-first + cleanup) without exercising the real action/navigation stack.
let triggerFileSelection: ((files: FileObject[]) => void) | null = null;
let capturedCreateTransactionArg: CreateTransactionArg | undefined;
const mockCreateTransaction = jest.fn((arg: CreateTransactionArg) => {
    capturedCreateTransactionArg = arg;
});
const mockCleanupAfterSkipConfirmSubmit = jest.fn();
const mockResolveChatTargetForScan = jest.fn(() => ({report: undefined, chatReportID: 'chat-resolved', optimisticChatReportID: 'optimistic-resolved'}));
// Fire the write synchronously with the fallback override so createTransaction + cleanup run inline.
const mockSubmitWithDismissFirst = jest.fn((params: {executeWrite: (overrides: {shouldHandleNavigation: boolean}) => void}) => params.executeWrite({shouldHandleNavigation: true}));

jest.mock('react-native-permissions', () => ({
    RESULTS: {GRANTED: 'granted', DENIED: 'denied', UNAVAILABLE: 'unavailable', BLOCKED: 'blocked', LIMITED: 'limited'},
    PERMISSIONS: {IOS: {CAMERA: 'ios.permission.CAMERA'}, ANDROID: {CAMERA: 'android.permission.CAMERA'}},
    check: jest.fn(() => Promise.resolve('granted')),
    request: jest.fn(() => Promise.resolve('granted')),
    checkLocationAccuracy: jest.fn(() => 'full'),
    requestLocationAccuracy: jest.fn(() => 'full'),
    checkMultiple: jest.fn(() => Promise.resolve({})),
    requestMultiple: jest.fn(() => Promise.resolve({})),
    checkNotifications: jest.fn(() => Promise.resolve({status: 'granted', settings: {}})),
    requestNotifications: jest.fn(() => Promise.resolve({status: 'granted', settings: {}})),
    openLimitedPhotoLibraryPicker: jest.fn(),
    openSettings: jest.fn(),
}));

jest.mock('react-native-vision-camera', () => ({
    useCameraDevice: jest.fn(() => null),
    useCameraFormat: jest.fn(() => null),
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/hooks/useScanRouteParams', () => ({
    __esModule: true,
    default: () => ({iouType: 'submit', routeName: 'Money_Request_Create'}),
}));

jest.mock('@hooks/useFilesValidation', () => {
    const ReactLib = require('react') as {createElement: (type: unknown, props?: unknown, ...children: unknown[]) => unknown; Fragment: unknown};
    return (callback: (files: FileObject[]) => void) => {
        triggerFileSelection = callback;
        return {
            validateFiles: (files: FileObject[]) => callback(files),
            PDFValidationComponent: ReactLib.createElement(ReactLib.Fragment),
            ErrorModal: ReactLib.createElement(ReactLib.Fragment),
        };
    };
});

jest.mock('@libs/actions/IOU/MoneyRequest', () => {
    const actual = jest.requireActual<typeof MoneyRequestActions>('@libs/actions/IOU/MoneyRequest');
    return {
        ...actual,
        createTransaction: (arg: CreateTransactionArg) => mockCreateTransaction(arg),
        getMoneyRequestParticipantOptions: () => [{accountID: 42, login: 'them@test.com'}],
    };
});

jest.mock('@libs/Navigation/helpers/submitWithDismissFirst', () => ({
    submitWithDismissFirst: (params: {executeWrite: (overrides: {shouldHandleNavigation: boolean}) => void}) => mockSubmitWithDismissFirst(params),
}));

jest.mock('@libs/Navigation/helpers/cleanupAfterSkipConfirmSubmit', () => ({
    __esModule: true,
    default: (params: Record<string, unknown>) => {
        mockCleanupAfterSkipConfirmSubmit(params);
    },
}));

jest.mock('@pages/iou/request/step/resolveChatTarget', () => ({
    resolveChatTargetForScan: () => mockResolveChatTargetForScan(),
    resolveChatTargetForSubmitCleanup: jest.fn(),
}));

const REPORT_ID = '1';
const POLICY_ID = 'policy-1';
const TRANSACTION_ID = '101';

function createMinimalReport(): Report {
    return {
        reportID: REPORT_ID,
        policyID: POLICY_ID,
        ownerAccountID: 1,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        isPinned: false,
        lastVisibleActionCreated: '',
        lastReadTime: '',
    };
}

describe('ScanSkipConfirmation submit orchestration', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        triggerFileSelection = null;
        capturedCreateTransactionArg = undefined;
    });

    afterEach(async () => {
        jest.clearAllMocks();
        mockResolveChatTargetForScan.mockReturnValue({report: undefined, chatReportID: 'chat-resolved', optimisticChatReportID: 'optimistic-resolved'});
        mockSubmitWithDismissFirst.mockImplementation((params) => params.executeWrite({shouldHandleNavigation: true}));
        await Onyx.clear();
    });

    it('threads the UI optimistic ids into createTransaction and runs dismiss-first cleanup on a quick-action scan submit', async () => {
        const transaction = createRandomTransaction(1);
        transaction.reportID = REPORT_ID;
        transaction.transactionID = TRANSACTION_ID;
        transaction.isFromGlobalCreate = false;
        // Non-zero amount keeps the submit off the GPS branch (gpsRequired = amount === 0).
        transaction.amount = 100;
        transaction.receipt = undefined;

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMinimalReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: 'Test', type: CONST.POLICY.TYPE.TEAM});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${TRANSACTION_ID}`, true);
        });
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestStepScan
                            route={
                                {
                                    key: 'StepScanSkip',
                                    name: SCREENS.MONEY_REQUEST.STEP_SCAN,
                                    params: {
                                        action: CONST.IOU.ACTION.CREATE,
                                        iouType: CONST.IOU.TYPE.SUBMIT,
                                        reportID: REPORT_ID,
                                        transactionID: TRANSACTION_ID,
                                        pageIndex: 0,
                                    },
                                } as unknown as PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_SCAN>['route']
                            }
                            navigation={{} as never}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();
        expect(triggerFileSelection).not.toBeNull();

        const receiptFile = {name: 'receipt.png', type: 'image/png', size: 100, uri: 'file://receipt.png'} as FileObject;
        await act(async () => {
            triggerFileSelection?.([receiptFile]);
        });
        await waitForBatchedUpdates();

        // The view layer threads the UI-resolved optimistic ids into the action and runs cleanup-only after dismiss-first; the action owns post-create navigation.
        expect(mockSubmitWithDismissFirst).toHaveBeenCalledTimes(1);
        expect(mockCreateTransaction).toHaveBeenCalledTimes(1);

        // One optimistic id per receipt file, plus the UI-resolved optimistic chat id — so the action writes and the UI navigates to the same target.
        expect(capturedCreateTransactionArg?.optimisticTransactionIDs).toHaveLength(1);
        expect(capturedCreateTransactionArg?.optimisticChatReportID).toBe('optimistic-resolved');

        // Cleanup is cleanup-only (draft ids + linked tracked action); it no longer receives navigation params.
        expect(mockCleanupAfterSkipConfirmSubmit).toHaveBeenCalledTimes(1);
    });
});
