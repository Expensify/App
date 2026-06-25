import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import IOURequestStartPage from '@pages/iou/request/IOURequestStartPage';
import type {IOURequestType} from '@src/CONST';
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

    it('removes any pre-inserted fullscreen report before closing the RHP when backing out', async () => {
        // Given the start page is mounted (e.g. QAB Scan -> Manual tab, where the embedded
        // confirmation pre-inserts the workspace chat under the RHP as a post-submit optimization)
        const removePreInsertedSpy = jest.spyOn(Navigation, 'removePreInsertedFullscreenIfNeeded').mockImplementation(() => {});
        const closeRHPFlowSpy = jest.spyOn(Navigation, 'closeRHPFlow').mockImplementation(() => {});

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

        // When the user presses the header back button
        await act(async () => {
            fireEvent.press(screen.getByLabelText('Back'));
        });

        // Then the pre-inserted fullscreen report is removed (while the RHP is still on top, so it
        // is not revealed) before the RHP flow is closed, landing the user on the LHN instead of the
        // workspace chat. Regression test for App#94259.
        expect(removePreInsertedSpy).toHaveBeenCalledTimes(1);
        expect(closeRHPFlowSpy).toHaveBeenCalledTimes(1);
        expect(removePreInsertedSpy.mock.invocationCallOrder.at(0)).toBeLessThan(closeRHPFlowSpy.mock.invocationCallOrder.at(0) ?? 0);

        removePreInsertedSpy.mockRestore();
        closeRHPFlowSpy.mockRestore();
    });
});
