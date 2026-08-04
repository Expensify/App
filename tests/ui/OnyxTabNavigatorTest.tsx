import {act, render} from '@testing-library/react-native';

import ComposerFocusManager from '@libs/ComposerFocusManager';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';

import React from 'react';

type MockNavigation = {
    getState: () => {
        index: number;
        routes: Array<{key: string; name: string}>;
    };
    dispatch: jest.Mock;
};

type MockTabPressEvent = {
    target: string;
    defaultPrevented: boolean;
    preventDefault: jest.Mock;
};

type MockScreenListeners = (args: {navigation: MockNavigation}) => {
    tabPress: (event: MockTabPressEvent) => void;
};

const mockShowConfirmModal = jest.fn(() => new Promise<never>(() => {}));
const mockOnDiscard = jest.fn();
let mockScreenListeners: MockScreenListeners | undefined;

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({fullScreenLoading: {}, w100: {}, h100: {}}),
}));

jest.mock('@userActions/Tab', () => ({setSelectedTab: jest.fn()}));

jest.mock('@react-navigation/material-top-tabs', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const Navigator = ({children, screenListeners}: {children: React.ReactNode; screenListeners: MockScreenListeners}) => {
        mockScreenListeners = screenListeners;
        return ReactModule.createElement(ReactModule.Fragment, null, children);
    };
    const Screen = ({children}: {children?: React.ReactNode | (() => React.ReactNode)}) => {
        return ReactModule.createElement(ReactModule.Fragment, null, typeof children === 'function' ? children() : children);
    };

    return {
        createMaterialTopTabNavigator: () => ({Navigator, Screen}),
    };
});

const CURRENT_TAB = 'distance-odometer';
const TARGET_TAB = 'distance-map';

function TabGuard({hasUnsavedChanges}: {hasUnsavedChanges: boolean}) {
    useRegisterTabSwitchGuard(CURRENT_TAB, () => hasUnsavedChanges, mockOnDiscard);
    return null;
}

function renderTabNavigator(hasUnsavedChanges: boolean) {
    render(
        <OnyxTabNavigator
            id="test-tab-navigator"
            defaultSelectedTab={CURRENT_TAB}
            tabBar={() => null}
        >
            <TopTab.Screen name={CURRENT_TAB}>{() => <TabGuard hasUnsavedChanges={hasUnsavedChanges} />}</TopTab.Screen>
            <TopTab.Screen name={TARGET_TAB}>{() => null}</TopTab.Screen>
        </OnyxTabNavigator>,
    );
}

function pressTargetTab() {
    if (!mockScreenListeners) {
        throw new Error('Expected the tab navigator to register screen listeners');
    }

    const navigation: MockNavigation = {
        getState: () => ({
            index: 0,
            routes: [
                {key: `${CURRENT_TAB}-key`, name: CURRENT_TAB},
                {key: `${TARGET_TAB}-key`, name: TARGET_TAB},
            ],
        }),
        dispatch: jest.fn(),
    };
    const event: MockTabPressEvent = {
        target: `${TARGET_TAB}-key`,
        defaultPrevented: false,
        preventDefault: jest.fn(),
    };

    act(() => mockScreenListeners?.({navigation}).tabPress(event));
    return event;
}

describe('OnyxTabNavigator tab discard input blur', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockScreenListeners = undefined;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('blurs the active input before opening the discard modal', () => {
        const blurActiveInputSpy = jest.spyOn(ComposerFocusManager, 'blurActiveInput').mockImplementation();
        renderTabNavigator(true);

        const event = pressTargetTab();

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(blurActiveInputSpy).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(blurActiveInputSpy.mock.invocationCallOrder.at(0)).toBeLessThan(mockShowConfirmModal.mock.invocationCallOrder.at(0) ?? 0);
    });

    it('does not blur the active input when there are no unsaved changes', () => {
        const blurActiveInputSpy = jest.spyOn(ComposerFocusManager, 'blurActiveInput').mockImplementation();
        renderTabNavigator(false);

        const event = pressTargetTab();

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(blurActiveInputSpy).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });
});
