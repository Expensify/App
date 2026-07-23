import {act, render} from '@testing-library/react-native';

import Log from '@libs/Log';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';

import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';

import {TabActions} from '@react-navigation/native';
import React from 'react';

type MockTabPressEvent = {
    target?: string;
    defaultPrevented: boolean;
    preventDefault: jest.Mock;
};

type MockNavigation = {
    getState: jest.Mock;
    dispatch: jest.Mock;
};

type MockNavigatorProps = {
    screenListeners: ({navigation}: {navigation: MockNavigation}) => {tabPress: (event: MockTabPressEvent) => void};
};

let mockNavigatorProps: MockNavigatorProps | undefined;

jest.mock('@react-navigation/material-top-tabs', () => ({
    createMaterialTopTabNavigator: () => ({
        Navigator: ({children, ...props}: MockNavigatorProps & {children?: React.ReactNode}) => {
            mockNavigatorProps = props;
            return children;
        },
        Screen: ({children}: {children?: () => React.ReactNode}) => children?.() ?? null,
    }),
}));

jest.mock('@react-navigation/native', () => ({
    TabActions: {jumpTo: jest.fn((name: string) => ({type: 'JUMP_TO', payload: {name}}))},
    useRoute: () => ({name: 'tab-a'}),
}));

jest.mock('@components/ActivityIndicator', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('@components/FocusTrap/FocusTrapContainerElement', () => ({
    __esModule: true,
    default: ({children}: {children?: React.ReactNode}) => children ?? null,
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: jest.fn()}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => ['tab-a', {status: 'loaded'}],
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({
        fullScreenLoading: {},
        h100: {},
        w100: {},
    }),
}));

jest.mock('@libs/Growl', () => ({
    __esModule: true,
    default: {error: jest.fn()},
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {warn: jest.fn()},
}));

jest.mock('@userActions/Tab', () => ({
    __esModule: true,
    default: {setSelectedTab: jest.fn()},
}));

jest.mock('@src/utils/keyboard', () => ({
    __esModule: true,
    default: {dismiss: jest.fn()},
}));

const mockedKeyboardUtils = jest.mocked(KeyboardUtils);
const mockedLog = jest.mocked(Log);
const mockedTabActions = jest.mocked(TabActions);

const renderNavigator = () =>
    render(
        <OnyxTabNavigator
            id={CONST.TAB.DISTANCE_REQUEST_TYPE}
            defaultSelectedTab="tab-a"
            tabBar={() => null}
            shouldDismissKeyboardBeforeTabSwitch
        >
            <TopTab.Screen name="tab-a">{() => null}</TopTab.Screen>
            <TopTab.Screen name="tab-b">{() => null}</TopTab.Screen>
        </OnyxTabNavigator>,
    );

const createNavigation = (): MockNavigation => ({
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
        index: 0,
        routeNames: ['tab-a', 'tab-b'],
        routes: [
            {key: 'route-a', name: 'tab-a'},
            {key: 'route-b', name: 'tab-b'},
        ],
    })),
});

const createTabPressEvent = (): MockTabPressEvent => {
    const event: MockTabPressEvent = {
        defaultPrevented: false,
        preventDefault: jest.fn(() => {
            event.defaultPrevented = true;
        }),
        target: 'route-b',
    };
    return event;
};

describe('OnyxTabNavigator', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockNavigatorProps = undefined;
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('falls back to switching tabs when keyboard dismiss does not resolve', async () => {
        mockedKeyboardUtils.dismiss.mockReturnValue(new Promise(() => {}));

        renderNavigator();

        const navigation = createNavigation();
        const event = createTabPressEvent();

        act(() => {
            mockNavigatorProps?.screenListeners({navigation}).tabPress(event);
        });

        expect(event.preventDefault).toHaveBeenCalled();
        expect(mockedKeyboardUtils.dismiss).toHaveBeenCalledTimes(1);
        expect(navigation.dispatch).not.toHaveBeenCalled();

        await act(async () => {
            await jest.advanceTimersByTimeAsync(CONST.MAX_TRANSITION_DURATION_MS);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(mockedLog.warn.mock.calls).toContainEqual(['[OnyxTabNavigator] Timed out waiting for keyboard dismiss before tab switch']);
        expect(mockedTabActions.jumpTo.mock.calls).toContainEqual(['tab-b']);
        expect(navigation.dispatch).toHaveBeenCalledWith({type: 'JUMP_TO', payload: {name: 'tab-b'}});
    });
});
