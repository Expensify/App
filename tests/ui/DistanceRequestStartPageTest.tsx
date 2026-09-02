import {act, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import DistanceRequestStartPage from '@pages/iou/request/DistanceRequestStartPage';

import type {IOUAction, IOURequestType, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy, SelectedTabRequest, Transaction} from '@src/types/onyx';
import type {DistanceExpenseType} from '@src/types/onyx/IOU';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/Tab');
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('react-native-tab-view', () => ({
    TabView: ({navigationState}: {navigationState: {routes: Array<{name: string}>}}) => {
        const React2 = jest.requireActual<typeof React>('react');
        return React2.createElement(
            React2.Fragment,
            null,
            navigationState.routes.map((route) => React2.createElement('TabRoute', {key: route.name, testID: `tab-${route.name}`})),
        );
    },
    SceneMap: jest.fn(),
    TabBar: 'TabBar',
}));

jest.mock('react-native-vision-camera', () => ({
    useCameraDevice: jest.fn(),
}));

const REPORT_ID = '1';
const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const PERSONAL_POLICY_ID = 'personalPolicy1';

type DistanceCreateScreenProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE>;

/**
 * The focus effect that rebuilds the draft transaction bails out unless a personal policy exists,
 * so every case needs one seeded before the page mounts.
 */
async function setUpOnyx({selectedTab, lastDistanceExpenseType}: {selectedTab?: SelectedTabRequest; lastDistanceExpenseType?: DistanceExpenseType}) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_POLICY_ID, PERSONAL_POLICY_ID);
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.POLICY}${PERSONAL_POLICY_ID}`,
            createMock<Policy>({
                id: PERSONAL_POLICY_ID,
                type: CONST.POLICY.TYPE.PERSONAL,
                name: 'Personal',
                outputCurrency: CONST.CURRENCY.USD,
            }),
        );
        await Onyx.set(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`, selectedTab ?? null);
        await Onyx.set(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, lastDistanceExpenseType ?? null);
    });
}

async function renderPage(defaultSelectedTab: SelectedTabRequest, iouType: IOUType = CONST.IOU.TYPE.TRACK, action: IOUAction = CONST.IOU.ACTION.CREATE) {
    render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <DistanceRequestStartPage
                            route={createMock<DistanceCreateScreenProps['route']>({
                                params: {
                                    action,
                                    iouType,
                                    reportID: REPORT_ID,
                                    transactionID: '',
                                },
                            })}
                            report={undefined}
                            reportDraft={undefined}
                            navigation={createMock<DistanceCreateScreenProps['navigation']>({})}
                            defaultSelectedTab={defaultSelectedTab}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>,
    );

    await waitForBatchedUpdatesWithAct();
}

function getDraftTransaction() {
    return new Promise<OnyxEntry<Transaction>>((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            callback: (value) => {
                resolve(value);
                Onyx.disconnect(connection);
            },
        });
    });
}

async function getDraftRequestType(): Promise<OnyxEntry<IOURequestType>> {
    return (await getDraftTransaction())?.iouRequestType;
}

describe('DistanceRequestStartPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should type the rebuilt draft from the selected tab rather than the last created distance type', async () => {
        // Given a Map tab that is already selected and an Odometer expense created earlier
        await setUpOnyx({
            selectedTab: CONST.TAB_REQUEST.DISTANCE_MAP,
            lastDistanceExpenseType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
        });

        // When the page mounts on the Map tab with no draft request type yet
        await renderPage(CONST.TAB_REQUEST.DISTANCE_MAP);

        // Then the draft is rebuilt as a map expense, so it keeps the waypoints the Map tab needs
        await expect(getDraftRequestType()).resolves.toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP);
    });

    it('should seed the waypoints that keep the waypoint editor reachable from the Map tab', async () => {
        // Given a Map tab that is already selected and an Odometer expense created earlier
        await setUpOnyx({
            selectedTab: CONST.TAB_REQUEST.DISTANCE_MAP,
            lastDistanceExpenseType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
        });

        // When the page mounts on the Map tab with no draft request type yet
        await renderPage(CONST.TAB_REQUEST.DISTANCE_MAP);

        // Then both waypoints are present, so the waypoint page opens the editor instead of "Not here",
        // which it shows whenever fewer than two waypoints are filled in
        const waypoints = (await getDraftTransaction())?.comment?.waypoints ?? {};
        expect(Object.values(waypoints).filter((waypoint) => !isEmptyObject(waypoint))).toHaveLength(2);
    });

    it('should fall back to the last created distance type when no tab has been selected yet', async () => {
        // Given no persisted tab but an Odometer expense created earlier
        await setUpOnyx({lastDistanceExpenseType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER});

        // When the page mounts on the Odometer tab
        await renderPage(CONST.TAB_REQUEST.DISTANCE_ODOMETER);

        // Then the draft keeps the remembered Odometer type
        await expect(getDraftRequestType()).resolves.toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER);
    });

    it('should default to the map type when neither a selected tab nor a last created type exists', async () => {
        // Given a user who has never created a distance expense or picked a tab
        await setUpOnyx({});

        // When the page mounts on the default Map tab
        await renderPage(CONST.TAB_REQUEST.DISTANCE_MAP);

        // Then the draft falls back to the map type
        await expect(getDraftRequestType()).resolves.toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP);
    });

    it('keeps manual distance available for a self-DM expense with a personal policy when every workspace has commuter exclusions', async () => {
        await setUpOnyx({selectedTab: CONST.TAB_REQUEST.DISTANCE_MANUAL});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            reportID: REPORT_ID,
            policyID: PERSONAL_POLICY_ID,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        });
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.POLICY}workspacePolicy`,
            createMock<Policy>({
                id: 'workspacePolicy',
                type: CONST.POLICY.TYPE.TEAM,
                name: 'Workspace',
                role: CONST.POLICY.ROLE.USER,
                commuterExclusions: {
                    method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                    fixedDistance: 1,
                    fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
            }),
        );

        await renderPage(CONST.TAB_REQUEST.DISTANCE_MANUAL);

        expect(screen.getByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_MANUAL}`)).toBeOnTheScreen();
        expect(screen.getByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_ODOMETER}`)).toBeOnTheScreen();
    });

    it('hides manual and odometer distance when the only workspace is the auto-report target', async () => {
        await setUpOnyx({selectedTab: CONST.TAB_REQUEST.DISTANCE_MAP});
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: ACCOUNT_LOGIN});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}workspaceReport`, {
            reportID: 'workspaceReport',
            policyID: 'workspacePolicy',
            ownerAccountID: ACCOUNT_ID,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        });
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.POLICY}workspacePolicy`,
            createMock<Policy>({
                id: 'workspacePolicy',
                type: CONST.POLICY.TYPE.TEAM,
                name: 'Workspace',
                role: CONST.POLICY.ROLE.USER,
                autoReporting: true,
                commuterExclusions: {
                    method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                    fixedDistance: 1,
                    fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
            }),
        );

        await renderPage(CONST.TAB_REQUEST.DISTANCE_MAP, CONST.IOU.TYPE.CREATE);

        expect(screen.queryByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_MANUAL}`)).not.toBeOnTheScreen();
        expect(screen.queryByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_ODOMETER}`)).not.toBeOnTheScreen();
    });

    it('hides manual and odometer distance when every active workspace has commuter exclusions', async () => {
        await setUpOnyx({selectedTab: CONST.TAB_REQUEST.DISTANCE_MAP});
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: ACCOUNT_LOGIN});
        for (const policyID of ['workspacePolicy1', 'workspacePolicy2']) {
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                createMock<Policy>({
                    id: policyID,
                    type: CONST.POLICY.TYPE.TEAM,
                    name: policyID,
                    role: CONST.POLICY.ROLE.USER,
                    commuterExclusions: {
                        method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                        fixedDistance: 1,
                        fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    },
                }),
            );
        }

        await renderPage(CONST.TAB_REQUEST.DISTANCE_MAP);

        expect(screen.queryByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_MANUAL}`)).not.toBeOnTheScreen();
        expect(screen.queryByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_ODOMETER}`)).not.toBeOnTheScreen();
    });

    it('keeps manual and odometer distance available when not every active workspace excludes commuters', async () => {
        await setUpOnyx({selectedTab: CONST.TAB_REQUEST.DISTANCE_MAP});
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: ACCOUNT_LOGIN});
        // workspacePolicy1 enforces commuter exclusion, workspacePolicy2 does not, so the tabs must stay visible.
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.POLICY}workspacePolicy1`,
            createMock<Policy>({
                id: 'workspacePolicy1',
                type: CONST.POLICY.TYPE.TEAM,
                name: 'workspacePolicy1',
                role: CONST.POLICY.ROLE.USER,
                commuterExclusions: {
                    method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                    fixedDistance: 1,
                    fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
            }),
        );
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.POLICY}workspacePolicy2`,
            createMock<Policy>({
                id: 'workspacePolicy2',
                type: CONST.POLICY.TYPE.TEAM,
                name: 'workspacePolicy2',
                role: CONST.POLICY.ROLE.USER,
            }),
        );

        await renderPage(CONST.TAB_REQUEST.DISTANCE_MAP);

        expect(screen.getByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_MANUAL}`)).toBeOnTheScreen();
        expect(screen.getByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_ODOMETER}`)).toBeOnTheScreen();
    });

    it('keeps manual and odometer distance available without an active group workspace', async () => {
        await setUpOnyx({selectedTab: CONST.TAB_REQUEST.DISTANCE_MAP});
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: ACCOUNT_LOGIN});

        await renderPage(CONST.TAB_REQUEST.DISTANCE_MAP);

        expect(screen.getByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_MANUAL}`)).toBeOnTheScreen();
        expect(screen.getByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_ODOMETER}`)).toBeOnTheScreen();
    });

    it('keeps manual and odometer distance available when the global FAB targets the self-DM', async () => {
        await setUpOnyx({selectedTab: CONST.TAB_REQUEST.DISTANCE_MAP});
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: ACCOUNT_LOGIN});
        await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'workspacePolicy1');
        await Onyx.set(ONYXKEYS.SELF_DM_REPORT_ID, 'selfDMReport');
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}selfDMReport`, {
            reportID: 'selfDMReport',
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            type: CONST.REPORT.TYPE.CHAT,
        });
        for (const policyID of ['workspacePolicy1', 'workspacePolicy2']) {
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                createMock<Policy>({
                    id: policyID,
                    type: CONST.POLICY.TYPE.TEAM,
                    name: policyID,
                    role: CONST.POLICY.ROLE.USER,
                    autoReporting: false,
                    commuterExclusions: {
                        method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                        fixedDistance: 1,
                        fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    },
                }),
            );
        }

        await renderPage(CONST.TAB_REQUEST.DISTANCE_MAP, CONST.IOU.TYPE.CREATE);

        expect(screen.getByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_MANUAL}`)).toBeOnTheScreen();
        expect(screen.getByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_ODOMETER}`)).toBeOnTheScreen();
    });

    it('hides manual and odometer distance when tracking from an expense report with commuter exclusions', async () => {
        await setUpOnyx({selectedTab: CONST.TAB_REQUEST.DISTANCE_MAP});
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: ACCOUNT_LOGIN});
        await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'otherWorkspacePolicy');
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            reportID: REPORT_ID,
            policyID: 'workspacePolicy',
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.POLICY}workspacePolicy`,
            createMock<Policy>({
                id: 'workspacePolicy',
                type: CONST.POLICY.TYPE.TEAM,
                name: 'Workspace',
                role: CONST.POLICY.ROLE.USER,
                commuterExclusions: {
                    method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                    fixedDistance: 1,
                    fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
            }),
        );
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.POLICY}otherWorkspacePolicy`,
            createMock<Policy>({
                id: 'otherWorkspacePolicy',
                type: CONST.POLICY.TYPE.TEAM,
                name: 'Other workspace',
                role: CONST.POLICY.ROLE.USER,
            }),
        );

        await renderPage(CONST.TAB_REQUEST.DISTANCE_MAP);

        expect(screen.queryByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_MANUAL}`)).not.toBeOnTheScreen();
        expect(screen.queryByTestId(`tab-${CONST.TAB_REQUEST.DISTANCE_ODOMETER}`)).not.toBeOnTheScreen();
    });
});
