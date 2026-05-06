import {act, render, screen} from '@testing-library/react-native';
import React, {useEffect, useLayoutEffect, useRef} from 'react';
import type {PropsWithChildren, ReactNode} from 'react';
import type {View as RNViewType} from 'react-native';
import {View} from 'react-native';
import * as PopoverMenu from '@components/PopoverMenu/v2';
// Reaches for an internal hook so the harness can publish `activeAnchor` without rendering a
// real `<Trigger>` button in every test. Production code never imports this.
import {useRootActions} from '@components/PopoverMenu/v2/root/RootContext';
import type {AnchorRef} from '@components/PopoverMenu/v2/root/RootContext';

const {useIsAtActiveLevel} = PopoverMenu;

type MenuItemMockProps = Record<string, unknown> & {
    title?: string;
    pressableTestID?: string;
};

const menuItemPropsCapture: {current: MenuItemMockProps[]} = {current: []};

jest.mock('@components/PopoverWithMeasuredContent', () => {
    function MockPopoverWithMeasuredContent({isVisible, children}: {isVisible?: boolean; children?: ReactNode}) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo.
        const {View: RNView} = jest.requireActual('react-native');
        if (!isVisible) {
            return null;
        }
        return <RNView testID="mock-popover">{children}</RNView>;
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
jest.mock('@hooks/useTheme', () => () => ({border: 'borderColor', icon: 'iconColor', iconHovered: 'iconHovered'}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false, shouldUseNarrowLayout: false}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({BackArrow: 'BackArrowIcon', ArrowRight: 'ArrowRightIcon', Checkmark: 'CheckmarkIcon'}),
}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

const mockFocusState: {cleanup: (() => void) | undefined} = {cleanup: undefined};
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (callback: () => (() => void) | void) => {
        const cleanup = callback();
        if (typeof cleanup === 'function') {
            mockFocusState.cleanup = cleanup;
        }
    },
}));

const mockModalState: {
    value: {willAlertModalBecomeVisible?: boolean; isPopover?: boolean} | undefined;
    listeners: Set<() => void>;
} = {value: undefined, listeners: new Set()};
jest.mock('@hooks/useOnyx', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo. */
    const ReactActual = jest.requireActual('react');
    return () => {
        const [, force] = ReactActual.useState({});
        ReactActual.useEffect(() => {
            const listener = () => force({});
            mockModalState.listeners.add(listener);
            return () => mockModalState.listeners.delete(listener);
        }, []);
        return [mockModalState.value, {status: 'loaded'}];
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
    mockFocusState.cleanup = undefined;
    mockModalState.value = undefined;
    mockModalState.listeners.clear();
    jest.clearAllMocks();
});

function findItemByTitle<T = MenuItemMockProps>(title: string): T | undefined {
    return menuItemPropsCapture.current.find((p) => p.title === title) as T | undefined;
}

function press(title: string): void {
    const item = findItemByTitle<{onPress?: () => void}>(title);
    menuItemPropsCapture.current = [];
    act(() => item?.onPress?.());
}

/**
 * Helper rendered as a child of `<Root>` that publishes `activeAnchor` on mount, mimicking what a
 * `<Trigger>` press would do. Stays mounted so the anchor persists across open/close cycles. Rect
 * is fabricated since the mocked `<PopoverWithMeasuredContent>` doesn't read it.
 */
function AutoSetAnchor() {
    const {setActiveAnchor} = useRootActions('AutoSetAnchor');
    const ref = useRef<RNViewType>(null);
    useLayoutEffect(() => {
        setActiveAnchor({ref: ref as AnchorRef, rect: {x: 0, y: 0, width: 0, height: 0}});
    }, [setActiveAnchor]);
    return <View ref={ref} />;
}

/** Reads `useIsPopoverVisible` and forwards transitions to a parent callback — replaces v1's `onOpenChange` prop in tests. */
function VisibilityObserver({onChange}: {onChange: (open: boolean) => void}) {
    const isVisible = PopoverMenu.useIsPopoverVisible();
    useEffect(() => {
        onChange(isVisible);
    }, [isVisible, onChange]);
    return null;
}

/** v2 is uncontrolled-only; `onOpenChange` here is a test-side observer of `useIsPopoverVisible`, not a prop on Root. */
function Harness({initialOpen = false, onOpenChange, children}: PropsWithChildren<{initialOpen?: boolean; onOpenChange?: (open: boolean) => void}>) {
    return (
        <PopoverMenu.Root defaultOpen={initialOpen}>
            <AutoSetAnchor />
            {onOpenChange ? <VisibilityObserver onChange={onOpenChange} /> : null}
            {children}
        </PopoverMenu.Root>
    );
}

describe('PopoverMenu V2', () => {
    describe('Root', () => {
        it('renders nothing when closed', () => {
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
            expect(findItemByTitle('Hidden')).toBeUndefined();
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

        it('closes on screen blur via useFocusEffect cleanup', () => {
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
            act(() => mockFocusState.cleanup?.());
            expect(onOpenChange).toHaveBeenCalledWith(false);
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

        // Event-coord callers like VideoPopoverMenu drive Root with anchorPosition only — anchorPosition alone must be sufficient.
        it('renders with anchorPosition only (no Trigger, no Root anchorRef)', () => {
            render(
                <PopoverMenu.Root defaultOpen>
                    <PopoverMenu.Content anchorPosition={{horizontal: 100, vertical: 200}}>
                        <PopoverMenu.Item
                            text="Anchored by coords"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </PopoverMenu.Root>,
            );
            expect(findItemByTitle('Anchored by coords')).toBeDefined();
        });
    });

    describe('usePopoverTrigger', () => {
        it('returns a ref and an onPress callback', () => {
            const captured: PopoverMenu.UsePopoverTriggerResult[] = [];
            function ProbeHook() {
                captured.push(PopoverMenu.usePopoverTrigger());
                return null;
            }
            render(
                <PopoverMenu.Root>
                    <ProbeHook />
                </PopoverMenu.Root>,
            );
            const result = captured.at(-1);
            expect(result).toBeDefined();
            expect(typeof result?.onPress).toBe('function');
            expect(result?.ref).toMatchObject({current: null});
        });
    });

    describe('useSecondaryInteractionTrigger', () => {
        it('returns a ref and an onSecondaryInteraction callback', () => {
            const captured: PopoverMenu.UseSecondaryInteractionTriggerResult[] = [];
            function ProbeHook() {
                captured.push(PopoverMenu.useSecondaryInteractionTrigger());
                return null;
            }
            render(
                <PopoverMenu.Root>
                    <ProbeHook />
                </PopoverMenu.Root>,
            );
            const result = captured.at(-1);
            expect(result).toBeDefined();
            expect(typeof result?.onSecondaryInteraction).toBe('function');
            expect(result?.ref).toMatchObject({current: null});
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
            expect(findItemByTitle<{focused?: boolean}>('A')?.focused).toBe(false);
            expect(findItemByTitle<{focused?: boolean}>('B')?.focused).toBe(false);
            expect(findItemByTitle<{focused?: boolean}>('Last')?.focused).toBe(false);
        });
    });

    describe('CheckmarkItem', () => {
        it('renders the check when isSelected', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
                            text="Wallet"
                            isSelected
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            const item = findItemByTitle<{iconRight?: unknown; shouldShowRightIcon?: boolean; isSelected?: boolean}>('Wallet');
            expect(item?.shouldShowRightIcon).toBe(true);
            expect(item?.iconRight).toBe('CheckmarkIcon');
            expect(item?.isSelected).toBe(true);
        });

        it('does not render the check when isSelected is false', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
                            text="Wallet"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            const item = findItemByTitle<{iconRight?: unknown; shouldShowRightIcon?: boolean; isSelected?: boolean}>('Wallet');
            expect(item?.shouldShowRightIcon).toBe(false);
            expect(item?.iconRight).toBeUndefined();
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
                        <PopoverMenu.CheckmarkItem
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

        it('replaces the check with rightIcon when supplied (selected)', () => {
            const customRightIcon = jest.fn();
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
                            text="Override"
                            isSelected
                            rightIcon={customRightIcon}
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            const item = findItemByTitle<{iconRight?: unknown; shouldShowRightIcon?: boolean}>('Override');
            expect(item?.shouldShowRightIcon).toBe(true);
            expect(item?.iconRight).toBe(customRightIcon);
        });

        it('renders rightIcon (no check) when not selected', () => {
            const customRightIcon = jest.fn();
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
                            text="Plain"
                            rightIcon={customRightIcon}
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </Harness>,
            );
            const item = findItemByTitle<{iconRight?: unknown; shouldShowRightIcon?: boolean}>('Plain');
            expect(item?.shouldShowRightIcon).toBe(true);
            expect(item?.iconRight).toBe(customRightIcon);
        });

        it('skips onSelect when disabled', () => {
            const onSelect = jest.fn();
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
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
            expect(findItemByTitle<{interactive?: boolean}>('Section heading')?.interactive).toBe(false);
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
                        <PopoverMenu.Sub>
                            <PopoverMenu.Sub.Trigger text="Pay as business" />
                            <PopoverMenu.Sub.Content backButtonText="Business">
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
                    <PopoverMenu.Sub>
                        <PopoverMenu.Sub.Trigger text="Pay as business" />
                        <PopoverMenu.Sub.Content backButtonText="Business">
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

        it('selecting a sub item closes the menu by default', () => {
            const onOpenChange = jest.fn();
            render(
                <Harness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub>
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
                                <PopoverMenu.Sub.Content backButtonText="Back">
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

        it('renders a nested SubTrigger when its parent sub is the active level', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="A">
                            <PopoverMenu.Sub.Trigger text="Open A" />
                            <PopoverMenu.Sub.Content backButtonText="Back to root">
                                <PopoverMenu.Item
                                    text="A item"
                                    onSelect={() => {}}
                                />
                                <PopoverMenu.Sub id="B">
                                    <PopoverMenu.Sub.Trigger text="Open B" />
                                    <PopoverMenu.Sub.Content backButtonText="Back to A">
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
                                    <PopoverMenu.Sub.Content backButtonText="Back to root">
                                        <PopoverMenu.Sub id="B">
                                            <PopoverMenu.Sub.Trigger text="Open B" />
                                            <PopoverMenu.Sub.Content backButtonText="Back to A">
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

        it('keeps custom non-primitive children gated to the active level', () => {
            const renderSpy = jest.fn();
            function CustomRow() {
                renderSpy();
                return null;
            }

            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub>
                            <PopoverMenu.Sub.Trigger text="Trigger" />
                            <PopoverMenu.Sub.Content backButtonText="Back">
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
                            <PopoverMenu.Sub.Content backButtonText="Back to root">
                                <PopoverMenu.Sub id="inner">
                                    <PopoverMenu.Sub.Trigger text="Open inner" />
                                    <PopoverMenu.Sub.Content backButtonText="Back to outer">
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
                        <PopoverMenu.Sub>
                            <PopoverMenu.Sub.Trigger text="Trigger" />
                            <PopoverMenu.Sub.Content backButtonText="Back">
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.Sub.Content>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </Harness>,
            );

            const trigger = findItemByTitle<{onFocus?: () => void}>('Trigger');
            act(() => trigger?.onFocus?.());
            press('Trigger');

            expect(findItemByTitle<{focused?: boolean}>('Back')?.focused).toBe(false);
            expect(findItemByTitle<{focused?: boolean}>('Inner')?.focused).toBe(false);
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
            const innerA = findItemByTitle<{onFocus?: () => void}>('Inner-A');
            menuItemPropsCapture.current = [];
            act(() => innerA?.onFocus?.());
            expect(findItemByTitle<{focused?: boolean}>('Inner-A')?.focused).toBe(true);

            menuItemPropsCapture.current = [];
            tree.rerender(<SubMenuWithToggle showSub={false} />);

            // After cascade: index 1 maps to Outer-B in the parent list. Focus must NOT carry over.
            const outerBLatest = [...menuItemPropsCapture.current].reverse().find((p) => p.title === 'Outer-B') as {focused?: boolean} | undefined;
            const outerALatest = [...menuItemPropsCapture.current].reverse().find((p) => p.title === 'Outer-A') as {focused?: boolean} | undefined;
            expect(outerALatest?.focused).toBe(false);
            expect(outerBLatest?.focused).toBe(false);
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
                        <PopoverMenu.Sub>
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

    describe('Group', () => {
        it('keeps a Sub inside a Group navigable', () => {
            render(
                <Harness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Group>
                            <PopoverMenu.Sub>
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
                        <PopoverMenu.Sub>
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

        it('throws when usePopoverTrigger is called outside Root', () => {
            function CallTriggerHook() {
                PopoverMenu.usePopoverTrigger();
                return null;
            }
            expect(() => render(<CallTriggerHook />)).toThrow(/usePopoverTrigger\(\) must be called inside <PopoverMenu\.Root>/);
        });

        it('throws when useSecondaryInteractionTrigger is called outside Root', () => {
            function CallSecondaryHook() {
                PopoverMenu.useSecondaryInteractionTrigger();
                return null;
            }
            expect(() => render(<CallSecondaryHook />)).toThrow(/useSecondaryInteractionTrigger\(\) must be called inside <PopoverMenu\.Root>/);
        });

        it('throws when useIsPopoverVisible is called outside Root', () => {
            function CallVisibilityHook() {
                PopoverMenu.useIsPopoverVisible();
                return null;
            }
            expect(() => render(<CallVisibilityHook />)).toThrow(/useIsPopoverVisible\(\) must be called inside <PopoverMenu\.Root>/);
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
            ).toThrow(/<PopoverMenu\.Content> must be rendered inside <PopoverMenu\.Root>/);
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
            ).toThrow(/<PopoverMenu\.Item> must be rendered inside <PopoverMenu\.Content>/);
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
            ).toThrow(/<PopoverMenu\.Group> must be rendered inside <PopoverMenu\.Content>/);
        });

        it('throws when Sub is rendered outside Content', () => {
            expect(() =>
                render(
                    <Harness initialOpen>
                        <PopoverMenu.Sub>
                            <PopoverMenu.Sub.Trigger text="X" />
                        </PopoverMenu.Sub>
                    </Harness>,
                ),
            ).toThrow(/<PopoverMenu\.Sub> must be rendered inside <PopoverMenu\.Content>/);
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
            ).toThrow(/<PopoverMenu\.SubTrigger> must be rendered inside <PopoverMenu\.Sub>/);
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
            ).toThrow(/<PopoverMenu\.SubContent> must be rendered inside <PopoverMenu\.Sub>/);
        });
    });
});
