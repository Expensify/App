import {act, render} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';

import ComposerFocusManager from '@libs/ComposerFocusManager';
import getPlatform from '@libs/getPlatform';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';

import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {Keyboard} from 'react-native';

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

type ConfirmModalResult = {action: ValueOf<typeof ModalActions>};

// Defaults to a promise that never settles, so the modal stays "open" unless a test resolves it.
const mockShowConfirmModal = jest.fn((): Promise<ConfirmModalResult> => new Promise(() => {}));
const mockOnDiscard = jest.fn();
const mockDispatch = jest.fn();
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

jest.mock('@src/utils/keyboard', () => ({
    __esModule: true,
    default: {
        dismiss: jest.fn(() => Promise.resolve()),
        dismissKeyboardAndExecute: jest.fn((cb: () => void) => {
            cb();
            return Promise.resolve();
        }),
    },
}));

// Self-contained (no outer variable), since `@libs/getPlatform` can get required before any outer variable here
// would be assigned. Defaults to iOS so existing tests keep exercising the `dismiss()`-based path.
jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: jest.fn(() => 'ios'),
}));

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

function renderTabNavigator(hasUnsavedChanges: boolean, shouldDismissKeyboardBeforeTabSwitch = false) {
    render(
        <OnyxTabNavigator
            id="test-tab-navigator"
            defaultSelectedTab={CURRENT_TAB}
            tabBar={() => null}
            shouldDismissKeyboardBeforeTabSwitch={shouldDismissKeyboardBeforeTabSwitch}
        >
            <TopTab.Screen name={CURRENT_TAB}>{() => <TabGuard hasUnsavedChanges={hasUnsavedChanges} />}</TopTab.Screen>
            <TopTab.Screen name={TARGET_TAB}>{() => null}</TopTab.Screen>
        </OnyxTabNavigator>,
    );
}

function pressTargetTab(): MockTabPressEvent {
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
        dispatch: mockDispatch,
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

describe('OnyxTabNavigator keyboard dismissal before tab switch', () => {
    const mockedKeyboardUtils = jest.mocked(KeyboardUtils);

    /** The navigator only defers a tab switch when React Native reports a visible keyboard. */
    function mockKeyboardVisible(isVisible: boolean) {
        jest.spyOn(Keyboard, 'isVisible').mockReturnValue(isVisible);
    }

    beforeEach(() => {
        jest.clearAllMocks();
        mockScreenListeners = undefined;
        mockedKeyboardUtils.dismiss.mockImplementation(() => Promise.resolve());
        mockedKeyboardUtils.dismissKeyboardAndExecute.mockImplementation((cb) => {
            cb();
            return Promise.resolve();
        });
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
        mockKeyboardVisible(true);
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('waits for the keyboard to hide before jumping to the target tab', async () => {
        let resolveDismiss: () => void = () => {};
        mockedKeyboardUtils.dismiss.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveDismiss = resolve;
                }),
        );
        renderTabNavigator(false, true);

        const event = pressTargetTab();

        // The default jump is blocked and nothing is dispatched while the keyboard is still hiding.
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(mockDispatch).not.toHaveBeenCalled();

        await act(async () => {
            resolveDismiss();
        });

        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('still switches tabs when the keyboard never reports that it hid', async () => {
        jest.useFakeTimers();
        // `keyboardDidHide` never fires, so the dismissal promise never settles.
        mockedKeyboardUtils.dismiss.mockImplementation(() => new Promise<void>(() => {}));
        renderTabNavigator(false, true);

        pressTargetTab();
        expect(mockDispatch).not.toHaveBeenCalled();

        await act(async () => {
            jest.advanceTimersByTime(CONST.MAX_TRANSITION_DURATION_MS);
        });

        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('ignores repeated taps while a tab switch is already waiting on the keyboard', async () => {
        let resolveDismiss: () => void = () => {};
        mockedKeyboardUtils.dismiss.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveDismiss = resolve;
                }),
        );
        renderTabNavigator(false, true);

        pressTargetTab();
        pressTargetTab();
        pressTargetTab();

        expect(mockedKeyboardUtils.dismiss).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveDismiss();
        });

        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('does not defer the tab switch when the caller has not opted in', () => {
        renderTabNavigator(false);

        const event = pressTargetTab();

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(mockedKeyboardUtils.dismiss).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('leaves the jump to react-navigation when no keyboard is showing', () => {
        mockKeyboardVisible(false);
        renderTabNavigator(false, true);

        const event = pressTargetTab();

        // Nothing to wait for, so the press is not taken over and stays synchronous.
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(mockedKeyboardUtils.dismiss).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('reuses dismissKeyboardAndExecute on Android instead of waiting on dismiss', async () => {
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.ANDROID);
        let resolveDismissAndExecute: () => void = () => {};
        mockedKeyboardUtils.dismissKeyboardAndExecute.mockImplementation(
            (cb) =>
                new Promise<void>((resolve) => {
                    resolveDismissAndExecute = () => {
                        cb();
                        resolve();
                    };
                }),
        );
        renderTabNavigator(false, true);

        const event = pressTargetTab();

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(mockedKeyboardUtils.dismiss).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();

        await act(async () => {
            resolveDismissAndExecute();
        });

        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
});

describe('OnyxTabNavigator keyboard dismissal after discarding changes', () => {
    const mockedKeyboardUtils = jest.mocked(KeyboardUtils);

    beforeEach(() => {
        jest.clearAllMocks();
        mockScreenListeners = undefined;
        mockedKeyboardUtils.dismiss.mockImplementation(() => Promise.resolve());
        // `restoreAllMocks` below only restores `jest.spyOn` mocks, not this factory-created one, so a prior test
        // overriding it (e.g. the Android `dismissKeyboardAndExecute` test) would otherwise leak in here.
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
        jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
        jest.spyOn(ComposerFocusManager, 'blurActiveInput').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('waits for the keyboard to hide before jumping once the discard is confirmed', async () => {
        mockShowConfirmModal.mockImplementation(() => Promise.resolve({action: ModalActions.CONFIRM}));

        let resolveDismiss: () => void = () => {};
        mockedKeyboardUtils.dismiss.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveDismiss = resolve;
                }),
        );
        renderTabNavigator(true, true);

        await act(async () => {
            pressTargetTab();
        });

        // The draft has been discarded, but the tab must not change until the keyboard is gone.
        expect(mockOnDiscard).toHaveBeenCalledTimes(1);
        expect(mockedKeyboardUtils.dismiss).toHaveBeenCalledTimes(1);
        expect(mockDispatch).not.toHaveBeenCalled();

        await act(async () => {
            resolveDismiss();
        });

        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('does not discard or jump when the user cancels', async () => {
        mockShowConfirmModal.mockImplementation(() => Promise.resolve({action: ModalActions.CLOSE}));
        renderTabNavigator(true, true);

        await act(async () => {
            pressTargetTab();
        });

        expect(mockOnDiscard).not.toHaveBeenCalled();
        expect(mockedKeyboardUtils.dismiss).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('jumps synchronously after discard when not deferring', async () => {
        jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
        mockShowConfirmModal.mockImplementation(() => Promise.resolve({action: ModalActions.CONFIRM}));
        renderTabNavigator(true, true);

        await act(async () => {
            pressTargetTab();
        });

        expect(mockOnDiscard).toHaveBeenCalledTimes(1);
        expect(mockedKeyboardUtils.dismiss).not.toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
});
