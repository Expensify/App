import {act, fireEvent, render, screen} from '@testing-library/react-native';

import * as PopoverMenu from '@components/PopoverMenu/v2';
import {useContentNavigation, useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
// Test-only: harness publishes `activeAnchor` synthetically so we don't need a real measurable trigger.
import {useRootActions} from '@components/PopoverMenu/v2/root/RootContext';
import type {AnchorRef} from '@components/PopoverMenu/v2/root/RootContext';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import usePressResponderPropsImport from '@components/Pressable/PressResponder/usePressResponderProps';
import useResponderRefImport from '@components/Pressable/PressResponder/useResponderRef';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';

import Log from '@libs/Log';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {PropsWithChildren, ReactNode} from 'react';
import type {GestureResponderEvent, View as RNViewType} from 'react-native';

import {NavigationContext} from '@react-navigation/core';
import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';

const {useIsAtActiveLevel} = PopoverMenu;

type MenuItemMockProps = Record<string, unknown> & {
    title?: string;
    pressableTestID?: string;
};

const menuItemPropsCapture: {current: MenuItemMockProps[]} = {current: []};

// Production-faithful: keep children mounted across `isVisible` flips (mirrors react-native-modal during close animation).
jest.mock('@components/PopoverWithMeasuredContent', () => {
    function MockPopoverWithMeasuredContent({isVisible, children}: {isVisible?: boolean; children?: ReactNode}) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo.
        const {View: RNView} = jest.requireActual('react-native');
        return <RNView testID={isVisible ? 'mock-popover-open' : 'mock-popover-closed'}>{children}</RNView>;
    }
    return MockPopoverWithMeasuredContent;
});

jest.mock('@components/FocusTrap/FocusTrapForModal', () => {
    function MockFocusTrap({children}: {children?: ReactNode}) {
        return children;
    }
    return MockFocusTrap;
});

jest.mock('@components/MenuItem', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo.
    const {View: RNView, Text: RNText} = jest.requireActual('react-native');
    function MockMenuItem(props: MenuItemMockProps) {
        menuItemPropsCapture.current.push(props);
        return (
            <RNView testID={props.pressableTestID ?? 'mock-menu-item'}>
                <RNText>{props.title ?? ''}</RNText>
            </RNView>
        );
    }
    return MockMenuItem;
});

jest.mock('@components/OfflineWithFeedback', () => {
    function MockOfflineWithFeedback({children}: {children?: ReactNode}) {
        return children;
    }
    return MockOfflineWithFeedback;
});

jest.mock('@components/CompactMenuContext', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo. */
    const ReactActual = jest.requireActual('react');
    const ctx = ReactActual.createContext(false);
    return {
        __esModule: true,
        default: ctx,
        useIsCompactMenu: () => true,
    };
});

jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useTheme', () => () => ({
    border: 'borderColor',
    icon: 'iconColor',
    iconHovered: 'iconHovered',
}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({
    isSmallScreenWidth: false,
    shouldUseNarrowLayout: false,
}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        BackArrow: 'BackArrowIcon',
        ArrowRight: 'ArrowRightIcon',
        Checkmark: 'CheckmarkIcon',
    }),
}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

// Captures registered shortcuts so tests can fire them imperatively. Re-registration overwrites — mirrors real RN-keycommand replacement.
type ShortcutEntry = {callback: (event?: unknown) => void; isActive: boolean};
const registeredShortcuts: Record<string, ShortcutEntry> = {};
jest.mock('@hooks/useKeyboardShortcut', () => {
    return (shortcut: {shortcutKey: string}, callback: (event?: unknown) => void, config?: {isActive?: boolean}) => {
        registeredShortcuts[shortcut.shortcutKey] = {callback, isActive: config?.isActive ?? true};
    };
});

function pressShortcut(shortcutKey: string): void {
    const entry = registeredShortcuts[shortcutKey];
    if (!entry?.isActive) {
        return;
    }
    act(() => entry.callback());
}

const mockNavigationState: {blurListeners: Set<() => void>} = {
    blurListeners: new Set(),
};
const mockNavigation = {
    addListener: (event: string, listener: () => void) => {
        if (event !== 'blur') {
            return () => {};
        }
        mockNavigationState.blurListeners.add(listener);
        return () => mockNavigationState.blurListeners.delete(listener);
    },
} as unknown as NavigationProp<ParamListBase>;

function fireBlur(): void {
    for (const fn of mockNavigationState.blurListeners) {
        fn();
    }
}

const mockModalState: {
    value: {willAlertModalBecomeVisible?: boolean; isPopover?: boolean} | undefined;
    listeners: Set<() => void>;
} = {value: undefined, listeners: new Set()};
jest.mock('@hooks/useOnyx', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo. */
    const ReactActual = jest.requireActual('react');
    return (_key: string, options?: {selector?: (v: unknown) => unknown}) => {
        const [, force] = ReactActual.useState({});
        ReactActual.useEffect(() => {
            const listener = () => force({});
            mockModalState.listeners.add(listener);
            return () => mockModalState.listeners.delete(listener);
        }, []);
        const value = options?.selector ? options.selector(mockModalState.value) : mockModalState.value;
        return [value, {status: 'loaded'}];
    };
});

function setMockModal(value: typeof mockModalState.value): void {
    mockModalState.value = value;
    for (const fn of mockModalState.listeners) {
        fn();
    }
}

beforeEach(() => {
    menuItemPropsCapture.current = [];
    mockNavigationState.blurListeners.clear();
    mockModalState.value = undefined;
    mockModalState.listeners.clear();
    for (const key of Object.keys(registeredShortcuts)) {
        delete registeredShortcuts[key];
    }
    jest.clearAllMocks();
});

// RN's View ref in jest exposes `measureInWindow` but not `getBoundingClientRect` (production paths have it); install the stub for tests that exercise the press → anchor-measurement path.
function stubViewGetBoundingClientRect(): {restore: () => void} {
    const proto = (View as unknown as {prototype: Record<string, unknown>}).prototype;
    const original = proto.getBoundingClientRect as ((this: unknown) => DOMRect) | undefined;
    proto.getBoundingClientRect = () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        toJSON: () => ({}),
    });
    return {
        restore: () => {
            if (original) {
                proto.getBoundingClientRect = original;
            } else {
                delete proto.getBoundingClientRect;
            }
        },
    };
}

function findItemByTitle(title: string): MenuItemMockProps | undefined {
    return menuItemPropsCapture.current.findLast((p) => p.title === title);
}

function press(title: string): void {
    const onPress = findItemByTitle(title)?.onPress;
    menuItemPropsCapture.current = [];
    if (typeof onPress === 'function') {
        act(() => onPress());
    }
}

function focus(title: string): void {
    const onFocus = findItemByTitle(title)?.onFocus;
    if (typeof onFocus === 'function') {
        act(() => onFocus());
    }
}

/** Publishes `activeAnchor` synthetically; stays mounted across open/close. Rect is fabricated — the mock ignores it. */
function AutoSetAnchor() {
    const {setActiveAnchor} = useRootActions('AutoSetAnchor');
    const ref: AnchorRef = useRef<RNViewType>(null);
    useLayoutEffect(() => {
        setActiveAnchor({ref, rect: {x: 0, y: 0, width: 0, height: 0}});
    }, [setActiveAnchor, ref]);
    return <View ref={ref} />;
}

function VisibilityObserver({onChange}: {onChange: (open: boolean) => void}) {
    const isVisible = PopoverMenu.useIsPopoverVisible();
    useEffect(() => {
        onChange(isVisible);
    }, [isVisible, onChange]);
    return null;
}

/** Test-side observer; `<Root>` has no `onOpenChange` prop. */
function Harness({
    initialOpen = false,
    onOpenChange,
    children,
}: PropsWithChildren<{
    initialOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}>) {
    return (
        <NavigationContext.Provider value={mockNavigation}>
            <PopoverMenu.Root defaultOpen={initialOpen}>
                <AutoSetAnchor />
                {onOpenChange ? <VisibilityObserver onChange={onOpenChange} /> : null}
                {children}
            </PopoverMenu.Root>
        </NavigationContext.Provider>
    );
}

describe('PopoverMenu V2', () => {
    describe('Root', () => {
        it('renders the popover in the closed state when not open', () => {
            render(
                <Harness>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Hidden"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(screen.getByTestId('mock-popover-closed')).toBeOnTheScreen();
            expect(screen.queryByTestId('mock-popover-open')).toBeNull();
        });

        it('renders Content when open', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Visible"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(findItemByTitle('Visible')).toBeDefined();
        });

        it('mounts visible with `defaultOpen` (uncontrolled)', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Default"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(findItemByTitle('Default')).toBeDefined();
        });

        it('closes on screen blur via navigation.addListener', () => {
            const onOpenChange = jest.fn();
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="A"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            onOpenChange.mockClear();
            act(() => fireBlur());
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('renders without a NavigationContainer in scope', () => {
            expect(() =>
                render(
                    <PopoverMenu.Root>
                        <PopoverMenu.Content>
                            <PopoverMenu.Item
                                text="A"
                                onSelect={() => {}}
                            />
                        </PopoverMenu.Content>
                    </PopoverMenu.Root>,
                ),
            ).not.toThrow();
        });

        it('closes when a non-popover modal is about to become visible', () => {
            const onOpenChange = jest.fn();
            const tree = (
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="A"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>
            );
            render(tree);
            onOpenChange.mockClear();
            act(() => setMockModal({willAlertModalBecomeVisible: true, isPopover: false}));
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('does not close when the covering modal is itself a popover', () => {
            const onOpenChange = jest.fn();
            const tree = (
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="A"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>
            );
            render(tree);
            onOpenChange.mockClear();
            act(() => setMockModal({willAlertModalBecomeVisible: true, isPopover: true}));
            expect(onOpenChange).not.toHaveBeenCalled();
        });

        it('does not close when mounted inside an already-covered non-popover modal', () => {
            mockModalState.value = {
                willAlertModalBecomeVisible: true,
                isPopover: false,
            };
            const onOpenChange = jest.fn();
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="A"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(onOpenChange).not.toHaveBeenCalledWith(false);
        });
    });

    describe('Trigger', () => {
        let getBoundingClientRectStub: {restore: () => void} | undefined;
        beforeAll(() => {
            getBoundingClientRectStub = stubViewGetBoundingClientRect();
        });
        afterAll(() => {
            getBoundingClientRectStub?.restore();
        });

        it('opens the popover when the slotted child is pressed', () => {
            const onOpenChange = jest.fn();
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.Trigger>
                            <PressableWithFeedback
                                onPress={() => {}}
                                accessibilityLabel="Open menu"
                                sentryLabel="TriggerTest"
                                testID="trigger"
                            >
                                <View testID="trigger-icon" />
                            </PressableWithFeedback>
                        </PopoverMenu.Trigger>
                        <VisibilityObserver onChange={onOpenChange} />
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            expect(screen.getByTestId('trigger-icon')).toBeOnTheScreen();
            onOpenChange.mockClear();
            fireEvent.press(screen.getByTestId('trigger'));
            expect(onOpenChange).toHaveBeenCalledWith(true);
        });

        it("runs the slotted child's onPress before opening", () => {
            const order: string[] = [];
            const onOpenChange = jest.fn(() => order.push('open'));
            const consumerOnPress = jest.fn(() => {
                order.push('consumer');
            });
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.Trigger>
                            <PressableWithFeedback
                                onPress={consumerOnPress}
                                accessibilityLabel="Open menu"
                                sentryLabel="TriggerTest"
                                testID="trigger"
                            >
                                <View testID="trigger-icon" />
                            </PressableWithFeedback>
                        </PopoverMenu.Trigger>
                        <VisibilityObserver onChange={onOpenChange} />
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            order.length = 0;
            onOpenChange.mockClear();
            fireEvent.press(screen.getByTestId('trigger'));
            expect(consumerOnPress).toHaveBeenCalledTimes(1);
            expect(order).toEqual(['consumer', 'open']);
        });

        it('skips opening when the slotted child calls event.preventDefault()', () => {
            const onOpenChange = jest.fn();
            const consumerOnPress = jest.fn((event?: {preventDefault?: () => void}) => event?.preventDefault?.());
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.Trigger>
                            <PressableWithFeedback
                                onPress={consumerOnPress}
                                accessibilityLabel="Open menu"
                                sentryLabel="TriggerTest"
                                testID="trigger"
                            >
                                <View testID="trigger-icon" />
                            </PressableWithFeedback>
                        </PopoverMenu.Trigger>
                        <VisibilityObserver onChange={onOpenChange} />
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            onOpenChange.mockClear();
            const pressEvent = {
                defaultPrevented: false,
                preventDefault() {
                    pressEvent.defaultPrevented = true;
                },
            };
            fireEvent.press(screen.getByTestId('trigger'), pressEvent);
            expect(consumerOnPress).toHaveBeenCalledTimes(1);
            expect(pressEvent.defaultPrevented).toBe(true);
            expect(onOpenChange).not.toHaveBeenCalledWith(true);
        });

        it('opens via PressResponder context even when the consumer pressable omits onPress', () => {
            const onOpenChange = jest.fn();
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.Trigger>
                            <PressableWithFeedback
                                accessibilityLabel="X"
                                sentryLabel="X"
                                testID="trigger"
                            >
                                <View />
                            </PressableWithFeedback>
                        </PopoverMenu.Trigger>
                        <VisibilityObserver onChange={onOpenChange} />
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            expect(() => fireEvent.press(screen.getByTestId('trigger'))).not.toThrow();
            expect(onOpenChange).toHaveBeenLastCalledWith(true);
        });

        it('merges the consumer ref with the internal anchor ref', () => {
            const consumerRef = React.createRef<RNViewType>();
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.Trigger>
                            <PressableWithFeedback
                                ref={consumerRef}
                                onPress={() => {}}
                                accessibilityLabel="Open menu"
                                sentryLabel="TriggerTest"
                                testID="trigger"
                            >
                                <View testID="trigger-icon" />
                            </PressableWithFeedback>
                        </PopoverMenu.Trigger>
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            expect(consumerRef.current).not.toBeNull();
        });

        it('handles two Triggers as independent instances (multi-instance composition)', () => {
            const consumerOnPressA = jest.fn();
            const consumerOnPressB = jest.fn();
            const refA = React.createRef<RNViewType>();
            const refB = React.createRef<RNViewType>();
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.Trigger>
                            <PressableWithFeedback
                                ref={refA}
                                onPress={consumerOnPressA}
                                accessibilityLabel="Open A"
                                sentryLabel="A"
                                testID="trigger-a"
                            >
                                <View />
                            </PressableWithFeedback>
                        </PopoverMenu.Trigger>
                        <PopoverMenu.Trigger>
                            <PressableWithFeedback
                                ref={refB}
                                onPress={consumerOnPressB}
                                accessibilityLabel="Open B"
                                sentryLabel="B"
                                testID="trigger-b"
                            >
                                <View />
                            </PressableWithFeedback>
                        </PopoverMenu.Trigger>
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            expect(refA.current).not.toBe(refB.current);
            fireEvent.press(screen.getByTestId('trigger-a'));
            fireEvent.press(screen.getByTestId('trigger-b'));
            expect(consumerOnPressA).toHaveBeenCalledTimes(1);
            expect(consumerOnPressB).toHaveBeenCalledTimes(1);
        });

        it('flows responder props through arbitrary wrappers to the underlying pressable', () => {
            const onOpenChange = jest.fn();
            function PassthroughWrapper({children}: {children: ReactNode}) {
                return <View testID="wrapper">{children}</View>;
            }
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.Trigger>
                            <PassthroughWrapper>
                                <PassthroughWrapper>
                                    <PressableWithFeedback
                                        accessibilityLabel="Open menu"
                                        sentryLabel="TriggerTest"
                                        testID="trigger"
                                    >
                                        <View testID="trigger-icon" />
                                    </PressableWithFeedback>
                                </PassthroughWrapper>
                            </PassthroughWrapper>
                        </PopoverMenu.Trigger>
                        <VisibilityObserver onChange={onOpenChange} />
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            onOpenChange.mockClear();
            fireEvent.press(screen.getByTestId('trigger'));
            expect(onOpenChange).toHaveBeenLastCalledWith(true);
        });

        it('accepts multiple children and a Fragment subtree', () => {
            const onOpenChange = jest.fn();
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.Trigger>
                            <>
                                <View testID="trigger-sibling" />
                                <PressableWithFeedback
                                    accessibilityLabel="Open menu"
                                    sentryLabel="TriggerTest"
                                    testID="trigger"
                                >
                                    <View />
                                </PressableWithFeedback>
                            </>
                        </PopoverMenu.Trigger>
                        <VisibilityObserver onChange={onOpenChange} />
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            expect(screen.getByTestId('trigger-sibling')).toBeOnTheScreen();
            fireEvent.press(screen.getByTestId('trigger'));
            expect(onOpenChange).toHaveBeenLastCalledWith(true);
        });

        it('publishes accessibilityHasPopup, accessibilityState.expanded, nativeID and accessibilityControls through PressResponderContext', () => {
            const captured: Array<ReturnType<typeof usePressResponderPropsImport>> = [];
            function CapturePressResponderSlot() {
                captured.push(usePressResponderPropsImport({}));
                useResponderRefImport(null);
                return null;
            }
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.Trigger>
                            <CapturePressResponderSlot />
                        </PopoverMenu.Trigger>
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            const slotBefore = captured.at(-1);
            expect(slotBefore?.accessibilityHasPopup).toBe('menu');
            expect(slotBefore?.accessibilityState).toMatchObject({expanded: false});
            expect(slotBefore?.accessibilityControls).toBeUndefined();
            expect(typeof slotBefore?.nativeID).toBe('string');
        });
    });

    describe('SecondaryInteractionTrigger', () => {
        let getBoundingClientRectStub: {restore: () => void} | undefined;
        beforeAll(() => {
            getBoundingClientRectStub = stubViewGetBoundingClientRect();
        });
        afterAll(() => {
            getBoundingClientRectStub?.restore();
        });

        it('opens the popover when the slotted child receives a long-press', () => {
            const onOpenChange = jest.fn();
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.SecondaryInteractionTrigger>
                            <PressableWithSecondaryInteraction
                                onSecondaryInteraction={() => {}}
                                accessibilityLabel="Long-press me"
                                testID="secondary-trigger"
                            >
                                <View testID="secondary-icon" />
                            </PressableWithSecondaryInteraction>
                        </PopoverMenu.SecondaryInteractionTrigger>
                        <VisibilityObserver onChange={onOpenChange} />
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            expect(screen.getByTestId('secondary-icon')).toBeOnTheScreen();
            onOpenChange.mockClear();
            // Production-realistic event: PressableWithSecondaryInteraction calls preventDefault unconditionally
            // (native long-press) and via preventDefaultContextMenu (web right-click) before the chained handler runs.
            const longPressEvent = {
                defaultPrevented: false,
                preventDefault() {
                    longPressEvent.defaultPrevented = true;
                },
            };
            fireEvent(screen.getByTestId('secondary-trigger'), 'longPress', longPressEvent);
            expect(longPressEvent.defaultPrevented).toBe(true);
            expect(onOpenChange).toHaveBeenCalledWith(true);
        });

        it("runs the slotted child's onSecondaryInteraction before opening", () => {
            const order: string[] = [];
            const onOpenChange = jest.fn(() => order.push('open'));
            const consumerOnSecondary = jest.fn(() => order.push('consumer'));
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.SecondaryInteractionTrigger>
                            <PressableWithSecondaryInteraction
                                onSecondaryInteraction={consumerOnSecondary}
                                accessibilityLabel="Long-press me"
                                testID="secondary-trigger"
                            >
                                <View testID="secondary-icon" />
                            </PressableWithSecondaryInteraction>
                        </PopoverMenu.SecondaryInteractionTrigger>
                        <VisibilityObserver onChange={onOpenChange} />
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            order.length = 0;
            onOpenChange.mockClear();
            fireEvent(screen.getByTestId('secondary-trigger'), 'longPress', {
                preventDefault: () => {},
            });
            expect(consumerOnSecondary).toHaveBeenCalledTimes(1);
            expect(order).toEqual(['consumer', 'open']);
        });

        it('still opens when the slotted child calls event.preventDefault() (framework reserves preventDefault for OS suppression)', () => {
            const onOpenChange = jest.fn();
            const consumerOnSecondary = jest.fn((event: {preventDefault: () => void}) => event.preventDefault());
            render(
                <NavigationContext.Provider value={mockNavigation}>
                    <PopoverMenu.Root>
                        <PopoverMenu.SecondaryInteractionTrigger>
                            <PressableWithSecondaryInteraction
                                onSecondaryInteraction={consumerOnSecondary}
                                accessibilityLabel="Long-press me"
                                testID="secondary-trigger"
                            >
                                <View testID="secondary-icon" />
                            </PressableWithSecondaryInteraction>
                        </PopoverMenu.SecondaryInteractionTrigger>
                        <VisibilityObserver onChange={onOpenChange} />
                    </PopoverMenu.Root>
                </NavigationContext.Provider>,
            );
            onOpenChange.mockClear();
            const longPressEvent = {
                defaultPrevented: false,
                preventDefault() {
                    longPressEvent.defaultPrevented = true;
                },
            };
            fireEvent(screen.getByTestId('secondary-trigger'), 'longPress', longPressEvent);
            expect(consumerOnSecondary).toHaveBeenCalledTimes(1);
            expect(longPressEvent.defaultPrevented).toBe(true);
            expect(onOpenChange).toHaveBeenCalledWith(true);
        });
    });

    describe('useSubTrigger', () => {
        it('returns the trigger shape and reports active-level visibility', () => {
            const captured: PopoverMenu.UseSubTriggerResult[] = [];
            function ProbeHook() {
                captured.push(PopoverMenu.useSubTrigger());
                return null;
            }
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="sub-test">
                            <ProbeHook />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Item
                                    text="X"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            const result = captured.at(-1);
            expect(result).toBeDefined();
            expect(typeof result?.onPress).toBe('function');
            expect(typeof result?.onFocus).toBe('function');
            expect(typeof result?.focused).toBe('boolean');
            expect(result?.isAtActiveLevel).toBe(true);
        });

        it('drills into the enclosing Sub on onPress', () => {
            const captured: PopoverMenu.UseSubTriggerResult[] = [];
            const navigationCaptured: Array<ReturnType<typeof useContentNavigation>> = [];
            function ProbeHook() {
                captured.push(PopoverMenu.useSubTrigger());
                return null;
            }
            function NavigationProbe() {
                navigationCaptured.push(useContentNavigation('NavigationProbe'));
                return null;
            }
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <NavigationProbe />
                        <PopoverMenu.Sub id="speed-sub">
                            <ProbeHook />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Item
                                    text="Fast"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(navigationCaptured.at(-1)?.currentSubID).toBeNull();
            act(() => captured.at(-1)?.onPress());
            expect(navigationCaptured.at(-1)?.currentSubID).toBe('speed-sub');
        });

        it('does not drill into the Sub when disabled', () => {
            const captured: PopoverMenu.UseSubTriggerResult[] = [];
            const navigationCaptured: Array<ReturnType<typeof useContentNavigation>> = [];
            function ProbeHook() {
                captured.push(PopoverMenu.useSubTrigger({disabled: true}));
                return null;
            }
            function NavigationProbe() {
                navigationCaptured.push(useContentNavigation('NavigationProbe'));
                return null;
            }
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <NavigationProbe />
                        <PopoverMenu.Sub id="speed-sub">
                            <ProbeHook />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Item
                                    text="Fast"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            act(() => captured.at(-1)?.onPress());
            expect(navigationCaptured.at(-1)?.currentSubID).toBeNull();
        });
    });

    describe('useSubBackButton', () => {
        it('returns the back-button shape and reports active-level visibility', () => {
            const captured: PopoverMenu.UseSubBackButtonResult[] = [];
            function ProbeHook() {
                captured.push(PopoverMenu.useSubBackButton());
                return null;
            }
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="probe-sub">
                            <PopoverMenu.Sub.Trigger text="Open" />
                            <PopoverMenu.Sub.Content>
                                <ProbeHook />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('Open');
            const result = captured.at(-1);
            expect(result).toBeDefined();
            expect(typeof result?.onPress).toBe('function');
            expect(typeof result?.onFocus).toBe('function');
            expect(typeof result?.focused).toBe('boolean');
            expect(result?.isAtActiveLevel).toBe(true);
        });

        it('exits to the parent level on onPress', () => {
            const captured: PopoverMenu.UseSubBackButtonResult[] = [];
            const navigationCaptured: Array<ReturnType<typeof useContentNavigation>> = [];
            function ProbeHook() {
                captured.push(PopoverMenu.useSubBackButton());
                return null;
            }
            function NavigationProbe() {
                navigationCaptured.push(useContentNavigation('NavigationProbe'));
                return null;
            }
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <NavigationProbe />
                        <PopoverMenu.Sub id="speed-sub">
                            <PopoverMenu.Sub.Trigger text="Open" />
                            <PopoverMenu.Sub.Content>
                                <ProbeHook />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('Open');
            expect(navigationCaptured.at(-1)?.currentSubID).toBe('speed-sub');
            act(() => captured.at(-1)?.onPress());
            expect(navigationCaptured.at(-1)?.currentSubID).toBeNull();
        });
    });

    describe('useSelectableRow', () => {
        it('returns the row shape and reports active-level visibility', () => {
            const captured: PopoverMenu.UseSelectableRowResult[] = [];
            function ProbeHook() {
                captured.push(PopoverMenu.useSelectableRow());
                return null;
            }
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <ProbeHook />
                    </PopoverMenu.Content>
                </Harness>,
            );
            const result = captured.at(-1);
            expect(result).toBeDefined();
            expect(typeof result?.onPress).toBe('function');
            expect(typeof result?.onFocus).toBe('function');
            expect(typeof result?.focused).toBe('boolean');
            expect(result?.isAtActiveLevel).toBe(true);
        });

        it('closes the popover after onPress', () => {
            const onOpenChange = jest.fn();
            const captured: PopoverMenu.UseSelectableRowResult[] = [];
            function ProbeHook() {
                captured.push(PopoverMenu.useSelectableRow({onSelect: jest.fn()}));
                return null;
            }
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <ProbeHook />
                    </PopoverMenu.Content>
                </Harness>,
            );
            onOpenChange.mockClear();
            act(() => captured.at(-1)?.onPress());
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('keeps the popover open when onSelect calls event.preventDefault()', () => {
            const onOpenChange = jest.fn();
            const captured: PopoverMenu.UseSelectableRowResult[] = [];
            function ProbeHook() {
                captured.push(
                    PopoverMenu.useSelectableRow({
                        onSelect: (event) => event.preventDefault(),
                    }),
                );
                return null;
            }
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <ProbeHook />
                    </PopoverMenu.Content>
                </Harness>,
            );
            onOpenChange.mockClear();
            act(() => captured.at(-1)?.onPress());
            expect(onOpenChange).not.toHaveBeenCalledWith(false);
        });
    });

    describe('useIsPopoverVisible', () => {
        it('reflects Root visibility', () => {
            const captured: boolean[] = [];
            function Probe() {
                captured.push(PopoverMenu.useIsPopoverVisible());
                return null;
            }
            render(
                <Harness initialOpen>
                    <Probe />
                </Harness>,
            );
            expect(captured.at(-1)).toBe(true);
        });

        it('returns false when Root is closed', () => {
            const captured: boolean[] = [];
            function Probe() {
                captured.push(PopoverMenu.useIsPopoverVisible());
                return null;
            }
            render(
                <Harness>
                    <Probe />
                </Harness>,
            );
            expect(captured.at(-1)).toBe(false);
        });
    });

    describe('useClosePopover', () => {
        it('closes the popover when called', () => {
            const onOpenChange = jest.fn();
            const captured: Array<() => void> = [];
            function Probe() {
                captured.push(PopoverMenu.useClosePopover());
                return null;
            }
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <Probe />
                    </PopoverMenu.Content>
                </Harness>,
            );
            onOpenChange.mockClear();
            act(() => captured.at(-1)?.());
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });
    });

    describe('Item', () => {
        it('fires onSelect when pressed', () => {
            const onSelect = jest.fn();
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Pay"
                            onSelect={onSelect}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('Pay');
            expect(onSelect).toHaveBeenCalledTimes(1);
        });

        it('closes the menu by default after onSelect', () => {
            const onOpenChange = jest.fn();
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Pay"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            onOpenChange.mockClear();
            press('Pay');
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('keeps the menu open when onSelect calls event.preventDefault()', () => {
            const onOpenChange = jest.fn();
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Stay"
                            onSelect={(event) => event.preventDefault()}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            onOpenChange.mockClear();
            press('Stay');
            expect(onOpenChange).not.toHaveBeenCalled();
        });

        it('skips onSelect when disabled', () => {
            const onSelect = jest.fn();
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Disabled"
                            disabled
                            onSelect={onSelect}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('Disabled');
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('still closes the menu when no onSelect is provided', () => {
            const onOpenChange = jest.fn();
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item text="Plain" />
                    </PopoverMenu.Content>
                </Harness>,
            );
            onOpenChange.mockClear();
            press('Plain');
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('does not mark the last item as focused when no row is focused', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="A"
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Item
                            text="B"
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Item
                            text="Last"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(findItemByTitle('A')?.focused).toBe(false);
            expect(findItemByTitle('B')?.focused).toBe(false);
            expect(findItemByTitle('Last')?.focused).toBe(false);
        });
    });

    describe('RadioItem', () => {
        it('renders the radio indicator with isSelected=true when selected', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.RadioItem
                            text="Wallet"
                            isSelected
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            const item = findItemByTitle('Wallet');
            expect(item?.shouldShowRadioButton).toBe(true);
            expect(item?.shouldShowRightIcon).toBe(false);
            expect(item?.isSelected).toBe(true);
        });

        it('renders the radio indicator with isSelected=false when not selected', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.RadioItem
                            text="Wallet"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            const item = findItemByTitle('Wallet');
            expect(item?.shouldShowRadioButton).toBe(true);
            expect(item?.shouldShowRightIcon).toBe(false);
            expect(item?.isSelected).toBe(false);
        });

        it('fires onSelect and closes the menu by default', () => {
            const onSelect = jest.fn();
            const onOpenChange = jest.fn();
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.RadioItem
                            text="Pick"
                            onSelect={onSelect}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            onOpenChange.mockClear();
            press('Pick');
            expect(onSelect).toHaveBeenCalledTimes(1);
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('replaces the radio indicator with rightIcon when supplied (selected)', () => {
            const customRightIcon = jest.fn();
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.RadioItem
                            text="Override"
                            isSelected
                            rightIcon={customRightIcon}
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            const item = findItemByTitle('Override');
            expect(item?.shouldShowRadioButton).toBe(false);
            expect(item?.shouldShowRightIcon).toBe(true);
            expect(item?.iconRight).toBe(customRightIcon);
        });

        it('renders rightIcon (no radio) when not selected', () => {
            const customRightIcon = jest.fn();
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.RadioItem
                            text="Plain"
                            rightIcon={customRightIcon}
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            const item = findItemByTitle('Plain');
            expect(item?.shouldShowRadioButton).toBe(false);
            expect(item?.shouldShowRightIcon).toBe(true);
            expect(item?.iconRight).toBe(customRightIcon);
        });

        it('skips onSelect when disabled', () => {
            const onSelect = jest.fn();
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.RadioItem
                            text="Disabled"
                            disabled
                            isSelected
                            onSelect={onSelect}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('Disabled');
            expect(onSelect).not.toHaveBeenCalled();
        });
    });

    describe('Label', () => {
        it('renders a non-interactive row', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Label text="Section heading" />
                        <PopoverMenu.Item
                            text="Below"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(findItemByTitle('Section heading')?.interactive).toBe(false);
            expect(findItemByTitle('Below')).toBeDefined();
        });
    });

    describe('Header', () => {
        it('renders at the root level', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Header>Pick a payment</PopoverMenu.Header>
                        <PopoverMenu.Item
                            text="Wallet"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(screen.getByText('Pick a payment')).toBeTruthy();
        });

        it('hides once a sub is entered', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Header>Pick a payment</PopoverMenu.Header>
                        <PopoverMenu.Sub id="sub-test">
                            <PopoverMenu.Sub.Trigger text="Pay as business" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Sub.BackButton text="Business" />
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(screen.getByText('Pick a payment')).toBeTruthy();
            press('Pay as business');
            expect(screen.queryByText('Pick a payment')).toBeNull();
        });
    });

    describe('Sub', () => {
        const renderTwoLevelMenu = () => (
            <Harness initialOpen>
                <PopoverMenu.Content>
                    <PopoverMenu.Item
                        text="Top 1"
                        onSelect={() => {}}
                    />
                    <PopoverMenu.Sub id="sub-test">
                        <PopoverMenu.Sub.Trigger text="Pay as business" />
                        <PopoverMenu.Sub.Content>
                            <PopoverMenu.Sub.BackButton text="Business" />
                            <PopoverMenu.Item
                                text="Sub option"
                                onSelect={() => {}}
                            />
                        </PopoverMenu.Sub.Content>
                    </PopoverMenu.Sub>
                    <PopoverMenu.Item
                        text="Top 2"
                        onSelect={() => {}}
                    />
                </PopoverMenu.Content>
            </Harness>
        );

        it('shows top-level items + SubTrigger when no sub is entered', () => {
            render(renderTwoLevelMenu());
            expect(findItemByTitle('Top 1')).toBeDefined();
            expect(findItemByTitle('Top 2')).toBeDefined();
            expect(findItemByTitle('Pay as business')).toBeDefined();
            expect(findItemByTitle('Sub option')).toBeUndefined();
        });

        it('hides top-level items and shows back button + sub items when entered', () => {
            render(renderTwoLevelMenu());
            press('Pay as business');
            expect(findItemByTitle('Top 1')).toBeUndefined();
            expect(findItemByTitle('Top 2')).toBeUndefined();
            expect(findItemByTitle('Pay as business')).toBeUndefined();
            expect(findItemByTitle('Sub option')).toBeDefined();
            expect(findItemByTitle('Business')).toBeDefined();
        });

        it('back-button press exits the sub and restores top-level items', () => {
            render(renderTwoLevelMenu());
            press('Pay as business');
            press('Business');
            expect(findItemByTitle('Top 1')).toBeDefined();
            expect(findItemByTitle('Top 2')).toBeDefined();
            expect(findItemByTitle('Sub option')).toBeUndefined();
        });

        it("Sub.Trigger runs consumer onPress before drilling; event.preventDefault() gates the drill (parity with Trigger's contract)", () => {
            const consumerOnPress = jest.fn((event: GestureResponderEvent | KeyboardEvent | undefined) => event?.preventDefault());
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="sub-gated">
                            <PopoverMenu.Sub.Trigger
                                text="Drill"
                                onPress={consumerOnPress}
                            />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Sub.BackButton text="Back" />
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            const event = {
                defaultPrevented: false,
                preventDefault() {
                    event.defaultPrevented = true;
                },
            } as unknown as GestureResponderEvent;
            act(() => {
                const onPress = findItemByTitle('Drill')?.onPress;
                if (typeof onPress === 'function') {
                    onPress(event);
                }
            });
            expect(consumerOnPress).toHaveBeenCalledTimes(1);
            expect(event.defaultPrevented).toBe(true);
            expect(findItemByTitle('Inner')).toBeUndefined();
        });

        it('selecting a sub item closes the menu by default', () => {
            const onOpenChange = jest.fn();
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="sub-test">
                            <PopoverMenu.Sub.Trigger text="Sub" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Item
                                    text="Choose"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('Sub');
            onOpenChange.mockClear();
            press('Choose');
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('resets to top level when the menu closes via item selection and reopens', () => {
            // Remounting `<Root>` (key bump) tears down nav state — the test's substitute for a "close + reopen" cycle.
            function RemountingHarness({remountKey}: {remountKey: number}) {
                return (
                    <Harness
                        key={remountKey}
                        initialOpen
                    >
                        <PopoverMenu.Content>
                            <PopoverMenu.Sub id="A">
                                <PopoverMenu.Sub.Trigger text="Open Sub" />
                                <PopoverMenu.Sub.Content>
                                    <PopoverMenu.Sub.BackButton text="Back" />
                                    <PopoverMenu.Item
                                        text="Choose"
                                        onSelect={() => {}}
                                    />
                                </PopoverMenu.Sub.Content>
                            </PopoverMenu.Sub>
                        </PopoverMenu.Content>
                    </Harness>
                );
            }

            const tree = render(<RemountingHarness remountKey={1} />);
            press('Open Sub');
            expect(findItemByTitle('Choose')).toBeDefined();

            menuItemPropsCapture.current = [];
            tree.rerender(<RemountingHarness remountKey={2} />);

            expect(findItemByTitle('Open Sub')).toBeDefined();
            expect(findItemByTitle('Choose')).toBeUndefined();
        });

        it('resets sub navigation when the menu closes via screen blur (so reopen lands at top)', () => {
            const captured: Array<string | null> = [];
            function NavProbe() {
                const {currentSubID} = useContentNavigation('NavProbe');
                captured.push(currentSubID);
                return null;
            }
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <NavProbe />
                        <PopoverMenu.Sub id="A">
                            <PopoverMenu.Sub.Trigger text="Open Sub" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Sub.BackButton text="Back" />
                                <PopoverMenu.Item
                                    text="Choose"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('Open Sub');
            expect(captured.at(-1)).toBe('A');

            act(() => fireBlur());
            expect(captured.at(-1)).toBeNull();
        });

        it('resets sub navigation when the menu closes via modal-stack cover (so reopen lands at top)', () => {
            const captured: Array<string | null> = [];
            function NavProbe() {
                const {currentSubID} = useContentNavigation('NavProbe');
                captured.push(currentSubID);
                return null;
            }
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <NavProbe />
                        <PopoverMenu.Sub id="A">
                            <PopoverMenu.Sub.Trigger text="Open Sub" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Sub.BackButton text="Back" />
                                <PopoverMenu.Item
                                    text="Choose"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('Open Sub');
            expect(captured.at(-1)).toBe('A');

            act(() => setMockModal({willAlertModalBecomeVisible: true, isPopover: false}));
            expect(captured.at(-1)).toBeNull();
        });

        it('renders a nested SubTrigger when its parent sub is the active level', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="A">
                            <PopoverMenu.Sub.Trigger text="Open A" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Sub.BackButton text="Back to root" />
                                <PopoverMenu.Item
                                    text="A item"
                                    onSelect={() => {}}
                                />
                                <PopoverMenu.Sub id="B">
                                    <PopoverMenu.Sub.Trigger text="Open B" />
                                    <PopoverMenu.Sub.Content>
                                        <PopoverMenu.Sub.BackButton text="Back to A" />
                                        <PopoverMenu.Item
                                            text="B item"
                                            onSelect={() => {}}
                                        />
                                    </PopoverMenu.Sub.Content>
                                </PopoverMenu.Sub>
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );

            expect(findItemByTitle('Open A')).toBeDefined();
            expect(findItemByTitle('Open B')).toBeUndefined();
            expect(findItemByTitle('A item')).toBeUndefined();

            press('Open A');
            expect(findItemByTitle('A item')).toBeDefined();
            expect(findItemByTitle('Open B')).toBeDefined();
            expect(findItemByTitle('B item')).toBeUndefined();

            press('Open B');
            expect(findItemByTitle('B item')).toBeDefined();
            expect(findItemByTitle('A item')).toBeUndefined();
            expect(findItemByTitle('Open B')).toBeUndefined();

            press('Back to A');
            expect(findItemByTitle('A item')).toBeDefined();
            expect(findItemByTitle('Open B')).toBeDefined();
            expect(findItemByTitle('B item')).toBeUndefined();
        });

        it('pops to parent when an active <Sub> unmounts mid-flight', () => {
            function SubMenuWithToggle({showSub}: {showSub: boolean}) {
                return (
                    <Harness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.Item
                                text="Top"
                                onSelect={() => {}}
                            />
                            {showSub && (
                                <PopoverMenu.Sub id="A">
                                    <PopoverMenu.Sub.Trigger text="Open A" />
                                    <PopoverMenu.Sub.Content>
                                        <PopoverMenu.Item
                                            text="A item"
                                            onSelect={() => {}}
                                        />
                                    </PopoverMenu.Sub.Content>
                                </PopoverMenu.Sub>
                            )}
                        </PopoverMenu.Content>
                    </Harness>
                );
            }

            const tree = render(<SubMenuWithToggle showSub />);
            press('Open A');
            expect(findItemByTitle('A item')).toBeDefined();
            expect(findItemByTitle('Top')).toBeUndefined();

            menuItemPropsCapture.current = [];
            tree.rerender(<SubMenuWithToggle showSub={false} />);
            expect(findItemByTitle('Top')).toBeDefined();
            expect(findItemByTitle('A item')).toBeUndefined();
        });

        it('cascades back to root when both a nested <Sub> and its parent unmount together', () => {
            function NestedTree({showSubs}: {showSubs: boolean}) {
                return (
                    <Harness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.Item
                                text="Top"
                                onSelect={() => {}}
                            />
                            {showSubs && (
                                <PopoverMenu.Sub id="A">
                                    <PopoverMenu.Sub.Trigger text="Open A" />
                                    <PopoverMenu.Sub.Content>
                                        <PopoverMenu.Sub.BackButton text="Back to root" />
                                        <PopoverMenu.Sub id="B">
                                            <PopoverMenu.Sub.Trigger text="Open B" />
                                            <PopoverMenu.Sub.Content>
                                                <PopoverMenu.Sub.BackButton text="Back to A" />
                                                <PopoverMenu.Item
                                                    text="B item"
                                                    onSelect={() => {}}
                                                />
                                            </PopoverMenu.Sub.Content>
                                        </PopoverMenu.Sub>
                                    </PopoverMenu.Sub.Content>
                                </PopoverMenu.Sub>
                            )}
                        </PopoverMenu.Content>
                    </Harness>
                );
            }

            const tree = render(<NestedTree showSubs />);
            press('Open A');
            press('Open B');
            expect(findItemByTitle('B item')).toBeDefined();

            menuItemPropsCapture.current = [];
            tree.rerender(<NestedTree showSubs={false} />);
            expect(findItemByTitle('Top')).toBeDefined();
            expect(findItemByTitle('B item')).toBeUndefined();
        });

        // Mutation-tested: `useSubNavigation`'s `unregisterSub` must read the latest `pathStack` via functional `setState` — closure-capturing it makes this test fail.
        it('pops to parent when only the nested <Sub> unmounts (parent stays mounted)', () => {
            const captured: Array<string | null> = [];
            function NavProbe() {
                const {currentSubID} = useContentNavigation('NavProbe');
                captured.push(currentSubID);
                return null;
            }
            function NestedTree({showInner}: {showInner: boolean}) {
                return (
                    <Harness initialOpen>
                        <PopoverMenu.Content>
                            <NavProbe />
                            <PopoverMenu.Sub id="A">
                                <PopoverMenu.Sub.Trigger text="Open A" />
                                <PopoverMenu.Sub.Content>
                                    <PopoverMenu.Sub.BackButton text="Back to root" />
                                    {showInner && (
                                        <PopoverMenu.Sub id="B">
                                            <PopoverMenu.Sub.Trigger text="Open B" />
                                            <PopoverMenu.Sub.Content>
                                                <PopoverMenu.Sub.BackButton text="Back to A" />
                                                <PopoverMenu.Item
                                                    text="B item"
                                                    onSelect={() => {}}
                                                />
                                            </PopoverMenu.Sub.Content>
                                        </PopoverMenu.Sub>
                                    )}
                                </PopoverMenu.Sub.Content>
                            </PopoverMenu.Sub>
                        </PopoverMenu.Content>
                    </Harness>
                );
            }

            const tree = render(<NestedTree showInner />);
            press('Open A');
            press('Open B');
            expect(captured.at(-1)).toBe('B');

            menuItemPropsCapture.current = [];
            tree.rerender(<NestedTree showInner={false} />);

            // Cascade pops the path-stack tail past unmounted entries to the nearest still-mounted ancestor (A), NOT to root.
            expect(captured.at(-1)).toBe('A');
        });

        it('keeps custom non-primitive children gated to the active level', () => {
            const renderSpy = jest.fn();
            function CustomRow() {
                renderSpy();
                return null;
            }

            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="sub-test">
                            <PopoverMenu.Sub.Trigger text="Trigger" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Sub.BackButton text="Back" />
                                <CustomRow />
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );

            // Custom content would otherwise leak — built-in Items self-gate, this doesn't.
            expect(renderSpy).not.toHaveBeenCalled();

            press('Trigger');

            expect(renderSpy).toHaveBeenCalled();
            expect(findItemByTitle('Inner')).toBeDefined();
        });

        it('lets custom rows self-gate via useIsAtActiveLevel', () => {
            const renderSpy = jest.fn();
            function SelfGatedRow() {
                if (!useIsAtActiveLevel('SelfGatedRow')) {
                    return null;
                }
                renderSpy();
                return null;
            }

            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="outer">
                            <PopoverMenu.Sub.Trigger text="Outer" />
                            <PopoverMenu.Sub.Content>
                                <SelfGatedRow />
                                <PopoverMenu.Sub id="inner">
                                    <PopoverMenu.Sub.Trigger text="Inner" />
                                    <PopoverMenu.Sub.Content>
                                        <PopoverMenu.Item
                                            text="Innermost"
                                            onSelect={() => {}}
                                        />
                                    </PopoverMenu.Sub.Content>
                                </PopoverMenu.Sub>
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );

            press('Outer');
            expect(renderSpy).toHaveBeenCalled();

            renderSpy.mockClear();

            press('Inner');
            expect(renderSpy).not.toHaveBeenCalled();
            expect(findItemByTitle('Innermost')).toBeDefined();
        });

        it('keeps a parent-level <SubContent> mounted while a nested sub is active', () => {
            const innerRenderSpy = jest.fn();
            function InnerCustomRow() {
                innerRenderSpy();
                return null;
            }

            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="outer">
                            <PopoverMenu.Sub.Trigger text="Open outer" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Sub.BackButton text="Back to root" />
                                <PopoverMenu.Sub id="inner">
                                    <PopoverMenu.Sub.Trigger text="Open inner" />
                                    <PopoverMenu.Sub.Content>
                                        <PopoverMenu.Sub.BackButton text="Back to outer" />
                                        <InnerCustomRow />
                                        <PopoverMenu.Item
                                            text="Innermost"
                                            onSelect={() => {}}
                                        />
                                    </PopoverMenu.Sub.Content>
                                </PopoverMenu.Sub>
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );

            press('Open outer');
            expect(innerRenderSpy).not.toHaveBeenCalled();

            press('Open inner');
            expect(innerRenderSpy).toHaveBeenCalled();
            expect(findItemByTitle('Innermost')).toBeDefined();
        });

        it('resets focus when entering a submenu', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Above"
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Sub id="sub-test">
                            <PopoverMenu.Sub.Trigger text="Trigger" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Sub.BackButton text="Back" />
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );

            focus('Trigger');
            press('Trigger');

            expect(findItemByTitle('Back')?.focused).toBe(false);
            expect(findItemByTitle('Inner')?.focused).toBe(false);
        });

        // Stricter than the integration test below — fails first if RC ever regresses on the actions-object memoization.
        it('keeps registerSub identity stable across unrelated parent re-renders (RC mutation guard)', () => {
            const registerSubCaptures: unknown[] = [];
            function RegisterSubProbe() {
                const {registerSub} = useContentSubActions('RegisterSubProbe');
                registerSubCaptures.push(registerSub);
                return null;
            }
            function TickHarness({tick}: {tick: number}) {
                return (
                    <Harness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.Item
                                text={`tick-${tick}`}
                                onSelect={() => {}}
                            />
                            <RegisterSubProbe />
                        </PopoverMenu.Content>
                    </Harness>
                );
            }
            const tree = render(<TickHarness tick={0} />);
            const first = registerSubCaptures.at(0);
            for (let i = 1; i <= 3; i += 1) {
                tree.rerender(<TickHarness tick={i} />);
            }
            for (const captured of registerSubCaptures) {
                expect(captured).toBe(first);
            }
            expect(registerSubCaptures.length).toBeGreaterThan(1);
        });

        // Guards `Sub`'s useLayoutEffect cleanup + `ContentSubActions` identity stability across unrelated re-renders.
        it('stays in the sub when focus changes inside it (re-render stability)', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="sub">
                            <PopoverMenu.Sub.Trigger text="Open" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Sub.BackButton text="Back" />
                                <PopoverMenu.Item
                                    text="First"
                                    onSelect={() => {}}
                                />
                                <PopoverMenu.Item
                                    text="Second"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('Open');
            expect(findItemByTitle('First')).toBeDefined();
            expect(findItemByTitle('Second')).toBeDefined();
            expect(findItemByTitle('Back')).toBeDefined();

            // Focus change re-renders the Content tree; sub state must not collapse.
            focus('Second');

            expect(findItemByTitle('First')).toBeDefined();
            expect(findItemByTitle('Second')).toBeDefined();
            expect(findItemByTitle('Back')).toBeDefined();
            expect(findItemByTitle('Open')).toBeUndefined();
        });

        it('resets focus when an active sub unmounts mid-flight', () => {
            function SubMenuWithToggle({showSub}: {showSub: boolean}) {
                return (
                    <Harness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.Item
                                text="Outer-A"
                                onSelect={() => {}}
                            />
                            <PopoverMenu.Item
                                text="Outer-B"
                                onSelect={() => {}}
                            />
                            {showSub && (
                                <PopoverMenu.Sub id="sub">
                                    <PopoverMenu.Sub.Trigger text="Open" />
                                    <PopoverMenu.Sub.Content>
                                        <PopoverMenu.Item
                                            text="Inner-A"
                                            onSelect={() => {}}
                                        />
                                        <PopoverMenu.Item
                                            text="Inner-B"
                                            onSelect={() => {}}
                                        />
                                    </PopoverMenu.Sub.Content>
                                </PopoverMenu.Sub>
                            )}
                        </PopoverMenu.Content>
                    </Harness>
                );
            }

            const tree = render(<SubMenuWithToggle showSub />);
            press('Open');

            // Focus Inner-A (index 1 after the back button).
            focus('Inner-A');
            expect(findItemByTitle('Inner-A')?.focused).toBe(true);

            menuItemPropsCapture.current = [];
            tree.rerender(<SubMenuWithToggle showSub={false} />);

            // After cascade: index 1 maps to Outer-B in the parent list. Focus must NOT carry over.
            expect(findItemByTitle('Outer-A')?.focused).toBe(false);
            expect(findItemByTitle('Outer-B')?.focused).toBe(false);
        });
    });

    describe('Separator', () => {
        it('renders at the top level', () => {
            const tree = render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="A"
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Separator />
                        <PopoverMenu.Item
                            text="B"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(findItemByTitle('A')).toBeDefined();
            expect(findItemByTitle('B')).toBeDefined();
            expect(tree).toBeTruthy();
        });

        it('hides at top level when a sub is entered', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Separator />
                        <PopoverMenu.Sub id="sub-test">
                            <PopoverMenu.Sub.Trigger text="Sub" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('Sub');
            expect(findItemByTitle('Sub')).toBeUndefined();
            expect(findItemByTitle('Inner')).toBeDefined();
        });
    });

    describe('ScrollableContent', () => {
        it('warns when the child count exceeds the virtualization threshold', () => {
            const warnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => {});
            const items = Array.from({length: 51}, (_, index) => (
                <PopoverMenu.Item
                    key={index}
                    text={`Item ${index}`}
                    onSelect={() => {}}
                />
            ));
            render(
                <Harness initialOpen>
                    <PopoverMenu.ScrollableContent>{items}</PopoverMenu.ScrollableContent>
                </Harness>,
            );
            expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/received 51 children/));
            warnSpy.mockRestore();
        });

        it('does not warn at or below the threshold', () => {
            const warnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => {});
            const items = Array.from({length: 50}, (_, index) => (
                <PopoverMenu.Item
                    key={index}
                    text={`Item ${index}`}
                    onSelect={() => {}}
                />
            ));
            render(
                <Harness initialOpen>
                    <PopoverMenu.ScrollableContent>{items}</PopoverMenu.ScrollableContent>
                </Harness>,
            );
            expect(warnSpy).not.toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });

    describe('Group', () => {
        it('keeps a Sub inside a Group navigable', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Group>
                            <PopoverMenu.Sub id="sub-test">
                                <PopoverMenu.Sub.Trigger text="Open" />
                                <PopoverMenu.Sub.Content>
                                    <PopoverMenu.Item
                                        text="Inside"
                                        onSelect={() => {}}
                                    />
                                </PopoverMenu.Sub.Content>
                            </PopoverMenu.Sub>
                        </PopoverMenu.Group>
                    </PopoverMenu.Content>
                </Harness>,
            );

            press('Open');
            expect(findItemByTitle('Inside')).toBeDefined();
        });

        it('renders its children at the top level', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Group>
                            <PopoverMenu.Label text="Currency" />
                            <PopoverMenu.Item
                                text="USD"
                                onSelect={() => {}}
                            />
                        </PopoverMenu.Group>
                    </PopoverMenu.Content>
                </Harness>,
            );
            expect(findItemByTitle('Currency')).toBeDefined();
            expect(findItemByTitle('USD')).toBeDefined();
        });

        it('hides its children when a sub is entered', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Group>
                            <PopoverMenu.Item
                                text="USD"
                                onSelect={() => {}}
                            />
                        </PopoverMenu.Group>
                        <PopoverMenu.Sub id="sub-test">
                            <PopoverMenu.Sub.Trigger text="More" />
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );
            press('More');
            expect(findItemByTitle('USD')).toBeUndefined();
            expect(findItemByTitle('Inner')).toBeDefined();
        });
    });

    describe('Composition invariants', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        afterAll(() => {
            consoleErrorSpy.mockRestore();
        });

        it('throws when Trigger is rendered outside Root', () => {
            expect(() =>
                render(
                    <PopoverMenu.Trigger>
                        <PressableWithFeedback
                            onPress={() => {}}
                            accessibilityLabel="X"
                            sentryLabel="X"
                        >
                            <View />
                        </PressableWithFeedback>
                    </PopoverMenu.Trigger>,
                ),
            ).toThrow(/PopoverMenu\.Trigger must be used inside <PopoverMenu\.Root>/);
        });

        it('throws when SecondaryInteractionTrigger is rendered outside Root', () => {
            expect(() =>
                render(
                    <PopoverMenu.SecondaryInteractionTrigger>
                        <PressableWithSecondaryInteraction
                            onSecondaryInteraction={() => {}}
                            accessibilityLabel="X"
                        >
                            <View />
                        </PressableWithSecondaryInteraction>
                    </PopoverMenu.SecondaryInteractionTrigger>,
                ),
            ).toThrow(/PopoverMenu\.SecondaryInteractionTrigger must be used inside <PopoverMenu\.Root>/);
        });

        it('throws when useIsPopoverVisible is called outside Root', () => {
            function CallVisibilityHook() {
                PopoverMenu.useIsPopoverVisible();
                return null;
            }
            expect(() => render(<CallVisibilityHook />)).toThrow(/useIsPopoverVisible must be used inside <PopoverMenu\.Root>/);
        });

        it('throws when Content is rendered outside Root', () => {
            expect(() =>
                render(
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="A"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>,
                ),
            ).toThrow(/PopoverMenu\.Content must be used inside <PopoverMenu\.Root>/);
        });

        it('throws when Item is rendered outside Content', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Item
                            text="A"
                            onSelect={() => {}}
                        />
                    </Harness>,
                ),
            ).toThrow(/PopoverMenu\.Item must be used inside <PopoverMenu\.Content>/);
        });

        it('throws when Group is rendered outside Content', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Group>
                            <View />
                        </PopoverMenu.Group>
                    </Harness>,
                ),
            ).toThrow(/PopoverMenu\.Group must be used inside <PopoverMenu\.Content>/);
        });

        it('throws when Sub is rendered outside Content', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Sub id="sub-test">
                            <PopoverMenu.Sub.Trigger text="X" />
                        </PopoverMenu.Sub>
                    </Harness>,
                ),
            ).toThrow(/PopoverMenu\.Sub must be used inside <PopoverMenu\.Content>/);
        });

        it('throws when Sub.Trigger is rendered outside Sub', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.Sub.Trigger text="X" />
                        </PopoverMenu.Content>
                    </Harness>,
                ),
            ).toThrow(/PopoverMenu\.Sub\.Trigger must be used inside <PopoverMenu\.Sub>/);
        });

        it('throws when useSelectableRow is called outside Content', () => {
            function CallSelectableRowHook() {
                PopoverMenu.useSelectableRow();
                return null;
            }
            expect(() =>
                render(
                    <Harness initialOpen>
                        <CallSelectableRowHook />
                    </Harness>,
                ),
            ).toThrow(/useSelectableRow must be used inside <PopoverMenu\.Content>/);
        });

        it('throws when useClosePopover is called outside Content', () => {
            function CallClosePopoverHook() {
                PopoverMenu.useClosePopover();
                return null;
            }
            expect(() =>
                render(
                    <Harness initialOpen>
                        <CallClosePopoverHook />
                    </Harness>,
                ),
            ).toThrow(/useClosePopover must be used inside <PopoverMenu\.Content>/);
        });

        it('throws when useSubBackButton is called outside Sub', () => {
            function CallSubBackButtonHook() {
                PopoverMenu.useSubBackButton();
                return null;
            }
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Content>
                            <CallSubBackButtonHook />
                        </PopoverMenu.Content>
                    </Harness>,
                ),
            ).toThrow(/useSubBackButton must be used inside <PopoverMenu\.Sub>/);
        });

        it('throws when useSubTrigger is called outside Sub', () => {
            function CallSubTriggerHook() {
                PopoverMenu.useSubTrigger();
                return null;
            }
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Content>
                            <CallSubTriggerHook />
                        </PopoverMenu.Content>
                    </Harness>,
                ),
            ).toThrow(/useSubTrigger must be used inside <PopoverMenu\.Sub>/);
        });

        it('throws when Sub.Content is rendered outside Sub', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.Sub.Content>
                                <PopoverMenu.Item
                                    text="X"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Content>
                    </Harness>,
                ),
            ).toThrow(/PopoverMenu\.Sub\.Content must be used inside <PopoverMenu\.Sub>/);
        });

        it('throws when Header is rendered outside Content', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Header>Title</PopoverMenu.Header>
                    </Harness>,
                ),
            ).toThrow(/PopoverMenu\.Header must be used inside <PopoverMenu\.Content>/);
        });

        it('throws when Label is rendered outside Content', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Label text="Label" />
                    </Harness>,
                ),
            ).toThrow(/PopoverMenu\.Label must be used inside <PopoverMenu\.Content>/);
        });

        it('throws when RadioItem is rendered outside Content', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.RadioItem
                            text="X"
                            onSelect={() => {}}
                        />
                    </Harness>,
                ),
            ).toThrow(/PopoverMenu\.RadioItem must be used inside <PopoverMenu\.Content>/);
        });

        it('throws when Separator is rendered outside Content', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Separator />
                    </Harness>,
                ),
            ).toThrow(/PopoverMenu\.Separator must be used inside <PopoverMenu\.Content>/);
        });

        it('throws when Sub.BackButton is rendered outside Sub', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.Sub.BackButton text="Back" />
                        </PopoverMenu.Content>
                    </Harness>,
                ),
            ).toThrow(/PopoverMenu\.Sub\.BackButton must be used inside <PopoverMenu\.Sub>/);
        });

        it('throws when ScrollableContent is rendered outside Root', () => {
            expect(() =>
                render(
                    <PopoverMenu.ScrollableContent>
                        <PopoverMenu.Item
                            text="X"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.ScrollableContent>,
                ),
            ).toThrow(/PopoverMenu\.ScrollableContent must be used inside <PopoverMenu\.Root>/);
        });
    });

    describe('Arrow-key navigation', () => {
        // capture accumulates across re-renders — read the LATEST render of a title to assert post-arrow state.
        function findItemFocusedFlag(title: string): boolean {
            return !!menuItemPropsCapture.current.findLast((p) => p.title === title)?.focused;
        }

        it('ArrowDown focuses rows in registration (DOM) order; ArrowUp walks back', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Alpha"
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Item
                            text="Beta"
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Item
                            text="Gamma"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );

            pressShortcut('ArrowDown');
            expect(findItemFocusedFlag('Alpha')).toBe(true);
            pressShortcut('ArrowDown');
            expect(findItemFocusedFlag('Beta')).toBe(true);
            pressShortcut('ArrowDown');
            expect(findItemFocusedFlag('Gamma')).toBe(true);

            pressShortcut('ArrowUp');
            expect(findItemFocusedFlag('Beta')).toBe(true);
            pressShortcut('ArrowUp');
            expect(findItemFocusedFlag('Alpha')).toBe(true);
        });

        it('ArrowDown skips disabled rows', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="A"
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Item
                            text="B-disabled"
                            disabled
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Item
                            text="C"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );

            pressShortcut('ArrowDown');
            expect(findItemFocusedFlag('A')).toBe(true);
            pressShortcut('ArrowDown');
            expect(findItemFocusedFlag('B-disabled')).toBe(false);
            expect(findItemFocusedFlag('C')).toBe(true);
        });

        it('Enter activates the focused row and closes the menu', () => {
            const onSelectAlpha = jest.fn();
            const onSelectBeta = jest.fn();
            const onOpenChange = jest.fn();
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Alpha"
                            onSelect={onSelectAlpha}
                        />
                        <PopoverMenu.Item
                            text="Beta"
                            onSelect={onSelectBeta}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );

            pressShortcut('ArrowDown');
            pressShortcut('ArrowDown');
            pressShortcut('Enter');
            expect(onSelectBeta).toHaveBeenCalledTimes(1);
            expect(onSelectAlpha).not.toHaveBeenCalled();
            expect(onOpenChange).toHaveBeenLastCalledWith(false);
        });

        it('Enter on a disabled focused row is a no-op (focus skip prevents reaching it)', () => {
            const onSelectDisabled = jest.fn();
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Disabled"
                            disabled
                            onSelect={onSelectDisabled}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );

            pressShortcut('ArrowDown');
            expect(findItemFocusedFlag('Disabled')).toBe(false);
            pressShortcut('Enter');
            expect(onSelectDisabled).not.toHaveBeenCalled();
        });
    });
});
