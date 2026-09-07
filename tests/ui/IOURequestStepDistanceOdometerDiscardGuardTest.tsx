import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as DiscardChangesNative from '@hooks/useDiscardChangesConfirmation/index.native';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import IOURequestStepDistanceOdometer from '@pages/iou/request/step/IOURequestStepDistanceOdometer';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// These tests assert the flag the native hook computes during render, not what its callback returns when asked.
// That distinction is the whole point: iOS maps the flag to `preventNativeDismiss`, so a swipe-back is decided by
// the last committed value. A callback that reads refs answers correctly whenever it is called, yet still leaves
// the flag stale, because React Compiler reuses the render-time result while the closure's captured values hold.
const preventRemoveFlags: boolean[] = [];

// Only the two React APIs this factory needs. A namespace import of 'react' trips no-restricted-imports,
// and `typeof import(...)` is banned, so name them off the default import instead (types are erased).
type ReactFactoryApi = {
    createContext: typeof React.createContext;
    createElement: typeof React.createElement;
};

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('@components/LocaleContextProvider', () => {
    const React2 = jest.requireActual<ReactFactoryApi>('react');
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

// The blink this PR fixes is iOS-only, so pin the native variant rather than whichever one module resolution picks.
jest.mock('@hooks/useDiscardChangesConfirmation', () => jest.requireActual<typeof DiscardChangesNative>('@hooks/useDiscardChangesConfirmation/index.native.ts'));

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
    getCurrentRoute: jest.fn(() => ({name: 'Money_Request_Distance_Create', params: {}})),
    getState: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({name: 'Money_Request_Distance_Create', params: {}})),
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
        getCurrentRoute: jest.fn(() => ({name: 'Money_Request_Distance_Create', params: {}})),
        getState: jest.fn(() => ({})),
    };
    return {
        ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: (shouldPreventRemove: boolean) => {
            preventRemoveFlags.push(shouldPreventRemove);
        },
        useRoute: jest.fn(() => ({key: 'distance-odometer', name: 'Money_Request_Distance_Create', params: {}})),
    };
});

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = 'report-odometer-guard-1';
const TRANSACTION_ID = 'txn-odometer-guard-1';
const ODOMETER_START = 100;
const ODOMETER_END = 300;

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

function createOdometerDraftTransaction(readings?: {start: number; end: number}): Transaction {
    const transaction = createRandomTransaction(1);
    return {
        ...transaction,
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
        comment: {
            ...transaction.comment,
            odometerStart: readings?.start,
            odometerEnd: readings?.end,
            customUnit: {
                customUnitID: 'test-unit-id',
                customUnitRateID: 'test-rate-id',
                name: 'Distance',
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            },
        },
    };
}

function createDistanceCreateRoute(): PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE>['route'] {
    // The DISTANCE_CREATE route types `action`/`backTo` as `never` (unused for navigation but read at runtime here), so the params object can't be built without one assertion.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see comment above
    const params = {
        action: CONST.IOU.ACTION.CREATE,
        iouType: CONST.IOU.TYPE.SUBMIT,
        reportID: REPORT_ID,
        transactionID: TRANSACTION_ID,
    } as unknown as MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE];
    return {
        key: 'Money_Request_Distance_Create-test',
        name: SCREENS.MONEY_REQUEST.DISTANCE_CREATE,
        params,
    };
}

function renderCreateOdometer() {
    return render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <IOURequestStepDistanceOdometer
                    route={createDistanceCreateRoute()}
                    // @ts-expect-error minimal navigation for test
                    navigation={undefined}
                />
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>,
    );
}

// Returns the underlying TextInput (not the floating-label <Text>) for a given odometer field label
const odometerInput = (labelKey: string) => {
    const input = screen.getAllByLabelText(labelKey).find((element) => 'value' in element.props);
    if (!input) {
        throw new Error(`No editable odometer input found for ${labelKey}`);
    }
    return input;
};

// ScreenWrapper calls usePreventRemove as well and always passes false here, so a single armed call in the render
// pass can only have come from the discard guard. Reading the last flag alone would depend on render order.
const isGuardArmed = () => preventRemoveFlags.some(Boolean);

const typeStartReading = async (value: string) => {
    preventRemoveFlags.length = 0;
    fireEvent.changeText(odometerInput('distance.odometer.startReading'), value);
    await waitForBatchedUpdatesWithAct();
};

describe('IOURequestStepDistanceOdometer - native discard guard arms on the reading itself', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        preventRemoveFlags.length = 0;
        await Onyx.clear();
        await waitForBatchedUpdates();
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
    });

    // The reported bug: on a fresh Track distance > Odometer screen, typing 7 and edge-swiping back dismissed the
    // screen with no discard modal, because the flag iOS reads was still the one computed before the keystroke.
    it('arms on the first digit and relaxes when it is deleted', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createTestReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, createOdometerDraftTransaction());
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        renderCreateOdometer();
        await waitForBatchedUpdatesWithAct();

        // Nothing typed yet, so the swipe must go through in one native animation - that is the blink this PR removes.
        expect(isGuardArmed()).toBe(false);

        await typeStartReading('7');
        expect(isGuardArmed()).toBe(true);

        // Deleting the digit puts the reading back on its baseline, so the next swipe must not be swallowed.
        await typeStartReading('');
        expect(isGuardArmed()).toBe(false);
    });

    // The same three states against a non-empty baseline: reverting has to compare against the readings the screen
    // was seeded with, not against an empty string.
    it('arms on an edit to a seeded reading and relaxes when the seeded value is typed back', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createTestReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, createOdometerDraftTransaction({start: ODOMETER_START, end: ODOMETER_END}));
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        renderCreateOdometer();
        await waitForBatchedUpdatesWithAct();

        // The seeded reading has to reach the field, else the revert below would be comparing against an empty baseline.
        expect(odometerInput('distance.odometer.startReading').props.value).toBe(`${ODOMETER_START}`);
        expect(isGuardArmed()).toBe(false);

        await typeStartReading('999');
        expect(isGuardArmed()).toBe(true);

        await typeStartReading(`${ODOMETER_START}`);
        expect(isGuardArmed()).toBe(false);
    });
});
