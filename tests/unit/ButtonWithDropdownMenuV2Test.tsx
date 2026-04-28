import {act, render, screen} from '@testing-library/react-native';
import React, {useState} from 'react';
import type {View as RNViewType} from 'react-native';
import {View} from 'react-native';
import ButtonWithDropdownMenuV2 from '@components/ButtonWithDropdownMenu/v2';
import type {ButtonWithDropdownMenuV2Ref} from '@components/ButtonWithDropdownMenu/v2';
import type {PopoverMenuItem, PopoverMenuProps} from '@components/PopoverMenu';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';

type MockButtonProps = Record<string, unknown> & {
    text?: string;
    testID?: string;
    children?: React.ReactNode;
    iconRight?: unknown;
    ref?: React.Ref<unknown>;
};

const popoverMenuPropsCapture: {current: PopoverMenuProps | null} = {current: null};
const buttonPropsCapture: {current: MockButtonProps[]} = {current: []};

// Capture PopoverMenu's props so tests can assert on the `menuItems[]` v2 builds.
jest.mock('@components/PopoverMenu', () => {
    function MockPopoverMenu(props: PopoverMenuProps) {
        popoverMenuPropsCapture.current = props;
        return null;
    }
    return MockPopoverMenu;
});

jest.mock('@components/Button', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo.
    const {View: RNView, Text: RNText} = jest.requireActual('react-native');
    function MockButton(props: MockButtonProps) {
        buttonPropsCapture.current.push(props);
        const {ref, text, testID, children, iconRight} = props;
        return (
            <RNView
                testID={testID ?? 'mock-button'}
                ref={ref}
            >
                <RNText testID="mock-button-text">{text ?? ''}</RNText>
                <RNText testID="mock-button-has-caret">{iconRight ? 'caret' : 'no-caret'}</RNText>
                {children}
            </RNView>
        );
    }
    return MockButton;
});

jest.mock('@components/Icon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo.
    const {View: RNView} = jest.requireActual('react-native');
    function MockIcon() {
        return <RNView testID="mock-icon" />;
    }
    return MockIcon;
});

jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useTheme', () => () => ({}));
jest.mock('@hooks/useStyleUtils', () => () => ({getDropDownButtonHeight: () => ({})}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false}));
jest.mock('@hooks/useSafeAreaPaddings', () => () => ({paddingBottom: 0}));
jest.mock('@hooks/usePopoverPosition', () => () => ({calculatePopoverPosition: jest.fn(() => Promise.resolve({horizontal: 0, vertical: 0}))}));
jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({DownArrow: 'DownArrowIcon', DotIndicator: 'DotIndicatorIcon'}),
}));

beforeEach(() => {
    popoverMenuPropsCapture.current = null;
    buttonPropsCapture.current = [];
    jest.clearAllMocks();
});

describe('ButtonWithDropdownMenuV2', () => {
    describe('Option registration (in <Menu>)', () => {
        it('registers a single Option and surfaces it as a menu item', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="Option A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            const menuItems = popoverMenuPropsCapture.current?.menuItems ?? [];
            expect(menuItems).toHaveLength(1);
            expect(menuItems.at(0)).toMatchObject({text: 'Option A'});
        });

        it('preserves JSX order across multiple Options', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                        <ButtonWithDropdownMenuV2.Option text="B" />
                        <ButtonWithDropdownMenuV2.Option text="C" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            const menuItems = popoverMenuPropsCapture.current?.menuItems ?? [];
            expect(menuItems.map((item: PopoverMenuItem) => item.text)).toEqual(['A', 'B', 'C']);
        });

        it('drops options that fall under a falsy conditional', () => {
            const showB = false;
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                        {showB && <ButtonWithDropdownMenuV2.Option text="B" />}
                        <ButtonWithDropdownMenuV2.Option text="C" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            const menuItems = popoverMenuPropsCapture.current?.menuItems ?? [];
            expect(menuItems.map((item: PopoverMenuItem) => item.text)).toEqual(['A', 'C']);
        });

        it('handles options produced by .map() over a runtime list', () => {
            const items = [
                {id: 'x', label: 'X'},
                {id: 'y', label: 'Y'},
                {id: 'z', label: 'Z'},
            ];
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        {items.map((item) => (
                            <ButtonWithDropdownMenuV2.Option
                                key={item.id}
                                text={item.label}
                            />
                        ))}
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            const menuItems = popoverMenuPropsCapture.current?.menuItems ?? [];
            expect(menuItems.map((item: PopoverMenuItem) => item.text)).toEqual(['X', 'Y', 'Z']);
        });

        it('keeps JSX order when a conditional Option mounts after its later siblings', () => {
            function Harness() {
                const [showFirst, setShowFirst] = useState(false);
                return (
                    <>
                        <View
                            testID="toggle"
                            onTouchEnd={() => setShowFirst(true)}
                        />
                        <ButtonWithDropdownMenuV2>
                            <ButtonWithDropdownMenuV2.Trigger text="More" />
                            <ButtonWithDropdownMenuV2.Menu>
                                {showFirst && <ButtonWithDropdownMenuV2.Option text="First" />}
                                <ButtonWithDropdownMenuV2.Option text="Second" />
                                <ButtonWithDropdownMenuV2.Option text="Third" />
                            </ButtonWithDropdownMenuV2.Menu>
                        </ButtonWithDropdownMenuV2>
                    </>
                );
            }

            const {rerender} = render(<Harness />);
            expect(popoverMenuPropsCapture.current?.menuItems?.map((item) => item.text)).toEqual(['Second', 'Third']);

            rerender(<Harness />);
            function HarnessWithFirst() {
                return (
                    <ButtonWithDropdownMenuV2>
                        <ButtonWithDropdownMenuV2.Trigger text="More" />
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.Option text="First" />
                            <ButtonWithDropdownMenuV2.Option text="Second" />
                            <ButtonWithDropdownMenuV2.Option text="Third" />
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>
                );
            }
            rerender(<HarnessWithFirst />);
            expect(popoverMenuPropsCapture.current?.menuItems?.map((item) => item.text)).toEqual(['First', 'Second', 'Third']);
        });
    });

    describe('Submenu nesting', () => {
        it('registers a Submenu with its Option children as subMenuItems', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Submenu
                            text="Outer"
                            backButtonText="Back"
                        >
                            <ButtonWithDropdownMenuV2.Option text="Sub one" />
                            <ButtonWithDropdownMenuV2.Option text="Sub two" />
                        </ButtonWithDropdownMenuV2.Submenu>
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            const menuItems = popoverMenuPropsCapture.current?.menuItems ?? [];
            expect(menuItems).toHaveLength(1);
            const submenu = menuItems.at(0);
            expect(submenu).toMatchObject({text: 'Outer', backButtonText: 'Back'});
            expect(submenu?.subMenuItems).toHaveLength(2);
            expect(submenu?.subMenuItems?.map((item) => item.text)).toEqual(['Sub one', 'Sub two']);
        });

        it('keeps top-level options grouped separately from submenu children', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="Top 1" />
                        <ButtonWithDropdownMenuV2.Submenu text="Outer">
                            <ButtonWithDropdownMenuV2.Option text="Inner" />
                        </ButtonWithDropdownMenuV2.Submenu>
                        <ButtonWithDropdownMenuV2.Option text="Top 2" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            const menuItems = popoverMenuPropsCapture.current?.menuItems ?? [];
            expect(menuItems.map((item: PopoverMenuItem) => item.text)).toEqual(['Top 1', 'Outer', 'Top 2']);
            const submenu = menuItems.find((item: PopoverMenuItem) => item.text === 'Outer');
            expect(submenu?.subMenuItems?.map((item) => item.text)).toEqual(['Inner']);
        });

        it('throws in dev mode when a Submenu is nested inside another Submenu', () => {
            const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            expect(() =>
                render(
                    <ButtonWithDropdownMenuV2>
                        <ButtonWithDropdownMenuV2.Trigger text="More" />
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.Submenu text="Outer">
                                <ButtonWithDropdownMenuV2.Submenu text="Inner">
                                    <ButtonWithDropdownMenuV2.Option text="X" />
                                </ButtonWithDropdownMenuV2.Submenu>
                            </ButtonWithDropdownMenuV2.Submenu>
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>,
                ),
            ).toThrow(/cannot be nested inside another <Submenu>/);
            error.mockRestore();
        });
    });

    describe('Composition invariants', () => {
        it('throws when <PrimaryButton> is rendered inside <Menu>', () => {
            const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            expect(() =>
                render(
                    <ButtonWithDropdownMenuV2>
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>X</ButtonWithDropdownMenuV2.PrimaryButton>
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>,
                ),
            ).toThrow(/<ButtonWithDropdownMenuV2\.PrimaryButton> must be a sibling of <Menu>/);
            error.mockRestore();
        });

        it('throws when <Trigger> is rendered inside <Menu>', () => {
            const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            expect(() =>
                render(
                    <ButtonWithDropdownMenuV2>
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.Trigger text="X" />
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>,
                ),
            ).toThrow(/<ButtonWithDropdownMenuV2\.Trigger> must be a sibling of <Menu>/);
            error.mockRestore();
        });

        it('throws when <Caret> is rendered inside <Menu>', () => {
            const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            expect(() =>
                render(
                    <ButtonWithDropdownMenuV2>
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.Caret />
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>,
                ),
            ).toThrow(/<ButtonWithDropdownMenuV2\.Caret> must be a sibling of <Menu>/);
            error.mockRestore();
        });
    });

    describe('Compound rendering', () => {
        it('renders both a primary button and a caret in split mode', () => {
            const onPress = jest.fn();
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={onPress}>Pay $123</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            const buttons = screen.queryAllByTestId('mock-button');
            expect(buttons.length).toBeGreaterThanOrEqual(2);
            const buttonTexts = screen.queryAllByTestId('mock-button-text').map((node) => (node.props as {children: string}).children);
            expect(buttonTexts).toContain('Pay $123');
        });

        it('renders one button with a caret in single-trigger mode', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            const buttons = screen.queryAllByTestId('mock-button');
            expect(buttons).toHaveLength(1);
            const buttonText = screen.queryAllByTestId('mock-button-text').at(0);
            expect((buttonText?.props as {children: string} | undefined)?.children).toBe('More');
            const carets = screen.queryAllByTestId('mock-button-has-caret').map((node) => (node.props as {children: string}).children);
            expect(carets).toEqual(['caret']);
        });

        it('renders a custom node passed as Trigger children', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger>
                        <View testID="custom-trigger-node" />
                    </ButtonWithDropdownMenuV2.Trigger>
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            expect(screen.getByTestId('custom-trigger-node')).toBeDefined();
        });

        it('omits `children` when PrimaryButton receives a string label so Button renders the text prop', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay $123.45</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const primary = buttonPropsCapture.current.find((p) => p.text === 'Pay $123.45');
            expect(primary).toBeDefined();
            expect(primary && 'children' in primary).toBe(false);
        });

        it('attaches `children` when PrimaryButton receives a non-string label', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>
                        <View testID="custom-primary-label" />
                    </ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const primary = buttonPropsCapture.current.find((p) => 'children' in p && p.text === '');
            expect(primary).toBeDefined();
        });

        it('omits `children` for a text-only Trigger so Button renders the text + right caret', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const trigger = buttonPropsCapture.current.find((p) => p.text === 'More');
            expect(trigger).toBeDefined();
            expect(trigger && 'children' in trigger).toBe(false);
        });
    });

    describe('Selection callbacks', () => {
        it('invokes the consumer onSelected when PopoverMenu invokes the menu item', () => {
            const onSelected = jest.fn();
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option
                            text="A"
                            onSelected={onSelected}
                        />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const menuItem = popoverMenuPropsCapture.current?.menuItems?.at(0);
            menuItem?.onSelected?.();
            expect(onSelected).toHaveBeenCalledTimes(1);
        });

        it('marks normal options with shouldCloseModalOnSelect:true so PopoverMenu runs its close+reset flow', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="Close" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const menuItem = popoverMenuPropsCapture.current?.menuItems?.at(0);
            expect(menuItem?.shouldCloseModalOnSelect).toBe(true);
        });

        it('marks `keepOpen` options with shouldCloseModalOnSelect:false so PopoverMenu skips closing', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option
                            text="Stay"
                            keepOpen
                        />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const menuItem = popoverMenuPropsCapture.current?.menuItems?.at(0);
            expect(menuItem?.shouldCloseModalOnSelect).toBe(false);
        });

        it('also propagates `keepOpen` to options nested under a Submenu', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Submenu text="Outer">
                            <ButtonWithDropdownMenuV2.Option
                                text="Inner stay"
                                keepOpen
                            />
                            <ButtonWithDropdownMenuV2.Option text="Inner close" />
                        </ButtonWithDropdownMenuV2.Submenu>
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const submenu = popoverMenuPropsCapture.current?.menuItems?.at(0);
            const subItems = submenu?.subMenuItems ?? [];
            expect(subItems.at(0)?.shouldCloseModalOnSelect).toBe(false);
            expect(subItems.at(1)?.shouldCloseModalOnSelect).toBe(true);
        });

        it('fires onOpenChange(false) when PopoverMenu signals close', () => {
            const onOpenChange = jest.fn();
            const ref = React.createRef<ButtonWithDropdownMenuV2Ref>();
            render(
                <ButtonWithDropdownMenuV2
                    ref={ref}
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            act(() => {
                ref.current?.setIsMenuVisible(true);
            });
            onOpenChange.mockClear();

            act(() => {
                popoverMenuPropsCapture.current?.onClose?.();
            });
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('closes via onItemSelected (Safari fallback path) when a non-keepOpen option is selected', () => {
            const onOpenChange = jest.fn();
            const ref = React.createRef<ButtonWithDropdownMenuV2Ref>();
            render(
                <ButtonWithDropdownMenuV2
                    ref={ref}
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            act(() => {
                ref.current?.setIsMenuVisible(true);
            });
            onOpenChange.mockClear();

            const item = popoverMenuPropsCapture.current?.menuItems?.at(0);
            expect(item).toBeDefined();
            act(() => {
                if (!item) {
                    return;
                }
                popoverMenuPropsCapture.current?.onItemSelected?.(item, 0);
            });
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('does not close via onItemSelected when option has keepOpen', () => {
            const onOpenChange = jest.fn();
            const ref = React.createRef<ButtonWithDropdownMenuV2Ref>();
            render(
                <ButtonWithDropdownMenuV2
                    ref={ref}
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option
                            text="Stay"
                            keepOpen
                        />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            act(() => {
                ref.current?.setIsMenuVisible(true);
            });
            onOpenChange.mockClear();

            const item = popoverMenuPropsCapture.current?.menuItems?.at(0);
            expect(item).toBeDefined();
            act(() => {
                if (!item) {
                    return;
                }
                popoverMenuPropsCapture.current?.onItemSelected?.(item, 0);
            });
            expect(onOpenChange).not.toHaveBeenCalled();
        });
    });

    describe('Imperative API', () => {
        it('exposes setIsMenuVisible via ref and fires onOpenChange', () => {
            const onOpenChange = jest.fn();
            const ref = React.createRef<ButtonWithDropdownMenuV2Ref>();
            render(
                <ButtonWithDropdownMenuV2
                    ref={ref}
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            act(() => {
                ref.current?.setIsMenuVisible(true);
            });
            expect(onOpenChange).toHaveBeenCalledWith(true);
        });

        it('does not fire onOpenChange when setIsMenuVisible is called with the current value', () => {
            const onOpenChange = jest.fn();
            const ref = React.createRef<ButtonWithDropdownMenuV2Ref>();
            render(
                <ButtonWithDropdownMenuV2
                    ref={ref}
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            // Initial state is false; setting to false again should be a no-op.
            act(() => {
                ref.current?.setIsMenuVisible(false);
            });
            expect(onOpenChange).not.toHaveBeenCalled();

            // Open then set true again — only one fire.
            act(() => {
                ref.current?.setIsMenuVisible(true);
            });
            act(() => {
                ref.current?.setIsMenuVisible(true);
            });
            expect(onOpenChange).toHaveBeenCalledTimes(1);
            expect(onOpenChange).toHaveBeenCalledWith(true);
        });
    });

    describe('Sub-component refs', () => {
        it('forwards a ref to PrimaryButton and the ref attaches to the underlying node', () => {
            const primaryRef = React.createRef<RNViewType>();
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.PrimaryButton
                        ref={primaryRef}
                        onPress={() => {}}
                    >
                        Pay
                    </ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            expect(primaryRef.current).not.toBeNull();
        });

        it('forwards a ref to Caret via the merged ref', () => {
            const caretRef = React.createRef<RNViewType>();
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret ref={caretRef} />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            expect(caretRef.current).not.toBeNull();
        });

        it('forwards a ref to Trigger via the merged ref', () => {
            const triggerRef = React.createRef<RNViewType>();
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger
                        ref={triggerRef}
                        text="More"
                    />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            expect(triggerRef.current).not.toBeNull();
        });
    });

    describe('Trigger plumbing', () => {
        it('forwards `pressOnEnter` from Root to PrimaryButton', () => {
            render(
                <ButtonWithDropdownMenuV2 pressOnEnter>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const primaryProps = buttonPropsCapture.current.find((p) => p.text === 'Pay');
            expect(primaryProps).toBeDefined();
            expect((primaryProps as {pressOnEnter?: boolean}).pressOnEnter).toBe(true);
        });

        it('registers a Ctrl+Enter shortcut on PrimaryButton when `useKeyboardShortcuts` is true', () => {
            render(
                <ButtonWithDropdownMenuV2 useKeyboardShortcuts>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            // PrimaryButton calls useKeyboardShortcut once with isActive=true.
            const shortcutCalls = (useKeyboardShortcut as jest.Mock).mock.calls as Array<[unknown, unknown, {isActive?: boolean}]>;
            const activeCalls = shortcutCalls.filter((args) => args[2].isActive === true);
            expect(activeCalls.length).toBeGreaterThanOrEqual(1);
        });

        it('does not activate Ctrl+Enter shortcut when `useKeyboardShortcuts` is false', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const shortcutCalls = (useKeyboardShortcut as jest.Mock).mock.calls as Array<[unknown, unknown, {isActive?: boolean}]>;
            const activeCalls = shortcutCalls.filter((args) => args[2].isActive === true);
            expect(activeCalls).toHaveLength(0);
        });

        it('deactivates the PrimaryButton shortcut when Root is disabled or loading', () => {
            const cases: Array<Partial<{isDisabled: boolean; isLoading: boolean}>> = [{isDisabled: true}, {isLoading: true}];
            for (const flags of cases) {
                jest.clearAllMocks();
                render(
                    <ButtonWithDropdownMenuV2
                        useKeyboardShortcuts
                        isDisabled={flags.isDisabled}
                        isLoading={flags.isLoading}
                    >
                        <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                        <ButtonWithDropdownMenuV2.Caret />
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.Option text="A" />
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>,
                );
                const shortcutCalls = (useKeyboardShortcut as jest.Mock).mock.calls as Array<[unknown, unknown, {isActive?: boolean}]>;
                const activeCalls = shortcutCalls.filter((args) => args[2].isActive === true);
                expect(activeCalls).toHaveLength(0);
            }
        });

        it('deactivates the PrimaryButton shortcut when its own `isDisabled` is true', () => {
            render(
                <ButtonWithDropdownMenuV2 useKeyboardShortcuts>
                    <ButtonWithDropdownMenuV2.PrimaryButton
                        isDisabled
                        onPress={() => {}}
                    >
                        Pay
                    </ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const shortcutCalls = (useKeyboardShortcut as jest.Mock).mock.calls as Array<[unknown, unknown, {isActive?: boolean}]>;
            const activeCalls = shortcutCalls.filter((args) => args[2].isActive === true);
            expect(activeCalls).toHaveLength(0);
        });

        it('deactivates the Trigger shortcut when Root is disabled or loading', () => {
            const cases: Array<Partial<{isDisabled: boolean; isLoading: boolean}>> = [{isDisabled: true}, {isLoading: true}];
            for (const flags of cases) {
                jest.clearAllMocks();
                render(
                    <ButtonWithDropdownMenuV2
                        useKeyboardShortcuts
                        isDisabled={flags.isDisabled}
                        isLoading={flags.isLoading}
                    >
                        <ButtonWithDropdownMenuV2.Trigger text="More" />
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.Option text="A" />
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>,
                );
                const shortcutCalls = (useKeyboardShortcut as jest.Mock).mock.calls as Array<[unknown, unknown, {isActive?: boolean}]>;
                const activeCalls = shortcutCalls.filter((args) => args[2].isActive === true);
                expect(activeCalls).toHaveLength(0);
            }
        });
    });
});
