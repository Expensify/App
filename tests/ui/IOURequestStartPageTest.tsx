import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useCreateFlowDiscardGuard from '@hooks/useCreateFlowDiscardGuard';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import IOURequestStartPage from '@pages/iou/request/IOURequestStartPage';

import type {IOURequestType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import type {OnyxEntry} from 'react-native-onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// The page is rendered outside a navigator screen, which the flow's discard guard needs
jest.mock('@hooks/useCreateFlowDiscardGuard', () => jest.fn(() => ({isFlowDirty: false})));
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
    useCameraDevices: jest.fn(() => []),
    usePhotoOutput: jest.fn(() => ({capturePhoto: jest.fn()})),
}));

describe('IOURequestStartPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    const renderStartPage = () =>
        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <PortalProvider>
                        <NavigationContainer>
                            <IOURequestStartPage
                                route={createMock<PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>['route']>({
                                    params: {iouType: CONST.IOU.TYPE.SUBMIT, reportID: '1', transactionID: ''},
                                })}
                                report={undefined}
                                reportDraft={undefined}
                                navigation={createMock<PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>['navigation']>({})}
                                defaultSelectedTab={CONST.TAB_REQUEST.MANUAL}
                            />
                        </NavigationContainer>
                    </PortalProvider>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

    it('leaves the pre-inserted tab alone until the user confirms abandoning a flow with edits', async () => {
        // Given a create flow whose draft holds user input
        jest.mocked(useCreateFlowDiscardGuard).mockReturnValue({isFlowDirty: true});
        const closeRHPFlowSpy = jest.spyOn(Navigation, 'closeRHPFlow').mockImplementation(() => {});
        const removePreInsertedSpy = jest.spyOn(Navigation, 'removePreInsertedFullscreenIfNeeded').mockImplementation(() => {});
        renderStartPage();
        await waitForBatchedUpdatesWithAct();

        // When the user presses the header back button
        fireEvent.press(screen.getByLabelText(translateLocal('common.back')));

        // Then the page only asks to close the flow, so the discard prompt can still cancel without side effects
        expect(closeRHPFlowSpy).toHaveBeenCalledTimes(1);
        expect(removePreInsertedSpy).not.toHaveBeenCalled();

        // When the user confirms Discard in the prompt
        const onBeforeClose = jest.mocked(useCreateFlowDiscardGuard).mock.calls.at(-1)?.[0].onBeforeClose;
        await act(async () => {
            await onBeforeClose?.();
        });

        // Then the page prepares to close the flow
        expect(removePreInsertedSpy).toHaveBeenCalledTimes(1);
    });

    it('prepares and closes the flow right away when nothing would be lost', async () => {
        // Given a create flow without user input
        jest.mocked(useCreateFlowDiscardGuard).mockReturnValue({isFlowDirty: false});
        const closeRHPFlowSpy = jest.spyOn(Navigation, 'closeRHPFlow').mockImplementation(() => {});
        const removePreInsertedSpy = jest.spyOn(Navigation, 'removePreInsertedFullscreenIfNeeded').mockImplementation(() => {});
        renderStartPage();
        await waitForBatchedUpdatesWithAct();

        // When the user presses the header back button
        fireEvent.press(screen.getByLabelText(translateLocal('common.back')));

        // Then the flow is cleaned up and closed with no prompt in between
        expect(removePreInsertedSpy).toHaveBeenCalledTimes(1);
        expect(closeRHPFlowSpy).toHaveBeenCalledTimes(1);
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
                    <PortalProvider>
                        <NavigationContainer>
                            <IOURequestStartPage
                                route={createMock<PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>['route']>({
                                    params: {iouType: CONST.IOU.TYPE.SUBMIT, reportID: '1', transactionID: ''},
                                })}
                                report={undefined}
                                reportDraft={undefined}
                                navigation={createMock<PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>['navigation']>({})}
                                defaultSelectedTab={CONST.TAB_REQUEST.MANUAL}
                            />
                        </NavigationContainer>
                    </PortalProvider>
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
});
