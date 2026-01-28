import {NavigationContainer} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import * as TransactionEditModule from '@libs/actions/TransactionEdit';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import IOURequestStepScan from '@pages/iou/request/step/IOURequestStepScan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1';
const POLICY_ID = 'policy-1';

let triggerFileSelection: ((files: FileObject[]) => void) | null = null;

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

jest.mock('@hooks/useFilesValidation', () => {
    const React = require('react');
    return (callback: (files: FileObject[]) => void) => {
        triggerFileSelection = callback;
        return {
            validateFiles: (files: FileObject[]) => callback(files),
            PDFValidationComponent: React.createElement(React.Fragment),
            ErrorModal: React.createElement(React.Fragment),
        };
    };
});

jest.mock('react-native-vision-camera', () => ({
    useCameraDevice: jest.fn(() => null),
}));

const mockCreateObjectURL = jest.fn(() => 'file://mock-receipt.png');
global.URL.createObjectURL = mockCreateObjectURL;

function createMinimalReport(reportID: string): Report {
    return {
        reportID,
        policyID: POLICY_ID,
        ownerAccountID: 1,
        type: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        state: CONST.REPORT.STATE_NUM.OPEN,
        status: CONST.REPORT.STATUS_NUM.OPEN,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        isPinned: false,
        lastVisibleActionCreated: '',
        lastReadTime: '',
        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
    } as Report;
}

function getOnyxDraft(transactionID: string): Promise<OnyxEntry<Transaction>> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
            callback: (val) => {
                resolve(val);
                Onyx.disconnect(connection);
            },
        });
    });
}

describe('IOURequestStepScan', () => {
    let removeDraftTransactionsSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        triggerFileSelection = null;
        removeDraftTransactionsSpy = jest.spyOn(TransactionEditModule, 'removeDraftTransactions');
    });

    afterEach(async () => {
        removeDraftTransactionsSpy.mockRestore();
        await Onyx.clear();
    });

    it('replacing receipt in multi-scan does not clear other drafts', async () => {
        const transaction1 = createRandomTransaction(1);
        transaction1.reportID = REPORT_ID;
        transaction1.transactionID = '101';
        transaction1.receipt = {source: 'file://receipt1.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

        const transaction2 = createRandomTransaction(2);
        transaction2.reportID = REPORT_ID;
        transaction2.transactionID = '102';
        transaction2.receipt = {source: 'file://receipt2.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMinimalReport(REPORT_ID));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}101`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}102`, transaction2);
        });
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestStepScan
                            route={
                                {
                                    key: 'StepScan',
                                    name: SCREENS.MONEY_REQUEST.STEP_SCAN,
                                    params: {
                                        action: CONST.IOU.ACTION.CREATE,
                                        iouType: CONST.IOU.TYPE.SUBMIT,
                                        reportID: REPORT_ID,
                                        transactionID: '101',
                                        backTo: 'Money_Request_Step_Confirmation' as const,
                                        pageIndex: 0,
                                    },
                                } as unknown as PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_SCAN>['route']
                            }
                            navigation={{} as never}
                            isMultiScanEnabled
                            isStartingScan={false}
                            setIsMultiScanEnabled={jest.fn()}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(triggerFileSelection).not.toBeNull();

        const replacementFile = {name: 'replacement-receipt.png', type: 'image/png', size: 100} as FileObject;
        await act(async () => {
            triggerFileSelection!([replacementFile]);
        });
        await waitForBatchedUpdates();

        expect(removeDraftTransactionsSpy).not.toHaveBeenCalled();

        const tx2After = await getOnyxDraft('102');
        expect(tx2After).toBeDefined();
        expect(tx2After?.transactionID).toBe('102');
        expect(tx2After?.receipt?.source).toBe('file://receipt2.png');
    });

    it('multi-scan mode preserves first receipt when adding second receipt', async () => {
        const transaction1 = createRandomTransaction(1);
        transaction1.reportID = REPORT_ID;
        transaction1.transactionID = '101';
        transaction1.receipt = {source: 'file://first-receipt.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMinimalReport(REPORT_ID));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}101`, transaction1);
        });
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestStepScan
                            route={
                                {
                                    key: 'StepScan2',
                                    name: SCREENS.MONEY_REQUEST.STEP_SCAN,
                                    params: {
                                        action: CONST.IOU.ACTION.CREATE,
                                        iouType: CONST.IOU.TYPE.SUBMIT,
                                        reportID: REPORT_ID,
                                        transactionID: '101',
                                        backTo: 'Money_Request_Step_Confirmation' as const,
                                        pageIndex: 0,
                                    },
                                } as unknown as PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_SCAN>['route']
                            }
                            navigation={{} as never}
                            isMultiScanEnabled
                            isStartingScan
                            setIsMultiScanEnabled={jest.fn()}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(triggerFileSelection).not.toBeNull();

        const secondFile = {name: 'second-receipt.png', type: 'image/png', size: 200} as FileObject;
        await act(async () => {
            triggerFileSelection!([secondFile]);
        });
        await waitForBatchedUpdates();

        const tx1After = await getOnyxDraft('101');
        expect(tx1After).toBeDefined();
        expect(tx1After?.receipt?.source).toBeDefined();
    });
});
