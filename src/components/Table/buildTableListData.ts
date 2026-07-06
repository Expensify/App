import type React from 'react';

import type {SharedListProps, TableData, TableRow} from './types';

const PAGE_HEADER_KEY = '__table_page_header__';
const TABLE_HEADER_KEY = '__table_header__';
const EMPTY_RESULT_KEY = '__table_empty_result__';
const LIST_EMPTY_KEY = '__table_empty__';

type SyntheticRowKind = 'pageHeader' | 'tableHeader' | 'emptyResult' | 'listEmpty' | 'data';

type TableListMetadata = {
    hasPageHeader: boolean;
    shouldRenderStickyHeader: boolean;
    shouldRenderSyntheticEmptyRow: boolean;
    isEmptyResult: boolean;
    syntheticRowsBeforeData: number;
    stickyTableHeaderIndex: number;
    listDataRowOffset: number;
};

type TableListMetadataParams<DataType extends TableData> = {
    headerComponent?: React.ReactElement;
    listHeaderComponent?: SharedListProps<DataType>['ListHeaderComponent'];
    listEmptyComponent?: SharedListProps<DataType>['ListEmptyComponent'];
    processedData: Array<TableRow<DataType>>;
    isEmptyResult: boolean;
    shouldRenderStickyHeader: boolean;
};

function getTableListMetadata<DataType extends TableData>({
    headerComponent,
    listHeaderComponent,
    listEmptyComponent,
    processedData,
    isEmptyResult,
    shouldRenderStickyHeader,
}: TableListMetadataParams<DataType>): TableListMetadata {
    const hasPageHeader = !!listHeaderComponent || !!headerComponent;
    const syntheticRowsBeforeData = (hasPageHeader ? 1 : 0) + (shouldRenderStickyHeader ? 1 : 0);

    return {
        hasPageHeader,
        shouldRenderStickyHeader,
        shouldRenderSyntheticEmptyRow: processedData.length === 0 && hasPageHeader && (isEmptyResult || !!listEmptyComponent),
        isEmptyResult,
        syntheticRowsBeforeData,
        stickyTableHeaderIndex: hasPageHeader ? 1 : 0,
        listDataRowOffset: syntheticRowsBeforeData,
    };
}

function createSyntheticRow<DataType extends TableData>(keyForList: string): DataType {
    // FlashList data is typed to consumer rows, but synthetic rows are intercepted before consumer callbacks.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {keyForList} as DataType;
}

function buildTableListData<DataType extends TableData>(data: Array<TableRow<DataType>>, metadata: TableListMetadata): DataType[] {
    return [
        ...(metadata.hasPageHeader ? [createSyntheticRow<DataType>(PAGE_HEADER_KEY)] : []),
        ...(metadata.shouldRenderStickyHeader ? [createSyntheticRow<DataType>(TABLE_HEADER_KEY)] : []),
        ...data,
        ...(metadata.shouldRenderSyntheticEmptyRow ? [createSyntheticRow<DataType>(metadata.isEmptyResult ? EMPTY_RESULT_KEY : LIST_EMPTY_KEY)] : []),
    ];
}

function getSyntheticRowKind(index: number, metadata: TableListMetadata): SyntheticRowKind {
    if (metadata.hasPageHeader && index === 0) {
        return 'pageHeader';
    }

    if (metadata.shouldRenderStickyHeader && index === metadata.stickyTableHeaderIndex) {
        return 'tableHeader';
    }

    if (metadata.shouldRenderSyntheticEmptyRow && index === metadata.syntheticRowsBeforeData) {
        return metadata.isEmptyResult ? 'emptyResult' : 'listEmpty';
    }

    return 'data';
}

function getDataIndex(index: number, metadata: TableListMetadata): number {
    return index - metadata.syntheticRowsBeforeData;
}

function getAdjustedStickyHeaderIndices(metadata: TableListMetadata, stickyHeaderIndices: SharedListProps<TableData>['stickyHeaderIndices']) {
    if (metadata.shouldRenderStickyHeader) {
        return [metadata.stickyTableHeaderIndex];
    }

    return stickyHeaderIndices?.map((index) => index + (metadata.hasPageHeader ? 1 : 0));
}

export {buildTableListData, getAdjustedStickyHeaderIndices, getDataIndex, getSyntheticRowKind, getTableListMetadata};
export type {TableListMetadata};
