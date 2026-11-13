import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import Table from '@components/Table';
import {getBadgeChromeWidth, getBadgeColumnDragMinWidth, measureBadgeLabelWidth} from '@components/Table/badgeCellWidths';

import useDomainHighlightOnReturn from '@hooks/useDomainHighlightOnReturn';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React, {useRef} from 'react';

import type {DomainGroupRowData} from './DomainGroupsTableRow';

import DomainGroupsTableRow from './DomainGroupsTableRow';

type DomainGroupsTableColumnKey = 'name' | 'members' | 'actions';

type DomainGroupsTableProps = {
    domainAccountID: number;
    groups: DomainGroupRowData[];
};

export default function DomainGroupsTable({domainAccountID, groups}: DomainGroupsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const tableRef = useRef<TableHandle<DomainGroupRowData, DomainGroupsTableColumnKey>>(null);
    useDomainHighlightOnReturn(domainAccountID, 'groups', tableRef);

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const hasDefaultGroup = groups.some((group) => group.isDefault);
    const defaultBadgeLabel = translate('common.default');
    const defaultBadgeExtraWidth = hasDefaultGroup ? getBadgeChromeWidth(styles) : 0;
    const defaultBadgeWidths = hasDefaultGroup ? [measureBadgeLabelWidth(defaultBadgeLabel)] : [];

    const domainGroupsTableColumns: Array<TableColumn<DomainGroupsTableColumnKey, DomainGroupRowData>> = [
        {
            key: 'name',
            label: translate('common.name'),
            sortable: true,
            dynamicSizing: {
                // The default group renders a badge after its name, so that label is measured with the name and
                // extraWidth covers the gap and the badge's padding and border.
                getContentToMeasure: (item) => [{text: item.isDefault ? `${item.name}${defaultBadgeLabel}` : item.name, fontSize: fontScale.text}],
                extraWidth: defaultBadgeExtraWidth,
                dragMinWidth: getBadgeColumnDragMinWidth(styles, 0, defaultBadgeWidths),
            },
        },
        {
            key: 'members',
            label: translate('common.members'),
            sortable: true,
            width: variables.domainGroupsTableMembersColumnWidth,
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.domainTableActionColumnWidth,
        },
    ];

    const compareTableItems: CompareItemsCallback<DomainGroupRowData, DomainGroupsTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'members') {
            return (item1.memberCount - item2.memberCount) * orderMultiplier;
        }

        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isTableItemInSearch: IsItemInSearchCallback<DomainGroupRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name]);
        return results.length > 0;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<DomainGroupRowData>) => (
        <DomainGroupsTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );
    const tableHeaderComponent = <Table.FilterBar label={translate('domain.groups.findGroup')} />;

    return (
        <Table
            shouldUseDynamicColumns
            columnResizingID={CONST.TABLES.COLUMN_RESIZING_IDS.DOMAIN_GROUPS}
            ref={tableRef}
            data={groups}
            columns={domainGroupsTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            initialSortColumn="name"
            title={translate('domain.groups.title')}
            keyExtractor={(item) => item.keyForList}
        >
            <Table.ListHeader>{tableHeaderComponent}</Table.ListHeader>
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {DomainGroupRowData};
