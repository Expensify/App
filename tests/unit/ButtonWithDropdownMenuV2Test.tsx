import {act, render, screen} from '@testing-library/react-native';
import React, {useState} from 'react';
import type {ReactElement, Ref} from 'react';
import type {View as RNViewType} from 'react-native';
import {View} from 'react-native';
import ButtonWithDropdownMenuV2 from '@components/ButtonWithDropdownMenu/v2';
import type {PopoverMenuItem, PopoverMenuProps} from '@components/PopoverMenu';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';

type MockButtonProps = Record<string, unknown> & {
    text?: string;
    testID?: string;
    children?: React.ReactNode;
    iconRight?: unknown;
    ref?: React.Ref<unknown>;
};

const popoverMenuPropsCapture: {current: PopoverMenuProps | null} = {current: null};
const buttonPropsCapture: {current: MockButtonProps[]} = {current: []};
const iconPropsCapture: {current: Array<Record<string, unknown>>} = {current: []};

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
    function MockIcon(props: Record<string, unknown>) {
        iconPropsCapture.current.push(props);
        return <RNView testID="mock-icon" />;
    }
    return MockIcon;
});

jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useTheme', () => () => ({danger: 'dangerColor', buttonIcon: 'buttonIconColor'}));
jest.mock('@hooks/useStyleUtils', () => () => ({getDropDownButtonHeight: () => ({})}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false}));
jest.mock('@hooks/useSafeAreaPaddings', () => () => ({paddingBottom: 0}));
jest.mock('@hooks/usePopoverPosition', () => () => ({calculatePopoverPosition: jest.fn(() => Promise.resolve({horizontal: 0, vertical: 0}))}));
jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({DownArrow: 'DownArrowIcon', DotIndicator: 'DotIndicatorIcon', ArrowRight: 'ArrowRightIcon'}),
}));

beforeEach(() => {
    popoverMenuPropsCapture.current = null;
    buttonPropsCapture.current = [];
    iconPropsCapture.current = [];
    jest.clearAllMocks();
});

const findButtonByText = (text: string) => buttonPropsCapture.current.find((p) => p.text === text);

// ───── parameterized cases ─────

const insideMenuCases: Array<[string, () => ReactElement]> = [
    ['PrimaryButton', () => <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>X</ButtonWithDropdownMenuV2.PrimaryButton>],
    ['Trigger', () => <ButtonWithDropdownMenuV2.Trigger text="X" />],
    ['Caret', () => <ButtonWithDropdownMenuV2.Caret />],
];

const refForwardingCases: Array<[string, (ref: Ref<RNViewType>) => ReactElement]> = [
    [
        'PrimaryButton',
        (ref) => (
            <ButtonWithDropdownMenuV2>
                <ButtonWithDropdownMenuV2.PrimaryButton
                    ref={ref}
                    onPress={() => {}}
                >
                    Pay
                </ButtonWithDropdownMenuV2.PrimaryButton>
                <ButtonWithDropdownMenuV2.Caret />
                <ButtonWithDropdownMenuV2.Menu>
                    <ButtonWithDropdownMenuV2.Option text="A" />
                </ButtonWithDropdownMenuV2.Menu>
            </ButtonWithDropdownMenuV2>
        ),
    ],
    [
        'Caret',
        (ref) => (
            <ButtonWithDropdownMenuV2>
                <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                <ButtonWithDropdownMenuV2.Caret ref={ref} />
                <ButtonWithDropdownMenuV2.Menu>
                    <ButtonWithDropdownMenuV2.Option text="A" />
                </ButtonWithDropdownMenuV2.Menu>
            </ButtonWithDropdownMenuV2>
        ),
    ],
    [
        'Trigger',
        (ref) => (
            <ButtonWithDropdownMenuV2>
                <ButtonWithDropdownMenuV2.Trigger
                    ref={ref}
                    text="More"
                />
                <ButtonWithDropdownMenuV2.Menu>
                    <ButtonWithDropdownMenuV2.Option text="A" />
                </ButtonWithDropdownMenuV2.Menu>
            </ButtonWithDropdownMenuV2>
        ),
    ],
];

const stringLabelCases: Array<[string, string, () => ReactElement]> = [
    [
        'PrimaryButton',
        'Pay $123.45',
        () => (
            <ButtonWithDropdownMenuV2>
                <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay $123.45</ButtonWithDropdownMenuV2.PrimaryButton>
                <ButtonWithDropdownMenuV2.Caret />
                <ButtonWithDropdownMenuV2.Menu>
                    <ButtonWithDropdownMenuV2.Option text="A" />
                </ButtonWithDropdownMenuV2.Menu>
            </ButtonWithDropdownMenuV2>
        ),
    ],
    [
        'Trigger',
        'More',
        () => (
            <ButtonWithDropdownMenuV2>
                <ButtonWithDropdownMenuV2.Trigger text="More" />
                <ButtonWithDropdownMenuV2.Menu>
                    <ButtonWithDropdownMenuV2.Option text="A" />
                </ButtonWithDropdownMenuV2.Menu>
            </ButtonWithDropdownMenuV2>
        ),
    ],
];

describe('ButtonWithDropdownMenuV2', () => {
    describe('Option registration', () => {
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
        it('keeps top-level options grouped separately from submenu children and propagates Submenu props', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="Top 1" />
                        <ButtonWithDropdownMenuV2.Submenu
                            text="Outer"
                            backButtonText="Back"
                        >
                            <ButtonWithDropdownMenuV2.Option text="Sub one" />
                            <ButtonWithDropdownMenuV2.Option text="Sub two" />
                        </ButtonWithDropdownMenuV2.Submenu>
                        <ButtonWithDropdownMenuV2.Option text="Top 2" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );

            const menuItems = popoverMenuPropsCapture.current?.menuItems ?? [];
            expect(menuItems.map((item: PopoverMenuItem) => item.text)).toEqual(['Top 1', 'Outer', 'Top 2']);
            const submenu = menuItems.find((item: PopoverMenuItem) => item.text === 'Outer');
            expect(submenu).toMatchObject({text: 'Outer', backButtonText: 'Back'});
            expect(submenu?.subMenuItems?.map((item) => item.text)).toEqual(['Sub one', 'Sub two']);
        });

        it('attaches a right-chevron to submenu rows', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Submenu text="Outer">
                            <ButtonWithDropdownMenuV2.Option text="Inner" />
                        </ButtonWithDropdownMenuV2.Submenu>
                        <ButtonWithDropdownMenuV2.Option text="Leaf" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const items = popoverMenuPropsCapture.current?.menuItems ?? [];
            expect(items.find((item) => item.text === 'Outer')?.rightIcon).toBe('ArrowRightIcon');
            expect(items.find((item) => item.text === 'Leaf')?.rightIcon).toBeUndefined();
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

    describe('Menu props plumbing', () => {
        it('forwards Menu props through to PopoverMenu', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu
                        headerText="Choose option"
                        layout="scrollable"
                        padding="tight"
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                        }}
                    >
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const props = popoverMenuPropsCapture.current;
            expect(props?.headerText).toBe('Choose option');
            expect(props?.shouldUseScrollView).toBe(true);
            expect(props?.shouldUseModalPaddingStyle).toBe(false);
            expect(props?.anchorAlignment).toMatchObject({
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            });
        });

        it('Menu defaults map to PopoverMenu defaults (fixed layout, modal padding)', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            expect(popoverMenuPropsCapture.current?.shouldUseScrollView).toBe(false);
            expect(popoverMenuPropsCapture.current?.shouldUseModalPaddingStyle).toBe(true);
        });
    });

    describe('Composition invariants', () => {
        it.each(insideMenuCases)('throws when <%s> is rendered inside <Menu>', (name, renderElement) => {
            const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            expect(() =>
                render(
                    <ButtonWithDropdownMenuV2>
                        <ButtonWithDropdownMenuV2.Menu>{renderElement()}</ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>,
                ),
            ).toThrow(new RegExp(`<ButtonWithDropdownMenuV2\\.${name}> must be a sibling of <Menu>`));
            error.mockRestore();
        });

        it('throws when <Option> is rendered outside <Menu>', () => {
            const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            expect(() =>
                render(
                    <ButtonWithDropdownMenuV2>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2>,
                ),
            ).toThrow(/<ButtonWithDropdownMenuV2\.Option> must be rendered inside <ButtonWithDropdownMenuV2\.Menu>/);
            error.mockRestore();
        });

        it('throws when <Submenu> is rendered outside <Menu>', () => {
            const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            expect(() =>
                render(
                    <ButtonWithDropdownMenuV2>
                        <ButtonWithDropdownMenuV2.Submenu text="X">
                            <ButtonWithDropdownMenuV2.Option text="A" />
                        </ButtonWithDropdownMenuV2.Submenu>
                    </ButtonWithDropdownMenuV2>,
                ),
            ).toThrow(/<ButtonWithDropdownMenuV2\.Submenu> must be rendered inside <ButtonWithDropdownMenuV2\.Menu>/);
            error.mockRestore();
        });
    });

    describe('Compound rendering', () => {
        it('renders a primary button + caret in split mode', () => {
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
            expect(screen.queryAllByTestId('mock-button')).toHaveLength(2);
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
            expect(screen.queryAllByTestId('mock-button')).toHaveLength(1);
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

        it.each(stringLabelCases)('omits `children` when %s receives a string label', (_, expectedText, renderJsx) => {
            render(renderJsx());
            const button = findButtonByText(expectedText);
            expect(button).toBeDefined();
            expect(button && 'children' in button).toBe(false);
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
    });

    describe('keepOpen and selectionMarker', () => {
        it('default options have shouldCloseModalOnSelect: true', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="Close" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            expect(popoverMenuPropsCapture.current?.menuItems?.at(0)?.shouldCloseModalOnSelect).toBe(true);
        });

        it('keepOpen options have shouldCloseModalOnSelect: false', () => {
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
            expect(popoverMenuPropsCapture.current?.menuItems?.at(0)?.shouldCloseModalOnSelect).toBe(false);
        });

        it('propagates keepOpen to Submenu sub-options', () => {
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
            const subItems = popoverMenuPropsCapture.current?.menuItems?.at(0)?.subMenuItems ?? [];
            expect(subItems.at(0)?.shouldCloseModalOnSelect).toBe(false);
            expect(subItems.at(1)?.shouldCloseModalOnSelect).toBe(true);
        });

        it('passes selectionMarker and isSelected through to PopoverMenu', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu selectionMarker="check">
                        <ButtonWithDropdownMenuV2.Option
                            text="A"
                            isSelected
                        />
                        <ButtonWithDropdownMenuV2.Option text="B" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            expect(popoverMenuPropsCapture.current?.shouldShowSelectedItemCheck).toBe(true);
            const items = popoverMenuPropsCapture.current?.menuItems ?? [];
            expect(items.at(0)?.isSelected).toBe(true);
            expect(items.at(1)?.isSelected).toBeUndefined();
        });

        it('selectionMarker defaults to "none"', () => {
            render(
                <ButtonWithDropdownMenuV2>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option
                            text="A"
                            isSelected
                        />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            expect(popoverMenuPropsCapture.current?.shouldShowSelectedItemCheck).toBe(false);
        });
    });

    describe('Open/close wiring', () => {
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
            popoverMenuPropsCapture.current?.menuItems?.at(0)?.onSelected?.();
            expect(onSelected).toHaveBeenCalledTimes(1);
        });

        it('fires onOpenChange(false) when PopoverMenu signals close', () => {
            const onOpenChange = jest.fn();
            render(
                <ButtonWithDropdownMenuV2
                    defaultOpen
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            onOpenChange.mockClear();
            act(() => {
                popoverMenuPropsCapture.current?.onClose?.();
            });
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('onItemSelected closes the menu when shouldCloseModalOnSelect is true', () => {
            const onOpenChange = jest.fn();
            render(
                <ButtonWithDropdownMenuV2
                    defaultOpen
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
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

        it('onItemSelected does not close keepOpen items', () => {
            const onOpenChange = jest.fn();
            render(
                <ButtonWithDropdownMenuV2
                    defaultOpen
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

        it('uncontrolled `defaultOpen` initial state opens the menu without firing onOpenChange', () => {
            const onOpenChange = jest.fn();
            render(
                <ButtonWithDropdownMenuV2
                    defaultOpen
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            expect(popoverMenuPropsCapture.current?.isVisible).toBe(true);
            expect(onOpenChange).not.toHaveBeenCalled();
        });

        it('controlled `open` prop drives PopoverMenu visibility without firing onOpenChange', () => {
            const onOpenChange = jest.fn();
            const {rerender} = render(
                <ButtonWithDropdownMenuV2
                    open={false}
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            expect(popoverMenuPropsCapture.current?.isVisible).toBe(false);

            rerender(
                <ButtonWithDropdownMenuV2
                    open
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            expect(popoverMenuPropsCapture.current?.isVisible).toBe(true);
            // Controlled mode: the parent drove the change via `open`, so we don't echo onOpenChange.
            expect(onOpenChange).not.toHaveBeenCalled();
        });

        it('controlled mode: pressing Trigger fires onOpenChange but does not flip internal state until parent drives `open`', () => {
            const onOpenChange = jest.fn();
            render(
                <ButtonWithDropdownMenuV2
                    open={false}
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const trigger = findButtonByText('More') as {onPress: () => void} | undefined;
            expect(trigger).toBeDefined();

            act(() => trigger?.onPress());
            expect(onOpenChange).toHaveBeenCalledWith(true);
            // Parent hasn't flipped `open` — internal state unchanged.
            expect(popoverMenuPropsCapture.current?.isVisible).toBe(false);
        });

        it('toggles menu visibility when Trigger is pressed', () => {
            const onOpenChange = jest.fn();
            render(
                <ButtonWithDropdownMenuV2 onOpenChange={onOpenChange}>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const trigger = findButtonByText('More') as {onPress: () => void} | undefined;
            expect(trigger).toBeDefined();

            act(() => trigger?.onPress());
            expect(onOpenChange).toHaveBeenLastCalledWith(true);

            const reopenedTrigger = findButtonByText('More') as {onPress: () => void} | undefined;
            act(() => reopenedTrigger?.onPress());
            expect(onOpenChange).toHaveBeenLastCalledWith(false);
        });

        it('toggles menu visibility when Caret is pressed', () => {
            const onOpenChange = jest.fn();
            render(
                <ButtonWithDropdownMenuV2 onOpenChange={onOpenChange}>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret accessibilityLabel="caret" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const caret = buttonPropsCapture.current.find((p) => p.accessibilityLabel === 'caret') as {onPress: () => void} | undefined;
            expect(caret).toBeDefined();

            act(() => caret?.onPress());
            expect(onOpenChange).toHaveBeenLastCalledWith(true);
        });

        it('does not fire onOpenChange when controlled `open` re-renders with the same value', () => {
            const onOpenChange = jest.fn();
            const tree = (
                <ButtonWithDropdownMenuV2
                    open={false}
                    onOpenChange={onOpenChange}
                >
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>
            );
            const {rerender} = render(tree);
            expect(onOpenChange).not.toHaveBeenCalled();
            rerender(tree);
            expect(onOpenChange).not.toHaveBeenCalled();
        });
    });

    describe('Sub-component refs', () => {
        it.each(refForwardingCases)('forwards a ref to %s', (_, renderJsx) => {
            const ref = React.createRef<RNViewType>();
            render(renderJsx(ref));
            expect(ref.current).not.toBeNull();
        });
    });

    describe('Keyboard shortcut & prop plumbing', () => {
        it('forwards `shouldStayNormalOnDisable` from Root to all sub-component buttons', () => {
            render(
                <ButtonWithDropdownMenuV2 shouldStayNormalOnDisable>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret accessibilityLabel="caret" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const primary = findButtonByText('Pay') as {shouldStayNormalOnDisable?: boolean} | undefined;
            const caret = buttonPropsCapture.current.find((p) => p.accessibilityLabel === 'caret') as {shouldStayNormalOnDisable?: boolean} | undefined;
            expect(primary?.shouldStayNormalOnDisable).toBe(true);
            expect(caret?.shouldStayNormalOnDisable).toBe(true);
        });

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
            const primary = findButtonByText('Pay');
            expect(primary).toBeDefined();
            expect((primary as {pressOnEnter?: boolean}).pressOnEnter).toBe(true);
        });

        it('registers a Ctrl+Enter shortcut when `useKeyboardShortcuts` is true', () => {
            render(
                <ButtonWithDropdownMenuV2 useKeyboardShortcuts>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const shortcutCalls = (useKeyboardShortcut as jest.Mock).mock.calls as Array<[unknown, unknown, {isActive?: boolean}]>;
            const activeCalls = shortcutCalls.filter((args) => args[2].isActive === true);
            expect(activeCalls.length).toBeGreaterThanOrEqual(1);
        });

        it('does not activate Ctrl+Enter when `useKeyboardShortcuts` is false', () => {
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

        it.each<[string, () => ReactElement]>([
            [
                'PrimaryButton + Root.isDisabled',
                () => (
                    <ButtonWithDropdownMenuV2
                        useKeyboardShortcuts
                        isDisabled
                    >
                        <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                        <ButtonWithDropdownMenuV2.Caret />
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.Option text="A" />
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>
                ),
            ],
            [
                'PrimaryButton + Root.isLoading',
                () => (
                    <ButtonWithDropdownMenuV2
                        useKeyboardShortcuts
                        isLoading
                    >
                        <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                        <ButtonWithDropdownMenuV2.Caret />
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.Option text="A" />
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>
                ),
            ],
            [
                'PrimaryButton + own isDisabled',
                () => (
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
                    </ButtonWithDropdownMenuV2>
                ),
            ],
            [
                'Trigger + Root.isDisabled',
                () => (
                    <ButtonWithDropdownMenuV2
                        useKeyboardShortcuts
                        isDisabled
                    >
                        <ButtonWithDropdownMenuV2.Trigger text="More" />
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.Option text="A" />
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>
                ),
            ],
            [
                'Trigger + Root.isLoading',
                () => (
                    <ButtonWithDropdownMenuV2
                        useKeyboardShortcuts
                        isLoading
                    >
                        <ButtonWithDropdownMenuV2.Trigger text="More" />
                        <ButtonWithDropdownMenuV2.Menu>
                            <ButtonWithDropdownMenuV2.Option text="A" />
                        </ButtonWithDropdownMenuV2.Menu>
                    </ButtonWithDropdownMenuV2>
                ),
            ],
        ])('deactivates Ctrl+Enter shortcut: %s', (_, renderJsx) => {
            render(renderJsx());
            const shortcutCalls = (useKeyboardShortcut as jest.Mock).mock.calls as Array<[unknown, unknown, {isActive?: boolean}]>;
            const activeCalls = shortcutCalls.filter((args) => args[2].isActive === true);
            expect(activeCalls).toHaveLength(0);
        });
    });

    describe('Presentation plumbing', () => {
        it('swaps the icon to DotIndicator when brickRoadIndicator is ERROR', () => {
            render(
                <ButtonWithDropdownMenuV2 brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const trigger = findButtonByText('More');
            expect(trigger).toBeDefined();
            expect((trigger as {icon?: unknown}).icon).toBe('DotIndicatorIcon');
        });

        it('wires accessibilityState.expanded to isMenuVisible on Trigger', () => {
            const {rerender} = render(
                <ButtonWithDropdownMenuV2 open={false}>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const initial = findButtonByText('More') as {accessibilityState?: {expanded?: boolean}};
            expect(initial.accessibilityState?.expanded).toBe(false);

            buttonPropsCapture.current = [];
            rerender(
                <ButtonWithDropdownMenuV2 open>
                    <ButtonWithDropdownMenuV2.Trigger text="More" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const after = findButtonByText('More') as {accessibilityState?: {expanded?: boolean}};
            expect(after.accessibilityState?.expanded).toBe(true);
        });

        it('disables the Caret while Root is loading', () => {
            render(
                <ButtonWithDropdownMenuV2 isLoading>
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret accessibilityLabel="caret" />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            const caret = buttonPropsCapture.current.find((p) => p.accessibilityLabel === 'caret');
            expect(caret).toBeDefined();
            expect((caret as {isDisabled?: boolean}).isDisabled).toBe(true);
        });

        it('flows triggerLayout="compact" to Caret as isCompactTrigger (Icon renders inline)', () => {
            render(
                <ButtonWithDropdownMenuV2 triggerLayout="compact">
                    <ButtonWithDropdownMenuV2.PrimaryButton onPress={() => {}}>Pay</ButtonWithDropdownMenuV2.PrimaryButton>
                    <ButtonWithDropdownMenuV2.Caret />
                    <ButtonWithDropdownMenuV2.Menu>
                        <ButtonWithDropdownMenuV2.Option text="A" />
                    </ButtonWithDropdownMenuV2.Menu>
                </ButtonWithDropdownMenuV2>,
            );
            // Caret renders the DownArrow icon with `inline={isCompactTrigger}`.
            const downArrowIcon = iconPropsCapture.current.find((p) => p.src === 'DownArrowIcon');
            expect(downArrowIcon).toBeDefined();
            expect(downArrowIcon?.inline).toBe(true);
        });
    });
});
