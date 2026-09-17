import type React from 'react';

import type {SharedListProps, TableData, TableRow} from './types';

const TABLE_HEADER_KEY = '__table_header__';

type SyntheticRowKind = 'tableHeader' | 'data';

type TableListMetadata = {
    hasPageHeader: boolean;
    shouldRenderStickyHeader: boolean;
    syntheticRowsBeforeData: number;
    stickyTableHeaderIndex: number;
    listDataRowOffset: number;
};

type TableListMetadataParams<DataType extends TableData> = {
    listHeaderElement?: React.ReactNode;
    listHeaderComponent?: SharedListProps<DataType>['ListHeaderComponent'];
    shouldRenderStickyHeader: boolean;
};

function getTableListMetadata<DataType extends TableData>({listHeaderElement, listHeaderComponent, shouldRenderStickyHeader}: TableListMetadataParams<DataType>): TableListMetadata {
    const hasPageHeader = !!listHeaderComponent || !!listHeaderElement;
    const syntheticRowsBeforeData = shouldRenderStickyHeader ? 1 : 0;

    return {
        hasPageHeader,
        shouldRenderStickyHeader,
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
    return [...(metadata.shouldRenderStickyHeader ? [createSyntheticRow<DataType>(TABLE_HEADER_KEY)] : []), ...data];
}

function getSyntheticRowKind(index: number, metadata: TableListMetadata): SyntheticRowKind {
    if (metadata.shouldRenderStickyHeader && index === metadata.stickyTableHeaderIndex) {
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
    if (metadata.shouldRenderStickyHeader) {
        return [metadata.stickyTableHeaderIndex];
    }

    return stickyHeaderIndices;
}

export {buildTableListData, getAdjustedStickyHeaderIndices, getDataIndex, getDataVisibleIndices, getListIndex, getSyntheticRowKind, getTableListMetadata};
export type {TableListMetadata};
