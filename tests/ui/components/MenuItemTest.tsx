import {render, screen} from '@testing-library/react-native';
import React from 'react';
import type {SvgProps} from 'react-native-svg';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import getOperatingSystem from '@libs/getOperatingSystem';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import {translateLocal} from '../../utils/TestHelper';

const mockNewWindowIcon: React.FC<SvgProps> = () => null;
const mockLinkIcon: React.FC<SvgProps> = () => null;
const mockDownloadIcon: React.FC<SvgProps> = () => null;
const mockCheckmarkIcon: React.FC<SvgProps> = () => null;

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        NewWindow: mockNewWindowIcon,
    })),
}));

jest.mock('@libs/getPlatform', () => jest.fn());
jest.mock('@libs/getOperatingSystem', () => jest.fn());

const mockedGetPlatform = jest.mocked(getPlatform);
const mockedGetOperatingSystem = jest.mocked(getOperatingSystem);

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('MenuItem', () => {
    beforeEach(() => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
        mockedGetOperatingSystem.mockReturnValue(CONST.OS.WINDOWS);
    });

    describe('accessibility label with NewWindow icon', () => {
        it('appends "Opens in a new tab" to the accessibility label when iconRight is NewWindow', () => {
            const customLabel = 'Open external link';
            const opensInNewTabText = translateLocal('common.opensInNewTab');
            const expectedAccessibilityLabel = `${customLabel}. ${opensInNewTabText}`;

            render(
                <Wrapper>
                    <MenuItem
                        title={customLabel}
                        icon={mockLinkIcon}
                        iconRight={mockNewWindowIcon}
                        accessibilityLabel={customLabel}
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            const menuItem = screen.getByLabelText(expectedAccessibilityLabel);
            expect(menuItem).toBeOnTheScreen();
        });

        it('uses default accessibility label (from title) with "Opens in a new tab" when iconRight is NewWindow and no accessibilityLabel is passed', () => {
            const title = 'Download app';
            const opensInNewTabText = translateLocal('common.opensInNewTab');
            const expectedAccessibilityLabel = `${title}. ${opensInNewTabText}`;

            render(
                <Wrapper>
                    <MenuItem
                        title={title}
                        icon={mockDownloadIcon}
                        iconRight={mockNewWindowIcon}
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            const menuItem = screen.getByLabelText(expectedAccessibilityLabel);
            expect(menuItem).toBeOnTheScreen();
        });

        it('does not append "Opens in a new tab" when iconRight is not NewWindow', () => {
            const customLabel = 'Go to next';

            render(
                <Wrapper>
                    <MenuItem
                        title={customLabel}
                        icon={mockCheckmarkIcon}
                        iconRight={mockCheckmarkIcon}
                        accessibilityLabel={customLabel}
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            const menuItem = screen.getByLabelText(customLabel);
            expect(menuItem).toBeOnTheScreen();
            expect(screen.queryByLabelText(`${customLabel}. ${translateLocal('common.opensInNewTab')}`)).not.toBeOnTheScreen();
        });
    });

    describe('context-menu accessibility hint', () => {
        it('adds the desktop web hint when a context menu is available on desktop web', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            const title = 'Help';
            const contextMenuHint = translateLocal('accessibilityHints.contextMenuAvailable');
            const expectedAccessibilityLabel = `${title}. ${contextMenuHint}`;

            render(
                <Wrapper>
                    <MenuItem
                        title={title}
                        icon={mockLinkIcon}
                        shouldShowContextMenuHint
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            expect(screen.getByLabelText(expectedAccessibilityLabel)).toBeOnTheScreen();
            expect(screen.queryByAccessibilityHint(contextMenuHint)).not.toBeOnTheScreen();
        });

        it('adds the mac desktop web hint when a context menu is available on macos web', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            mockedGetOperatingSystem.mockReturnValue(CONST.OS.MAC_OS);
            const title = 'Help';
            const contextMenuHint = translateLocal('accessibilityHints.contextMenuAvailableMacOS');
            const expectedAccessibilityLabel = `${title}. ${contextMenuHint}`;

            render(
                <Wrapper>
                    <MenuItem
                        title={title}
                        icon={mockLinkIcon}
                        shouldShowContextMenuHint
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            expect(screen.getByLabelText(expectedAccessibilityLabel)).toBeOnTheScreen();
            expect(screen.queryByAccessibilityHint(contextMenuHint)).not.toBeOnTheScreen();
        });

        it('adds the native hint when a context menu is available on native', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
            const title = 'Help';
            const contextMenuHint = translateLocal('accessibilityHints.contextMenuAvailableNative');

            render(
                <Wrapper>
                    <MenuItem
                        title={title}
                        icon={mockLinkIcon}
                        shouldShowContextMenuHint
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            expect(screen.getByAccessibilityHint(contextMenuHint)).toBeOnTheScreen();
        });

        it('preserves the native fallback hint when no context-menu hint is provided', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
            const title = 'Help';

            render(
                <Wrapper>
                    <MenuItem
                        title={title}
                        icon={mockLinkIcon}
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            expect(screen.getByAccessibilityHint(title)).toBeOnTheScreen();
            expect(screen.queryByAccessibilityHint(translateLocal('accessibilityHints.contextMenuAvailable'))).not.toBeOnTheScreen();
            expect(screen.queryByAccessibilityHint(translateLocal('accessibilityHints.contextMenuAvailableNative'))).not.toBeOnTheScreen();
        });
    });
});
