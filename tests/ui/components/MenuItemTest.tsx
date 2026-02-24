import {render, screen} from '@testing-library/react-native';
import React from 'react';
import type {SvgProps} from 'react-native-svg';
import * as Expensicons from '@components/Icon/Expensicons';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import {translateLocal} from '../../utils/TestHelper';

// Mock useLazyAsset hook
jest.mock('@hooks/useLazyAsset', () => {
    const ExpensiconsModule = jest.requireActual<Record<string, React.FC<SvgProps>>>('@components/Icon/Expensicons');
    return {
        useMemoizedLazyExpensifyIcons: jest.fn(() => ({
            NewWindow: ExpensiconsModule.NewWindow,
        })),
    };
});

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
                        icon={Expensicons.Link}
                        iconRight={Expensicons.NewWindow}
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
                        icon={Expensicons.Download}
                        iconRight={Expensicons.NewWindow}
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
                        icon={Expensicons.Checkmark}
                        iconRight={Expensicons.Checkmark}
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
