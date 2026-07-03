import DomainListEmptyState from '@components/Domain/DomainListEmptyState';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Table, {composeTableHeaderComponent} from '@components/Table';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {ValueOf} from 'type-fest';

import React from 'react';

import DomainListTableRow from './DomainListTableRow';

type DomainTableColumnKey = 'domains' | 'actions';

type DomainRowData = {
    keyForList: string;
    domainAccountID: number;
    title: string;
    disabled: boolean;
    isAdmin: boolean;
    isValidated: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    errors?: OnyxCommon.Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    action: () => void;
};

type DomainListTableProps = {
    domains: DomainRowData[];
    headerComponent?: React.ReactElement;
};

export default function DomainListTable({domains, headerComponent}: DomainListTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const domainTableColumns: Array<TableColumn<DomainTableColumnKey>> = [
        {
            sortable: true,
            key: 'domains',
            label: translate('common.domains'),
        },
        {
            sortable: false,
            key: 'actions',
            width: variables.domainTableActionColumnWidth,
            label: '',
            styling: {containerStyles: [styles.justifyContentEnd, styles.pr3]},
        },
    ];

    const compareTableItems: CompareItemsCallback<DomainRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        return orderMultiplier * localeCompare(item1.title, item2.title);
    };

    const isTableItemInSearch: IsItemInSearchCallback<DomainRowData> = (item, searchValue) => {
        return item.title.toLowerCase().includes(searchValue.toLowerCase());
    };

    const shouldShowSearchBar = domains.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const searchBarComponent = shouldShowSearchBar ? <Table.SearchBar label={translate('workspace.common.findDomain')} /> : undefined;
    const tableHeaderComponent = composeTableHeaderComponent(headerComponent, searchBarComponent);

    const renderTableItem = ({item, index}: ListRenderItemInfo<DomainRowData>) => {
        return (
            <DomainListTableRow
                item={item}
                rowIndex={index}
                shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            />
        );
    };

    return (
        <Table
            data={domains}
            columns={domainTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            initialSortColumn="domains"
            title={translate('common.domains')}
            headerComponent={tableHeaderComponent}
            shouldUseStickyColumnHeader
            ListEmptyComponent={DomainListEmptyState}
            keyExtractor={(row, index) => `${row.domainAccountID}-${index}`}
        >
            <Table.Body />
        </Table>
    );
}

export type {DomainRowData};
