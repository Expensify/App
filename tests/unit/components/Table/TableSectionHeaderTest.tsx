import {render, screen} from '@testing-library/react-native';

import TableContext, {useTableContext} from '@components/Table/TableContext';
import TableSectionHeader from '@components/Table/TableSectionHeader';

import React, {useMemo} from 'react';

let mockShouldUseNarrowLayout = false;
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}));

// Tooltip measurement is unrelated to the section band's layout and selection behavior.
jest.mock('@components/TextWithTooltip', () => {
    const {createElement} = jest.requireActual<{createElement: typeof React.createElement}>('react');
    const {Text: RNText} = jest.requireActual<{Text: React.ComponentType<React.PropsWithChildren>}>('react-native');
    return {__esModule: true, default: ({text}: {text: string}) => createElement(RNText, null, text)};
});

type SectionFixtureProps = {
    shouldUseNarrowTableLayout?: boolean;
    selectionEnabled?: boolean;
    rowWidth?: string;
    rowIndex?: number;
};

function SectionFixture({shouldUseNarrowTableLayout = false, selectionEnabled = false, rowWidth, rowIndex = 0}: SectionFixtureProps) {
    const context = useTableContext();
    const value = useMemo(() => ({...context, shouldUseNarrowTableLayout, selectionEnabled, rowWidth}), [context, shouldUseNarrowTableLayout, selectionEnabled, rowWidth]);
    return (
        <TableContext.Provider value={value}>
            <TableSectionHeader
                text="Merchants"
                rowIndex={rowIndex}
            />
        </TableContext.Provider>
    );
}

describe('TableSectionHeader', () => {
    beforeEach(() => {
        mockShouldUseNarrowLayout = false;
    });

    it.each([
        {layout: 'narrow', narrowPage: true, compactTable: true, selectionEnabled: false, gutter: 12, padding: 16},
        {layout: 'narrow selection', narrowPage: true, compactTable: true, selectionEnabled: true, gutter: 12, padding: 16},
        {layout: 'medium', narrowPage: false, compactTable: true, selectionEnabled: false, gutter: 20, padding: 16},
        {layout: 'wide without selection', narrowPage: false, compactTable: false, selectionEnabled: false, gutter: 20, padding: 12},
        {layout: 'wide with selection', narrowPage: false, compactTable: false, selectionEnabled: true, gutter: 20, padding: 12},
    ])('matches row insets on $layout without adding a selection control', ({narrowPage, compactTable, selectionEnabled, gutter, padding}) => {
        // Given page gutters and compact-table padding can use different breakpoints.
        mockShouldUseNarrowLayout = narrowPage;

        // When a section is rendered in that table layout.
        render(
            <SectionFixture
                shouldUseNarrowTableLayout={compactTable}
                selectionEnabled={selectionEnabled}
            />,
        );

        // Then its band follows the row insets without becoming another selectable row.
        expect(screen.root).toHaveStyle({marginHorizontal: gutter, paddingHorizontal: padding});
        expect(screen.getByText('Merchants')).toBeTruthy();
        expect(screen.queryByRole('checkbox')).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it.each([false, true])('follows the live row width with selection enabled: %s', (selectionEnabled) => {
        // Given resizing exposes a CSS expression shared by the column header and data rows.
        const rowWidth = 'max(800px, calc(var(--column-width) + 100px))';
        const {rerender} = render(<SectionFixture selectionEnabled={selectionEnabled} />);
        expect(screen.root).toHaveStyle({width: undefined});

        // When the table starts supplying a live width, then clears it on a compact layout.
        rerender(
            <SectionFixture
                selectionEnabled={selectionEnabled}
                rowWidth={rowWidth}
            />,
        );

        // Then the band retains the expression rather than freezing a measured width.
        expect(screen.root).toHaveProp('style', expect.arrayContaining([expect.objectContaining({width: rowWidth})]));
        rerender(<SectionFixture shouldUseNarrowTableLayout />);
        expect(screen.root).toHaveStyle({width: undefined});
    });

    it('preserves the first-band separator and later-band top borders without adding rounded corners', () => {
        // Given the first section sits immediately below the column header.
        const {rerender} = render(<SectionFixture />);

        // When it renders, then moves to a later group in the processed rows.
        expect(screen.root).toHaveStyle({borderBottomWidth: 1, borderTopWidth: undefined});
        rerender(<SectionFixture rowIndex={3} />);

        // Then the existing separator policy is retained and final-row rounding stays with data rows.
        expect(screen.root).toHaveStyle({
            borderTopWidth: 1,
            borderBottomWidth: undefined,
            borderBottomLeftRadius: undefined,
            borderBottomRightRadius: undefined,
        });
    });
});
