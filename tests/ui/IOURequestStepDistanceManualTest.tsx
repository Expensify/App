import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import DynamicIOURequestStepDistanceManual from '@pages/iou/request/step/DynamicIOURequestStepDistanceManual';

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

// The screen feeds its dirtiness into the discard hook. Capture that callback so the tests read exactly
// what the guard reads. Capturing react-navigation's `usePreventRemove` flag instead does not work here:
// `ScreenWrapper/index.tsx:216` calls that hook too and renders last, so its `false` wins.
let mockGetHasUnsavedChanges: (() => boolean) | undefined;
// Only the two React APIs this factory needs. A namespace import of 'react' trips no-restricted-imports,
// and `typeof import(...)` is banned, so name them off the default import instead (types are erased).
type ReactFactoryApi = {
    createContext: typeof React.createContext;
    createElement: typeof React.createElement;
};

jest.mock('@hooks/useDiscardChangesConfirmation', () => ({
    __esModule: true,
    default: (options: {getHasUnsavedChanges: () => boolean}) => {
        mockGetHasUnsavedChanges = options.getHasUnsavedChanges;
        return {suppressDiscardPrompt: jest.fn()};
    },
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

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    closeRHPFlow: jest.fn(),
    dismissModalWithReport: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
    getReportRouteByID: jest.fn(() => undefined),
    removeScreenByKey: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getActiveRoute: jest.fn(() => ''),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
    useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn(() => jest.fn())}),
    useFocusEffect: jest.fn(),
    usePreventRemove: jest.fn(),
    useRoute: jest.fn(() => ({key: '', name: 'Money_Request_Step_Distance_Manual', params: {}})),
}));

jest.mock('@libs/actions/IOU/UpdateMoneyRequest', () => ({
    updateMoneyRequestDistance: jest.fn(),
}));

jest.mock('@hooks/useShowNotFoundPageInIOUStep', () => () => false);
jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = 'report-1';
const TRANSACTION_ID = 'txn-1';
const PARTICIPANT_ACCOUNT_ID = 2;
const COMMITTED_DISTANCE = 100;

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
            customUnit: {
                customUnitID: 'test-unit-id',
                customUnitRateID: 'test-rate-id',
                name: 'Distance',
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                quantity: COMMITTED_DISTANCE,
            },
        },
    };
}

// The route types `action`/`backTo` as `never` (unused for navigation but read at runtime by the screen
// under test), so the params object cannot be built without one assertion.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see comment above
const EDIT_ROUTE_PARAMS = {
    action: CONST.IOU.ACTION.EDIT,
    iouType: CONST.IOU.TYPE.SUBMIT,
    reportID: REPORT_ID,
    transactionID: TRANSACTION_ID,
    backTo: undefined,
} as unknown as MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DISTANCE_MANUAL];

function renderEditMode() {
    return render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <DynamicIOURequestStepDistanceManual
                    route={{
                        key: 'Dynamic_Money_Request_Step_Distance_Manual-test',
                        name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DISTANCE_MANUAL,
                        params: EDIT_ROUTE_PARAMS,
                    }}
                    // @ts-expect-error minimal navigation for test
                    navigation={undefined}
                />
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>,
    );
}

// The label matches both the header text and the field, so pick the editable one.
function distanceInput() {
    const input = screen.getAllByLabelText(/common\.distance/).find((node) => typeof node.props.onChangeText === 'function');
    if (!input) {
        throw new Error('The manual distance field did not render');
    }
    return input;
}

describe('IOURequestStepDistanceManual - discard guard', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockGetHasUnsavedChanges = undefined;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('stays clean when the transaction hydrates after mount', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        // Only the report is in Onyx, so the screen mounts with no transaction and seeds an empty mirror.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createTestReport());
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        renderEditMode();
        await waitForBatchedUpdatesWithAct();
        expect(mockGetHasUnsavedChanges?.()).toBe(false);

        // The transaction lands after mount, the way a real edit flow hydrates it.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, createDistanceTransaction());
        });
        await waitForBatchedUpdatesWithAct();

        // The user has touched nothing, so swiping back must not prompt.
        expect(mockGetHasUnsavedChanges?.()).toBe(false);
    });

    it('arms after hydration once the distance is edited, and disarms when it is typed back', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createTestReport());
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        renderEditMode();
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, createDistanceTransaction());
        });
        await waitForBatchedUpdatesWithAct();

        // The field carries the hydrated distance, so the baseline the guard compares against is not empty.
        expect(distanceInput().props.value).toBe(`${COMMITTED_DISTANCE}`);

        fireEvent.changeText(distanceInput(), '200');
        await waitForBatchedUpdatesWithAct();
        expect(mockGetHasUnsavedChanges?.()).toBe(true);

        // Typing the hydrated value back reads as clean, which only holds if the baseline hydrated too.
        fireEvent.changeText(distanceInput(), `${COMMITTED_DISTANCE}`);
        await waitForBatchedUpdatesWithAct();
        expect(mockGetHasUnsavedChanges?.()).toBe(false);
    });
});
