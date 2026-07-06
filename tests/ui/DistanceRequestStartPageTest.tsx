import {act, fireEvent, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import DistanceRequestStartPage from '@pages/iou/request/DistanceRequestStartPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let capturedAndroidBackHandler: (() => boolean) | undefined;

jest.mock('@hooks/useAndroidBackButtonHandler', () => ({
    __esModule: true,
    default: (callback: () => boolean) => {
        capturedAndroidBackHandler = callback;
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    closeRHPFlow: jest.fn(),
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {info: jest.fn(), warn: jest.fn(), hmmm: jest.fn()},
}));

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => {
    function MockAccessOrNotFoundWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockAccessOrNotFoundWrapper;
});

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

jest.mock('@libs/Navigation/OnyxTabNavigator', () => {
    const React2 = require('react');
    const OnyxTabNavigator = ({children, onTabSelected}: {children: React.ReactNode; onTabSelected?: (tab: string) => void}) => {
        React2.useEffect(() => {
            onTabSelected?.('distance-manual');
        }, [onTabSelected]);
        return React2.createElement(React2.Fragment, null, children);
    };
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

jest.mock('@pages/iou/request/step/IOURequestStepDistanceMap', () => {
    function MockIOURequestStepDistanceMap() {
        return null;
    }
    return MockIOURequestStepDistanceMap;
});

jest.mock('@pages/iou/request/step/IOURequestStepDistanceManual', () => {
    function MockIOURequestStepDistanceManual() {
        return null;
    }
    return MockIOURequestStepDistanceManual;
});

jest.mock('@pages/iou/request/step/IOURequestStepDistanceGPS', () => {
    function MockIOURequestStepDistanceGPS() {
        return null;
    }
    return MockIOURequestStepDistanceGPS;
});

jest.mock('@pages/iou/request/step/IOURequestStepDistanceOdometer', () => {
    function MockIOURequestStepDistanceOdometer() {
        return null;
    }
    return MockIOURequestStepDistanceOdometer;
});

jest.mock('@components/HeaderWithBackButton', () => {
    const {Pressable, Text} = require('react-native');
    function MockHeaderWithBackButton({onBackButtonPress}: {onBackButtonPress: () => void}) {
        return (
            <Pressable
                testID="header-back-button"
                onPress={onBackButtonPress}
            >
                <Text>Back</Text>
            </Pressable>
        );
    }
    return MockHeaderWithBackButton;
});

const defaultRoute = {
    params: {iouType: CONST.IOU.TYPE.TRACK, reportID: '1', transactionID: '', action: CONST.IOU.ACTION.CREATE},
} as PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE>['route'];

function renderDistanceRequestStartPage() {
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <NavigationContainer>
                    <DistanceRequestStartPage
                        route={defaultRoute}
                        report={undefined}
                        navigation={{} as PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE>['navigation']}
                        defaultSelectedTab={CONST.TAB_REQUEST.DISTANCE_MAP}
                    />
                </NavigationContainer>
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
}

describe('DistanceRequestStartPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        capturedAndroidBackHandler = undefined;
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('closes the RHP and consumes the Android hardware back press', async () => {
        renderDistanceRequestStartPage();
        await waitForBatchedUpdatesWithAct();

        expect(capturedAndroidBackHandler).toBeDefined();
        expect(capturedAndroidBackHandler?.()).toBe(true);
        expect(Navigation.closeRHPFlow).toHaveBeenCalledTimes(1);
        expect(Log.info).toHaveBeenCalledWith(
            '[DistanceRequestNavigation] Closing Track Distance flow',
            false,
            expect.objectContaining({
                source: 'device',
                defaultSelectedTab: CONST.TAB_REQUEST.DISTANCE_MAP,
                iouType: CONST.IOU.TYPE.TRACK,
            }),
        );
    });

    it('closes the RHP when the header back button is pressed', async () => {
        const {getByTestId} = renderDistanceRequestStartPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(getByTestId('header-back-button'));

        expect(Navigation.closeRHPFlow).toHaveBeenCalledTimes(1);
        expect(Log.info).toHaveBeenCalledWith(
            '[DistanceRequestNavigation] Closing Track Distance flow',
            false,
            expect.objectContaining({
                source: 'header',
            }),
        );
    });

    it('logs when the active distance tab changes', async () => {
        renderDistanceRequestStartPage();
        await waitForBatchedUpdatesWithAct();

        expect(Log.info).toHaveBeenCalledWith(
            '[DistanceRequestNavigation] Distance tab changed',
            false,
            expect.objectContaining({
                newTab: CONST.TAB_REQUEST.DISTANCE_MANUAL,
                defaultSelectedTab: CONST.TAB_REQUEST.DISTANCE_MAP,
                iouType: CONST.IOU.TYPE.TRACK,
            }),
        );
    });
});
