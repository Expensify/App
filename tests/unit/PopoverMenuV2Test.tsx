import {act, render, screen} from '@testing-library/react-native';
import React, {useLayoutEffect, useRef, useState} from 'react';
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
    useMemoizedLazyExpensifyIcons: () => ({BackArrow: 'BackArrowIcon', ArrowRight: 'ArrowRightIcon'}),
}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

beforeEach(() => {
    menuItemPropsCapture.current = [];
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

/** Drives `<Root>` via the controlled `open`/`onOpenChange` props. */
function ControlledHarness({initialOpen = false, onOpenChange, children}: PropsWithChildren<{initialOpen?: boolean; onOpenChange?: (open: boolean) => void}>) {
    const [open, setOpen] = useState(initialOpen);
    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        onOpenChange?.(next);
    };
    return (
        <PopoverMenu.Root
            open={open}
            onOpenChange={handleOpenChange}
        >
            <AutoSetAnchor />
            {children}
        </PopoverMenu.Root>
    );
}

/** Drives `<Root>` via `defaultOpen` (uncontrolled). */
function UncontrolledHarness({defaultOpen = false, children}: PropsWithChildren<{defaultOpen?: boolean}>) {
    return (
        <PopoverMenu.Root defaultOpen={defaultOpen}>
            <AutoSetAnchor />
            {children}
        </PopoverMenu.Root>
    );
}

describe('PopoverMenu V2', () => {
    describe('Root', () => {
        it('renders nothing when closed', () => {
            render(
                <ControlledHarness>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Hidden"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            expect(findItemByTitle('Hidden')).toBeUndefined();
        });

        it('renders Content when open', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Visible"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            expect(findItemByTitle('Visible')).toBeDefined();
        });

        it('mounts visible with `defaultOpen` (uncontrolled)', () => {
            render(
                <UncontrolledHarness defaultOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Default"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </UncontrolledHarness>,
            );
            expect(findItemByTitle('Default')).toBeDefined();
        });

        // Event-coord callers like VideoPopoverMenu drive Root with anchorPosition only — anchorPosition alone must be sufficient.
        it('renders with anchorPosition only (no Trigger, no Root anchorRef)', () => {
            render(
                <PopoverMenu.Root open>
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

    describe('Item', () => {
        it('fires onSelect when pressed', () => {
            const onSelect = jest.fn();
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Pay"
                            onSelect={onSelect}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            press('Pay');
            expect(onSelect).toHaveBeenCalledTimes(1);
        });

        it('closes the menu by default after onSelect', () => {
            const onOpenChange = jest.fn();
            render(
                <ControlledHarness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Pay"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            onOpenChange.mockClear();
            press('Pay');
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('keeps the menu open when onSelect calls event.preventDefault()', () => {
            const onOpenChange = jest.fn();
            render(
                <ControlledHarness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Stay"
                            onSelect={(event) => event.preventDefault()}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            onOpenChange.mockClear();
            press('Stay');
            expect(onOpenChange).not.toHaveBeenCalled();
        });

        it('skips onSelect when disabled', () => {
            const onSelect = jest.fn();
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Disabled"
                            disabled
                            onSelect={onSelect}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            press('Disabled');
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('still closes the menu when no onSelect is provided', () => {
            const onOpenChange = jest.fn();
            render(
                <ControlledHarness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Item text="Plain" />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            onOpenChange.mockClear();
            press('Plain');
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('does not mark the last item as focused when no row is focused', () => {
            render(
                <ControlledHarness initialOpen>
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
                </ControlledHarness>,
            );
            expect(findItemByTitle<{focused?: boolean}>('A')?.focused).toBe(false);
            expect(findItemByTitle<{focused?: boolean}>('B')?.focused).toBe(false);
            expect(findItemByTitle<{focused?: boolean}>('Last')?.focused).toBe(false);
        });
    });

    describe('CheckmarkItem', () => {
        it('renders the check when isSelected', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
                            text="Wallet"
                            isSelected
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            const item = findItemByTitle<{shouldShowSelectedItemCheck?: boolean; isSelected?: boolean}>('Wallet');
            expect(item?.shouldShowSelectedItemCheck).toBe(true);
            expect(item?.isSelected).toBe(true);
        });

        it('does not render the check when isSelected is false', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
                            text="Wallet"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            const item = findItemByTitle<{shouldShowSelectedItemCheck?: boolean; isSelected?: boolean}>('Wallet');
            expect(item?.shouldShowSelectedItemCheck).toBe(true);
            expect(item?.isSelected).toBe(false);
        });

        it('fires onSelect and closes the menu by default', () => {
            const onSelect = jest.fn();
            const onOpenChange = jest.fn();
            render(
                <ControlledHarness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
                            text="Pick"
                            onSelect={onSelect}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            onOpenChange.mockClear();
            press('Pick');
            expect(onSelect).toHaveBeenCalledTimes(1);
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('replaces the check with rightIcon when supplied (selected)', () => {
            const customRightIcon = jest.fn();
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
                            text="Override"
                            isSelected
                            rightIcon={customRightIcon}
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            const item = findItemByTitle<{shouldShowSelectedItemCheck?: boolean; iconRight?: unknown; shouldShowRightIcon?: boolean}>('Override');
            expect(item?.shouldShowSelectedItemCheck).toBe(false);
            expect(item?.shouldShowRightIcon).toBe(true);
            expect(item?.iconRight).toBe(customRightIcon);
        });

        it('renders rightIcon (no check) when not selected', () => {
            const customRightIcon = jest.fn();
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
                            text="Plain"
                            rightIcon={customRightIcon}
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            const item = findItemByTitle<{shouldShowSelectedItemCheck?: boolean; iconRight?: unknown; shouldShowRightIcon?: boolean}>('Plain');
            expect(item?.shouldShowSelectedItemCheck).toBe(false);
            expect(item?.shouldShowRightIcon).toBe(true);
            expect(item?.iconRight).toBe(customRightIcon);
        });

        it('skips onSelect when disabled', () => {
            const onSelect = jest.fn();
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.CheckmarkItem
                            text="Disabled"
                            disabled
                            isSelected
                            onSelect={onSelect}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            press('Disabled');
            expect(onSelect).not.toHaveBeenCalled();
        });
    });

    describe('Label', () => {
        it('renders a non-interactive row', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Label text="Section heading" />
                        <PopoverMenu.Item
                            text="Below"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            expect(findItemByTitle<{interactive?: boolean}>('Section heading')?.interactive).toBe(false);
            expect(findItemByTitle('Below')).toBeDefined();
        });
    });

    describe('Header', () => {
        it('renders at the root level', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Header>Pick a payment</PopoverMenu.Header>
                        <PopoverMenu.Item
                            text="Wallet"
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            expect(screen.getByText('Pick a payment')).toBeTruthy();
        });

        it('hides once a sub is entered', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Header>Pick a payment</PopoverMenu.Header>
                        <PopoverMenu.Sub>
                            <PopoverMenu.SubTrigger text="Pay as business" />
                            <PopoverMenu.SubContent backButtonText="Business">
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.SubContent>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            expect(screen.getByText('Pick a payment')).toBeTruthy();
            press('Pay as business');
            expect(screen.queryByText('Pick a payment')).toBeNull();
        });
    });

    describe('Sub', () => {
        const renderTwoLevelMenu = () => (
            <ControlledHarness initialOpen>
                <PopoverMenu.Content>
                    <PopoverMenu.Item
                        text="Top 1"
                        onSelect={() => {}}
                    />
                    <PopoverMenu.Sub>
                        <PopoverMenu.SubTrigger text="Pay as business" />
                        <PopoverMenu.SubContent backButtonText="Business">
                            <PopoverMenu.Item
                                text="Sub option"
                                onSelect={() => {}}
                            />
                        </PopoverMenu.SubContent>
                    </PopoverMenu.Sub>
                    <PopoverMenu.Item
                        text="Top 2"
                        onSelect={() => {}}
                    />
                </PopoverMenu.Content>
            </ControlledHarness>
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
                <ControlledHarness
                    initialOpen
                    onOpenChange={onOpenChange}
                >
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub>
                            <PopoverMenu.SubTrigger text="Sub" />
                            <PopoverMenu.SubContent>
                                <PopoverMenu.Item
                                    text="Choose"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.SubContent>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            press('Sub');
            onOpenChange.mockClear();
            press('Choose');
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('resets to top level when the menu closes via item selection and reopens', () => {
            // Remounting `<Root>` (key bump) is the strict-uncontrolled equivalent of toggling
            // `open` from outside: tear down nav state and rebuild, so the next open lands at root.
            function Harness({remountKey}: {remountKey: number}) {
                return (
                    <ControlledHarness
                        key={remountKey}
                        initialOpen
                    >
                        <PopoverMenu.Content>
                            <PopoverMenu.Sub id="A">
                                <PopoverMenu.SubTrigger text="Open Sub" />
                                <PopoverMenu.SubContent backButtonText="Back">
                                    <PopoverMenu.Item
                                        text="Choose"
                                        onSelect={() => {}}
                                    />
                                </PopoverMenu.SubContent>
                            </PopoverMenu.Sub>
                        </PopoverMenu.Content>
                    </ControlledHarness>
                );
            }

            const tree = render(<Harness remountKey={1} />);
            press('Open Sub');
            expect(findItemByTitle('Choose')).toBeDefined();

            menuItemPropsCapture.current = [];
            tree.rerender(<Harness remountKey={2} />);

            expect(findItemByTitle('Open Sub')).toBeDefined();
            expect(findItemByTitle('Choose')).toBeUndefined();
        });

        it('renders a nested SubTrigger when its parent sub is the active level', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="A">
                            <PopoverMenu.SubTrigger text="Open A" />
                            <PopoverMenu.SubContent backButtonText="Back to root">
                                <PopoverMenu.Item
                                    text="A item"
                                    onSelect={() => {}}
                                />
                                <PopoverMenu.Sub id="B">
                                    <PopoverMenu.SubTrigger text="Open B" />
                                    <PopoverMenu.SubContent backButtonText="Back to A">
                                        <PopoverMenu.Item
                                            text="B item"
                                            onSelect={() => {}}
                                        />
                                    </PopoverMenu.SubContent>
                                </PopoverMenu.Sub>
                            </PopoverMenu.SubContent>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </ControlledHarness>,
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
                    <ControlledHarness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.Item
                                text="Top"
                                onSelect={() => {}}
                            />
                            {showSub && (
                                <PopoverMenu.Sub id="A">
                                    <PopoverMenu.SubTrigger text="Open A" />
                                    <PopoverMenu.SubContent>
                                        <PopoverMenu.Item
                                            text="A item"
                                            onSelect={() => {}}
                                        />
                                    </PopoverMenu.SubContent>
                                </PopoverMenu.Sub>
                            )}
                        </PopoverMenu.Content>
                    </ControlledHarness>
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
                    <ControlledHarness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.Item
                                text="Top"
                                onSelect={() => {}}
                            />
                            {showSubs && (
                                <PopoverMenu.Sub id="A">
                                    <PopoverMenu.SubTrigger text="Open A" />
                                    <PopoverMenu.SubContent backButtonText="Back to root">
                                        <PopoverMenu.Sub id="B">
                                            <PopoverMenu.SubTrigger text="Open B" />
                                            <PopoverMenu.SubContent backButtonText="Back to A">
                                                <PopoverMenu.Item
                                                    text="B item"
                                                    onSelect={() => {}}
                                                />
                                            </PopoverMenu.SubContent>
                                        </PopoverMenu.Sub>
                                    </PopoverMenu.SubContent>
                                </PopoverMenu.Sub>
                            )}
                        </PopoverMenu.Content>
                    </ControlledHarness>
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
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub>
                            <PopoverMenu.SubTrigger text="Trigger" />
                            <PopoverMenu.SubContent backButtonText="Back">
                                <CustomRow />
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.SubContent>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </ControlledHarness>,
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
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="outer">
                            <PopoverMenu.SubTrigger text="Outer" />
                            <PopoverMenu.SubContent>
                                <SelfGatedRow />
                                <PopoverMenu.Sub id="inner">
                                    <PopoverMenu.SubTrigger text="Inner" />
                                    <PopoverMenu.SubContent>
                                        <PopoverMenu.Item
                                            text="Innermost"
                                            onSelect={() => {}}
                                        />
                                    </PopoverMenu.SubContent>
                                </PopoverMenu.Sub>
                            </PopoverMenu.SubContent>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </ControlledHarness>,
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
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Sub id="outer">
                            <PopoverMenu.SubTrigger text="Open outer" />
                            <PopoverMenu.SubContent backButtonText="Back to root">
                                <PopoverMenu.Sub id="inner">
                                    <PopoverMenu.SubTrigger text="Open inner" />
                                    <PopoverMenu.SubContent backButtonText="Back to outer">
                                        <InnerCustomRow />
                                        <PopoverMenu.Item
                                            text="Innermost"
                                            onSelect={() => {}}
                                        />
                                    </PopoverMenu.SubContent>
                                </PopoverMenu.Sub>
                            </PopoverMenu.SubContent>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );

            press('Open outer');
            expect(innerRenderSpy).not.toHaveBeenCalled();

            press('Open inner');
            expect(innerRenderSpy).toHaveBeenCalled();
            expect(findItemByTitle('Innermost')).toBeDefined();
        });

        it('resets focus when entering a submenu', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Item
                            text="Above"
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Sub>
                            <PopoverMenu.SubTrigger text="Trigger" />
                            <PopoverMenu.SubContent backButtonText="Back">
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.SubContent>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </ControlledHarness>,
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
                    <ControlledHarness initialOpen>
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
                                    <PopoverMenu.SubTrigger text="Open" />
                                    <PopoverMenu.SubContent>
                                        <PopoverMenu.Item
                                            text="Inner-A"
                                            onSelect={() => {}}
                                        />
                                        <PopoverMenu.Item
                                            text="Inner-B"
                                            onSelect={() => {}}
                                        />
                                    </PopoverMenu.SubContent>
                                </PopoverMenu.Sub>
                            )}
                        </PopoverMenu.Content>
                    </ControlledHarness>
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
                <ControlledHarness initialOpen>
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
                </ControlledHarness>,
            );
            expect(findItemByTitle('A')).toBeDefined();
            expect(findItemByTitle('B')).toBeDefined();
            expect(tree).toBeTruthy();
        });

        it('hides at top level when a sub is entered', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Separator />
                        <PopoverMenu.Sub>
                            <PopoverMenu.SubTrigger text="Sub" />
                            <PopoverMenu.SubContent>
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.SubContent>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            press('Sub');
            expect(findItemByTitle('Sub')).toBeUndefined();
            expect(findItemByTitle('Inner')).toBeDefined();
        });
    });

    describe('Group', () => {
        it('keeps a Sub inside a Group navigable', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Group>
                            <PopoverMenu.Sub>
                                <PopoverMenu.SubTrigger text="Open" />
                                <PopoverMenu.SubContent>
                                    <PopoverMenu.Item
                                        text="Inside"
                                        onSelect={() => {}}
                                    />
                                </PopoverMenu.SubContent>
                            </PopoverMenu.Sub>
                        </PopoverMenu.Group>
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );

            press('Open');
            expect(findItemByTitle('Inside')).toBeDefined();
        });

        it('renders its children at the top level', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Group>
                            <PopoverMenu.Label text="Currency" />
                            <PopoverMenu.Item
                                text="USD"
                                onSelect={() => {}}
                            />
                        </PopoverMenu.Group>
                    </PopoverMenu.Content>
                </ControlledHarness>,
            );
            expect(findItemByTitle('Currency')).toBeDefined();
            expect(findItemByTitle('USD')).toBeDefined();
        });

        it('hides its children when a sub is entered', () => {
            render(
                <ControlledHarness initialOpen>
                    <PopoverMenu.Content>
                        <PopoverMenu.Group>
                            <PopoverMenu.Item
                                text="USD"
                                onSelect={() => {}}
                            />
                        </PopoverMenu.Group>
                        <PopoverMenu.Sub>
                            <PopoverMenu.SubTrigger text="More" />
                            <PopoverMenu.SubContent>
                                <PopoverMenu.Item
                                    text="Inner"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.SubContent>
                        </PopoverMenu.Sub>
                    </PopoverMenu.Content>
                </ControlledHarness>,
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
                    <PopoverMenu.Trigger accessibilityLabel="Open menu">
                        <View />
                    </PopoverMenu.Trigger>,
                ),
            ).toThrow(/<PopoverMenu\.Trigger> must be rendered inside <PopoverMenu\.Root>/);
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
                    <ControlledHarness initialOpen>
                        <PopoverMenu.Item
                            text="A"
                            onSelect={() => {}}
                        />
                    </ControlledHarness>,
                ),
            ).toThrow(/<PopoverMenu\.Item> must be rendered inside <PopoverMenu\.Content>/);
        });

        it('throws when Group is rendered outside Content', () => {
            expect(() =>
                render(
                    <ControlledHarness initialOpen>
                        <PopoverMenu.Group>
                            <View />
                        </PopoverMenu.Group>
                    </ControlledHarness>,
                ),
            ).toThrow(/<PopoverMenu\.Group> must be rendered inside <PopoverMenu\.Content>/);
        });

        it('throws when Sub is rendered outside Content', () => {
            expect(() =>
                render(
                    <ControlledHarness initialOpen>
                        <PopoverMenu.Sub>
                            <PopoverMenu.SubTrigger text="X" />
                        </PopoverMenu.Sub>
                    </ControlledHarness>,
                ),
            ).toThrow(/<PopoverMenu\.Sub> must be rendered inside <PopoverMenu\.Content>/);
        });

        it('throws when SubTrigger is rendered outside Sub', () => {
            expect(() =>
                render(
                    <ControlledHarness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.SubTrigger text="X" />
                        </PopoverMenu.Content>
                    </ControlledHarness>,
                ),
            ).toThrow(/<PopoverMenu\.SubTrigger> must be rendered inside <PopoverMenu\.Sub>/);
        });

        it('throws when SubContent is rendered outside Sub', () => {
            expect(() =>
                render(
                    <ControlledHarness initialOpen>
                        <PopoverMenu.Content>
                            <PopoverMenu.SubContent>
                                <PopoverMenu.Item
                                    text="X"
                                    onSelect={() => {}}
                                />
                            </PopoverMenu.SubContent>
                        </PopoverMenu.Content>
                    </ControlledHarness>,
                ),
            ).toThrow(/<PopoverMenu\.SubContent> must be rendered inside <PopoverMenu\.Sub>/);
        });
    });
});
