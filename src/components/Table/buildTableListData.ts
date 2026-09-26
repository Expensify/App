import type React from 'react';
import type {ValueOf} from 'type-fest';

import type {SharedListProps, TableData, TableRow} from './types';

const TABLE_HEADER_KEY = '__table_header__';

type SyntheticRowKind = 'tableHeader' | 'data';

/** Where the column header is rendered. The placements are exclusive, so the table is always in exactly one of them. */
const COLUMN_HEADER_PLACEMENT = {
    /** The table has no column header anywhere. */
    NONE: 'none',
    /** A direct child of the table container, outside the list. Where every table without a page header keeps it. */
    OUTSIDE_LIST: 'outsideList',
    /** A synthetic list row, which FlashList paints as a sticky overlay outside the scroller. */
    STICKY_ROW: 'stickyRow',
    /** In flow inside the list header, so the scroller carries it sideways with the columns it labels. */
    LIST_HEADER: 'listHeader',
} as const;

type ColumnHeaderPlacement = ValueOf<typeof COLUMN_HEADER_PLACEMENT>;

type TableListMetadata = {
    hasPageHeader: boolean;
    columnHeaderPlacement: ColumnHeaderPlacement;
    syntheticRowsBeforeData: number;
    stickyTableHeaderIndex: number;
    listDataRowOffset: number;
};

type ColumnHeaderPlacementParams = {
    /** Whether the consumer passed a `Table.Header` child. Without one the table has no column header anywhere. */
    hasColumnHeaderElement: boolean;

    hasPageHeader: boolean;

    hasRows: boolean;

    /** Narrow layouts drop the column header unless the table has a title for it to sit under. */
    isColumnHeaderHiddenInNarrowLayout: boolean;

    /**
     * Whether the columns are wider than the table and so have to scroll. FlashList's sticky-row overlay can't follow
     * them, so the column header moves into the list header instead (see `TableBody`).
     */
    areColumnsScrollable: boolean;
};

type TableListMetadataParams<DataType extends TableData> = Omit<ColumnHeaderPlacementParams, 'hasPageHeader'> & {
    listHeaderElement?: React.ReactNode;
    listHeaderComponent?: SharedListProps<DataType>['ListHeaderComponent'];
};

function getColumnHeaderPlacement({
    hasColumnHeaderElement,
    hasPageHeader,
    hasRows,
    isColumnHeaderHiddenInNarrowLayout,
    areColumnsScrollable,
}: ColumnHeaderPlacementParams): ColumnHeaderPlacement {
    if (!hasColumnHeaderElement) {
        return COLUMN_HEADER_PLACEMENT.NONE;
    }

    if (!hasRows || isColumnHeaderHiddenInNarrowLayout) {
        return COLUMN_HEADER_PLACEMENT.NONE;
    }

    // A table without a page header keeps the column header as a plain child of the table container, so the list is
    // never the one placing it and the rest of the rules below don't apply.
    if (!hasPageHeader) {
        return COLUMN_HEADER_PLACEMENT.OUTSIDE_LIST;
    }

    return areColumnsScrollable ? COLUMN_HEADER_PLACEMENT.LIST_HEADER : COLUMN_HEADER_PLACEMENT.STICKY_ROW;
}

/** Whether the table has a column header at all, wherever it ends up. Drives `aria-rowindex`/`aria-rowcount`. */
function rendersColumnHeader(metadata: TableListMetadata): boolean {
    return metadata.columnHeaderPlacement !== COLUMN_HEADER_PLACEMENT.NONE;
}

function rendersColumnHeaderAsStickyRow(metadata: TableListMetadata): boolean {
    return metadata.columnHeaderPlacement === COLUMN_HEADER_PLACEMENT.STICKY_ROW;
}

function rendersColumnHeaderInListHeader(metadata: TableListMetadata): boolean {
    return metadata.columnHeaderPlacement === COLUMN_HEADER_PLACEMENT.LIST_HEADER;
}

function getTableListMetadata<DataType extends TableData>({listHeaderElement, listHeaderComponent, ...placementParams}: TableListMetadataParams<DataType>): TableListMetadata {
    const hasPageHeader = !!listHeaderComponent || !!listHeaderElement;
    const columnHeaderPlacement = getColumnHeaderPlacement({...placementParams, hasPageHeader});
    const syntheticRowsBeforeData = columnHeaderPlacement === COLUMN_HEADER_PLACEMENT.STICKY_ROW ? 1 : 0;

    return {
        hasPageHeader,
        columnHeaderPlacement,
        syntheticRowsBeforeData,
        stickyTableHeaderIndex: 0,
        listDataRowOffset: syntheticRowsBeforeData,
    };
}

function createSyntheticRow<DataType extends TableData>(keyForList: string): DataType {
    // FlashList data is typed to consumer rows, but synthetic rows are intercepted before consumer callbacks.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {keyForList} as DataType;
}

function buildTableListData<DataType extends TableData>(data: Array<TableRow<DataType>>, metadata: TableListMetadata): DataType[] {
    return [...(rendersColumnHeaderAsStickyRow(metadata) ? [createSyntheticRow<DataType>(TABLE_HEADER_KEY)] : []), ...data];
}

function getSyntheticRowKind(index: number, metadata: TableListMetadata): SyntheticRowKind {
    if (rendersColumnHeaderAsStickyRow(metadata) && index === metadata.stickyTableHeaderIndex) {
        return 'tableHeader';
    }

    return 'data';
}

function getDataIndex(index: number, metadata: TableListMetadata): number {
    return index - metadata.syntheticRowsBeforeData;
}

function getListIndex(index: number, metadata: TableListMetadata): number {
    return index + metadata.syntheticRowsBeforeData;
}

function getDataVisibleIndices({startIndex, endIndex}: {startIndex: number; endIndex: number}, metadata: TableListMetadata) {
    if (endIndex < metadata.syntheticRowsBeforeData) {
        return {startIndex: -1, endIndex: -2};
    }

    return {
        startIndex: Math.max(0, getDataIndex(startIndex, metadata)),
        endIndex: getDataIndex(endIndex, metadata),
    };
}

function getAdjustedStickyHeaderIndices(metadata: TableListMetadata, stickyHeaderIndices: SharedListProps<TableData>['stickyHeaderIndices']) {
    if (rendersColumnHeaderAsStickyRow(metadata)) {
        return [metadata.stickyTableHeaderIndex];
    }

    return stickyHeaderIndices;
}

export {
    buildTableListData,
    COLUMN_HEADER_PLACEMENT,
    getAdjustedStickyHeaderIndices,
    getDataIndex,
    getDataVisibleIndices,
    getListIndex,
    getSyntheticRowKind,
    getTableListMetadata,
    rendersColumnHeader,
    rendersColumnHeaderAsStickyRow,
    rendersColumnHeaderInListHeader,
};
export type {TableListMetadata};
