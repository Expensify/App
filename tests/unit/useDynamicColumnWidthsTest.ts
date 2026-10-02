import {renderHook} from '@testing-library/react-native';

import type {TableColumn, TableData} from '@components/Table';
import useDynamicColumnWidths from '@components/Table/useDynamicColumnWidths';

// Text measurement is a web-only canvas call, so it is mocked to return whatever each test declares. Keyed by the
// measured string, which lets a column's cells and its header label be given different widths.
const measuredWidthByText: Record<string, number> = {};
jest.mock('@libs/measureTextWidth', () => ({
    __esModule: true,
    default: (text: string) => measuredWidthByText[text] ?? 0,
    canMeasureText: () => true,
}));

// Dynamic sizing is a wide-layout feature; pin the layout so the row chrome below is the wide page gutter.
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));

type Row = TableData & {value: string};

const SORT_ICON_WIDTH = 12 + 4; // variables.iconSizeExtraSmall + styles.ml1.marginLeft
const ROW_CHROME_WIDTH = (20 + 12) * 2; // (layoutSpacing.pageGutter.wide + styles.ph3.paddingHorizontal) * 2
const GAP_WIDTH = 12; // styles.gap3.gap

/** Three free-text columns, each with one cell, so the only thing driving their width is the declared measurement. */
const columns: Array<TableColumn<string, Row>> = ['first', 'second', 'third'].map((key) => ({
    key,
    label: key,
    sortable: true,
    dynamicSizing: {getContentToMeasure: (item) => [{text: `${key}-${item.value}`}]},
}));

/** The same three columns, with one of them given an extra sizing option to exercise. */
const columnsWithSizingOn = (key: string, dynamicSizing: Partial<NonNullable<TableColumn<string, Row>['dynamicSizing']>>): Array<TableColumn<string, Row>> =>
    columns.map((column) => (column.key === key ? {...column, dynamicSizing: {getContentToMeasure: (item: Row) => [{text: `${key}-${item.value}`}], ...dynamicSizing}} : column));

const data: Row[] = [{keyForList: 'row', value: 'cell'}];

/** Turns the width the columns should share into the `tableWidth` the hook has to be handed to produce it. */
const tableWidthFor = (availableWidth: number) => availableWidth + ROW_CHROME_WIDTH + (columns.length - 1) * GAP_WIDTH;

const widthsFrom = (gridTemplateColumns: string[] | undefined) => (gridTemplateColumns ?? []).map((track) => Number.parseInt(track, 10));

describe('useDynamicColumnWidths', () => {
    beforeEach(() => {
        for (const key of Object.keys(measuredWidthByText)) {
            delete measuredWidthByText[key];
        }

        // Headers stay narrow so the header-label floor never decides a width, and every column needs 300px of content
        // it cannot get. That puts the squeeze floors at 120 each (360 total) and the scroll floors at 180 each (540).
        for (const {key} of columns) {
            measuredWidthByText[key] = 10;
            measuredWidthByText[`${key}-cell`] = 300;
        }
    });

    it('squeezes past the readable minimum instead of scrolling, when the squeeze floors still fit', () => {
        // 360 <= 400 < 540: the squeeze floors fit but the scroll floors do not, which is the boundary the two floors
        // exist to separate. On a single 180px floor this table would have scrolled.
        const {result} = renderHook(() => useDynamicColumnWidths<Row, string>({columns, data, tableWidth: tableWidthFor(400), isEnabled: true, hasSelectionColumn: false}));

        const widths = widthsFrom(result.current.gridTemplateColumns);

        expect(result.current.scrollWidth).toBeUndefined();
        expect(widths).toHaveLength(columns.length);
        expect(widths.reduce((total, width) => total + width, 0)).toBe(400);

        // Every column is squeezed below the 180px it would be laid out at while scrolling, but none below 120px.
        for (const width of widths) {
            expect(width).toBeGreaterThanOrEqual(120);
            expect(width).toBeLessThan(180);
        }
    });

    it('lays the columns out at the wider scroll floor once even the squeeze floors overflow', () => {
        // 360 > 300, so the table scrolls. Horizontal room stops being scarce at that point, so the columns take 180px
        // rather than staying squeezed at 120px.
        const {result} = renderHook(() => useDynamicColumnWidths<Row, string>({columns, data, tableWidth: tableWidthFor(300), isEnabled: true, hasSelectionColumn: false}));

        expect(widthsFrom(result.current.gridTemplateColumns)).toEqual([180, 180, 180]);
        expect(result.current.scrollWidth).toBe(180 * columns.length + (columns.length - 1) * GAP_WIDTH + ROW_CHROME_WIDTH);
    });

    it('never squeezes a column below its own header label', () => {
        // A header wider than the 120px squeeze floor has to keep deciding the column's minimum, or sorting it would
        // ellipsize its own heading.
        measuredWidthByText.first = 200 - SORT_ICON_WIDTH;

        const {result} = renderHook(() => useDynamicColumnWidths<Row, string>({columns, data, tableWidth: tableWidthFor(300), isEnabled: true, hasSelectionColumn: false}));

        expect(widthsFrom(result.current.gridTemplateColumns).at(0)).toBeGreaterThanOrEqual(200);
    });

    it('leaves a short column at its content width rather than inflating it to the minimum', () => {
        measuredWidthByText['first-cell'] = 60;

        const {result} = renderHook(() => useDynamicColumnWidths<Row, string>({columns, data, tableWidth: tableWidthFor(300), isEnabled: true, hasSelectionColumn: false}));

        expect(widthsFrom(result.current.gridTemplateColumns).at(0)).toBe(60);
    });

    it('keeps a column that must not truncate at its full content width', () => {
        // Given a column whose values come from a fixed set, so an ellipsis would hide part of a value
        const columnsWithFitContent = columnsWithSizingOn('first', {shouldFitContent: true});

        // When the table is too narrow for every column to have what it wants
        const {result} = renderHook(() =>
            useDynamicColumnWidths<Row, string>({columns: columnsWithFitContent, data, tableWidth: tableWidthFor(300), isEnabled: true, hasSelectionColumn: false}),
        );

        // Then it keeps all 300px of its content while the free-text columns fall back to their floor
        expect(widthsFrom(result.current.gridTemplateColumns)).toEqual([300, 180, 180]);
    });

    it('lets a column set a minimum of its own, over both the derived floor and its content', () => {
        // Given a column that declares the width it needs, narrower than its content and wider than the floor
        const columnsWithMinWidth = columnsWithSizingOn('first', {minWidth: 250});

        // When the table is too narrow for every column to have what it wants
        const {result} = renderHook(() =>
            useDynamicColumnWidths<Row, string>({columns: columnsWithMinWidth, data, tableWidth: tableWidthFor(300), isEnabled: true, hasSelectionColumn: false}),
        );

        // Then the declared minimum decides, rather than the 180px floor below it or the 300px of content above it
        expect(widthsFrom(result.current.gridTemplateColumns).at(0)).toBe(250);
    });

    it('counts a capped column at its cap when predicting whether the table scrolls', () => {
        // Given a column that caps itself well below the floor the other columns are squeezed to
        const columnsWithMaxWidth = columnsWithSizingOn('first', {maxWidth: 40});

        // When the table is measured at a width the capped column brings the total under: 40 + 120 + 120 fits in 300,
        // while the unclamped 120 + 120 + 120 would not
        const {result} = renderHook(() =>
            useDynamicColumnWidths<Row, string>({columns: columnsWithMaxWidth, data, tableWidth: tableWidthFor(300), isEnabled: true, hasSelectionColumn: false}),
        );

        // Then the table lays out in place instead of scrolling, and the capped column is held at its cap
        const widths = widthsFrom(result.current.gridTemplateColumns);
        expect(result.current.scrollWidth).toBeUndefined();
        expect(widths.at(0)).toBe(40);
        expect(widths.reduce((total, width) => total + width, 0)).toBe(300);
    });

    it('adds the cell avatar width on top of the free-text floor', () => {
        const columnsWithAvatar: Array<TableColumn<string, Row>> = ['first', 'second', 'third'].map((key) => ({
            key,
            label: key,
            sortable: true,
            dynamicSizing: {getContentToMeasure: (item) => [{text: `${key}-${item.value}`}], extraWidth: 20},
        }));

        // Squeeze floor: 360 (unclamped, ignoring the extra width) would fit 450, so this stays in the squeeze
        // branch rather than the scroll one. With the avatar's 20px added on top, the true floor is 140, not 120.
        const squeezed = renderHook(() =>
            useDynamicColumnWidths<Row, string>({columns: columnsWithAvatar, data, tableWidth: tableWidthFor(450), isEnabled: true, hasSelectionColumn: false}),
        );
        for (const width of widthsFrom(squeezed.result.current.gridTemplateColumns)) {
            expect(width).toBeGreaterThanOrEqual(140);
        }

        // Scroll floor: three squeeze floors of 140 overflow 300, so the table scrolls and each column takes the
        // wider scroll floor plus the avatar width: 180 + 20 = 200.
        const scrolled = renderHook(() =>
            useDynamicColumnWidths<Row, string>({columns: columnsWithAvatar, data, tableWidth: tableWidthFor(300), isEnabled: true, hasSelectionColumn: false}),
        );
        expect(widthsFrom(scrolled.result.current.gridTemplateColumns)).toEqual([200, 200, 200]);
    });
});
