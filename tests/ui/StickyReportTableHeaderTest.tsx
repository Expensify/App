import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {createScrollOffsetStore} from '@components/MoneyRequestReportView/ExternalScrollFlashListTable';
import StickyReportTableHeader from '@components/MoneyRequestReportView/StickyReportTableHeader';
import Text from '@components/Text';

import React from 'react';

jest.mock('@components/Text', () => 'Text');
jest.mock('@hooks/useThemeStyles', () => () => ({zIndex1: {zIndex: 1}, appBG: {backgroundColor: 'white'}}));

describe('StickyReportTableHeader', () => {
    it('pins only through the expense rows and restores its position on reverse scrolling', () => {
        // Given a header below report fields, controls and nonzero content padding.
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

        // When scrolling through and beyond the expenses, then returning to the top.
        // Then the header pins, leaves before the summary and returns without duplicating its controls.
        for (const [offset, translation] of [
            [200, 0],
            [220, 0],
            [500, 280],
            [960, 740],
            [980, 740],
            [1200, 740],
            [500, 280],
            [0, 0],
        ]) {
            act(() => scrollOffsetStore.setOffset(offset));
            expect(header).toHaveStyle({transform: [{translateY: translation}]});
            expect(screen.getAllByText('Column labels')).toHaveLength(1);
        }
    });

    it('updates push-off when rows are removed or header geometry changes without scrolling', () => {
        // Given a header already pinned above a long expense table.
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

        // When expenses are removed and the header grows.
        act(() => tableEndOffsetStore.setOffset(720));
        fireEvent(header, 'layout', {nativeEvent: {layout: {height: 60}}});

        // Then it leaves before the new table end without waiting for another scroll.
        expect(header).toHaveStyle({transform: [{translateY: 460}]});

        // When report fields grow, then the updated natural position is used too.
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

    it('preserves the interactive instance without rerendering the report parent', () => {
        // Given a parent and one persistent header control.
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
        const control = screen.getByRole('button');

        // When the header pins and returns.
        act(() => scrollOffsetStore.setOffset(500));
        act(() => scrollOffsetStore.setOffset(0));

        // Then only its positioning component updates, with no remount or extra subscription.
        expect(screen.getByRole('button')).toBe(control);
        expect(renderParent).toHaveBeenCalledTimes(1);
        expect(subscribe).toHaveBeenCalledTimes(1);
        unmount();
        act(() => scrollOffsetStore.setOffset(700));
    });
});
