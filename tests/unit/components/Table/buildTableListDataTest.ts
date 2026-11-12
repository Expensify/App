import {getTableListMetadata} from '@components/Table/buildTableListData';

import CONST from '@src/CONST';

const {COLUMN_HEADER_PLACEMENT} = CONST.TABLES;

const pageHeader = 'Page header';

describe('getTableListMetadata', () => {
    // Given a table with a page header on a platform that can't pin content inside the scroller
    // When the column header is placed
    // Then it rides FlashList's sticky-row overlay, the only way left to keep it stuck
    it('places the column header in the sticky row when the scroller cannot pin it', () => {
        const metadata = getTableListMetadata({
            listHeaderElement: pageHeader,
            hasColumnHeaderElement: true,
            hasRows: true,
            isColumnHeaderHiddenInNarrowLayout: false,
            canStickColumnHeaderInScroller: false,
        });

        expect(metadata.columnHeaderPlacement).toBe(COLUMN_HEADER_PLACEMENT.STICKY_ROW);
        expect(metadata.syntheticRowsBeforeData).toBe(1);
    });

    // Given a table with a page header on a platform that can pin content inside the scroller
    // When the column header is placed
    // Then it goes in the list header, which keeps it clear of the scrollbar and scrolls it sideways with the columns
    it('places the column header in the list header when the scroller can pin it', () => {
        const metadata = getTableListMetadata({
            listHeaderElement: pageHeader,
            hasColumnHeaderElement: true,
            hasRows: true,
            isColumnHeaderHiddenInNarrowLayout: false,
            canStickColumnHeaderInScroller: true,
        });

        expect(metadata.columnHeaderPlacement).toBe(COLUMN_HEADER_PLACEMENT.LIST_HEADER);
        expect(metadata.syntheticRowsBeforeData).toBe(0);
    });

    // Given a table without a page header
    // When the column header is placed, on either kind of platform
    // Then it stays outside the list either way, since the ancestor scroller already carries it with the columns
    it('keeps the column header outside the list when there is no page header', () => {
        for (const canStickColumnHeaderInScroller of [false, true]) {
            const metadata = getTableListMetadata({
                hasColumnHeaderElement: true,
                hasRows: true,
                isColumnHeaderHiddenInNarrowLayout: false,
                canStickColumnHeaderInScroller,
            });

            expect(metadata.columnHeaderPlacement).toBe(COLUMN_HEADER_PLACEMENT.OUTSIDE_LIST);
        }
    });

    // Given a table with a page header but no rows
    // When the column header is placed
    // Then there is none, since a header over an empty table only labels nothing
    it('renders no column header when there are no rows', () => {
        const metadata = getTableListMetadata({
            listHeaderElement: pageHeader,
            hasColumnHeaderElement: true,
            hasRows: false,
            isColumnHeaderHiddenInNarrowLayout: false,
            canStickColumnHeaderInScroller: true,
        });

        expect(metadata.columnHeaderPlacement).toBe(COLUMN_HEADER_PLACEMENT.NONE);
    });
});
