import {getTableListMetadata} from '@components/Table/buildTableListData';

import CONST from '@src/CONST';

const {COLUMN_HEADER_PLACEMENT} = CONST.TABLES;

const pageHeader = 'Page header';

describe('getTableListMetadata', () => {
    // Given a table with a page header whose columns fit and can't be resized
    // When the column header is placed
    // Then it rides FlashList's sticky-row overlay, which is the cheapest way to keep it stuck
    it('places the column header in the sticky row when there is no horizontal scroller', () => {
        const metadata = getTableListMetadata({
            listHeaderElement: pageHeader,
            hasColumnHeaderElement: true,
            hasRows: true,
            isColumnHeaderHiddenInNarrowLayout: false,
            hasHorizontalScrollContainer: false,
        });

        expect(metadata.columnHeaderPlacement).toBe(COLUMN_HEADER_PLACEMENT.STICKY_ROW);
        expect(metadata.syntheticRowsBeforeData).toBe(1);
    });

    // Given a table with a page header that sits in a horizontal scroller, which every resizable table does even while its columns fit
    // When the column header is placed
    // Then it goes in the list header so it scrolls sideways with the columns, and doesn't move once a drag starts overflowing them
    it('places the column header in the list header when there is a horizontal scroller', () => {
        const metadata = getTableListMetadata({
            listHeaderElement: pageHeader,
            hasColumnHeaderElement: true,
            hasRows: true,
            isColumnHeaderHiddenInNarrowLayout: false,
            hasHorizontalScrollContainer: true,
        });

        expect(metadata.columnHeaderPlacement).toBe(COLUMN_HEADER_PLACEMENT.LIST_HEADER);
        expect(metadata.syntheticRowsBeforeData).toBe(0);
    });

    // Given a table without a page header
    // When the column header is placed, with or without a horizontal scroller
    // Then it stays outside the list either way, since the ancestor scroller already carries it with the columns
    it('keeps the column header outside the list when there is no page header', () => {
        for (const hasHorizontalScrollContainer of [false, true]) {
            const metadata = getTableListMetadata({
                hasColumnHeaderElement: true,
                hasRows: true,
                isColumnHeaderHiddenInNarrowLayout: false,
                hasHorizontalScrollContainer,
            });

            expect(metadata.columnHeaderPlacement).toBe(COLUMN_HEADER_PLACEMENT.OUTSIDE_LIST);
        }
    });

    // Given a table with a horizontal scroller but no rows
    // When the column header is placed
    // Then there is none, since a header over an empty table only labels nothing
    it('renders no column header when there are no rows', () => {
        const metadata = getTableListMetadata({
            listHeaderElement: pageHeader,
            hasColumnHeaderElement: true,
            hasRows: false,
            isColumnHeaderHiddenInNarrowLayout: false,
            hasHorizontalScrollContainer: true,
        });

        expect(metadata.columnHeaderPlacement).toBe(COLUMN_HEADER_PLACEMENT.NONE);
    });
});
