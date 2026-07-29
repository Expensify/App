import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import DistanceRequestStartPage from '@pages/iou/request/DistanceRequestStartPage';

import type {IOURequestType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy, SelectedTabRequest} from '@src/types/onyx';
import type {DistanceExpenseType} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/Tab');
jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('react-native-tab-view', () => ({
    TabView: 'TabView',
    SceneMap: jest.fn(),
    TabBar: 'TabBar',
}));

jest.mock('react-native-vision-camera', () => ({
    useCameraDevice: jest.fn(),
}));

const REPORT_ID = '1';
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

async function renderPage(defaultSelectedTab: SelectedTabRequest) {
    render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <NavigationContainer>
                    <DistanceRequestStartPage
                        route={createMock<DistanceCreateScreenProps['route']>({
                            params: {
                                iouType: CONST.IOU.TYPE.TRACK,
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
        </OnyxListItemProvider>,
    );

    await waitForBatchedUpdatesWithAct();
}

function getDraftRequestType() {
    return new Promise<OnyxEntry<IOURequestType>>((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            callback: (value) => {
                resolve(value?.iouRequestType);
                Onyx.disconnect(connection);
            },
        });
    });
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
});
