import {render, screen} from '@testing-library/react-native';
import React from 'react';
import type {SvgProps} from 'react-native-svg';
import CompactMenuContext from '@components/CompactMenuContext';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';

const mockIcon: React.FC<SvgProps> = () => null;

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

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
                />
            </Wrapper>,
        );

        expect(screen.getByText('Avatar Item')).toBeOnTheScreen();
    });
});
