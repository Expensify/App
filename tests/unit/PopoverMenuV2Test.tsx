import {act, render} from '@testing-library/react-native';
import React, {useRef, useState} from 'react';
import type {ReactElement} from 'react';
import type {View as RNViewType} from 'react-native';
import {View} from 'react-native';
import PopoverMenu from '@components/PopoverMenu/v2';

type MenuItemMockProps = Record<string, unknown> & {
    title?: string;
    pressableTestID?: string;
};

const menuItemPropsCapture: {current: MenuItemMockProps[]} = {current: []};

jest.mock('@components/PopoverWithMeasuredContent', () => {
    function MockPopoverWithMeasuredContent({isVisible, children}: {isVisible?: boolean; children?: React.ReactNode}) {
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
    function MockFocusTrap({children}: {children?: React.ReactNode}) {
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
    function MockOfflineWithFeedback({children}: {children?: React.ReactNode}) {
        return children;
    }
    return MockOfflineWithFeedback;
});

jest.mock('@components/CompactMenuContext', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo. */
    const ReactActual = jest.requireActual('react');
    const ctx = ReactActual.createContext(false);
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- ESM module marker required by jest module mocks.
        __esModule: true,
        default: ctx,
        useIsCompactMenu: () => true,
    };
});

jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useTheme', () => () => ({border: 'borderColor', icon: 'iconColor', iconHovered: 'iconHovered'}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false, shouldUseNarrowLayout: false}));
jest.mock('@hooks/usePopoverPosition', () => () => ({calculatePopoverPosition: jest.fn(() => Promise.resolve({horizontal: 0, vertical: 0}))}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({BackArrow: 'BackArrowIcon', ArrowRight: 'ArrowRightIcon'}),
}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

beforeEach(() => {
    menuItemPropsCapture.current = [];
    jest.clearAllMocks();
});

const findItemByTitle = (title: string) => menuItemPropsCapture.current.find((p) => p.title === title);

function ControlledHarness({initialOpen = false, onOpenChange, children}: {initialOpen?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode}) {
    const [open, setOpen] = useState(initialOpen);
    const anchorRef = useRef<RNViewType>(null);
    return (
        <>
            <View ref={anchorRef} />
            <PopoverMenu.Root
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);
                    onOpenChange?.(next);
                }}
                anchorRef={anchorRef}
            >
                {children}
            </PopoverMenu.Root>
        </>
    );
}

function UncontrolledHarness({defaultOpen = false, children}: {defaultOpen?: boolean; children: React.ReactNode}) {
    const anchorRef = useRef<RNViewType>(null);
    return (
        <>
            <View ref={anchorRef} />
            <PopoverMenu.Root
                defaultOpen={defaultOpen}
                anchorRef={anchorRef}
            >
                {children}
            </PopoverMenu.Root>
        </>
    );
}

describe('PopoverMenu compound API', () => {
    describe('Root', () => {
        it('does not render Content when closed', () => {
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

        it('uncontrolled `defaultOpen` mounts the menu visible', () => {
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
            const item = findItemByTitle('Pay') as {onPress?: () => void} | undefined;
            act(() => item?.onPress?.());
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
            const item = findItemByTitle('Pay') as {onPress?: () => void} | undefined;
            act(() => item?.onPress?.());
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
            const item = findItemByTitle('Stay') as {onPress?: () => void} | undefined;
            act(() => item?.onPress?.());
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
            const item = findItemByTitle('Disabled') as {onPress?: () => void} | undefined;
            act(() => item?.onPress?.());
            expect(onSelect).not.toHaveBeenCalled();
        });
    });

    describe('CheckmarkItem', () => {
        it('renders the check icon when isSelected', () => {
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
            const item = findItemByTitle('Wallet') as {shouldShowSelectedItemCheck?: boolean; isSelected?: boolean} | undefined;
            expect(item?.shouldShowSelectedItemCheck).toBe(true);
            expect(item?.isSelected).toBe(true);
        });

        it('renders without the check when isSelected is false', () => {
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
            const item = findItemByTitle('Wallet') as {shouldShowSelectedItemCheck?: boolean; isSelected?: boolean} | undefined;
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
            const item = findItemByTitle('Pick') as {onPress?: () => void} | undefined;
            act(() => item?.onPress?.());
            expect(onSelect).toHaveBeenCalledTimes(1);
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('suppresses the check when rightIcon is supplied (rightIcon replaces it)', () => {
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
            const item = findItemByTitle('Override') as {shouldShowSelectedItemCheck?: boolean; iconRight?: unknown; shouldShowRightIcon?: boolean} | undefined;
            expect(item?.shouldShowSelectedItemCheck).toBe(false);
            expect(item?.shouldShowRightIcon).toBe(true);
            expect(item?.iconRight).toBe(customRightIcon);
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
            const label = findItemByTitle('Section heading') as {interactive?: boolean; onPress?: () => void} | undefined;
            expect(label?.interactive).toBe(false);
            expect(findItemByTitle('Below')).toBeDefined();
        });
    });

    describe('Sub', () => {
        const renderTwoLevelMenu = (): ReactElement => (
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
            const subTrigger = findItemByTitle('Pay as business') as {onPress?: () => void} | undefined;
            menuItemPropsCapture.current = [];
            act(() => subTrigger?.onPress?.());
            expect(findItemByTitle('Top 1')).toBeUndefined();
            expect(findItemByTitle('Top 2')).toBeUndefined();
            expect(findItemByTitle('Pay as business')).toBeUndefined();
            expect(findItemByTitle('Sub option')).toBeDefined();
            expect(findItemByTitle('Business')).toBeDefined();
        });

        it('back-button press exits the sub and restores top-level items', () => {
            render(renderTwoLevelMenu());
            act(() => (findItemByTitle('Pay as business') as {onPress?: () => void} | undefined)?.onPress?.());
            const backButton = findItemByTitle('Business') as {onPress?: () => void} | undefined;
            menuItemPropsCapture.current = [];
            act(() => backButton?.onPress?.());
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
            act(() => (findItemByTitle('Sub') as {onPress?: () => void} | undefined)?.onPress?.());
            const subItem = findItemByTitle('Choose') as {onPress?: () => void} | undefined;
            onOpenChange.mockClear();
            act(() => subItem?.onPress?.());
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        // Issue 1: closing while inside a submenu (via Item.onSelect or controlled `open={false}`)
        // bypassed `handleClose`, leaving `currentSubId` stale. Reopening the same mounted Content showed the submenu.
        it('resets to top level when the menu closes via item selection and reopens', () => {
            function ExternallyControlledHarness({open}: {open: boolean}) {
                const anchorRef = useRef<RNViewType>(null);
                return (
                    <>
                        <View ref={anchorRef} />
                        <PopoverMenu.Root
                            open={open}
                            onOpenChange={() => {}}
                            anchorRef={anchorRef}
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
                        </PopoverMenu.Root>
                    </>
                );
            }

            const tree = render(<ExternallyControlledHarness open />);

            // Enter sub.
            act(() => (findItemByTitle('Open Sub') as {onPress?: () => void} | undefined)?.onPress?.());
            expect(findItemByTitle('Choose')).toBeDefined();

            // Close the menu via controlled prop. Content stays mounted; only the popover children unmount via the mock.
            tree.rerender(<ExternallyControlledHarness open={false} />);
            // Reopen — same Content instance. Without the close-effect reset, `currentSubId` would still point at "A".
            menuItemPropsCapture.current = [];
            tree.rerender(<ExternallyControlledHarness open />);

            expect(findItemByTitle('Open Sub')).toBeDefined();
            expect(findItemByTitle('Choose')).toBeUndefined();
        });

        // Issue 2: nested SubTrigger only rendered while `currentSubId === null`, so deeper subs
        // were unreachable. With `parentSubId` tracking, B's trigger appears while A is active.
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

            // At root: A's trigger visible, B's trigger hidden (parent A isn't active yet).
            expect(findItemByTitle('Open A')).toBeDefined();
            expect(findItemByTitle('Open B')).toBeUndefined();
            expect(findItemByTitle('A item')).toBeUndefined();
            expect(findItemByTitle('B item')).toBeUndefined();

            // Enter A: A's items + B's trigger visible. Clear capture before press so we read the next render only.
            const triggerA = findItemByTitle('Open A') as {onPress?: () => void} | undefined;
            menuItemPropsCapture.current = [];
            act(() => triggerA?.onPress?.());
            expect(findItemByTitle('A item')).toBeDefined();
            expect(findItemByTitle('Open B')).toBeDefined();
            expect(findItemByTitle('B item')).toBeUndefined();

            // Enter B: B's items visible, A's items hidden.
            const triggerB = findItemByTitle('Open B') as {onPress?: () => void} | undefined;
            menuItemPropsCapture.current = [];
            act(() => triggerB?.onPress?.());
            expect(findItemByTitle('B item')).toBeDefined();
            expect(findItemByTitle('A item')).toBeUndefined();
            expect(findItemByTitle('Open B')).toBeUndefined();

            // Press B's back button: pops to A, not root.
            const backToA = findItemByTitle('Back to A') as {onPress?: () => void} | undefined;
            menuItemPropsCapture.current = [];
            act(() => backToA?.onPress?.());
            expect(findItemByTitle('A item')).toBeDefined();
            expect(findItemByTitle('Open B')).toBeDefined();
            expect(findItemByTitle('B item')).toBeUndefined();
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
            const subTrigger = findItemByTitle('Sub') as {onPress?: () => void} | undefined;
            menuItemPropsCapture.current = [];
            act(() => subTrigger?.onPress?.());
            expect(findItemByTitle('Sub')).toBeUndefined();
            expect(findItemByTitle('Inner')).toBeDefined();
        });
    });

    describe('Composition invariants', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        afterAll(() => {
            consoleErrorSpy.mockRestore();
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
            ).toThrow(/must be called inside <PopoverMenu\.Root>/);
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
            ).toThrow(/must be called inside <PopoverMenu\.Content>/);
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
            ).toThrow(/must be called inside <PopoverMenu\.Sub>/);
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
            ).toThrow(/must be called inside <PopoverMenu\.Sub>/);
        });
    });
});
