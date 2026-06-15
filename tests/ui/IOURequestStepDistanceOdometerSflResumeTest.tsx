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
import * as OdometerTransactionUtils from '@libs/actions/OdometerTransactionUtils';
import TabSwitchGuardContext from '@libs/Navigation/TabSwitchGuardContext';
import type {RegisterTabSwitchGuard, TabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';
import IOURequestStepDistanceOdometer from '@pages/iou/request/step/IOURequestStepDistanceOdometer';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {OdometerDraft, Report, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import createRandomTransaction from '../utils/collections/transaction';
import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => ({default: jest.fn(), MarkerView: jest.fn(), setAccessToken: jest.fn()}));

// Keep the real module (getOdometerHasUnsavedChanges + the actions) but stub saveOdometerDraft so "Save for later"
// resolves deterministically in jsdom (the real one tries to read a blob: URI)
jest.mock('@libs/actions/OdometerTransactionUtils', () => {
    const actual = jest.requireActual<typeof OdometerTransactionUtils>('@libs/actions/OdometerTransactionUtils');
    return {
        ...actual,
        saveOdometerDraft: jest.fn(() => Promise.resolve()),
    };
});

jest.mock('@components/LocaleContextProvider', () => {
    const React2 = require('react');
    const defaultContextValue = {
        translate: (path: string) => path,
        numberFormat: (n: number) => String(n),
        getLocalDateFromDatetime: () => new Date(),
        datetimeToRelative: () => '',
        datetimeToCalendarTime: () => '',
        formatPhoneNumber: (p: string) => p,
        toLocaleDigit: (d: string) => d,
        toLocaleOrdinal: (n: number) => String(n),
        fromLocaleDigit: (d: string) => d,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        formatTravelDate: () => '',
        preferredLocale: 'en',
    };
    const LocaleContext = React2.createContext(defaultContextValue);
    return {LocaleContext, LocaleContextProvider: ({children}: {children: React.ReactNode}) => React2.createElement(LocaleContext.Provider, {value: defaultContextValue}, children)};
});
jest.mock('@pages/iou/request/step/IOURequestStepDistance/handleMoneyRequestStepDistanceNavigation', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/actions/MapboxToken', () => ({init: jest.fn(), stop: jest.fn()}));
jest.mock('@components/ProductTrainingContext', () => ({useProductTrainingContext: () => [false]}));
jest.mock('@hooks/useShowNotFoundPageInIOUStep', () => () => false);
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({__esModule: true, default: () => ({didScreenTransitionEnd: true})}));
jest.mock('@libs/Navigation/navigationRef', () => ({getCurrentRoute: jest.fn(() => ({name: 'Money_Request_Distance_Create', params: {}})), getState: jest.fn(() => ({}))}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    closeRHPFlow: jest.fn(),
    dismissModalWithReport: jest.fn(),
    navigationRef: {getCurrentRoute: jest.fn(() => ({name: 'Money_Request_Distance_Create', params: {}})), getState: jest.fn(() => ({}))},
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(() => undefined),
    removeScreenByKey: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
    createNavigationContainerRef: jest.fn(() => ({getCurrentRoute: jest.fn(() => ({name: 'Money_Request_Distance_Create', params: {}})), getState: jest.fn(() => ({}))})),
    useIsFocused: () => true,
    useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
    useFocusEffect: jest.fn(),
    usePreventRemove: jest.fn(),
    useRoute: jest.fn(() => ({key: 'distance-odometer', name: 'Money_Request_Distance_Create', params: {}})),
}));

const ACCOUNT_ID = 1;
const REPORT_ID = 'report-sfl-resume';
const TRANSACTION_ID = 'txn-sfl-resume';
const START_IMAGE: FileObject = {uri: 'data:image/png;base64,sfl', name: 'a.png', type: 'image/png', size: 1234};

function createReport(): Report {
    return {
        reportID: REPORT_ID,
        chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
        ownerAccountID: ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        isPinned: false,
        lastVisibleActionCreated: '',
        lastReadTime: '',
        participants: {[ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: CONST.REPORT.ROLE.MEMBER}},
    };
}

function createOdometerTransaction(withImage: boolean): Transaction {
    const transaction = createRandomTransaction(1);
    return {
        ...transaction,
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
        comment: {
            ...transaction.comment,
            odometerStart: withImage ? 100 : undefined,
            odometerEnd: withImage ? 300 : undefined,
            odometerStartImage: withImage ? START_IMAGE : undefined,
            customUnit: {customUnitID: 'u', customUnitRateID: 'r', name: 'Distance', distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
        },
    };
}

function renderCreateFlow(register: RegisterTabSwitchGuard) {
    return render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <TabSwitchGuardContext.Provider value={register}>
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
                </TabSwitchGuardContext.Provider>
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>,
    );
}

const odometerInput = (labelKey: string) => screen.getAllByLabelText(labelKey).find((element) => 'value' in element.props)!;

describe('IOURequestStepDistanceOdometer - create-flow discard guard (no stored user-edit marks)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
        await signInWithTestUser(ACCOUNT_ID, 'test@user.com');
    });

    // After capture + "Save for later" + same-session resume, the draft hydrates a re-minted image into
    // the transaction. The baseline absorbs it and the re-mint-invariant identity (name|size) reports no change
    it('Save for later then resume reports no unsaved changes', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, createOdometerTransaction(false));
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        // Session 1: type readings + capture a start image (the real marking path), then Save for later
        const {unmount} = renderCreateFlow(() => () => {});
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(odometerInput('distance.odometer.startReading'), '100');
        fireEvent.changeText(odometerInput('distance.odometer.endReading'), '300');
        await act(async () => {
            OdometerTransactionUtils.setMoneyRequestOdometerImage(createOdometerTransaction(false), CONST.IOU.ODOMETER_IMAGE_TYPE.START, START_IMAGE, true, false);
            await waitForBatchedUpdates();
        });
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('save-for-later-button'));
        await waitForBatchedUpdatesWithAct();
        await waitForBatchedUpdatesWithAct();

        unmount();

        // Session 2 (same JS session, no reload): resume with the draft + image hydrated into the transaction
        const existingDraft: OdometerDraft = {odometerStartReading: 100, odometerEndReading: 300, odometerStartImage: 'data:image/png;base64,sfl'};
        await act(async () => {
            await Onyx.set(ONYXKEYS.ODOMETER_DRAFT, existingDraft);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, createOdometerTransaction(true));
        });
        let resumeGuard: TabSwitchGuard | undefined;
        renderCreateFlow((guard) => {
            resumeGuard = guard;
            return () => {};
        });
        await waitForBatchedUpdatesWithAct();

        expect(resumeGuard?.getHasUnsavedChanges() ?? false).toBe(false);
    });

    // In the create flow, Next then leaving must still prompt. The baseline is snapshotted EMPTY at the
    // (empty) mount and survives Next -> back (screen stays mounted), so the committed readings differ from it
    it('reports unsaved changes after Next in the create flow', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, createOdometerTransaction(false));
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        let guard: TabSwitchGuard | undefined;
        renderCreateFlow((capturedGuard) => {
            guard = capturedGuard;
            return () => {};
        });
        await waitForBatchedUpdatesWithAct();

        // Empty mount baseline -> nothing unsaved yet
        expect(guard?.getHasUnsavedChanges() ?? false).toBe(false);

        // Type readings and press Next (writes the throwaway draft and lowers the typing flag, without remounting)
        fireEvent.changeText(odometerInput('distance.odometer.startReading'), '100');
        fireEvent.changeText(odometerInput('distance.odometer.endReading'), '300');
        fireEvent.press(screen.getByTestId('next-save-button'));
        await waitForBatchedUpdatesWithAct();

        // The committed-but-unsaved readings differ from the surviving empty baseline -> leaving must prompt
        expect(guard?.getHasUnsavedChanges() ?? false).toBe(true);
    });
});
