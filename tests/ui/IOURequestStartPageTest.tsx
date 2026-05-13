import {NavigationContainer} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {IOURequestType} from '@libs/actions/IOU';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import IOURequestStartPage from '@pages/iou/request/IOURequestStartPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
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

describe('IOURequestStartPage', () => {
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

    it('self DM track options should disappear when report moved to workspace', async () => {
        // Given no selected tab data in Onyx
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, null);
        });

        // When the page is mounted with MANUAL tab
        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestStartPage
                            route={
                                {params: {iouType: CONST.IOU.TYPE.SUBMIT, reportID: '1', transactionID: ''}} as PlatformStackScreenProps<
                                    MoneyRequestNavigatorParamList,
                                    typeof SCREENS.MONEY_REQUEST.CREATE
                                >['route']
                            }
                            report={undefined}
                            reportDraft={undefined}
                            navigation={{} as PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>['navigation']}
                            defaultSelectedTab={CONST.TAB_REQUEST.MANUAL}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // Then the iou type should be MANUAL
        const iouRequestType = await new Promise<OnyxEntry<IOURequestType>>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
                callback: (val) => {
                    resolve(val?.iouRequestType);
                    Onyx.disconnect(connection);
                },
            });
        });
        expect(iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.MANUAL);
    });

    it('uses the route-selected scan tab when a stale manual tab is persisted', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, CONST.TAB_REQUEST.MANUAL);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
                reportID: 'old-report',
                iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestStartPage
                            route={
                                {
                                    params: {iouType: CONST.IOU.TYPE.SUBMIT, reportID: '1', transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID},
                                    state: {
                                        index: 0,
                                        routes: [{name: CONST.TAB_REQUEST.SCAN}],
                                    },
                                } as unknown as PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>['route']
                            }
                            report={undefined}
                            reportDraft={undefined}
                            navigation={{} as PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>['navigation']}
                            defaultSelectedTab={CONST.TAB_REQUEST.MANUAL}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        const iouRequestType = await new Promise<OnyxEntry<IOURequestType>>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
                callback: (val) => {
                    resolve(val?.iouRequestType);
                    Onyx.disconnect(connection);
                },
            });
        });
        expect(iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.SCAN);
    });

    it('rebuilds a stale draft when the route-selected tab matches the stale request type', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, CONST.TAB_REQUEST.SCAN);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
                reportID: 'old-report',
                iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestStartPage
                            route={
                                {
                                    params: {iouType: CONST.IOU.TYPE.SUBMIT, reportID: '1', transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID},
                                    state: {
                                        index: 0,
                                        routes: [{name: CONST.TAB_REQUEST.SCAN}],
                                    },
                                } as unknown as PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>['route']
                            }
                            report={undefined}
                            reportDraft={undefined}
                            navigation={{} as PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>['navigation']}
                            defaultSelectedTab={CONST.TAB_REQUEST.MANUAL}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        const transactionReportID = await new Promise<OnyxEntry<string>>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
                callback: (val) => {
                    resolve(val?.reportID);
                    Onyx.disconnect(connection);
                },
            });
        });
        expect(transactionReportID).toBe('1');
    });
});
