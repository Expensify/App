import {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import {ValueOf} from 'type-fest';
import DomainListEmptyState from '@components/Domain/DomainListEmptyState';
import Table, {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import DomainListTableRow from './DomainListTableRow';

type DomainTableColumnKey = 'domains' | 'actions';

export type DomainRowData = {
    rowType: 'domain';
    domainAccountID: number;
    title: string;
    isAdmin: boolean;
    isValidated: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    errors?: OnyxCommon.Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    action: () => void;
};

type DomainListTableProps = {
    domains: DomainRowData[];
};

export default function DomainListTable({domains}: DomainListTableProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const domainTableColumns: Array<TableColumn<DomainTableColumnKey>> = [
        {key: 'domains', label: translate('common.domains')},
        {key: 'actions', width: variables.domainTableActionColumnWidth, label: '', styling: {containerStyles: [styles.justifyContentEnd, styles.pr3]}},
    ];

    const compareTableItems: CompareItemsCallback<DomainRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        return item1.title.localeCompare(item2.title) * orderMultiplier;
    };

    const isTableItemInSearch: IsItemInSearchCallback<DomainRowData> = (item, searchValue) => {
        return item.title.toLowerCase().includes(searchValue.toLowerCase());
    };

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
            keyExtractor={(row) => row.domainAccountID.toString()}
            initialSortColumn="domains"
            title={translate('common.domains')}
            ListEmptyComponent={DomainListEmptyState}
        >
            {/* JACK_TODO: findDomain */}
            {/* <Table.SearchBar label={translate('workspace.common.findWorkspace')} /> */}

            <Table.Header />
            <Table.Body />
        </Table>
    );
}
