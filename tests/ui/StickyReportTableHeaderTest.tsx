import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {createScrollOffsetStore} from '@components/MoneyRequestReportView/ExternalScrollFlashListTable';
import StickyReportTableHeader from '@components/MoneyRequestReportView/StickyReportTableHeader';
import Text from '@components/Text';

import React, {Profiler} from 'react';

jest.mock('@components/Text', () => 'Text');
jest.mock('@hooks/useThemeStyles', () => () => ({zIndex1: {zIndex: 1}, appBG: {backgroundColor: 'white'}}));

describe('StickyReportTableHeader', () => {
    it('skips scroll renders while the header stays at either clamped position', () => {
        // Given a measured header below the report fields with room to pin through the rows.
        const scrollOffsetStore = createScrollOffsetStore();
        const tableEndOffsetStore = createScrollOffsetStore();
        tableEndOffsetStore.setOffset(780);
        const onRender = jest.fn();
        render(
            <Profiler
                id="sticky-header"
                onRender={onRender}
            >
                <StickyReportTableHeader
                    scrollOffsetStore={scrollOffsetStore}
                    tableEndOffsetStore={tableEndOffsetStore}
                    offsetTop={220}
                >
                    <Text>Column labels</Text>
                </StickyReportTableHeader>
            </Profiler>,
        );
        const header = screen.getByTestId('sticky-report-table-header');
        fireEvent(header, 'layout', {nativeEvent: {layout: {height: 40}}});
        onRender.mockClear();

        // When scroll notifications arrive before the header reaches the viewport top.
        for (const offset of [50, 150, 220]) {
            act(() => scrollOffsetStore.setOffset(offset));
        }

        // Then unchanged translations do not commit another render.
        expect(onRender).not.toHaveBeenCalled();
        expect(header).toHaveStyle({transform: [{translateY: 0}]});

        // When scrolling within the table, then the header still follows the viewport.
        act(() => scrollOffsetStore.setOffset(500));
        expect(onRender).toHaveBeenCalled();
        expect(header).toHaveStyle({transform: [{translateY: 280}]});
        act(() => scrollOffsetStore.setOffset(960));
        expect(header).toHaveStyle({transform: [{translateY: 740}]});
        onRender.mockClear();

        // When continuing beyond the rows, then push-off stays fixed without more renders.
        for (const offset of [980, 1200]) {
            act(() => scrollOffsetStore.setOffset(offset));
        }
        expect(onRender).not.toHaveBeenCalled();
        expect(header).toHaveStyle({transform: [{translateY: 740}]});

        // When scrolling back into the rows, then positioning resumes immediately.
        act(() => scrollOffsetStore.setOffset(500));
        expect(onRender).toHaveBeenCalled();
        expect(header).toHaveStyle({transform: [{translateY: 280}]});
    });

    it('pins only through the expense rows and restores its position on reverse scrolling', () => {
        // Given a header below report fields, controls and nonzero content padding.
        const scrollOffsetStore = createScrollOffsetStore();
        const tableEndOffsetStore = createScrollOffsetStore();
        tableEndOffsetStore.setOffset(780);
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

    it('leaves pinning to a sticky list header and only pushes the header off with the last row', () => {
        // Given a measured header whose list header box sticks, so the browser keeps it at the top without lagging the scroll.
        const scrollOffsetStore = createScrollOffsetStore();
        const tableEndOffsetStore = createScrollOffsetStore();
        tableEndOffsetStore.setOffset(780);
        const onRender = jest.fn();
        render(
            <Profiler
                id="sticky-header"
                onRender={onRender}
            >
                <StickyReportTableHeader
                    scrollOffsetStore={scrollOffsetStore}
                    tableEndOffsetStore={tableEndOffsetStore}
                    offsetTop={220}
                    isListHeaderSticky
                >
                    <Text>Column labels</Text>
                </StickyReportTableHeader>
            </Profiler>,
        );
        const header = screen.getByTestId('sticky-report-table-header');
        fireEvent(header, 'layout', {nativeEvent: {layout: {height: 40}}});
        onRender.mockClear();

        // When scrolling through the rows until the header's bottom meets the last row.
        for (const offset of [200, 500, 960]) {
            act(() => scrollOffsetStore.setOffset(offset));
        }

        // Then JS never moves the header while the browser pins it, so those scroll frames don't render it.
        expect(onRender).not.toHaveBeenCalled();
        expect(header).toHaveStyle({transform: [{translateY: 0}]});

        // When scrolling past the last row, then the header leaves with it until it is out of view.
        for (const [offset, translation] of [
            [980, -20],
            [1000, -40],
        ]) {
            act(() => scrollOffsetStore.setOffset(offset));
            expect(header).toHaveStyle({transform: [{translateY: translation}]});
        }
        onRender.mockClear();

        // When reading the comments below the table, then the hidden header stays put without rendering.
        for (const offset of [1200, 1500]) {
            act(() => scrollOffsetStore.setOffset(offset));
        }
        expect(onRender).not.toHaveBeenCalled();
        expect(header).toHaveStyle({transform: [{translateY: -40}]});

        // When scrolling back into the rows, then the header returns for the browser to pin again.
        act(() => scrollOffsetStore.setOffset(500));
        expect(header).toHaveStyle({transform: [{translateY: 0}]});
    });

    it('updates push-off when rows are removed or header geometry changes without scrolling', () => {
        // Given a header already pinned above a long expense table.
        const scrollOffsetStore = createScrollOffsetStore();
        const tableEndOffsetStore = createScrollOffsetStore();
        scrollOffsetStore.setOffset(700);
        tableEndOffsetStore.setOffset(800);
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
        act(() => tableEndOffsetStore.setOffset(520));
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
        expect(header).toHaveStyle({transform: [{translateY: 400}]});
    });

    it('preserves the last-row bound when content above the table changes without a layout commit', () => {
        // Given a header pushed off at the last row with table-local geometry published once.
        const scrollOffsetStore = createScrollOffsetStore();
        const tableEndOffsetStore = createScrollOffsetStore();
        scrollOffsetStore.setOffset(1200);
        tableEndOffsetStore.setOffset(800);
        const renderHeader = (offsetTop: number) => (
            <StickyReportTableHeader
                scrollOffsetStore={scrollOffsetStore}
                tableEndOffsetStore={tableEndOffsetStore}
                offsetTop={offsetTop}
            >
                <Text>Column labels</Text>
            </StickyReportTableHeader>
        );
        const {rerender} = render(renderHeader(200));
        const header = screen.getByTestId('sticky-report-table-header');
        fireEvent(header, 'layout', {nativeEvent: {layout: {height: 40}}});
        expect(header).toHaveStyle({transform: [{translateY: 760}]});

        // When report fields grow and shrink without another measurement or scroll notification.
        for (const offsetTop of [300, 100]) {
            rerender(renderHeader(offsetTop));

            // Then push-off still ends exactly at the last row, rather than drifting by the height change.
            expect(header).toHaveStyle({transform: [{translateY: 760}]});
        }
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
