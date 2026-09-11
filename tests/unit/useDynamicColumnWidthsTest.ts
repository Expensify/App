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

type Row = TableData & {value: string};

const SORT_ICON_WIDTH = 12 + 4; // variables.iconSizeExtraSmall + styles.ml1.marginLeft
const ROW_CHROME_WIDTH = (20 + 12) * 2; // (styles.mh5.marginHorizontal + styles.ph3.paddingHorizontal) * 2
const GAP_WIDTH = 12; // styles.gap3.gap

/** Three free-text columns, each with one cell, so the only thing driving their width is the declared measurement. */
const columns: Array<TableColumn<string, Row>> = ['first', 'second', 'third'].map((key) => ({
    key,
    label: key,
    sortable: true,
    dynamicSizing: {getContentToMeasure: (item) => [{text: `${key}-${item.value}`}]},
}));

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
});
