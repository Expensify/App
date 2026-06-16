import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import DomainAdminsTableRow from './DomainAdminsTableRow';

type DomainAdminsTableColumnKey = 'admin' | 'primaryContact' | 'actions';

type DomainAdminRowData = TableData & {
    accountID: number;
    login: string;
    name: string;
    email: string;
    isPrimaryContact: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    dismissError: () => void;
};

type DomainAdminsTableProps = {
    admins: DomainAdminRowData[];
};

export default function DomainAdminsTable({admins}: DomainAdminsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const domainAdminsTableColumns: Array<TableColumn<DomainAdminsTableColumnKey>> = [
        {
            key: 'admin',
            label: translate('domain.admins.title'),
            sortable: true,
        },
        {
            key: 'primaryContact',
            label: '',
            sortable: false,
            styling: {
                containerStyles: [styles.justifyContentCenter],
            },
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.tableCaretColumnWidth,
        },
    ];

    const compareTableItems: CompareItemsCallback<DomainAdminRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isTableItemInSearch: IsItemInSearchCallback<DomainAdminRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.email]);
        return results.length > 0;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<DomainAdminRowData>) => (
        <DomainAdminsTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );

    return (
        <Table
            data={admins}
            columns={domainAdminsTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            initialSortColumn="admin"
            title={translate('domain.admins.title')}
            keyExtractor={(item) => item.keyForList}
        >
            {admins.length >= CONST.STANDARD_LIST_ITEM_LIMIT && <Table.SearchBar label={translate('domain.admins.findAdmin')} />}
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {DomainAdminRowData, DomainAdminsTableColumnKey};
