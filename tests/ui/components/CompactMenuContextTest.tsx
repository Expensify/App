import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import CompactMenuContext from '@components/CompactMenuContext';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ViewProps} from 'react-native';
import type {SvgProps} from 'react-native-svg';

import React from 'react';
import {StyleSheet, View} from 'react-native';

const mockIcon: React.FC<SvgProps> = () => null;

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        NewWindow: mockIcon,
    })),
}));

function Wrapper({children, isCompact = false}: {children: React.ReactNode; isCompact?: boolean}) {
    return (
        <LocaleContextProvider>
            <CompactMenuContext.Provider value={isCompact}>{children}</CompactMenuContext.Provider>
        </LocaleContextProvider>
    );
}

const defaultResponsiveLayout = {
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
    isInNarrowPaneModal: false,
    isExtraSmallScreenWidth: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: true,
    isExtraLargeScreenWidth: false,
    isSmallScreen: false,
    isInLandscapeMode: false,
    lockWindowDimensionsToLast: () => {},
    unlockWindowDimensions: () => {},
};

describe('CompactMenuContext with MenuItem', () => {
    beforeEach(() => {
        mockedUseResponsiveLayout.mockReturnValue(defaultResponsiveLayout);
    });

    it('renders MenuItem with compact styles on wider screens when CompactMenuContext is true', () => {
        render(
            <Wrapper isCompact>
                <MenuItem
                    title="Test Item"
                    icon={mockIcon}
                    onPress={() => {}}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                />
            </Wrapper>,
        );

        expect(screen.getByText('Test Item')).toBeOnTheScreen();
    });

    it('renders MenuItem without compact styles on small screens even when CompactMenuContext is true', () => {
        mockedUseResponsiveLayout.mockReturnValue({
            ...defaultResponsiveLayout,
            shouldUseNarrowLayout: true,
            isSmallScreenWidth: true,
            isLargeScreenWidth: false,
        });

        render(
            <Wrapper isCompact>
                <MenuItem
                    title="Test Item"
                    icon={mockIcon}
                    onPress={() => {}}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                />
            </Wrapper>,
        );

        expect(screen.getByText('Test Item')).toBeOnTheScreen();
    });

    it('renders MenuItem without compact styles when CompactMenuContext is false', () => {
        render(
            <Wrapper isCompact={false}>
                <MenuItem
                    title="Test Item"
                    icon={mockIcon}
                    onPress={() => {}}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                />
            </Wrapper>,
        );

        expect(screen.getByText('Test Item')).toBeOnTheScreen();
    });

    it('renders MenuItem with description using base compact style on wider screens', () => {
        render(
            <Wrapper isCompact>
                <MenuItem
                    title="Test Item"
                    description="A description"
                    icon={mockIcon}
                    onPress={() => {}}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                />
            </Wrapper>,
        );

        expect(screen.getByText('Test Item')).toBeOnTheScreen();
        expect(screen.getByText('A description')).toBeOnTheScreen();
    });

    it('applies compact icon styles for icon type icons on wider screens', () => {
        render(
            <Wrapper isCompact>
                <MenuItem
                    title="Icon Item"
                    icon={mockIcon}
                    iconType={CONST.ICON_TYPE_ICON}
                    onPress={() => {}}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                />
            </Wrapper>,
        );

        expect(screen.getByText('Icon Item')).toBeOnTheScreen();
    });

    it('does not apply compact icon styles for avatar type icons', () => {
        render(
            <Wrapper isCompact>
                <MenuItem
                    title="Avatar Item"
                    icon={mockIcon}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    onPress={() => {}}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                />
            </Wrapper>,
        );

        expect(screen.getByText('Avatar Item')).toBeOnTheScreen();
    });
});

describe('MenuItem.Root compact sizing', () => {
    it.each([false, true])('uses legacy compact pressable sizing on a small screen: %s', (isSmallScreenWidth) => {
        // Given explicit compact rows must keep their sizing independently of the popover breakpoint
        mockedUseResponsiveLayout.mockReturnValue({...defaultResponsiveLayout, isSmallScreenWidth});
        const {result} = renderHook(() => useThemeStyles());

        // When a composable compact row renders outside a compact popover
        render(
            <Wrapper>
                <MenuItem.Root
                    isCompact
                    testID="composable-compact"
                >
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <MenuItem.Title>Composable</MenuItem.Title>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
            </Wrapper>,
        );

        // Then the pressable applies the legacy compact height and alignment styles
        const compactStyles = StyleSheet.flatten([result.current.alignItemsCenter, result.current.optionRowCompact]);
        expect(screen.getByTestId('composable-compact')).toHaveStyle(compactStyles);
    });

    it.each([
        [false, false, false],
        [true, false, false],
        [false, true, false],
        [true, true, false],
        [false, true, true],
        [true, true, true],
    ])('shares text sizing for isCompact=%s, popover=%s, small screen=%s', (isCompact, isCompactPopover, isSmallScreenWidth) => {
        // Given popover compactness remains breakpoint-dependent while explicit compactness does not
        mockedUseResponsiveLayout.mockReturnValue({...defaultResponsiveLayout, isSmallScreenWidth});
        const {result} = renderHook(() => ({styles: useThemeStyles(), StyleUtils: useStyleUtils()}));

        // When a composed row renders its middle cell without a caller-supplied style
        render(
            <Wrapper isCompact={isCompactPopover}>
                <MenuItem.Root
                    isCompact={isCompact}
                    testID="compact-row"
                >
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <MenuItem.Title>Title</MenuItem.Title>
                            <MenuItem.Description>Description</MenuItem.Description>
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
            </Wrapper>,
        );

        // Then the content derives its spacing from either source and ordinary rows keep their base style
        const content = screen.UNSAFE_getAllByType(View).find((view) => {
            const {style} = view.props as ViewProps;
            return Array.isArray(style) && style.includes(result.current.styles.menuItemContent);
        });
        expect(content).toBeDefined();
        expect(StyleSheet.flatten(content?.props.style)).toEqual(
            StyleSheet.flatten([result.current.styles.menuItemContent, result.current.StyleUtils.getMenuItemTextContainerStyle((isCompactPopover && !isSmallScreenWidth) || isCompact)]),
        );
        const trailing = screen.UNSAFE_getAllByType(View).find((view) => {
            const {style} = view.props as ViewProps;
            return Array.isArray(style) && style.includes(result.current.styles.menuItemTrailing);
        });
        expect(trailing).toBeDefined();
        expect(StyleSheet.flatten(trailing?.props.style)).toEqual(
            StyleSheet.flatten([result.current.styles.menuItemTrailing, result.current.StyleUtils.getMenuItemTextContainerStyle((isCompactPopover && !isSmallScreenWidth) || isCompact)]),
        );
        if (!isCompact && !isCompactPopover) {
            expect(screen.getByTestId('compact-row')).toHaveStyle(result.current.styles.popoverMenuItem);
        }
    });

    it('updates compact spacing without changing the row action or trailing content', async () => {
        // Given a row can switch density while keeping the same action and chevron
        mockedUseResponsiveLayout.mockReturnValue(defaultResponsiveLayout);
        const onPress = jest.fn();
        const {result} = renderHook(() => ({styles: useThemeStyles(), StyleUtils: useStyleUtils()}));
        const row = (isCompact?: boolean) => (
            <Wrapper>
                <MenuItem.Root
                    isCompact={isCompact}
                    onPress={onPress}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                >
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <MenuItem.Title>Open picker</MenuItem.Title>
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
            </Wrapper>
        );
        const {rerender} = render(row(true));

        // When compact sizing is removed and the unchanged row is pressed
        rerender(row());
        fireEvent.press(await screen.findByRole(CONST.ROLE.BUTTON, {name: 'Open picker'}), {nativeEvent: {}});

        // Then context returns to normal spacing and the action and trailing content remain intact
        const content = screen.UNSAFE_getAllByType(View).find((view) => {
            const {style} = view.props as ViewProps;
            return Array.isArray(style) && style.includes(result.current.styles.menuItemContent);
        });
        expect(content).toBeDefined();
        expect(StyleSheet.flatten(content?.props.style)).toEqual(StyleSheet.flatten([result.current.styles.menuItemContent, result.current.StyleUtils.getMenuItemTextContainerStyle(false)]));
        expect(screen.getByTestId('menu-item-chevron')).toBeOnTheScreen();
        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
