import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockNavigatorProps = {
    children?: React.ReactNode;
    initialRouteName?: string;
};

const mockNavigatorProps = jest.fn<void, [MockNavigatorProps]>();

jest.mock('@react-navigation/material-top-tabs', () => ({
    createMaterialTopTabNavigator: () => {
        const ReactMock = jest.requireActual<typeof React>('react');
        return {
            Navigator: ({children, initialRouteName}: MockNavigatorProps) => {
                mockNavigatorProps({children, initialRouteName});
                return ReactMock.createElement(ReactMock.Fragment, null, children);
            },
            Screen: ({children}: {children?: React.ReactNode | (() => React.ReactNode)}) =>
                ReactMock.createElement(ReactMock.Fragment, null, typeof children === 'function' ? children() : children),
        };
    },
}));

jest.mock('@hooks/useThemeStyles', () => () => ({
    fullScreenLoading: {},
    h100: {},
    w100: {},
}));

describe('OnyxTabNavigator', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => Onyx.clear());
    });

    function renderNavigator(selectedTabOverride?: string) {
        render(
            <OnyxListItemProvider>
                <OnyxTabNavigator
                    id={CONST.TAB.IOU_REQUEST_TYPE}
                    defaultSelectedTab={CONST.TAB_REQUEST.SCAN}
                    selectedTabOverride={selectedTabOverride}
                    tabBar={() => null}
                >
                    <TopTab.Screen name={CONST.TAB_REQUEST.MANUAL}>{() => null}</TopTab.Screen>
                    <TopTab.Screen name={CONST.TAB_REQUEST.SCAN}>{() => null}</TopTab.Screen>
                </OnyxTabNavigator>
            </OnyxListItemProvider>,
        );
    }

    it('prefers an explicit tab override over a stale selected tab from Onyx', async () => {
        await act(async () => Onyx.set(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, CONST.TAB_REQUEST.MANUAL));

        renderNavigator(CONST.TAB_REQUEST.SCAN);
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigatorProps.mock.calls.at(-1)?.[0].initialRouteName).toBe(CONST.TAB_REQUEST.SCAN);
    });

    it('falls back to the selected tab from Onyx when the route has no tab state', async () => {
        await act(async () => Onyx.set(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, CONST.TAB_REQUEST.MANUAL));

        renderNavigator();
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigatorProps.mock.calls.at(-1)?.[0].initialRouteName).toBe(CONST.TAB_REQUEST.MANUAL);
    });
});
