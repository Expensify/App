import {NavigationContainer} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {buildOptimisticTransactionAndCreateDraft, removeDraftTransactions} from '@libs/actions/TransactionEdit';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import IOURequestStepScan from '@pages/iou/request/step/IOURequestStepScan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/TransactionEdit', () => ({
    removeDraftTransactions: jest.fn(),
    buildOptimisticTransactionAndCreateDraft: jest.fn(),
}));

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
    const ReactLib = require('react') as {
        createElement: (type: unknown, props?: unknown, ...children: unknown[]) => unknown;
        Fragment: unknown;
    };
    return (callback: (files: FileObject[]) => void) => {
        triggerFileSelection = callback;
        return {
            validateFiles: (files: FileObject[]) => callback(files),
            PDFValidationComponent: ReactLib.createElement(ReactLib.Fragment),
            ErrorModal: ReactLib.createElement(ReactLib.Fragment),
        };
    };
});

jest.mock('react-native-vision-camera', () => ({
    useCameraDevice: jest.fn(() => null),
}));

const mockCreateObjectURL = () => 'file://mock-receipt.png';
let originalCreateObjectURLDescriptor: PropertyDescriptor | undefined;

function createMinimalReport(reportID: string, policyID: string): Report {
    return {
        reportID,
        policyID,
        ownerAccountID: 1,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        isPinned: false,
        lastVisibleActionCreated: '',
        lastReadTime: '',
    };
}

function getTransactionsDraftOnyx(transactionID: string): Promise<OnyxEntry<Transaction>> {
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
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});

        if (global.URL && Object.getOwnPropertyDescriptor(global.URL, 'createObjectURL')) {
            originalCreateObjectURLDescriptor = Object.getOwnPropertyDescriptor(global.URL, 'createObjectURL');
        }

        if (!global.URL) {
            global.URL = {} as typeof global.URL;
        }

        Object.defineProperty(global.URL, 'createObjectURL', {
            value: mockCreateObjectURL,
            writable: true,
            configurable: true,
        });
    });

    beforeEach(() => {
        triggerFileSelection = null;
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    afterAll(() => {
        jest.restoreAllMocks();
        if (!originalCreateObjectURLDescriptor) {
            return;
        }
        Object.defineProperty(global.URL, 'createObjectURL', originalCreateObjectURLDescriptor);
    });

    it('replacing receipt when editing does not clear other drafts', async () => {
        const REPORT_ID = '1';
        const POLICY_ID = 'policy-1';
        const TRANSACTION_ID_1 = '101';
        const TRANSACTION_ID_2 = '102';

        const transaction1 = createRandomTransaction(1);
        transaction1.reportID = REPORT_ID;
        transaction1.transactionID = TRANSACTION_ID_1;
        transaction1.receipt = {source: 'file://receipt1.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

        const transaction2 = createRandomTransaction(2);
        transaction2.reportID = REPORT_ID;
        transaction2.transactionID = TRANSACTION_ID_2;
        transaction2.receipt = {source: 'file://receipt2.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMinimalReport(REPORT_ID, POLICY_ID));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID_1}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID_2}`, transaction2);
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
                                        transactionID: TRANSACTION_ID_1,
                                        backTo: ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.route,
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

        const replacementFile = {name: 'replacement-receipt.png', type: 'image/png', size: 100} as FileObject;
        await act(async () => {
            if (!triggerFileSelection) {
                return;
            }
            triggerFileSelection([replacementFile]);
        });
        await waitForBatchedUpdates();

        expect(jest.mocked(removeDraftTransactions)).not.toHaveBeenCalled();

        const tx2After = await getTransactionsDraftOnyx(TRANSACTION_ID_2);
        expect(tx2After).toBeDefined();
        expect(tx2After?.transactionID).toBe(TRANSACTION_ID_2);
        expect(tx2After?.receipt?.source).toBe('file://receipt2.png');
    });

    it('multi-scan mode preserves first receipt when adding second receipt', async () => {
        const REPORT_ID = '1';
        const POLICY_ID = 'policy-1';
        const TRANSACTION_ID_1 = '101';
        const TRANSACTION_ID_2 = '102';

        jest.mocked(buildOptimisticTransactionAndCreateDraft).mockReturnValue(createRandomTransaction(3));

        const transaction1 = createRandomTransaction(1);
        transaction1.reportID = REPORT_ID;
        transaction1.transactionID = TRANSACTION_ID_1;
        transaction1.receipt = {source: 'file://first-receipt.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

        const transaction2 = createRandomTransaction(2);
        transaction2.reportID = REPORT_ID;
        transaction2.transactionID = TRANSACTION_ID_2;
        transaction2.receipt = {source: 'file://second-receipt.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMinimalReport(REPORT_ID, POLICY_ID));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID_1}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID_2}`, transaction2);
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
                                        transactionID: TRANSACTION_ID_1,
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
            if (!triggerFileSelection) {
                return;
            }
            triggerFileSelection([secondFile]);
        });
        await waitForBatchedUpdates();

        expect(jest.mocked(removeDraftTransactions)).not.toHaveBeenCalled();

        const tx1After = await getTransactionsDraftOnyx(TRANSACTION_ID_1);
        expect(tx1After).toBeDefined();
        expect(tx1After?.receipt?.source).toBe('file://first-receipt.png');

        const tx2After = await getTransactionsDraftOnyx(TRANSACTION_ID_2);
        expect(tx2After).toBeDefined();
        expect(tx2After?.receipt?.source).toBe('file://second-receipt.png');
    });
});
