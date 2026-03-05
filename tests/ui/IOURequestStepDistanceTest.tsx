/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import IOURequestStepDistance from '@pages/iou/request/step/IOURequestStepDistance';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import type * as IOU from '../../src/libs/actions/IOU';
import createRandomTransaction from '../utils/collections/transaction';
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

jest.mock('@libs/actions/IOU', () => {
    const actual = jest.requireActual<typeof IOU>('@libs/actions/IOU');
    return {
        ...actual,
        requestMoney: jest.fn(() => ({iouReport: undefined})),
        trackExpense: jest.fn(),
        createDistanceRequest: jest.fn(),
    };
});

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    handleMoneyRequestStepDistanceNavigation: jest.fn(),
}));

jest.mock('@libs/actions/MapboxToken', () => ({
    init: jest.fn(),
    stop: jest.fn(),
}));

jest.mock('@libs/actions/Transaction', () => ({
    openDraftDistanceExpense: jest.fn(),
    removeWaypoint: jest.fn(() => Promise.resolve()),
    updateWaypoints: jest.fn(() => Promise.resolve()),
    getRoute: jest.fn(),
}));

jest.mock('@libs/actions/TransactionEdit', () => ({
    createBackupTransaction: jest.fn(),
    removeBackupTransaction: jest.fn(),
    restoreOriginalTransactionFromBackup: jest.fn(),
}));

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));
jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Money_Request_Step_Distance',
        params: {},
    })),
    getState: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Distance',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        dismissModalWithReport: jest.fn(),
        navigationRef: mockRef,
        setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
        getReportRouteByID: jest.fn(() => undefined),
        removeScreenByKey: jest.fn(),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        getActiveRoute: jest.fn(() => ''),
    };
});

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Distance',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
        useRoute: jest.fn(),
    };
});

// Mock DistanceRequestFooter to avoid Mapbox rendering issues
jest.mock('@components/DistanceRequest/DistanceRequestFooter', () => {
    return () => null;
});

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = 'report-1';
const TRANSACTION_ID = 'txn-1';
const PARTICIPANT_ACCOUNT_ID = 2;

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
            [PARTICIPANT_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: CONST.REPORT.ROLE.MEMBER},
        },
    };
}

function createDistanceTransaction(): Transaction {
    const transaction = createRandomTransaction(1);
    return {
        ...transaction,
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
        comment: {
            ...transaction.comment,
            waypoints: {
                waypoint0: {address: '123 Main St', lat: 40.7128, lng: -74.006, keyForList: 'start_waypoint'},
                waypoint1: {address: '456 Oak Ave', lat: 40.7589, lng: -73.9851, keyForList: 'stop_waypoint'},
            },
        },
    };
}

describe('IOURequestStepDistance - draft transactions coverage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should render and read draftTransactionIDs from Onyx', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        const transaction = createDistanceTransaction();
        const report = createTestReport();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
        });

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <IOURequestStepDistance
                        route={{
                            key: 'Money_Request_Step_Distance-test',
                            name: SCREENS.MONEY_REQUEST.STEP_DISTANCE,
                            params: {
                                action: CONST.IOU.ACTION.CREATE as never,
                                iouType: CONST.IOU.TYPE.SUBMIT,
                                reportID: REPORT_ID,
                                transactionID: TRANSACTION_ID,
                                backTo: undefined as never,
                            },
                        }}
                        // @ts-expect-error minimal navigation for test
                        navigation={undefined}
                    />
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // Component rendered successfully with draftTransactionIDs loaded from Onyx
        // When isCreatingNewRequest is true, StepScreenWrapper doesn't use ScreenWrapper so testID isn't set
        // Verify component rendered by checking for waypoint content
        expect(screen.getByAccessibilityHint(/123 Main St/)).toBeTruthy();
    });

    it('should render with multiple draft transactions in Onyx', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        const transaction = createDistanceTransaction();
        const draftTransaction2 = createRandomTransaction(2);
        const report = createTestReport();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction2.transactionID}`, draftTransaction2);
        });

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <IOURequestStepDistance
                        route={{
                            key: 'Money_Request_Step_Distance-test',
                            name: SCREENS.MONEY_REQUEST.STEP_DISTANCE,
                            params: {
                                action: CONST.IOU.ACTION.CREATE as never,
                                iouType: CONST.IOU.TYPE.SUBMIT,
                                reportID: REPORT_ID,
                                transactionID: TRANSACTION_ID,
                                backTo: undefined as never,
                            },
                        }}
                        // @ts-expect-error minimal navigation for test
                        navigation={undefined}
                    />
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // Component rendered with multiple draft transaction IDs available
        expect(screen.getByAccessibilityHint(/123 Main St/)).toBeTruthy();
    });
});
