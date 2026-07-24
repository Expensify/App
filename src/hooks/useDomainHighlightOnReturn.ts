import type {TableData, TableHandle} from '@components/Table';

import {clearDomainHighlightItems} from '@libs/actions/Domain';

import ONYXKEYS from '@src/ONYXKEYS';
import type {DomainHighlightItemType} from '@src/types/onyx/DomainHighlightItems';

import type {RefObject} from 'react';

import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';

import useOnyx from './useOnyx';

/**
 * Scrolls to and highlights a domain admin/member/group row after it was just added, by reading the
 * pending highlight flag set optimistically in `Domain.ts` and consuming it once the row is visible.
 * If the row is currently hidden by an active search/filter, the highlight is silently skipped.
 */
function useDomainHighlightOnReturn<DataType extends TableData, ColumnKey extends string = string, FilterKey extends string = string>(
    domainAccountID: number,
    type: DomainHighlightItemType,
    tableRef: RefObject<TableHandle<DataType, ColumnKey, FilterKey> | null>,
) {
    const isFocused = useIsFocused();
    const [highlightItems] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_HIGHLIGHT_ITEMS}${domainAccountID}`);
    const highlightKey = highlightItems?.type === type ? highlightItems.id : null;

    useEffect(() => {
        if (!isFocused || !highlightKey) {
            return;
        }

        const processedData = tableRef.current?.getProcessedData() ?? [];
        const index = processedData.findIndex((item) => item.keyForList === highlightKey);

        if (index === -1) {
            clearDomainHighlightItems(domainAccountID);
            return;
        }

        tableRef.current?.scrollToIndex({index, animated: false});
        tableRef.current?.highlightItems([highlightKey]);
        clearDomainHighlightItems(domainAccountID);
    }, [isFocused, highlightKey, domainAccountID, tableRef]);
}

export default useDomainHighlightOnReturn;
