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
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import IOURequestStepDistance from '@pages/iou/request/step/IOURequestStepDistance';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

jest.mock('@libs/actions/IOU/UpdateMoneyRequest', () => ({
    updateMoneyRequestDistance: jest.fn(),
}));

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

jest.mock('@libs/Navigation/OnyxTabNavigator', () => {
    const React2 = require('react');
    const OnyxTabNavigator = ({children}: {children: React.ReactNode}) => React2.createElement(React2.Fragment, null, children);
    const TopTab = {
        Screen: ({children}: {children: () => React.ReactNode}) => React2.createElement(React2.Fragment, null, typeof children === 'function' ? children() : children),
    };
    const TabScreenWithFocusTrapWrapper = ({children}: {children: React.ReactNode}) => React2.createElement(React2.Fragment, null, children);
    return {
        __esModule: true,
        default: OnyxTabNavigator,
        TopTab,
        TabScreenWithFocusTrapWrapper,
    };
});
jest.mock('@hooks/useShowNotFoundPageInIOUStep', () => () => false);
jest.mock('@src/hooks/useResponsiveLayout');
// The Map/Manual tab navigator only renders outside production (`isEditing && !isProduction`); force a non-production env so the edit-flow tabs render in tests.
jest.mock('@hooks/useEnvironment', () => () => ({environment: 'development', environmentURL: '', isProduction: false, isDevelopment: true}));

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
        closeRHPFlow: jest.fn(),
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

function createDistanceTransaction(overrides?: Partial<Transaction>): Transaction {
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
            customUnit: {
                customUnitID: 'test-unit-id',
                customUnitRateID: 'test-rate-id',
                name: 'Distance',
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                quantity: 100,
            },
            ...overrides?.comment,
        },
        ...overrides,
    };
}

function renderEditMode() {
    return render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <IOURequestStepDistance
                    route={{
                        key: 'Money_Request_Step_Distance-test',
                        name: SCREENS.MONEY_REQUEST.STEP_DISTANCE,
                        params: {
                            action: CONST.IOU.ACTION.EDIT as never,
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

describe('IOURequestStepDistance - submitManualDistance', () => {
    const {updateMoneyRequestDistance} = jest.requireMock<{updateMoneyRequestDistance: jest.Mock}>('@libs/actions/IOU/UpdateMoneyRequest');

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

    it('should show validation error for empty distance input', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        const transaction = createDistanceTransaction();
        const report = createTestReport();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, null);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        renderEditMode();
        await waitForBatchedUpdatesWithAct();

        // The Save button from the manual tab should be visible (mock renders both tabs)
        const saveButtons = screen.getAllByText('common.save');
        expect(saveButtons.length).toBeGreaterThan(0);

        // Press Save without changing the value — the form starts with the current distance
        // so we need to clear it first to test empty validation
        const distanceInput = screen.getAllByLabelText(/common\.distance/).at(0)!;
        fireEvent.changeText(distanceInput, '');

        fireEvent.press(saveButtons.at(0)!);

        // updateMoneyRequestDistance should NOT have been called
        expect(updateMoneyRequestDistance).not.toHaveBeenCalled();
    });

    it('should render manual distance input with current distance in edit mode', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        const transaction = createDistanceTransaction();
        const report = createTestReport();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, null);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        renderEditMode();
        await waitForBatchedUpdatesWithAct();

        // The manual distance input should display the current quantity value
        const distanceInputs = screen.getAllByLabelText(/common\.distance/);
        expect(distanceInputs.length).toBeGreaterThan(0);

        // Save button should be visible
        const saveButtons = screen.getAllByText('common.save');
        expect(saveButtons.length).toBeGreaterThan(0);
    });

    it('should not call updateMoneyRequestDistance when Save is pressed without valid changes', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        const transaction = createDistanceTransaction();
        const report = createTestReport();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, null);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        renderEditMode();
        await waitForBatchedUpdatesWithAct();

        // Press Save — the distance value has not been changed via the number pad
        const saveButtons = screen.getAllByText('common.save');
        fireEvent.press(saveButtons.at(0)!);

        // updateMoneyRequestDistance should not be called (either validation blocks or no-change early return)
        expect(updateMoneyRequestDistance).not.toHaveBeenCalled();
    });

    it('should render both Map and Manual tabs with correct content in edit mode', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        const transaction = createDistanceTransaction();
        const report = createTestReport();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, null);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        renderEditMode();
        await waitForBatchedUpdatesWithAct();

        // Map tab content: waypoint addresses should be visible
        expect(screen.getByAccessibilityHint(/123 Main St/)).toBeTruthy();
        expect(screen.getByAccessibilityHint(/456 Oak Ave/)).toBeTruthy();

        // Manual tab content: distance input and Save button should be present
        const distanceInputs = screen.getAllByLabelText(/common\.distance/);
        expect(distanceInputs.length).toBeGreaterThan(0);
        const saveButtons = screen.getAllByText('common.save');
        expect(saveButtons.length).toBeGreaterThan(0);
    });
});

describe('IOURequestStepDistance - navigateToWaypointEditPage backTo (GH #90037)', () => {
    const Navigation = jest.requireMock<{navigate: jest.Mock; getActiveRoute: jest.Mock}>('@libs/Navigation/Navigation');

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        Navigation.getActiveRoute.mockReturnValue('');
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('uses the explicit step-distance route as backTo in the edit flow (the tab navigator would otherwise add a tab suffix that breaks goBack)', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        const report = createTestReport();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, createDistanceTransaction());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, null);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        renderEditMode();
        await waitForBatchedUpdatesWithAct();

        const startWaypoint = screen.getByAccessibilityHint(/123 Main St/);
        fireEvent.press(startWaypoint, {nativeEvent: {}, type: 'press', target: startWaypoint, currentTarget: startWaypoint});

        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.MONEY_REQUEST_STEP_WAYPOINT.getRoute(
                CONST.IOU.ACTION.EDIT,
                CONST.IOU.TYPE.SUBMIT,
                TRANSACTION_ID,
                REPORT_ID,
                '0',
                ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.SUBMIT, TRANSACTION_ID, REPORT_ID),
            ),
        );
    });

    it('uses the current active route as backTo in the create flow (no tab navigator, so the production getActiveRoute path is correct)', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        const report = createTestReport();
        const activeRoute = ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, TRANSACTION_ID, REPORT_ID);
        Navigation.getActiveRoute.mockReturnValue(activeRoute);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, createDistanceTransaction());
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
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

        const startWaypoint = screen.getByAccessibilityHint(/123 Main St/);
        fireEvent.press(startWaypoint, {nativeEvent: {}, type: 'press', target: startWaypoint, currentTarget: startWaypoint});

        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.MONEY_REQUEST_STEP_WAYPOINT.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, TRANSACTION_ID, REPORT_ID, '0', activeRoute),
        );
    });
});

describe('IOURequestStepDistance - manual tab follows the recalculated route distance (GH #90082, #90083)', () => {
    // Mirrors `saveWaypoint`/`updateWaypoints`: a waypoint edit clears the route + customUnit.quantity,
    // then the BE pushes back the new geometry.
    const initialRouteMeters = DistanceRequestUtils.convertToDistanceInMeters(100, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
    const distanceTransactionWithRoute = (): Transaction => ({
        ...createDistanceTransaction(),
        routes: {route0: {distance: initialRouteMeters, geometry: {coordinates: [[0, 0] as const, [1, 1] as const]}}},
    });
    // `getAllByLabelText` matches both the field label <Text> and the underlying <TextInput>; pick the input.
    const distanceInput = () => screen.getAllByLabelText(/common\.distance/).find((element) => 'value' in element.props)!;
    const displayedDistance = () => distanceInput().props.value as string;
    const distanceUnit = () =>
        String(distanceInput().props.accessibilityLabel ?? '').includes(`common.${CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS}`)
            ? CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS
            : CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const expectedDisplayFor = (distanceInDestinationUnit: number) => {
        const meters = DistanceRequestUtils.convertToDistanceInMeters(distanceInDestinationUnit, distanceUnit());
        return roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(meters, distanceUnit())).toString();
    };
    const recalculateRoute = async (distanceInDestinationUnit: number) => {
        // saveWaypoint: clear the route and customUnit.quantity, change a waypoint address
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {
                comment: {customUnit: {quantity: null}, waypoints: {waypoint1: {address: '789 New Ave', lat: 41.5, lng: -73.5, keyForList: 'stop_waypoint'}}},
                routes: {route0: {distance: null, geometry: {coordinates: null}}},
            });
        });
        await waitForBatchedUpdatesWithAct();
        // BE returns the recalculated geometry
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {
                routes: {
                    route0: {
                        distance: DistanceRequestUtils.convertToDistanceInMeters(distanceInDestinationUnit, distanceUnit()),
                        geometry: {
                            coordinates: [
                                [0, 0],
                                [2, 2],
                            ],
                        },
                    },
                },
            });
        });
        await waitForBatchedUpdatesWithAct();
    };

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
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createTestReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, distanceTransactionWithRoute());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, null);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
    });

    it('updates the manual tab distance when the user edits a waypoint (GH #90082)', async () => {
        renderEditMode();
        await waitForBatchedUpdatesWithAct();

        await recalculateRoute(80);

        expect(displayedDistance()).toBe(expectedDisplayFor(80));
    });

    it('updates the manual tab distance after a waypoint edit even if the user had typed a manual value first (GH #90083)', async () => {
        renderEditMode();
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(distanceInput(), '777');
        await waitForBatchedUpdatesWithAct();
        expect(displayedDistance()).toBe('777');

        await recalculateRoute(55);

        expect(displayedDistance()).toBe(expectedDisplayFor(55));
    });
});

describe('IOURequestStepDistance - re-saving a waypoint resets a manual distance override (GH #90105)', () => {
    const {updateMoneyRequestDistance} = jest.requireMock<{updateMoneyRequestDistance: jest.Mock}>('@libs/actions/IOU/UpdateMoneyRequest');
    const routeMeters = DistanceRequestUtils.convertToDistanceInMeters(100, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
    // Seed the full distance transaction, then set just the route + the (possibly cleared) manual quantity.
    const seedDistanceTransaction = async (
        key: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` | `${typeof ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${string}`,
        quantity: number | null,
    ) => {
        await Onyx.merge(key, createDistanceTransaction());
        await Onyx.merge(key, {
            comment: {customUnit: {quantity}},
            routes: {
                route0: {
                    distance: routeMeters,
                    geometry: {
                        coordinates: [
                            [0, 0],
                            [1, 1],
                        ],
                    },
                },
            },
        });
    };

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createTestReport());
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, null);
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
    });

    it('sends an update with the route distance when a manual override was cleared by saveWaypoint', async () => {
        await act(async () => {
            // Saved state had a manual override (200 mi); current state is post-`saveWaypoint` (quantity cleared, route re-fetched to its real value).
            await seedDistanceTransaction(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${TRANSACTION_ID}`, 200);
            await seedDistanceTransaction(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, null);
        });

        renderEditMode();
        await waitForBatchedUpdatesWithAct();

        // The Map-tab Save button is the first "common.save" → submitWaypoints
        fireEvent.press(screen.getAllByText('common.save').at(0)!);

        expect(updateMoneyRequestDistance).toHaveBeenCalledWith(expect.objectContaining({distance: expect.any(Number)}));
    });

    it('does not send an update when the waypoints and distance are unchanged', async () => {
        await act(async () => {
            await seedDistanceTransaction(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${TRANSACTION_ID}`, 100);
            await seedDistanceTransaction(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, 100);
        });

        renderEditMode();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getAllByText('common.save').at(0)!);

        expect(updateMoneyRequestDistance).not.toHaveBeenCalled();
    });
});
