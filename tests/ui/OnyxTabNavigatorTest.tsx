import {act, render} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';

import useOnyx from '@hooks/useOnyx';

import ComposerFocusManager from '@libs/ComposerFocusManager';
import getPlatform from '@libs/getPlatform';
import OnyxTabNavigator, {createOnyxTabNavigator, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import type {OnyxTabNavigatorProps} from '@libs/Navigation/OnyxTabNavigator';
import type {TabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';

import Tab from '@userActions/Tab';

import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';

import type {MaterialTopTabNavigationOptions} from '@react-navigation/material-top-tabs';
import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {Keyboard} from 'react-native';

import createMock from '../utils/createMock';

type TabName = typeof CURRENT_TAB | typeof TARGET_TAB;
type MockNavigation = Pick<NavigationProp<ParamListBase>, 'getState' | 'dispatch'>;
type TabListeners = NonNullable<OnyxTabNavigatorProps<TabName>['screenListeners']>;
type TabStateEvent = Parameters<NonNullable<TabListeners['state']>>[0];
type MockTabPressEvent = Parameters<NonNullable<TabListeners['tabPress']>>[0] & {
    preventDefault: jest.Mock<
        ReturnType<Parameters<NonNullable<TabListeners['tabPress']>>[0]['preventDefault']>,
        Parameters<Parameters<NonNullable<TabListeners['tabPress']>>[0]['preventDefault']>
    >;
};
type MockScreenListeners = (args: {navigation: NavigationProp<ParamListBase>}) => TabListeners;

type ConfirmModalResult = {action: ValueOf<typeof ModalActions>};

// Defaults to a promise that never settles, so the modal stays "open" unless a test resolves it.
const mockShowConfirmModal = jest.fn((): Promise<ConfirmModalResult> => new Promise(() => {}));
const mockOnDiscard = jest.fn<ReturnType<TabSwitchGuard['onDiscard']>, Parameters<TabSwitchGuard['onDiscard']>>();
const mockDispatch = jest.fn<ReturnType<NavigationProp<ParamListBase>['dispatch']>, Parameters<NavigationProp<ParamListBase>['dispatch']>>();
let mockScreenListeners: MockScreenListeners | undefined;
let mockInitialRouteName: TabName | undefined;
let mockLazyPlaceholder: MaterialTopTabNavigationOptions['lazyPlaceholder'];

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

jest.mock('@hooks/useThemeStyles', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const context = ReactModule.createContext({fullScreenLoading: {}, w100: {}, h100: {}});
    function useMockThemeStyles() {
        return ReactModule.useContext(context);
    }
    return {
        __esModule: true,
        default: useMockThemeStyles,
    };
});

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
    const Navigator = ({
        children,
        screenListeners,
        initialRouteName,
        screenOptions,
    }: {
        children: React.ReactNode;
        screenListeners: MockScreenListeners;
        initialRouteName?: TabName;
        screenOptions: MaterialTopTabNavigationOptions;
    }) => {
        mockScreenListeners = screenListeners;
        mockInitialRouteName = initialRouteName;
        mockLazyPlaceholder = screenOptions.lazyPlaceholder;
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

function LazyScene({isVisible, renderPlaceholder}: {isVisible: boolean; renderPlaceholder: () => React.ReactNode}) {
    React.useRef(null);
    return isVisible ? renderPlaceholder() : null;
}

describe('OnyxTabNavigator lazy placeholder', () => {
    it('keeps placeholder hooks out of the scene when lazy content becomes visible', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            // Given React Navigation invokes its lazy-placeholder callback directly, and initially hides an unmeasured scene.
            renderFiniteNavigator({lazyLoadEnabled: true});
            const renderPlaceholder = mockLazyPlaceholder;
            if (!renderPlaceholder) {
                throw new Error('Expected a lazy placeholder callback');
            }
            const scene = render(
                <LazyScene
                    isVisible={false}
                    renderPlaceholder={renderPlaceholder}
                />,
            );

            // When layout makes that inactive scene visible, then hides it again.
            scene.rerender(
                <LazyScene
                    isVisible
                    renderPlaceholder={renderPlaceholder}
                />,
            );
            expect(scene.toJSON()).not.toBeNull();
            scene.rerender(
                <LazyScene
                    isVisible={false}
                    renderPlaceholder={renderPlaceholder}
                />,
            );

            // Then its own hook order stays unchanged; the placeholder owns its theme subscription.
            expect(scene.toJSON()).toBeNull();
            const hookOrderWarnings = errorSpy.mock.calls.filter((args) =>
                args.some((arg) => typeof arg === 'string' && /change in the order of Hooks|Rendered (more|fewer) hooks/.test(arg)),
            );
            expect(hookOrderWarnings).toHaveLength(0);
        } finally {
            errorSpy.mockRestore();
        }
    });
});

function pressTargetTab(): MockTabPressEvent {
    if (!mockScreenListeners) {
        throw new Error('Expected the tab navigator to register screen listeners');
    }

    const navigation = createMock<NavigationProp<ParamListBase>>({
        getState: () =>
            createMock<ReturnType<MockNavigation['getState']>>({
                index: 0,
                routes: [
                    {key: `${CURRENT_TAB}-key`, name: CURRENT_TAB},
                    {key: `${TARGET_TAB}-key`, name: TARGET_TAB},
                ],
            }),
        dispatch: mockDispatch,
    });
    const event: MockTabPressEvent = {
        type: 'tabPress',
        target: `${TARGET_TAB}-key`,
        defaultPrevented: false,
        preventDefault: jest.fn<ReturnType<MockTabPressEvent['preventDefault']>, Parameters<MockTabPressEvent['preventDefault']>>(),
    };

    const tabPress = mockScreenListeners({navigation}).tabPress;
    if (!tabPress) {
        throw new Error('Expected tabPress listener');
    }
    act(() => tabPress(event));
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
        const earlierCallOrder1 = blurActiveInputSpy.mock.invocationCallOrder.at(0);
        const laterCallOrder1 = mockShowConfirmModal.mock.invocationCallOrder.at(0);
        if (earlierCallOrder1 === undefined || laterCallOrder1 === undefined) {
            throw new Error('Expected both invocation order values');
        }
        expect(earlierCallOrder1).toBeLessThan(laterCallOrder1);
    });

    it('does not blur the active input when there are no unsaved changes', () => {
        const blurActiveInputSpy = jest.spyOn(ComposerFocusManager, 'blurActiveInput').mockImplementation();
        renderTabNavigator(false);

        const event = pressTargetTab();

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(blurActiveInputSpy).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('ignores a tab press while the discard modal is open', () => {
        jest.spyOn(ComposerFocusManager, 'blurActiveInput').mockImplementation();
        // The default mockShowConfirmModal never settles, so the modal is still open for the second press.
        renderTabNavigator(true);

        pressTargetTab();
        const secondEvent = pressTargetTab();

        expect(secondEvent.preventDefault).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
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

    it('still jumps after a rejected discard callback and releases the pending switch', async () => {
        // Given discarding can fail after the user confirms, but must not strand the user on the old tab.
        jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
        mockShowConfirmModal.mockImplementation(() => Promise.resolve({action: ModalActions.CONFIRM}));
        mockOnDiscard.mockRejectedValueOnce(new Error('discard failed'));
        renderTabNavigator(true, true);

        // When discard rejects and a later press reaches the same navigator.
        await act(async () => {
            pressTargetTab();
        });
        await act(async () => {
            pressTargetTab();
        });

        // Then each confirmed attempt can jump and no stale pending-modal gate blocks the next attempt.
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        expect(mockOnDiscard).toHaveBeenCalledTimes(2);
        expect(mockDispatch).toHaveBeenCalledTimes(2);
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

const {OnyxTabNavigator: FiniteNavigator, TopTab: FiniteTabs} = createOnyxTabNavigator([CURRENT_TAB, TARGET_TAB]);

function renderFiniteNavigator(props: Partial<OnyxTabNavigatorProps<TabName>> = {}, hasTargetScreen = true) {
    return render(
        <FiniteNavigator
            id="test-tab-navigator"
            defaultSelectedTab={CURRENT_TAB}
            tabBar={() => null}
            {...props}
        >
            <FiniteTabs.Screen name={CURRENT_TAB}>{() => null}</FiniteTabs.Screen>
            {hasTargetScreen && <FiniteTabs.Screen name={TARGET_TAB}>{() => null}</FiniteTabs.Screen>}
            {false}
            {null}
            {React.createElement(React.Fragment)}
        </FiniteNavigator>,
    );
}

function navigatorListeners() {
    if (!mockScreenListeners) {
        throw new Error('Expected actual navigator listeners');
    }
    const navigation = createMock<NavigationProp<ParamListBase>>({
        getState: () =>
            createMock<ReturnType<MockNavigation['getState']>>({
                index: 0,
                routes: [
                    {key: 'current-key', name: CURRENT_TAB},
                    {key: 'target-key', name: TARGET_TAB},
                ],
            }),
        dispatch: mockDispatch,
    });
    return mockScreenListeners({navigation});
}

function notifyNavigatorState(listeners: TabListeners, index: number) {
    const state = listeners.state;
    if (!state) {
        throw new Error('Expected actual state listener');
    }
    // React Navigation owns the finite route names; an out-of-range index yields undefined via .at().
    const event = createMock<TabStateEvent>({type: 'state', data: {state: {index, routeNames: [CURRENT_TAB, TARGET_TAB]}}});
    act(() => state(event));
    return event;
}

describe('OnyxTabNavigator finite state notifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useOnyx).mockReturnValue(createMock<ReturnType<typeof useOnyx>>([CURRENT_TAB, {status: 'loaded'}]));
        jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
    });
    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('calls the caller first, selects initially once and persists before notifying a changed name', () => {
        // Given caller state effects and the initial selection share the actual navigator listener.
        const callerState = jest.fn<ReturnType<NonNullable<TabListeners['state']>>, Parameters<NonNullable<TabListeners['state']>>>();
        const selected = jest.fn<void, [TabName]>();
        const initialSelect = jest.fn<ReturnType<NonNullable<OnyxTabNavigatorProps<TabName>['onTabSelect']>>, Parameters<NonNullable<OnyxTabNavigatorProps<TabName>['onTabSelect']>>>();
        const view = renderFiniteNavigator({screenListeners: {state: callerState}, onTabSelected: selected, onTabSelect: initialSelect});
        const listeners = navigatorListeners();

        // When initial, changed and repeated unchanged state events arrive.
        notifyNavigatorState(listeners, 0);
        const event = notifyNavigatorState(listeners, 1);
        jest.mocked(useOnyx).mockReturnValue(createMock<ReturnType<typeof useOnyx>>([TARGET_TAB, {status: 'loaded'}]));
        view.rerender(
            <FiniteNavigator
                id="test-tab-navigator"
                defaultSelectedTab={CURRENT_TAB}
                tabBar={() => null}
                onTabSelected={selected}
                onTabSelect={initialSelect}
            >
                <FiniteTabs.Screen name={CURRENT_TAB}>{() => null}</FiniteTabs.Screen>
                <FiniteTabs.Screen name={TARGET_TAB}>{() => null}</FiniteTabs.Screen>
            </FiniteNavigator>,
        );
        const secondListeners = navigatorListeners();
        notifyNavigatorState(secondListeners, 1);
        view.unmount();

        // Then the caller keeps event identity and persistence precedes a truthful changed-name notification.
        expect(callerState).toHaveBeenCalledWith(event);
        expect(initialSelect).toHaveBeenCalledTimes(1);
        const initialSelection = initialSelect.mock.calls.at(0);
        if (!initialSelection) {
            throw new Error('Expected initial tab selection');
        }
        expect(initialSelection[0]).toEqual({index: 0});
        expect(Tab.setSelectedTab).toHaveBeenCalledTimes(1);
        expect(Tab.setSelectedTab).toHaveBeenCalledWith('test-tab-navigator', TARGET_TAB);
        expect(selected).toHaveBeenCalledTimes(1);
        expect(selected).toHaveBeenCalledWith(TARGET_TAB);
        const earlierCallOrder2 = callerState.mock.invocationCallOrder.at(1);
        const laterCallOrder2 = jest.mocked(Tab.setSelectedTab).mock.invocationCallOrder.at(0);
        if (earlierCallOrder2 === undefined || laterCallOrder2 === undefined) {
            throw new Error('Expected both invocation order values');
        }
        expect(earlierCallOrder2).toBeLessThan(laterCallOrder2);
        const earlierCallOrder3 = jest.mocked(Tab.setSelectedTab).mock.invocationCallOrder.at(0);
        const laterCallOrder3 = selected.mock.invocationCallOrder.at(0);
        if (earlierCallOrder3 === undefined || laterCallOrder3 === undefined) {
            throw new Error('Expected both invocation order values');
        }
        expect(earlierCallOrder3).toBeLessThan(laterCallOrder3);
    });

    it('ignores a missing route name without persisting or notifying and selects initially once', () => {
        // Given a valid persisted tab and a temporarily out-of-range navigator index.
        const selected = jest.fn<void, [TabName]>();
        const initialSelect = jest.fn<ReturnType<NonNullable<OnyxTabNavigatorProps<TabName>['onTabSelect']>>, Parameters<NonNullable<OnyxTabNavigatorProps<TabName>['onTabSelect']>>>();
        renderFiniteNavigator({onTabSelected: selected, onTabSelect: initialSelect});
        const listeners = navigatorListeners();

        // When state no longer has a route at its index, then restores the same stored tab.
        notifyNavigatorState(listeners, 4);
        notifyNavigatorState(listeners, 0);

        // Then missing names do not escape to consumers, and initialization runs only once.
        expect(selected).not.toHaveBeenCalled();
        expect(Tab.setSelectedTab).not.toHaveBeenCalled();
        expect(initialSelect).toHaveBeenCalledTimes(1);
        expect(initialSelect).toHaveBeenCalledWith({index: 4});
    });

    it.each([
        {stored: TARGET_TAB, hasTargetScreen: true, expected: TARGET_TAB},
        {stored: TARGET_TAB, hasTargetScreen: false, expected: CURRENT_TAB},
        {stored: CONST.TAB_REQUEST.SCAN, hasTargetScreen: true, expected: CURRENT_TAB},
    ])('admits stored $stored only when finite and present in current children', ({stored, hasTargetScreen, expected}) => {
        // Given Onyx can contain a tab belonging to a different page or a currently hidden screen.
        jest.mocked(useOnyx).mockReturnValue(createMock<ReturnType<typeof useOnyx>>([stored, {status: 'loaded'}]));

        // When the actual factory chooses its initial route.
        renderFiniteNavigator({}, hasTargetScreen);

        // Then both finite-name and current-child admission precede the default fallback.
        expect(mockInitialRouteName).toBe(expected);
    });

    it('reapplies an interrupted press before returning for unchanged selection', () => {
        // Given React Navigation can leave the old selected tab after an allowed press.
        jest.useFakeTimers();
        const selected = jest.fn<void, [TabName]>();
        renderFiniteNavigator({shouldReapplyInterruptedTabPress: true, onTabSelected: selected});
        const listeners = navigatorListeners();
        const press = listeners.tabPress;
        if (!press) {
            throw new Error('Expected tabPress listener');
        }
        const event: MockTabPressEvent = {type: 'tabPress', target: 'target-key', defaultPrevented: false, preventDefault: jest.fn()};

        // When the old state is reported immediately after the press.
        act(() => press(event));
        notifyNavigatorState(listeners, 0);
        act(() => jest.advanceTimersByTime(20));

        // Then the reapplication survives the unchanged comparison without persisting or notifying that old state.
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'JUMP_TO', payload: {name: TARGET_TAB}}));
        expect(selected).not.toHaveBeenCalled();
        expect(Tab.setSelectedTab).not.toHaveBeenCalled();
    });

    it('cancels queued interrupted jumps on unmount', () => {
        // Given an interrupted press has scheduled a frame against this navigator's old state.
        jest.useFakeTimers();
        const view = renderFiniteNavigator({shouldReapplyInterruptedTabPress: true});
        const listeners = navigatorListeners();
        const press = listeners.tabPress;
        if (!press) {
            throw new Error('Expected tabPress listener');
        }
        act(() => press({type: 'tabPress', target: 'target-key', defaultPrevented: false, preventDefault: jest.fn()}));
        notifyNavigatorState(listeners, 0);

        // When the navigator unmounts before that frame executes.
        view.unmount();
        act(() => jest.advanceTimersByTime(20));

        // Then cleanup removes the queued dispatch against the detached navigator.
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('respects a caller-prevented tab press before consulting discard guards', () => {
        // Given the caller has first refusal over a tab press.
        renderFiniteNavigator({screenListeners: {tabPress: (event) => event.preventDefault()}});
        const listeners = navigatorListeners();
        const press = listeners.tabPress;
        if (!press) {
            throw new Error('Expected tabPress listener');
        }
        const event: MockTabPressEvent = {
            type: 'tabPress',
            target: 'target-key',
            defaultPrevented: false,
            preventDefault: jest.fn(() => {
                Object.defineProperty(event, 'defaultPrevented', {value: true});
            }),
        };

        // When the caller blocks the press.
        act(() => press(event));

        // Then no modal, keyboard wait or jump is started by the navigator.
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
    });
});
