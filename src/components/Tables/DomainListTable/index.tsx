import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Table, {composeTableHeaderComponent} from '@components/Table';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import type CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
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
    const illustrations = useMemoizedLazyIllustrations(['EarthWithControls']);
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

    const searchBarComponent = <Table.FilterBar label={translate('workspace.common.findDomain')} />;
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

    const emptyStateButtons = [
        {
            success: true,
            buttonAction: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN)),
            buttonText: translate('domain.addDomain.newDomain'),
        },
    ];

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
            keyExtractor={(row, index) => `${row.domainAccountID}-${index}`}
        >
            <Table.EmptyState
                headerMedia={illustrations.EarthWithControls}
                headerContentStyles={styles.emptyDomainListStaticIllustrationStyle}
                title={translate('workspace.emptyDomain.title')}
                subtitle={translate('workspace.emptyDomain.subtitle')}
                titleStyles={styles.pt2}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                containerStyles={styles.mb10}
                buttons={emptyStateButtons}
            />
            <Table.NoResultsState />
            <Table.Body />
        </Table>
    );
}

export type {DomainRowData};
