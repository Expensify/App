/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {removeMoneyRequestOdometerImage, setMoneyRequestOdometerImage} from '@libs/actions/OdometerTransactionUtils';
import * as TransactionEdit from '@libs/actions/TransactionEdit';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import TabSwitchGuardContext from '@libs/Navigation/TabSwitchGuardContext';
import type {RegisterTabSwitchGuard, TabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import IOURequestStepDistanceOdometer from '@pages/iou/request/step/IOURequestStepDistanceOdometer';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import createRandomTransaction from '../utils/collections/transaction';
import getOnyxValue from '../utils/getOnyxValue';
import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('@components/LocaleContextProvider', () => {
    const React2 = require('react');
    const defaultContextValue = {
        translate: (path: string) => path,
        numberFormat: (number: number) => String(number),
        getLocalDateFromDatetime: () => new Date(),
        datetimeToRelative: () => '',
        datetimeToCalendarTime: () => '',
        formatPhoneNumber: (phone: string) => phone,
        toLocaleDigit: (digit: string) => digit,
        toLocaleOrdinal: (number: number) => String(number),
        fromLocaleDigit: (localeDigit: string) => localeDigit,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        formatTravelDate: () => '',
        preferredLocale: 'en',
    };
    const LocaleContext = React2.createContext(defaultContextValue);
    return {
        LocaleContext,
        LocaleContextProvider: ({children}: {children: React.ReactNode}) => React2.createElement(LocaleContext.Provider, {value: defaultContextValue}, children),
    };
});

// Keep the real backup/restore logic but spy on the restore so we can assert it runs exactly once on unmount.
// The duplicate inline effect (now removed) made it run twice, which nulled the transaction on the second pass
jest.mock('@libs/actions/TransactionEdit', () => {
    const actual = jest.requireActual<typeof TransactionEdit>('@libs/actions/TransactionEdit');
    return {
        ...actual,
        restoreOriginalTransactionFromBackupWithImageCleanup: jest.fn(actual.restoreOriginalTransactionFromBackupWithImageCleanup),
    };
});

jest.mock('@libs/actions/MapboxToken', () => ({
    init: jest.fn(),
    stop: jest.fn(),
}));

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));

jest.mock('@hooks/useShowNotFoundPageInIOUStep', () => () => false);
jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({name: 'Money_Request_Step_Distance_Odometer', params: {}})),
    getState: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({name: 'Money_Request_Step_Distance_Odometer', params: {}})),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        closeRHPFlow: jest.fn(),
        dismissModalWithReport: jest.fn(),
        navigationRef: mockRef,
        setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        getReportRouteByID: jest.fn(() => undefined),
        removeScreenByKey: jest.fn(),
    };
});

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({name: 'Money_Request_Step_Distance_Odometer', params: {}})),
        getState: jest.fn(() => ({})),
    };
    return {
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
        useRoute: jest.fn(() => ({key: 'distance-odometer', name: 'Money_Request_Step_Distance_Odometer', params: {}})),
    };
});

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = 'report-odometer-backup-1';
const TRANSACTION_ID = 'txn-odometer-backup-1';
const ODOMETER_START = 100;
const ODOMETER_END = 300;

// Typed route for the odometer step, built against the single screen so `action`/`backToReport` need no casts.
function createOdometerRoute(): PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_ODOMETER>['route'] {
    return {
        key: 'Money_Request_Step_Distance_Odometer-test',
        name: SCREENS.MONEY_REQUEST.STEP_DISTANCE_ODOMETER,
        params: {
            action: CONST.IOU.ACTION.CREATE,
            iouType: CONST.IOU.TYPE.SUBMIT,
            reportID: REPORT_ID,
            transactionID: TRANSACTION_ID,
        },
    };
}

function createTestReport(): Report {
    return {
        reportID: REPORT_ID,
        chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
        ownerAccountID: ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        isPinned: false,
        lastVisibleActionCreated: '',
        lastReadTime: '',
        participants: {
            [ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: CONST.REPORT.ROLE.MEMBER},
        },
    };
}

// A populated odometer expense, as it exists when the user reaches the confirmation step and taps "Distance"
function createOdometerTransaction(): Transaction {
    const transaction = createRandomTransaction(1);
    return {
        ...transaction,
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
        comment: {
            ...transaction.comment,
            odometerStart: ODOMETER_START,
            odometerEnd: ODOMETER_END,
            customUnit: {
                customUnitID: 'test-unit-id',
                customUnitRateID: 'test-rate-id',
                name: 'Distance',
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            },
        },
    };
}

// Edit-from-confirmation entry: route name !== DISTANCE_CREATE and action !== EDIT -> `isEditingConfirmation` is true
function renderEditFromConfirmationOdometer() {
    return render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <IOURequestStepDistanceOdometer
                    route={createOdometerRoute()}
                    // @ts-expect-error minimal navigation for test
                    navigation={undefined}
                />
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>,
    );
}

describe('IOURequestStepDistanceOdometer - edit-from-confirmation backup is restored exactly once on plain back', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
    });

    // Regression: the edit-from-confirmation screen once ran two identical backup-restore effects. On a plain "back"
    // the first restored + deleted the backup, the second found it missing and nulled the transaction. The
    // `useOdometerTransactionBackup` hook must be the sole owner of this lifecycle
    it('restores the transaction once and does not wipe it when unmounting without saving', async () => {
        const transaction = createOdometerTransaction();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createTestReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${TRANSACTION_ID}`, transaction);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        const {unmount} = renderEditFromConfirmationOdometer();
        await waitForBatchedUpdatesWithAct();

        // Plain back / unmount without setting didSaveEditingConfirmationRef or backupHandledManually
        unmount();
        await waitForBatchedUpdatesWithAct();
        await waitForBatchedUpdatesWithAct();

        // The backup restore must run exactly once. With the duplicate inline effect it ran twice (the second
        // restore nulled the transaction). This assertion is 2 on the buggy code
        expect(jest.mocked(TransactionEdit.restoreOriginalTransactionFromBackupWithImageCleanup)).toHaveBeenCalledTimes(1);

        // The expense must survive the back navigation: the draft transaction is restored from the backup, not nulled
        const restoredTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
        expect(restoredTransaction).not.toBeNull();
        expect(restoredTransaction).not.toBeUndefined();
        expect(restoredTransaction?.comment?.odometerStart).toBe(ODOMETER_START);
        expect(restoredTransaction?.comment?.odometerEnd).toBe(ODOMETER_END);
    });
});

// Integration tests for the discard guard: they capture the real closure registered via
// useRegisterTabSwitchGuard (through TabSwitchGuardContext) and call its getHasUnsavedChanges().
//
// Setup is a save-for-later draft that holds the readings; the user then edits the image. The tests assert both
// directions:
//   - a real image edit (add / swap / remove)  -> getHasUnsavedChanges() is true  (the discard modal must fire)
//   - re-entering with nothing changed         -> getHasUnsavedChanges() is false (no false prompt)
//
// The first case is the false-negative being fixed: the draft check is presence-only, so it missed an image that
// moved ahead of the draft. Unlike the unit tests, these run the whole path (resync effect + image baseline +
// getOdometerHasUnsavedChanges), not just the pure function.
describe('IOURequestStepDistanceOdometer - discard guard detects user image changes with an active save-for-later draft', () => {
    const START_IMAGE_A: FileObject = {uri: 'a.jpg', name: 'a.jpg', type: 'image/jpeg', size: 1234};
    const START_IMAGE_B: FileObject = {uri: 'b.jpg', name: 'b.jpg', type: 'image/jpeg', size: 5678};

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
    });

    function renderWithCapturedGuard(register: RegisterTabSwitchGuard) {
        return render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <TabSwitchGuardContext.Provider value={register}>
                        <IOURequestStepDistanceOdometer
                            route={createOdometerRoute()}
                            // @ts-expect-error minimal navigation for test
                            navigation={undefined}
                        />
                    </TabSwitchGuardContext.Provider>
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );
    }

    // Seeds the edit-from-confirmation flow with an active save-for-later readings draft and renders, returning the
    // captured tab guard. `startImage` optionally seeds an image already present at mount (for swap/remove)
    async function setupAndRender(startImage?: FileObject): Promise<{getHasUnsavedChanges: () => boolean; transaction: Transaction}> {
        const transaction = createOdometerTransaction();
        if (startImage) {
            transaction.comment = {...transaction.comment, odometerStartImage: startImage};
        }
        let capturedGuard: TabSwitchGuard | undefined;
        const register: RegisterTabSwitchGuard = (guard) => {
            capturedGuard = guard;
            return () => {};
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createTestReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${TRANSACTION_ID}`, transaction);
            await Onyx.set(ONYXKEYS.ODOMETER_DRAFT, {odometerStartReading: ODOMETER_START, odometerEndReading: ODOMETER_END});
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        renderWithCapturedGuard(register);
        await waitForBatchedUpdatesWithAct();

        return {getHasUnsavedChanges: () => capturedGuard?.getHasUnsavedChanges() ?? false, transaction};
    }

    it('flags an added image as unsaved (the false-negative being fixed)', async () => {
        const {getHasUnsavedChanges, transaction} = await setupAndRender();

        // Baseline captured from a transaction with no image; nothing changed yet
        expect(getHasUnsavedChanges()).toBe(false);

        await act(async () => {
            setMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.START, START_IMAGE_A, true, false);
            await waitForBatchedUpdates();
        });
        await waitForBatchedUpdatesWithAct();

        expect(getHasUnsavedChanges()).toBe(true);
    });

    it('flags a swapped image as unsaved', async () => {
        const {getHasUnsavedChanges, transaction} = await setupAndRender(START_IMAGE_A);

        expect(getHasUnsavedChanges()).toBe(false);

        await act(async () => {
            setMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.START, START_IMAGE_B, true, false);
            await waitForBatchedUpdates();
        });
        await waitForBatchedUpdatesWithAct();

        expect(getHasUnsavedChanges()).toBe(true);
    });

    it('flags a removed image as unsaved', async () => {
        const {getHasUnsavedChanges, transaction} = await setupAndRender(START_IMAGE_A);

        expect(getHasUnsavedChanges()).toBe(false);

        await act(async () => {
            removeMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.START, true, false);
            await waitForBatchedUpdates();
        });
        await waitForBatchedUpdatesWithAct();

        expect(getHasUnsavedChanges()).toBe(true);
    });

    it('stays silent when the screen is re-entered with no image change', async () => {
        const {getHasUnsavedChanges} = await setupAndRender(START_IMAGE_A);

        expect(getHasUnsavedChanges()).toBe(false);
    });

    // A NON-user image URI change (blob re-mint on reload, external save) keeps the file name + size and only changes
    // the uri, so its re-mint-invariant identity (getOdometerImageIdentity = name|size) is unchanged and the guard
    // stays silent - no "user edited" tracking needed
    it('stays silent for a non-user image URI change (e.g. blob re-mint) because the identity is invariant', async () => {
        const {getHasUnsavedChanges} = await setupAndRender(START_IMAGE_A);

        expect(getHasUnsavedChanges()).toBe(false);

        // Change the image URI WITHOUT going through the user-edit actions -> no marker is set
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                comment: {odometerStartImage: {uri: 'a-reminted.jpg', name: 'a.jpg', type: 'image/jpeg', size: 1234}},
            });
        });
        await waitForBatchedUpdatesWithAct();

        expect(getHasUnsavedChanges()).toBe(false);
    });
});
