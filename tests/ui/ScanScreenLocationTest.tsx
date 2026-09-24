import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import getCurrentPosition from '@libs/getCurrentPosition';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import IOURequestStepScan from '@pages/iou/request/step/IOURequestStepScan';
import type {ScanRoute} from '@pages/iou/request/step/IOURequestStepScan/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, UserLocation} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';
import {getShowConfirmModalOption, mockShowConfirmModal, resetMockConfirmModal} from '../utils/mockUseConfirmModal';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1';
const POLICY_ID = 'policy-1';
const TRANSACTION_ID = '101';

let mockLocationPermissionResult = 'granted';

const mockCheck = jest.fn(() => Promise.resolve(mockLocationPermissionResult));

jest.mock('react-native-permissions', () => ({
    RESULTS: {GRANTED: 'granted', DENIED: 'denied', UNAVAILABLE: 'unavailable', BLOCKED: 'blocked', LIMITED: 'limited'},
    PERMISSIONS: {IOS: {CAMERA: 'ios.permission.CAMERA', LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION'}, ANDROID: {CAMERA: 'android.permission.CAMERA'}},
    check: () => mockCheck(),
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

jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

jest.mock('react-native-vision-camera', () => ({
    useCameraDevice: jest.fn(() => null),
    useCameraDevices: jest.fn(() => []),
    useCameraFormat: jest.fn(() => null),
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/hooks/useScanRouteParams', () => ({
    __esModule: true,
    default: () => ({iouType: 'submit', routeName: 'Money_Request_Create'}),
}));

jest.mock('@libs/getCurrentPosition');

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

function getUserLocationFromOnyx(): Promise<OnyxEntry<UserLocation>> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.USER_LOCATION,
            callback: (val) => {
                resolve(val);
                Onyx.disconnect(connection);
            },
        });
    });
}

function createUntouchedScanFromReportEntry() {
    const transaction = createRandomTransaction(1);
    transaction.reportID = REPORT_ID;
    transaction.transactionID = TRANSACTION_ID;
    transaction.isFromGlobalCreate = false;
    transaction.amount = 0;
    return transaction;
}

async function renderScanScreen() {
    const transaction = createUntouchedScanFromReportEntry();

    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMinimalReport());
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: 'Test', type: CONST.POLICY.TYPE.TEAM});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
    });

    render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <NavigationContainer>
                    <IOURequestStepScan
                        route={createMock<ScanRoute>({
                            key: 'StepScanLocation',
                            name: SCREENS.MONEY_REQUEST.CREATE,
                            params: {
                                action: CONST.IOU.ACTION.CREATE,
                                iouType: CONST.IOU.TYPE.SUBMIT,
                                reportID: REPORT_ID,
                                transactionID: TRANSACTION_ID,
                            },
                        })}
                        navigation={createMock<PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>['navigation']>({})}
                    />
                </NavigationContainer>
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );

    await waitForBatchedUpdatesWithAct();
}

describe('scan screen location permission prompt', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        resetMockConfirmModal();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('asks for location permission instead of caching a position when permission is not granted', async () => {
        // Given a device whose location permission was never granted, and no prompt inside the seven day window
        mockLocationPermissionResult = 'denied';

        // When the scan screen opens
        await renderScanScreen();
        await waitForBatchedUpdates();

        // Then the screen asks for permission, and spends no location read that permission would refuse
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('title')).toBe(translateLocal('receipt.locationAccessTitle'));
        expect(jest.mocked(getCurrentPosition)).not.toHaveBeenCalled();
        expect(await getUserLocationFromOnyx()).toBeUndefined();
    });

    it('holds the location prompt back while the last denial is still inside the prompt window', async () => {
        // Given a denied device whose last denial is recent enough that the seven day prompt window still covers it
        mockLocationPermissionResult = 'denied';
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, new Date().toISOString());
        });

        // When the scan screen opens
        await renderScanScreen();
        await waitForBatchedUpdates();

        // Then neither the prompt nor a location read happens, so the prompt window still protects the user
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(jest.mocked(getCurrentPosition)).not.toHaveBeenCalled();
    });
});
