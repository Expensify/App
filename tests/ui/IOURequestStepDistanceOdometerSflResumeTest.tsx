/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as OdometerTransactionUtils from '@libs/actions/OdometerTransactionUtils';
import getPlatform from '@libs/getPlatform';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import TabSwitchGuardContext from '@libs/Navigation/TabSwitchGuardContext';
import type {RegisterTabSwitchGuard, TabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import IOURequestStepDistanceOdometer from '@pages/iou/request/step/IOURequestStepDistanceOdometer';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {OdometerDraft, Report, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import type {View} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const BOTTOM_SAFE_AREA_INSET = 24;

// Controllable so the remount-on-focus tests can toggle it; other suites in this file leave it at the default `true`.
const mockUseIsFocused = jest.fn(() => true);
// A plain counter, not a jest mock, so `jest.clearAllMocks()` doesn't reset it — tests reset it themselves.
const mockKeyboardAvoidingViewMountCount = {current: 0};
const WINDOW_HEIGHT = 800;

// The factories below create their own `jest.fn()` rather than closing over an outer variable: `@libs/getPlatform`
// and `react-native-keyboard-controller` both get required extremely early via an unrelated transitive import chain
// (`OdometerTransactionUtils` -> ... -> `CONFIG.ts`), before this file's own top-level `const`s would be assigned,
// so a factory reading an outer variable at that point would crash. The platform test controls `getPlatform` via
// the imported reference instead, which `jest.mock` already routes to this same mock.
jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    // Defaults to Android, the only platform where the remount-on-focus key applies, so existing tests exercise it
    // without needing to opt in; the platform-gating test below overrides it to confirm other platforms don't remount.
    default: jest.fn(() => 'android'),
}));
jest.mock('react-native-keyboard-controller', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-keyboard-controller/jest'),
    // Pinned so the `keyboardVerticalOffset` test can assert an exact computed value.
    useWindowDimensions: jest.fn(() => ({width: 400, height: 800})),
}));

// `KeyboardAvoidingView`'s real native behavior isn't observable in Jest — `react-native-keyboard-controller/jest`
// maps it to a plain `View` with no avoidance logic, so testing the actual padding needs a device. This mock instead
// forwards `enabled`/`testID` onto a plain View, so the gating logic (create vs edit flow) still has coverage. Props
// pass through rather than a hardcoded testID because `ScreenWrapper` (rendered by `StepScreenWrapper` in the edit
// flow) has its own separate `KeyboardAvoidingView` usage that would otherwise collide on the same testID. The mount
// effect exists so the remount-on-focus tests can observe a fresh instance (React's `key` isn't visible via `.props`).
jest.mock('@components/KeyboardAvoidingView', () => {
    const ReactActual = jest.requireActual<typeof React>('react');
    const {View: RNView} = jest.requireActual<{View: typeof View}>('react-native');
    function MockKeyboardAvoidingView({children, ...rest}: {children?: React.ReactNode} & Record<string, unknown>) {
        ReactActual.useEffect(() => {
            mockKeyboardAvoidingViewMountCount.current += 1;
        }, []);
        return ReactActual.createElement(RNView, rest, children);
    }
    return {
        __esModule: true,
        default: MockKeyboardAvoidingView,
    };
});

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
jest.mock('@hooks/useSafeAreaInsets', () => ({__esModule: true, default: () => ({top: 0, right: 0, bottom: BOTTOM_SAFE_AREA_INSET, left: 0})}));
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
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    createNavigationContainerRef: jest.fn(() => ({getCurrentRoute: jest.fn(() => ({name: 'Money_Request_Distance_Create', params: {}})), getState: jest.fn(() => ({}))})),
    useIsFocused: () => mockUseIsFocused(),
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

// `isEditing` is derived from the route's `action`, so the edit flow is reachable without extra navigation setup.
function createDistanceEditRoute(): PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE>['route'] {
    const route = createDistanceCreateRoute();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- same `never`-typed params as the create route
    const params = {...route.params, action: CONST.IOU.ACTION.EDIT} as unknown as MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE];
    return {...route, params};
}

/** `undefined` when the mocked KeyboardAvoidingView isn't rendered at all (e.g. `shouldShowWrapper` swapped it out). */
function getKeyboardAvoidingViewEnabled(): boolean | undefined {
    const enabled: unknown = screen.queryByTestId('odometerKeyboardAvoidingView')?.props.enabled;
    return typeof enabled === 'boolean' ? enabled : undefined;
}

function odometerStepElement(route: PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE>['route']) {
    return (
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <TabSwitchGuardContext.Provider value={() => () => {}}>
                    <IOURequestStepDistanceOdometer
                        route={route}
                        // @ts-expect-error minimal navigation for test
                        navigation={undefined}
                    />
                </TabSwitchGuardContext.Provider>
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>
    );
}

function renderOdometerStep(route: PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE>['route']) {
    return render(odometerStepElement(route));
}

function renderCreateFlow(register: RegisterTabSwitchGuard) {
    return render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <TabSwitchGuardContext.Provider value={register}>
                    <IOURequestStepDistanceOdometer
                        route={createDistanceCreateRoute()}
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
        mockUseIsFocused.mockReturnValue(true);
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

describe('IOURequestStepDistanceOdometer - keyboard avoidance', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(true);
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.ANDROID);
        mockKeyboardAvoidingViewMountCount.current = 0;
        await Onyx.clear();
        await waitForBatchedUpdates();
        await signInWithTestUser(ACCOUNT_ID, 'test@user.com');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createReport());
        // The create flow reads the draft collection and the edit flow reads the non-draft one, so seed both.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, createOdometerTransaction(false));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, createOdometerTransaction(false));
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdates();
    });

    // The create flow has no ScreenWrapper of its own and the shared tab ScreenWrapper keeps keyboard avoidance off,
    // so this KeyboardAvoidingView is the only thing keeping the buttons clear of the keyboard.
    it('enables keyboard avoidance in the create flow', async () => {
        const {unmount} = renderOdometerStep(createDistanceCreateRoute());
        await waitForBatchedUpdatesWithAct();

        expect(getKeyboardAvoidingViewEnabled()).toBe(true);
        unmount();
    });

    // Android can recycle this screen's native view while it sits in the background of another tab, so the
    // KeyboardAvoidingView is remounted (via a `key` tied to focus) on every focus transition to shed any stale
    // state. A mount counter stands in for React's `key`, which isn't observable via `.props`.
    it('remounts KeyboardAvoidingView on a focus transition, not on an unrelated re-render', async () => {
        const route = createDistanceCreateRoute();
        const {rerender, unmount} = renderOdometerStep(route);
        await waitForBatchedUpdatesWithAct();
        expect(mockKeyboardAvoidingViewMountCount.current).toBe(1);

        // Re-render while focus is unchanged: no remount.
        mockUseIsFocused.mockReturnValue(true);
        rerender(odometerStepElement(route));
        expect(mockKeyboardAvoidingViewMountCount.current).toBe(1);

        // Focus leaves the tab: remounts.
        mockUseIsFocused.mockReturnValue(false);
        rerender(odometerStepElement(route));
        expect(mockKeyboardAvoidingViewMountCount.current).toBe(2);

        // Focus returns: remounts again.
        mockUseIsFocused.mockReturnValue(true);
        rerender(odometerStepElement(route));
        expect(mockKeyboardAvoidingViewMountCount.current).toBe(3);

        unmount();
    });

    // The recycling issue the remount key works around is Android-specific, so other platforms should keep a
    // stable key and skip the remount cost (re-running mount effects, dropping input/image state) entirely.
    it('does not remount KeyboardAvoidingView on a focus transition on non-Android platforms', async () => {
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
        const route = createDistanceCreateRoute();
        const {rerender, unmount} = renderOdometerStep(route);
        await waitForBatchedUpdatesWithAct();
        expect(mockKeyboardAvoidingViewMountCount.current).toBe(1);

        mockUseIsFocused.mockReturnValue(false);
        rerender(odometerStepElement(route));
        expect(mockKeyboardAvoidingViewMountCount.current).toBe(1);

        mockUseIsFocused.mockReturnValue(true);
        rerender(odometerStepElement(route));
        expect(mockKeyboardAvoidingViewMountCount.current).toBe(1);

        unmount();
    });

    // KeyboardAvoidingView measures its position relative to its parent, not the screen, so without an offset it
    // under-reserves space and the buttons end up behind the keyboard. This is the core of the fix, so a sign or
    // order error in `windowHeight - ownY - ownHeight` needs to fail a test, not ship unnoticed.
    it('computes keyboardVerticalOffset from its own layout', async () => {
        const {unmount} = renderOdometerStep(createDistanceCreateRoute());
        await waitForBatchedUpdatesWithAct();

        // Before any layout event, `ownY`/`ownHeight` are still 0, so the offset is the full window height.
        expect(screen.getByTestId('odometerKeyboardAvoidingView').props.keyboardVerticalOffset).toBe(WINDOW_HEIGHT);

        const OWN_Y = 120;
        const OWN_HEIGHT = 600;
        fireEvent(screen.getByTestId('odometerKeyboardAvoidingView'), 'layout', {nativeEvent: {layout: {x: 0, y: OWN_Y, width: 0, height: OWN_HEIGHT}}});

        expect(screen.getByTestId('odometerKeyboardAvoidingView').props.keyboardVerticalOffset).toBe(WINDOW_HEIGHT - OWN_Y - OWN_HEIGHT);

        unmount();
    });

    // The edit flow renders its own ScreenWrapper via StepScreenWrapper, which already avoids the keyboard, so this
    // one must stay disabled to avoid double-avoidance.
    it('disables keyboard avoidance in the edit flow', async () => {
        const {unmount} = renderOdometerStep(createDistanceEditRoute());
        await waitForBatchedUpdatesWithAct();

        expect(getKeyboardAvoidingViewEnabled()).toBe(false);
        unmount();
    });
});
