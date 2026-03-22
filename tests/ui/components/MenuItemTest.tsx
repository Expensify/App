import {render, screen} from '@testing-library/react-native';
import React from 'react';
import type {SvgProps} from 'react-native-svg';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
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

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('MenuItem', () => {
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
});
