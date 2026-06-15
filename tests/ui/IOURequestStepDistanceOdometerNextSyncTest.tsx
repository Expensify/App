/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {isOdometerDraftPendingHydration} from '@libs/actions/OdometerTransactionUtils';
import IOURequestStepDistanceOdometer from '@pages/iou/request/step/IOURequestStepDistanceOdometer';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {OdometerDraft, Report, Transaction} from '@src/types/onyx';
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

// Neutralize the post-Next navigation so the test can inspect Onyx right after Next, in isolation
jest.mock('@pages/iou/request/step/IOURequestStepDistance/handleMoneyRequestStepDistanceNavigation', () => ({
    __esModule: true,
    default: jest.fn(),
}));

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
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
        useRoute: jest.fn(() => ({key: 'distance-odometer', name: 'Money_Request_Distance_Create', params: {}})),
    };
});

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = 'report-odometer-1';
const TRANSACTION_ID = 'txn-odometer-1';

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

function createOdometerDraftTransaction(): Transaction {
    const transaction = createRandomTransaction(1);
    return {
        ...transaction,
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
        comment: {
            ...transaction.comment,
            // Start with no odometer readings - the user enters them in the form
            odometerStart: undefined,
            odometerEnd: undefined,
            customUnit: {
                customUnitID: 'test-unit-id',
                customUnitRateID: 'test-rate-id',
                name: 'Distance',
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            },
        },
    };
}

function renderCreateOdometer() {
    return render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <IOURequestStepDistanceOdometer
                    route={{
                        key: 'Money_Request_Distance_Create-test',
                        name: SCREENS.MONEY_REQUEST.DISTANCE_CREATE,
                        params: {
                            action: CONST.IOU.ACTION.CREATE as never,
                            iouType: CONST.IOU.TYPE.SUBMIT,
                            reportID: REPORT_ID,
                            transactionID: TRANSACTION_ID,
                            backToReport: undefined as never,
                        },
                    }}
                    // @ts-expect-error minimal navigation for test
                    navigation={undefined}
                />
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>,
    );
}

// Returns the underlying TextInput (not the floating-label <Text>) for a given odometer field label
const odometerInput = (labelKey: string) => screen.getAllByLabelText(labelKey).find((element) => 'value' in element.props)!;

const enterReadingsAndPressNext = async (start: string, end: string) => {
    fireEvent.changeText(odometerInput('distance.odometer.startReading'), start);
    fireEvent.changeText(odometerInput('distance.odometer.endReading'), end);
    await waitForBatchedUpdatesWithAct();

    fireEvent.press(screen.getByTestId('next-save-button'));
    // Flush twice so any Onyx writes triggered by Next would land before we assert
    await waitForBatchedUpdatesWithAct();
    await waitForBatchedUpdatesWithAct();
};

describe('IOURequestStepDistanceOdometer - create-flow Next does not write the save-for-later draft', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createTestReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, createOdometerDraftTransaction());
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
    });

    // "Next" is not a save action (only "Save for later" and the confirmation "Save" write the draft), so it must
    // leave an existing draft untouched. The directional isOdometerDraftPendingHydration reports the staler draft
    // as NOT pending, which is what prevents a false discard modal on re-entry
    it('leaves an existing save-for-later draft untouched on Next, and is reported as not pending', async () => {
        const existingDraft: OdometerDraft = {odometerStartReading: 50, odometerEndReading: 60};
        await act(async () => {
            await Onyx.set(ONYXKEYS.ODOMETER_DRAFT, existingDraft);
        });

        renderCreateOdometer();
        await waitForBatchedUpdatesWithAct();

        await enterReadingsAndPressNext('100', '300');

        const draftAfter = await getOnyxValue(ONYXKEYS.ODOMETER_DRAFT);
        const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);

        // Next did NOT touch ODOMETER_DRAFT - it still holds the originally saved readings
        expect(draftAfter?.odometerStartReading).toBe(50);
        expect(draftAfter?.odometerEndReading).toBe(60);
        // The transaction still received the freshly entered readings
        expect(draftTransaction?.comment?.odometerStart).toBe(100);
        expect(draftTransaction?.comment?.odometerEnd).toBe(300);
        // Even though the draft is now staler than the transaction, the directional predicate reports it as
        // NOT pending hydration (the transaction already holds readings) -> no false discard modal on re-entry
        expect(isOdometerDraftPendingHydration(draftAfter, draftTransaction?.comment)).toBe(false);
    });

    // The draft still holds an image the user has since removed from the transaction. Next leaves the draft
    // untouched, and the directional check reports the staler-image draft as NOT pending -> no false discard modal
    it('reports a readings+image draft as not pending after its image is removed from the transaction', async () => {
        const existingDraft: OdometerDraft = {odometerStartReading: 50, odometerEndReading: 60, odometerStartImage: 'data:image/png;base64,xxx'};
        await act(async () => {
            await Onyx.set(ONYXKEYS.ODOMETER_DRAFT, existingDraft);
        });

        renderCreateOdometer();
        await waitForBatchedUpdatesWithAct();

        await enterReadingsAndPressNext('100', '300');

        const draftAfter = await getOnyxValue(ONYXKEYS.ODOMETER_DRAFT);
        const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);

        // Next did NOT touch ODOMETER_DRAFT - it still holds the image.
        expect(draftAfter?.odometerStartImage).toBe('data:image/png;base64,xxx');
        // The transaction holds the freshly entered readings but no image (the user removed it before Next)
        expect(draftTransaction?.comment?.odometerStart).toBe(100);
        expect(draftTransaction?.comment?.odometerStartImage).toBeUndefined();
        // The staler-image draft is reported as NOT pending hydration -> no false discard modal on re-entry
        expect(isOdometerDraftPendingHydration(draftAfter, draftTransaction?.comment)).toBe(false);
    });

    // Cleared readings must NOT reappear when an image is later deleted. The user clears both reading inputs (local
    // state only), then deletes an image, which writes the transaction and re-fires the resync effect while
    // isUserTyping=true. The `!isUserTyping` guard on the predicate's reading branches must keep them cleared
    it('keeps readings cleared when an odometer image is deleted after clearing them', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                comment: {odometerStart: 100, odometerEnd: 300, odometerStartImage: 'data:image/png;base64,xxx'},
            });
        });

        renderCreateOdometer();
        await waitForBatchedUpdatesWithAct();

        const startInput = odometerInput('distance.odometer.startReading');
        const endInput = odometerInput('distance.odometer.endReading');

        // The form hydrates from the transaction on mount
        expect(startInput.props.value).toBe('100');
        expect(endInput.props.value).toBe('300');

        // User clears BOTH inputs (updates local state + the typing flag; the transaction is NOT written)
        fireEvent.changeText(startInput, '');
        fireEvent.changeText(endInput, '');
        await waitForBatchedUpdatesWithAct();
        expect(startInput.props.value).toBe('');
        expect(endInput.props.value).toBe('');

        // User deletes the start image - mirrors removeMoneyRequestOdometerImage + goBack to the mounted step
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {comment: {odometerStartImage: null}});
        });
        await waitForBatchedUpdatesWithAct();

        // The cleared readings must stay cleared - they must NOT be re-hydrated from the stale transaction
        expect(startInput.props.value).toBe('');
        expect(endInput.props.value).toBe('');
    });

    // Pressing Next never writes the draft in the plain create flow either, so an unrelated future expense
    // is never left with an orphaned ODOMETER_DRAFT
    it('does not create a draft on Next when no save-for-later draft exists', async () => {
        expect(await getOnyxValue(ONYXKEYS.ODOMETER_DRAFT)).toBeUndefined();

        renderCreateOdometer();
        await waitForBatchedUpdatesWithAct();

        await enterReadingsAndPressNext('100', '300');

        // Next does not write ODOMETER_DRAFT
        expect(await getOnyxValue(ONYXKEYS.ODOMETER_DRAFT)).toBeUndefined();
        // The transaction itself still received the readings
        const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
        expect(draftTransaction?.comment?.odometerStart).toBe(100);
        expect(draftTransaction?.comment?.odometerEnd).toBe(300);
    });
});
