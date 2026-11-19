import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {createScrollOffsetStore} from '@components/MoneyRequestReportView/ExternalScrollFlashListTable';
import StickyReportTableHeader from '@components/MoneyRequestReportView/StickyReportTableHeader';
import Text from '@components/Text';

import React from 'react';

jest.mock('@components/Text', () => 'Text');
jest.mock('@hooks/useThemeStyles', () => () => ({zIndex1: {zIndex: 1}, appBG: {backgroundColor: 'white'}}));

describe('StickyReportTableHeader', () => {
    it('pins at the natural header position and leaves with the expense table, including on reverse scroll', () => {
        // Given a header below report fields, controls and nonzero outer content padding.
        const scrollOffsetStore = createScrollOffsetStore();
        const tableEndOffsetStore = createScrollOffsetStore();
        tableEndOffsetStore.setOffset(1000);
        render(
            <StickyReportTableHeader
                scrollOffsetStore={scrollOffsetStore}
                tableEndOffsetStore={tableEndOffsetStore}
                offsetTop={220}
            >
                <Text>Column labels</Text>
            </StickyReportTableHeader>,
        );
        const header = screen.getByTestId('sticky-report-table-header');
        fireEvent(header, 'layout', {nativeEvent: {layout: {x: 0, y: 0, width: 800, height: 40}}});

        // When scrolling before, through and beyond the transaction section, then back up.
        // Then only the header moves, its bottom never exceeds the table end, and normal flow is restored.
        for (const [scrollOffset, expectedTranslation] of [
            [200, 0],
            [220, 0],
            [500, 280],
            [960, 740],
            [980, 740],
            [1200, 740],
            [500, 280],
            [0, 0],
        ]) {
            act(() => scrollOffsetStore.setOffset(scrollOffset));
            expect(header).toHaveStyle({transform: [{translateY: expectedTranslation}]});
            expect(screen.getAllByText('Column labels')).toHaveLength(1);
        }
    });

    it('recalculates push-off after the table or header changes without another scroll event', () => {
        // Given a header pinned above expenses.
        const scrollOffsetStore = createScrollOffsetStore();
        const tableEndOffsetStore = createScrollOffsetStore();
        scrollOffsetStore.setOffset(700);
        tableEndOffsetStore.setOffset(1000);
        const {rerender} = render(
            <StickyReportTableHeader
                scrollOffsetStore={scrollOffsetStore}
                tableEndOffsetStore={tableEndOffsetStore}
                offsetTop={200}
            >
                <Text>Column labels</Text>
            </StickyReportTableHeader>,
        );
        const header = screen.getByTestId('sticky-report-table-header');
        fireEvent(header, 'layout', {nativeEvent: {layout: {height: 40}}});
        expect(header).toHaveStyle({transform: [{translateY: 500}]});

        // When expenses are removed or the header height changes.
        act(() => tableEndOffsetStore.setOffset(720));
        fireEvent(header, 'layout', {nativeEvent: {layout: {height: 60}}});

        // Then the header moves away before the new table end, without waiting for scrolling.
        expect(header).toHaveStyle({transform: [{translateY: 460}]});

        // When report fields grow, then the natural header position is included in the new translation.
        rerender(
            <StickyReportTableHeader
                scrollOffsetStore={scrollOffsetStore}
                tableEndOffsetStore={tableEndOffsetStore}
                offsetTop={300}
            >
                <Text>Column labels</Text>
            </StickyReportTableHeader>,
        );
        expect(header).toHaveStyle({transform: [{translateY: 360}]});
    });

    it('updates only the positioning component and unsubscribes on unmount', () => {
        // Given a report parent and one persistent interactive header.
        const scrollOffsetStore = createScrollOffsetStore();
        const tableEndOffsetStore = createScrollOffsetStore();
        tableEndOffsetStore.setOffset(1000);
        const subscribe = jest.spyOn(scrollOffsetStore, 'subscribe');
        const renderParent = jest.fn();
        function Report() {
            renderParent();
            return (
                <StickyReportTableHeader
                    scrollOffsetStore={scrollOffsetStore}
                    tableEndOffsetStore={tableEndOffsetStore}
                    offsetTop={100}
                >
                    <Text accessibilityRole="button">Sort</Text>
                </StickyReportTableHeader>
            );
        }
        const {unmount} = render(<Report />);
        const sortControl = screen.getByRole('button');

        // When the header pins and returns to its starting position.
        act(() => scrollOffsetStore.setOffset(500));
        act(() => scrollOffsetStore.setOffset(0));

        // Then no duplicate control or report rerender is needed, preserving the focused instance.
        expect(screen.getByRole('button')).toBe(sortControl);
        expect(renderParent).toHaveBeenCalledTimes(1);
        expect(subscribe).toHaveBeenCalledTimes(1);
        unmount();
        act(() => scrollOffsetStore.setOffset(700));
    });
});
